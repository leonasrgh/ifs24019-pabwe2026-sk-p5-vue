import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import BidModal from "./BidModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const TID = (id) => `[data-testid="${id}"]`;
const withBids = {
  id: 5,
  title: "Oculus Quest 2",
  start_bid: 5000000,
  bids: [
    { id: 1, bid: 6000000 },
    { id: 2, bid: 7000000 },
  ],
};
const noBids = { ...withBids, bids: [] };

describe("BidModal", () => {
  let errorSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should not render when hidden or without aucation", () => {
    expect(
      renderWithProviders(BidModal, { props: { show: false, aucation: withBids } }).wrapper
        .find(TID("bid-modal"))
        .exists()
    ).toBe(false);
    expect(
      renderWithProviders(BidModal, { props: { show: true, aucation: null } }).wrapper
        .find(TID("bid-modal"))
        .exists()
    ).toBe(false);
  });

  it("should show aucation info with highest bid", () => {
    const { wrapper } = renderWithProviders(BidModal, { props: { show: true, aucation: withBids } });
    expect(wrapper.find(TID("bid-aucation-title")).text()).toBe("Oculus Quest 2");
    expect(wrapper.find(TID("bid-start-price")).text().replace(/\s/g, " ")).toBe("Rp 5.000.000");
    expect(wrapper.find(TID("bid-highest-price")).text().replace(/\s/g, " ")).toBe("Rp 7.000.000");
  });

  it("should show a message when there is no bid yet", () => {
    const { wrapper } = renderWithProviders(BidModal, { props: { show: true, aucation: noBids } });
    expect(wrapper.find(TID("bid-highest-price")).text()).toBe("Belum ada tawaran");
  });

  it("should toggle body scroll lock with show", async () => {
    const { wrapper } = renderWithProviders(BidModal, { props: { show: true, aucation: withBids } });
    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("auto");
    await wrapper.setProps({ show: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should reject empty, zero and negative amounts", async () => {
    const { wrapper } = renderWithProviders(BidModal, { props: { show: true, aucation: withBids } });
    const submit = () => wrapper.find("form").trigger("submit");

    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Nominal penawaran tidak valid");

    await wrapper.find(TID("bid-input")).setValue("0");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Nominal penawaran tidak valid");

    await wrapper.find(TID("bid-input")).setValue("-10");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Nominal penawaran tidak valid");
  });

  it("should reject a bid that is not higher than the current highest bid", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: withBids },
    });
    const bidSpy = vi.spyOn(aucationsStore, "asyncSetIsBidAdd");

    await wrapper.find(TID("bid-input")).setValue("7000000");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenLastCalledWith(expect.stringContaining("lebih tinggi dari penawaran tertinggi"));
    expect(bidSpy).not.toHaveBeenCalled();
  });

  it("should reject a first bid lower than the start price", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: noBids },
    });
    const bidSpy = vi.spyOn(aucationsStore, "asyncSetIsBidAdd");

    await wrapper.find(TID("bid-input")).setValue("4000000");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenLastCalledWith(expect.stringContaining("lebih rendah dari harga awal"));
    expect(bidSpy).not.toHaveBeenCalled();
  });

  it("should submit a higher bid and show loading", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: withBids },
    });
    const bidSpy = vi.spyOn(aucationsStore, "asyncSetIsBidAdd").mockImplementation(() => {});

    await wrapper.find(TID("bid-input")).setValue("7500000");
    await wrapper.find("form").trigger("submit");

    expect(bidSpy).toHaveBeenCalledWith(5, 7500000);
    expect(wrapper.text()).toContain("Mengirim...");
  });

  it("should accept a first bid equal to the start price", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: noBids },
    });
    const bidSpy = vi.spyOn(aucationsStore, "asyncSetIsBidAdd").mockImplementation(() => {});

    await wrapper.find(TID("bid-input")).setValue("5000000");
    await wrapper.find("form").trigger("submit");

    expect(bidSpy).toHaveBeenCalledWith(5, 5000000);
  });

  it("should refresh detail, reset and close when bid succeeded", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: withBids },
    });
    const refresh = vi.spyOn(aucationsStore, "asyncSetAucation").mockImplementation(() => {});

    aucationsStore.setIsBidAdded(true);
    aucationsStore.setIsBidAdd(true);
    await nextTick();

    expect(refresh).toHaveBeenCalledWith(5);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(aucationsStore.isBidAdd).toBe(false);
    expect(aucationsStore.isBidAdded).toBe(false);
  });

  it("should stay open when bid finished but failed", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(BidModal, {
      props: { show: true, aucation: withBids },
    });

    aucationsStore.setIsBidAdded(false);
    aucationsStore.setIsBidAdd(true);
    await nextTick();

    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("should emit close from close and cancel buttons and ignore clicks on the panel", async () => {
    const { wrapper } = renderWithProviders(BidModal, { props: { show: true, aucation: withBids } });
    await wrapper.find(TID("close-bid-modal-btn")).trigger("click");
    await wrapper.find(TID("cancel-bid-modal-btn")).trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);

    await wrapper.find(TID("bid-modal")).element.firstElementChild.click();
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});

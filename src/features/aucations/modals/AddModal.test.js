import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

async function mountModal(props) {
  const result = renderWithProviders(AddModal, { props });
  await flushPromises();
  const isReady = props.show && (props.aucation !== undefined ? Boolean(props.aucation) : true);
  if (isReady) {
    // Editor Markdown dimuat lazy (dynamic import), tunggu sampai textarea-nya tersedia.
    await vi.waitFor(() => {
      expect(result.wrapper.find('[data-testid$="description-input"]').exists()).toBe(true);
    }, { timeout: 10000 });
  }
  return result;
}

const TID = (id) => `[data-testid="${id}"]`;

async function fillForm(wrapper, { title, bid, closedAt, description } = {}) {
  if (title !== undefined) await wrapper.find(TID("add-aucation-title-input")).setValue(title);
  if (bid !== undefined) await wrapper.find(TID("add-aucation-start-bid-input")).setValue(bid);
  if (closedAt !== undefined) await wrapper.find(TID("add-aucation-closed-at-input")).setValue(closedAt);
  if (description !== undefined) await wrapper.find(TID("add-aucation-description-input")).setValue(description);
}

describe("AddModal", () => {
  let errorSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should not render when show is false", async () => {
    const { wrapper } = await mountModal({ show: false });
    expect(wrapper.find(TID("add-aucation-modal")).exists()).toBe(false);
  });

  it("should render and toggle body scroll lock with show", async () => {
    const { wrapper } = await mountModal({ show: true });
    expect(wrapper.find(TID("add-aucation-modal")).exists()).toBe(true);

    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("auto");
    await wrapper.setProps({ show: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate each required field in order", async () => {
    const { wrapper } = await mountModal({ show: true });
    const submit = () => wrapper.find("form").trigger("submit");

    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Judul tidak boleh kosong");

    await fillForm(wrapper, { title: "Oculus" });
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Deskripsi tidak boleh kosong");

    await fillForm(wrapper, { description: "Barang mulus" });
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Harga awal tidak valid");

    await fillForm(wrapper, { bid: "-5" });
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Harga awal tidak valid");

    await fillForm(wrapper, { bid: "10000" });
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Batas waktu penutupan tidak boleh kosong");
  });

  it("should submit trimmed values with API date format and show loading", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true });
    const addSpy = vi.spyOn(aucationsStore, "asyncSetIsAucationAdd").mockImplementation(() => {});

    await fillForm(wrapper, {
      title: "  Oculus Quest 2  ",
      description: "  Barang mulus  ",
      bid: "5000000",
      closedAt: "2026-12-31T23:59",
    });
    await wrapper.find("form").trigger("submit");

    expect(addSpy).toHaveBeenCalledWith("Oculus Quest 2", "Barang mulus", 5000000, "2026-12-31 23:59:00");
    expect(wrapper.text()).toContain("Menyimpan...");
    expect(wrapper.find(TID("submit-add-modal-btn")).attributes("disabled")).toBeDefined();
  });

  it("should reload list, reset form and close when add succeeded", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true });
    const reload = vi.spyOn(aucationsStore, "asyncReloadAucations").mockImplementation(() => {});
    vi.spyOn(aucationsStore, "asyncSetIsAucationAdd").mockImplementation(() => {});

    await fillForm(wrapper, { title: "T", description: "D", bid: "1", closedAt: "2026-12-31T23:59" });
    await wrapper.find("form").trigger("submit");

    aucationsStore.setIsAucationAdded(true);
    aucationsStore.setIsAucationAdd(true);
    await nextTick();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(aucationsStore.isAucationAdd).toBe(false);
    expect(aucationsStore.isAucationAdded).toBe(false);
    expect(wrapper.find(TID("add-aucation-title-input")).element.value).toBe("");
  });

  it("should stay open when add finished but failed", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true });
    const reload = vi.spyOn(aucationsStore, "asyncReloadAucations").mockImplementation(() => {});

    aucationsStore.setIsAucationAdded(false);
    aucationsStore.setIsAucationAdd(true);
    await nextTick();

    expect(reload).not.toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(aucationsStore.isAucationAdd).toBe(false);
  });

  it("should emit close from close and cancel buttons", async () => {
    const { wrapper } = await mountModal({ show: true });
    await wrapper.find(TID("close-add-modal-btn")).trigger("click");
    await wrapper.find(TID("cancel-add-modal-btn")).trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
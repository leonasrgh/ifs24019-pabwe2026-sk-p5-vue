import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

async function mountModal(props) {
  const result = renderWithProviders(ChangeModal, { props });
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
const item = {
  id: 5,
  title: "Oculus Quest 2",
  description: "Barang mulus",
  start_bid: 5000000,
  closed_at: "2026-12-31 23:59:00",
};

describe("ChangeModal", () => {
  let errorSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should not render when hidden or without aucation", async () => {
    const hidden = await mountModal({ show: false, aucation: item });
    expect(hidden.wrapper.find(TID("edit-aucation-modal")).exists()).toBe(false);

    const empty = await mountModal({ show: true, aucation: null });
    expect(empty.wrapper.find(TID("edit-aucation-modal")).exists()).toBe(false);
  });

  it("should prefill fields from the aucation", async () => {
    const { wrapper } = await mountModal({ show: true, aucation: item });
    expect(wrapper.find(TID("edit-aucation-title-input")).element.value).toBe("Oculus Quest 2");
    expect(wrapper.find(TID("edit-aucation-start-bid-input")).element.value).toBe("5000000");
    expect(wrapper.find(TID("edit-aucation-closed-at-input")).element.value).toBe("2026-12-31T23:59");
    expect(wrapper.find(TID("edit-aucation-description-input")).element.value).toBe("Barang mulus");
  });

  it("should fall back to empty strings for missing title and description", async () => {
    const { wrapper } = await mountModal({
      show: true,
      aucation: { id: 1, title: null, description: null, start_bid: 0, closed_at: null },
    });
    expect(wrapper.find(TID("edit-aucation-title-input")).element.value).toBe("");
    expect(wrapper.find(TID("edit-aucation-description-input")).element.value).toBe("");
  });

  it("should refill when the aucation prop changes while shown", async () => {
    const { wrapper } = await mountModal({ show: true, aucation: item });
    await wrapper.setProps({ aucation: { ...item, title: "Judul Baru" } });
    expect(wrapper.find(TID("edit-aucation-title-input")).element.value).toBe("Judul Baru");
  });

  it("should toggle body scroll lock with show", async () => {
    const { wrapper } = await mountModal({ show: true, aucation: item });
    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("auto");
    await wrapper.setProps({ show: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate each required field in order", async () => {
    const { wrapper } = await mountModal({ show: true, aucation: item });
    const submit = () => wrapper.find("form").trigger("submit");

    await wrapper.find(TID("edit-aucation-title-input")).setValue("  ");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Judul tidak boleh kosong");

    await wrapper.find(TID("edit-aucation-title-input")).setValue("Judul");
    await wrapper.find(TID("edit-aucation-description-input")).setValue(" ");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Deskripsi tidak boleh kosong");

    await wrapper.find(TID("edit-aucation-description-input")).setValue("Deskripsi");
    await wrapper.find(TID("edit-aucation-start-bid-input")).setValue("-1");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Harga awal tidak valid");

    await wrapper.find(TID("edit-aucation-start-bid-input")).setValue("1000");
    await wrapper.find(TID("edit-aucation-closed-at-input")).setValue("");
    await submit();
    expect(errorSpy).toHaveBeenLastCalledWith("Batas waktu penutupan tidak boleh kosong");
  });

  it("should submit edited values and show loading", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true, aucation: item });
    const changeSpy = vi.spyOn(aucationsStore, "asyncSetIsAucationChange").mockImplementation(() => {});

    await wrapper.find(TID("edit-aucation-title-input")).setValue(" Baru ");
    await wrapper.find("form").trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(5, "Baru", "Barang mulus", 5000000, "2026-12-31 23:59:00");
    expect(wrapper.text()).toContain("Menyimpan...");
  });

  it("should refresh detail and close when change succeeded", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true, aucation: item });
    const refresh = vi.spyOn(aucationsStore, "asyncSetAucation").mockImplementation(() => {});

    aucationsStore.setIsAucationChanged(true);
    aucationsStore.setIsAucationChange(true);
    await nextTick();

    expect(refresh).toHaveBeenCalledWith(5);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(aucationsStore.isAucationChange).toBe(false);
    expect(aucationsStore.isAucationChanged).toBe(false);
  });

  it("should stay open when change finished but failed", async () => {
    const { wrapper, aucationsStore } = await mountModal({ show: true, aucation: item });

    aucationsStore.setIsAucationChanged(false);
    aucationsStore.setIsAucationChange(true);
    await nextTick();

    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("should emit close from close and cancel buttons", async () => {
    const { wrapper } = await mountModal({ show: true, aucation: item });
    await wrapper.find(TID("close-edit-modal-btn")).trigger("click");
    await wrapper.find(TID("cancel-edit-modal-btn")).trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
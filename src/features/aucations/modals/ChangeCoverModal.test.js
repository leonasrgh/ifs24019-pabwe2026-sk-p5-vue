import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockAucation = { id: 1, title: "Aucation Test" };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: false, aucation: mockAucation },
    });
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should validate file presence, file type, and file size", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Pilih file cover terlebih dahulu!");

    // Empty files test
    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    await fileInput.trigger("change");

    // Non-image file test
    const badFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
    Object.defineProperty(fileInput.element, "files", {
      value: [badFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Hanya file JPEG, JPG, atau PNG yang diperbolehkan!");

    // Large file test (>1MB)
    const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput.element, "files", {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file terlalu besar. Maksimal 1MB!");
  });

  it("should preview selected image and dispatch cover upload on valid file", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
      preloadedState: {
        isAucationChangeCover: false,
        isAucationChangedCover: false,
      },
    });

    const changeCoverSpy = vi
      .spyOn(aucationsStore, "asyncSetIsAucationChangeCover")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    expect(wrapper.find('img[alt="Preview"]').exists()).toBe(true);

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeCoverSpy).toHaveBeenCalledWith(1, validFile);

    // Simulate completion
    aucationsStore.setIsAucationChangeCover(true);
    aucationsStore.setIsAucationChangedCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle isAucationChangeCover true when isAucationChangedCover is false", async () => {
    const { wrapper, aucationsStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
      preloadedState: {
        isAucationChangeCover: false,
        isAucationChangedCover: false,
      },
    });

    aucationsStore.setIsAucationChangeCover(true);
    aucationsStore.setIsAucationChangedCover(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should trigger onClose when close or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, aucation: mockAucation },
    });

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-cover-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")?.length).toBe(2);
  });
});

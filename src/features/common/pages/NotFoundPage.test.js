import { describe, it, expect, vi } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "../../../test-utils";

const mockRouter = {
  push: vi.fn(),
  go: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe("NotFoundPage", () => {
  it("should render 404 text and description properly", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    expect(wrapper.text()).toContain(
      "Maaf, rute atau halaman yang Anda cari tidak tersedia"
    );
  });

  it("should navigate back when Kembali button is clicked", async () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    const backButton = wrapper.find('[data-testid="back-btn"]');
    await backButton.trigger("click");

    expect(mockRouter.go).toHaveBeenCalledWith(-1);
  });

  it("should navigate to home when Ke Halaman Utama button is clicked", async () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    const homeButton = wrapper.find('[data-testid="home-btn"]');
    await homeButton.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});

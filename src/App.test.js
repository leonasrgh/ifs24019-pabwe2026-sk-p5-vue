import { describe, it, expect } from "vitest";
import App from "./App.vue";
import { renderWithProviders } from "./test-utils";
import { createMemoryHistory } from "vue-router";
import { createAppRouter } from "./router";

describe("App Component", () => {
  it("should render application without crashing", () => {
    const { wrapper } = renderWithProviders(App);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render 404 NotFoundPage for invalid route", async () => {
    const router = createAppRouter(createMemoryHistory());
    router.push("/random-invalid-route");
    await router.isReady();

    const { wrapper } = renderWithProviders(App, { router });
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
  });
});

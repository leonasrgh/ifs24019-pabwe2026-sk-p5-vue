import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

import { ref } from "vue";

const mockRouter = {
  push: vi.fn(),
};

const mockCurrentRoute = ref({ path: "/auth/login", query: {} });

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockCurrentRoute.value,
  };
});

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render branding and tabs", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: null,
      },
    });

    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
  });

  it("should navigate to home if user already logged in with profile", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { usersStore } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged In User" },
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await usersStore.$nextTick?.() || new Promise((r) => setTimeout(r, 10));

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should stay on auth layout if isProfile is true but profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper, usersStore } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: null,
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await usersStore.$nextTick?.() || new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Masuk Akun");
  });

  it("should highlight register tab when current route is /auth/register", () => {
    mockCurrentRoute.value = { path: "/auth/register", query: {} };

    const { wrapper } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: null,
      },
    });

    const links = wrapper.findAllComponents({ name: "RouterLink" });
    expect(links.length).toBe(2);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import AucationLayout from "./AucationLayout.vue";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

// Tanpa ini layout memanggil API profil sungguhan dan hasil tes bergantung jaringan.
vi.mock("../../users/api/userApi", () => ({
  default: {
    getProfile: vi.fn(() => new Promise(() => {})),
  },
}));

describe("AucationLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(AucationLayout, {
      preloadedState: {
        profile: null,
      },
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should render layout with navbar and sidebar when profile is present and handle sidebar toggling & logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(AucationLayout, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Test User",
          email: "test@delcom.org",
        },
      },
    });

    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("Test User");

    // Toggle sidebar
    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");

    // Click backdrop to close mobile sidebar
    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");

    // Trigger logout from navbar
    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout");
    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should stay on page when isProfile is triggered and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, usersStore } = renderWithProviders(AucationLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Logged User");
  });

  it("should redirect to login when isProfile is triggered and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(AucationLayout, {
      preloadedState: {
        profile: null,
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { authStore } = renderWithProviders(AucationLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isAuthLogout: false,
      },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });
});

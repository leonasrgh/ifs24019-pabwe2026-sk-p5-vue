import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockUsers = [
    {
      id: 1,
      name: "Abdullah",
      email: "abdullah@delcom.org",
      photo: "https://example.com/photo.jpg",
      created_at: "2024-10-05T02:53:38.000000Z",
    },
    {
      id: 2,
      name: "Ubaid",
      email: "ubaid@delcom.org",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
    {
      id: 3,
      name: "",
      email: "",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
  ];

  it("should render users list, fallback initial avatar, and search users", async () => {
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: mockUsers,
      },
    });

    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.text()).toContain("U"); // initial avatar fallback

    const searchInput = wrapper.find('[data-testid="search-user-input"]');
    await searchInput.setValue("abdullah");

    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).not.toContain("Ubaid");
  });

  it("should handle state when users in store is null", () => {
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: null,
      },
    });

    expect(wrapper.text()).toContain("Semua Pengguna");
  });

  it("should show empty state when no users found and not loading", () => {
    const { wrapper, usersStore } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();

    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should show loading indicator while users are being fetched", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, usersStore } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    vi.spyOn(usersStore, "asyncSetUsers").mockReturnValue(pendingPromise);

    // Call fetch again to trigger loading
    usersStore.asyncSetUsers();
    await new Promise((r) => setTimeout(r, 10));

    // Cleanup
    resolveLoad();
    await pendingPromise;
  });

  it("should finish loading state when fetch completes", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { createMockPinia } = await import("../../../test-utils");
    const { pinia, usersStore } = createMockPinia({ users: [] });
    vi.spyOn(usersStore, "asyncSetUsers").mockReturnValue(pendingPromise);

    const { wrapper } = renderWithProviders(UsersPage, {
      pinia,
    });

    resolveLoad();
    await pendingPromise;
    await new Promise((r) => setTimeout(r, 20));
  });
});

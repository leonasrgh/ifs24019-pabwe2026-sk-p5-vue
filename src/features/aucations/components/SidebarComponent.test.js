import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

async function renderAt(path, props = {}) {
  const result = renderWithProviders(SidebarComponent, { props });
  await result.router.push(path);
  await flushPromises();
  return result;
}

function activeLabels(wrapper) {
  return wrapper
    .findAll("a")
    .filter((a) => a.classes().includes("bg-indigo-600"))
    .map((a) => a.text());
}

describe("SidebarComponent", () => {
  it("should render all navigation items with correct hrefs", async () => {
    const { wrapper } = await renderAt("/");
    const links = wrapper.findAll("a");
    expect(links.map((a) => a.attributes("href"))).toEqual(["/", "/?tab=mine", "/users", "/profile"]);
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Lelang Saya");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it.each([
    ["/", "Dashboard Lelang"],
    ["/?tab=mine", "Lelang Saya"],
    ["/aucations/5", "Dashboard Lelang"],
    ["/users", "Daftar Pengguna"],
    ["/profile", "Profil Saya"],
  ])("should mark the right item active for %s", async (path, label) => {
    const { wrapper } = await renderAt(path);
    expect(activeLabels(wrapper)).toEqual([label]);
  });

  it("should show backdrop when open and emit close-mobile on backdrop and link click", async () => {
    const { wrapper } = await renderAt("/", { isSidebarOpen: true });

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.emitted("close-mobile")).toHaveLength(1);

    await wrapper.findAll("a")[3].trigger("click");
    await flushPromises();
    expect(wrapper.emitted("close-mobile")).toHaveLength(2);
  });
});

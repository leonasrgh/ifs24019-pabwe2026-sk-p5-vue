import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import HomePage from "./HomePage.vue";
import { renderWithProviders } from "../../../test-utils";
import { createAppRouter } from "../../../router";
import aucationApi from "../api/aucationApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/aucationApi", () => ({
  default: {
    getAucations: vi.fn(),
    getAucationById: vi.fn(),
  },
}));

const TID = (id) => `[data-testid="${id}"]`;
const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
const OPEN = "2099-12-31 23:59:59";
const CLOSED = "2000-01-01 00:00:00";

const items = [
  {
    id: 1, user_id: 1, title: "Oculus Quest 2", description: "Barang mulus", cover: "https://example.com/1.jpg",
    start_bid: 5000000, closed_at: OPEN, author: { name: "Abdullah" }, bids: [{ id: 1, bid: 7000000 }, { id: 2, bid: 6000000 }],
  },
  {
    id: 2, user_id: 2, title: "Keyboard RGB", description: "Masih segel", cover: null,
    start_bid: 200000, closed_at: CLOSED, author: { name: "Budi" }, bids: [3, 4],
  },
  {
    id: 3, user_id: 3, title: null, description: null, cover: null,
    start_bid: 1000, closed_at: OPEN, author: null, bids: [],
  },
  {
    id: 4, user_id: 4, title: "Tanpa Bids", description: "x", cover: null,
    start_bid: 1000, closed_at: OPEN, author: { name: "Cici" },
  },
];

async function renderPage({ path = "/", preloadedState = { profile } } = {}) {
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const result = renderWithProviders(HomePage, { router, preloadedState });
  await flushPromises();
  return result;
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aucationApi.getAucations.mockResolvedValue(items);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render nothing when profile is missing", async () => {
    const { wrapper } = await renderPage({ preloadedState: { profile: null } });
    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("should load all aucations by default", async () => {
    const { wrapper } = await renderPage();
    expect(aucationApi.getAucations).toHaveBeenCalledWith({ isMe: false });
    expect(wrapper.find("h1").text()).toBe("Dashboard Lelang");
    expect(wrapper.find(TID("delete-all-aucations-btn")).exists()).toBe(false);
    expect(wrapper.findAll('[data-testid^="aucation-card-"]')).toHaveLength(4);
  });

  it("should start on 'Lelang Saya' when route has tab=mine", async () => {
    const { wrapper } = await renderPage({ path: "/?tab=mine" });
    expect(aucationApi.getAucations).toHaveBeenCalledWith({ isMe: true });
    expect(wrapper.find("h1").text()).toBe("Lelang Saya");
    expect(wrapper.find(TID("delete-all-aucations-btn")).exists()).toBe(true);
  });

  it("should follow tab changes in the route query", async () => {
    const { wrapper, router } = await renderPage();

    await router.push("/?tab=mine");
    await flushPromises();
    expect(wrapper.find("h1").text()).toBe("Lelang Saya");
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: true });

    await router.push("/?tab=lain");
    await flushPromises();
    expect(wrapper.find("h1").text()).toBe("Dashboard Lelang");
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: false });
  });

  it("should render card details for every data variation", async () => {
    const { wrapper } = await renderPage();

    const card1 = wrapper.find(TID("aucation-card-1"));
    expect(card1.attributes("href")).toBe("/aucations/1");
    expect(card1.text()).toContain("Oculus Quest 2");
    expect(card1.text()).toContain("Abdullah");
    expect(card1.find("img").attributes("src")).toBe("https://example.com/1.jpg");
    expect(wrapper.find(TID("aucation-start-1")).text().replace(/\s/g, " ")).toBe("Rp 5.000.000");
    expect(wrapper.find(TID("aucation-highest-1")).text().replace(/\s/g, " ")).toBe("Rp 7.000.000");
    expect(wrapper.find(TID("aucation-status-1")).text()).toBe("Berlangsung");
    expect(wrapper.find(TID("aucation-countdown-1")).text()).toContain("lagi");

    const card2 = wrapper.find(TID("aucation-card-2"));
    expect(card2.find("img").exists()).toBe(false);
    expect(wrapper.find(TID("aucation-highest-2")).text()).toBe("2 tawaran");
    expect(wrapper.find(TID("aucation-status-2")).text()).toBe("Ditutup");
    expect(wrapper.find(TID("aucation-countdown-2")).text()).toBe("Ditutup");

    expect(wrapper.find(TID("aucation-card-3")).text()).toContain("Pengguna");
    expect(wrapper.find(TID("aucation-highest-3")).text()).toBe("Belum ada tawaran");
    expect(wrapper.find(TID("aucation-highest-4")).text()).toBe("Belum ada tawaran");
  });

  it("should filter by ongoing and closed status using closed_at", async () => {
    const { wrapper } = await renderPage();

    await wrapper.find(TID("tab-ongoing-btn")).trigger("click");
    expect(wrapper.find(TID("aucation-card-1")).exists()).toBe(true);
    expect(wrapper.find(TID("aucation-card-2")).exists()).toBe(false);

    await wrapper.find(TID("tab-closed-btn")).trigger("click");
    expect(wrapper.find(TID("aucation-card-2")).exists()).toBe(true);
    expect(wrapper.find(TID("aucation-card-1")).exists()).toBe(false);

    await wrapper.find(TID("tab-all-btn")).trigger("click");
    expect(wrapper.findAll('[data-testid^="aucation-card-"]')).toHaveLength(4);
    // pindah antar tab non-"mine" tidak memuat ulang data
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(1);
  });

  it("should reload with is_me when switching to 'Lelang Saya'", async () => {
    const { wrapper } = await renderPage();
    await wrapper.find(TID("tab-mine-btn")).trigger("click");
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: true });
  });

  it("should live-search title and description and tolerate null fields", async () => {
    const { wrapper } = await renderPage();
    const search = wrapper.find(TID("search-aucation-input"));

    await search.setValue("oculus");
    expect(wrapper.find(TID("aucation-card-1")).exists()).toBe(true);
    expect(wrapper.find(TID("aucation-card-2")).exists()).toBe(false);
    expect(wrapper.find(TID("aucation-card-3")).exists()).toBe(false);

    await search.setValue("SEGEL");
    expect(wrapper.find(TID("aucation-card-2")).exists()).toBe(true);

    await search.setValue("tidak ada");
    expect(wrapper.text()).toContain("Belum ada lelang yang cocok.");

    await search.setValue("   ");
    expect(wrapper.findAll('[data-testid^="aucation-card-"]')).toHaveLength(4);
  });

  it("should show loading state while the list is loading", async () => {
    aucationApi.getAucations.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderPage();
    expect(wrapper.text()).toContain("Memuat lelang...");
  });

  it("should show the empty state when there is no data", async () => {
    aucationApi.getAucations.mockResolvedValue([]);
    const { wrapper } = await renderPage();
    expect(wrapper.text()).toContain("Belum ada lelang yang cocok.");
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad = () => {};
    aucationApi.getAucations.mockReturnValue(new Promise((resolve) => { resolveLoad = resolve; }));
    const { wrapper } = await renderPage();
    wrapper.unmount();
    resolveLoad([]);
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(1);
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = await renderPage();
    expect(wrapper.find(TID("add-aucation-modal")).exists()).toBe(false);
    await wrapper.find(TID("add-aucation-btn")).trigger("click");
    expect(wrapper.find(TID("add-aucation-modal")).exists()).toBe(true);
    await wrapper.find(TID("close-add-modal-btn")).trigger("click");
    expect(wrapper.find(TID("add-aucation-modal")).exists()).toBe(false);
  });

  it("should delete all own aucations after confirmation only", async () => {
    const confirm = vi.spyOn(toolsHelper, "showConfirmDialog");
    const { wrapper, aucationsStore } = await renderPage({ path: "/?tab=mine" });
    const deleteAll = vi.spyOn(aucationsStore, "asyncSetIsAucationDeleteAll").mockImplementation(() => {});

    confirm.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.find(TID("delete-all-aucations-btn")).trigger("click");
    await flushPromises();
    expect(deleteAll).not.toHaveBeenCalled();

    confirm.mockResolvedValueOnce({ isConfirmed: true });
    await wrapper.find(TID("delete-all-aucations-btn")).trigger("click");
    await flushPromises();
    expect(deleteAll).toHaveBeenCalledTimes(1);
  });

  it("should reload the list after delete-all succeeded, and not when it failed", async () => {
    const { aucationsStore } = await renderPage({ path: "/?tab=mine" });
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(1);

    aucationsStore.setIsAucationDeletedAll(true);
    aucationsStore.setIsAucationDeleteAll(true);
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(2);
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: true });
    expect(aucationsStore.isAucationDeleteAll).toBe(false);
    expect(aucationsStore.isAucationDeletedAll).toBe(false);

    aucationsStore.setIsAucationDeletedAll(false);
    aucationsStore.setIsAucationDeleteAll(true);
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(2);
  });

  it("should refresh the countdown clock periodically", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { wrapper } = await renderPage();
    const before = wrapper.find(TID("aucation-countdown-1")).text();
    vi.advanceTimersByTime(30000);
    await flushPromises();
    expect(wrapper.find(TID("aucation-countdown-1")).text()).toBe(before);
    wrapper.unmount();
  });
});

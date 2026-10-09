import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { reactive } from "vue";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import aucationApi from "../api/aucationApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/aucationApi", () => ({
  default: {
    getAucations: vi.fn(),
    getAucationById: vi.fn(),
  },
}));

const mockRouter = { push: vi.fn() };
const mockRoute = reactive({ params: { aucationId: "5" } });

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockRoute,
  };
});

const TID = (id) => `[data-testid="${id}"]`;
const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
const OPEN = "2099-12-31 23:59:59";
const CLOSED = "2000-01-01 00:00:00";

const base = {
  id: 5,
  user_id: 1,
  title: "Oculus Quest 2",
  description: "Oculus Quest 2 second mulus",
  cover: "https://example.com/cover.jpg",
  start_bid: 5000000,
  closed_at: OPEN,
  created_at: "2024-10-05T08:34:04.000000Z",
  author: { name: "Abdullah" },
  bids: [
    { id: 1, bid: 6000000, created_at: "2024-10-05T08:40:00.000000Z" },
    { id: 2, bid: 7000000, created_at: "2024-10-05T08:44:12.000000Z" },
  ],
  my_bid: { id: 2, bid: 7000000 },
};

async function renderPage(aucation, preloadedState = { profile }) {
  aucationApi.getAucationById.mockResolvedValue(aucation);
  const result = renderWithProviders(DetailPage, { preloadedState });
  await flushPromises();
  return result;
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.params.aucationId = "5";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("loading and redirects", () => {
    it("should show a spinner while profile or aucation is missing", async () => {
      aucationApi.getAucationById.mockReturnValue(new Promise(() => {}));
      const { wrapper } = renderWithProviders(DetailPage, { preloadedState: { profile } });
      await flushPromises();
      expect(wrapper.find(".animate-spin").exists()).toBe(true);
      expect(wrapper.find("h1").text()).toBe("Memuat detail lelang...");
    });

    it("should show a spinner when profile is missing", async () => {
      const { wrapper } = await renderPage(base, { profile: null });
      expect(wrapper.find(".animate-spin").exists()).toBe(true);
    });

    it("should fetch by route id and refetch when the id changes", async () => {
      await renderPage(base);
      expect(aucationApi.getAucationById).toHaveBeenCalledWith("5");

      mockRoute.params.aucationId = "9";
      await flushPromises();
      expect(aucationApi.getAucationById).toHaveBeenLastCalledWith("9");
    });

    it("should redirect home when the aucation cannot be loaded", async () => {
      aucationApi.getAucationById.mockRejectedValue(new Error("not found"));
      renderWithProviders(DetailPage, { preloadedState: { profile } });
      await flushPromises();
      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });

    it("should stay when the aucation is loaded", async () => {
      await renderPage(base);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe("content", () => {
    it("should render details, status, prices and cover", async () => {
      const { wrapper } = await renderPage(base);
      expect(wrapper.find(TID("detail-title")).text()).toBe("Oculus Quest 2");
      expect(wrapper.find(TID("detail-author")).text()).toBe("Abdullah");
      expect(wrapper.find(TID("detail-start-bid")).text().replace(/\s/g, " ")).toBe("Rp 5.000.000");
      expect(wrapper.find(TID("detail-highest-bid")).text().replace(/\s/g, " ")).toBe("Rp 7.000.000");
      expect(wrapper.find(TID("detail-status-badge")).text()).toBe("Lelang Berlangsung");
      expect(wrapper.find(TID("detail-countdown")).text()).toContain("lagi");
      expect(wrapper.find(TID("aucation-cover-image")).attributes("src")).toBe("https://example.com/cover.jpg");
      expect(wrapper.find(TID("back-to-aucations-link")).attributes("href")).toBe("/");
    });

    it("should render closed state, placeholder cover and fallbacks", async () => {
      const { wrapper } = await renderPage({
        ...base, closed_at: CLOSED, cover: null, author: null, description: null, bids: undefined, my_bid: null,
      });
      expect(wrapper.find(TID("detail-status-badge")).text()).toBe("Lelang Ditutup");
      expect(wrapper.find(TID("detail-countdown")).text()).toBe("Ditutup");
      expect(wrapper.find(TID("aucation-cover-placeholder")).exists()).toBe(true);
      expect(wrapper.find(TID("detail-author")).text()).toBe("Pengguna");
      expect(wrapper.find(TID("detail-highest-bid")).text()).toBe("Belum ada tawaran");
      expect(wrapper.find(TID("no-bids")).exists()).toBe(true);
    });
  });

  describe("roles", () => {
    it("should show owner actions and hide the bid button for the owner", async () => {
      const { wrapper } = await renderPage(base);
      expect(wrapper.find(TID("edit-cover-btn")).exists()).toBe(true);
      expect(wrapper.find(TID("edit-detail-btn")).exists()).toBe(true);
      expect(wrapper.find(TID("delete-detail-btn")).exists()).toBe(true);
      expect(wrapper.find(TID("open-bid-btn")).exists()).toBe(false);
    });

    it("should show the bid button to other users while the aucation is open", async () => {
      const { wrapper } = await renderPage({ ...base, user_id: 99 });
      expect(wrapper.find(TID("edit-cover-btn")).exists()).toBe(false);
      expect(wrapper.find(TID("delete-detail-btn")).exists()).toBe(false);
      expect(wrapper.find(TID("open-bid-btn")).exists()).toBe(true);
    });

    it("should hide the bid button for other users when the aucation is closed", async () => {
      const { wrapper } = await renderPage({ ...base, user_id: 99, closed_at: CLOSED });
      expect(wrapper.find(TID("open-bid-btn")).exists()).toBe(false);
    });
  });

  describe("bid history", () => {
    it("should list bids from highest to lowest", async () => {
      const { wrapper } = await renderPage(base);
      const rows = wrapper.findAll('[data-testid^="bid-"]').filter((w) => /^bid-\d+$/.test(w.attributes("data-testid")));
      expect(rows.map((r) => r.attributes("data-testid"))).toEqual(["bid-2", "bid-1"]);
      expect(wrapper.find(TID("no-bids")).exists()).toBe(false);
    });

    it("should show my bid with a cancel button while open", async () => {
      const { wrapper } = await renderPage(base);
      expect(wrapper.find(TID("my-bid-amount")).text().replace(/\s/g, " ")).toBe("Rp 7.000.000");
      expect(wrapper.find(TID("delete-bid-btn")).exists()).toBe(true);
    });

    it("should hide the cancel button when closed and the section without my bid", async () => {
      const closed = await renderPage({ ...base, closed_at: CLOSED });
      expect(closed.wrapper.find(TID("my-bid")).exists()).toBe(true);
      expect(closed.wrapper.find(TID("delete-bid-btn")).exists()).toBe(false);
      closed.wrapper.unmount();

      const none = await renderPage({ ...base, my_bid: null });
      expect(none.wrapper.find(TID("my-bid")).exists()).toBe(false);
    });
  });

  describe("modals", () => {
    it("should open and close the cover, edit and bid modals", async () => {
      const owner = await renderPage(base);
      await owner.wrapper.find(TID("edit-cover-btn")).trigger("click");
      expect(owner.wrapper.find(TID("change-cover-modal")).exists()).toBe(true);
      await owner.wrapper.find(TID("close-cover-modal-btn")).trigger("click");
      expect(owner.wrapper.find(TID("change-cover-modal")).exists()).toBe(false);

      await owner.wrapper.find(TID("edit-detail-btn")).trigger("click");
      expect(owner.wrapper.find(TID("edit-aucation-modal")).exists()).toBe(true);
      await owner.wrapper.find(TID("close-edit-modal-btn")).trigger("click");
      expect(owner.wrapper.find(TID("edit-aucation-modal")).exists()).toBe(false);
      owner.wrapper.unmount();

      const bidder = await renderPage({ ...base, user_id: 99 });
      await bidder.wrapper.find(TID("open-bid-btn")).trigger("click");
      expect(bidder.wrapper.find(TID("bid-modal")).exists()).toBe(true);
      await bidder.wrapper.find(TID("close-bid-modal-btn")).trigger("click");
      expect(bidder.wrapper.find(TID("bid-modal")).exists()).toBe(false);
    });
  });

  describe("delete aucation", () => {
    it("should delete after confirmation and skip when cancelled", async () => {
      const confirm = vi.spyOn(toolsHelper, "showConfirmDialog");
      const { wrapper, aucationsStore } = await renderPage(base);
      const del = vi.spyOn(aucationsStore, "asyncSetIsAucationDelete").mockImplementation(() => {});

      confirm.mockResolvedValueOnce({ isConfirmed: false });
      await wrapper.find(TID("delete-detail-btn")).trigger("click");
      await flushPromises();
      expect(del).not.toHaveBeenCalled();

      confirm.mockResolvedValueOnce({ isConfirmed: true });
      await wrapper.find(TID("delete-detail-btn")).trigger("click");
      await flushPromises();
      expect(del).toHaveBeenCalledWith(5);
    });

    it("should go home after deletion and stay when deletion failed", async () => {
      const { aucationsStore } = await renderPage(base);

      aucationsStore.setIsAucationDeleted(false);
      aucationsStore.setIsAucationDelete(true);
      await flushPromises();
      expect(mockRouter.push).not.toHaveBeenCalled();

      aucationsStore.setIsAucationDeleted(true);
      aucationsStore.setIsAucationDelete(true);
      await flushPromises();
      expect(mockRouter.push).toHaveBeenCalledWith("/");
      expect(aucationsStore.isAucationDeleted).toBe(false);
    });
  });

  describe("delete bid", () => {
    it("should cancel my bid after confirmation and skip when cancelled", async () => {
      const confirm = vi.spyOn(toolsHelper, "showConfirmDialog");
      const { wrapper, aucationsStore } = await renderPage(base);
      const del = vi.spyOn(aucationsStore, "asyncSetIsBidDelete").mockImplementation(() => {});

      confirm.mockResolvedValueOnce({ isConfirmed: false });
      await wrapper.find(TID("delete-bid-btn")).trigger("click");
      await flushPromises();
      expect(del).not.toHaveBeenCalled();

      confirm.mockResolvedValueOnce({ isConfirmed: true });
      await wrapper.find(TID("delete-bid-btn")).trigger("click");
      await flushPromises();
      expect(del).toHaveBeenCalledWith(5);
    });

    it("should refresh after the bid was cancelled and not when it failed", async () => {
      const { aucationsStore } = await renderPage(base);
      expect(aucationApi.getAucationById).toHaveBeenCalledTimes(1);

      aucationsStore.setIsBidDeleted(false);
      aucationsStore.setIsBidDelete(true);
      await flushPromises();
      expect(aucationApi.getAucationById).toHaveBeenCalledTimes(1);

      aucationsStore.setIsBidDeleted(true);
      aucationsStore.setIsBidDelete(true);
      await flushPromises();
      expect(aucationApi.getAucationById).toHaveBeenCalledTimes(2);
      expect(aucationsStore.isBidDeleted).toBe(false);
    });
  });

  it("should refresh the countdown clock periodically and clean up on unmount", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { wrapper } = await renderPage(base);
    vi.advanceTimersByTime(30000);
    await flushPromises();
    expect(wrapper.find(TID("detail-countdown")).text()).toContain("lagi");
    wrapper.unmount();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import aucationApi from "./aucationApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  });
}

describe("aucationApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAucations", () => {
    it("should fetch all aucations without filters by default", async () => {
      const spy = mockResponse({ status: "success", data: { aucations: [{ id: 1 }] } });
      expect(await aucationApi.getAucations()).toEqual([{ id: 1 }]);
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/aucations\/$/), { method: "GET" });
    });

    it("should send is_me and is_closed filters", async () => {
      const spy = mockResponse({ status: "success", data: { aucations: [] } });
      await aucationApi.getAucations({ isMe: true, isClosed: 1 });
      expect(spy.mock.calls[0][0]).toMatch(/\/aucations\/\?is_me=1&is_closed=1$/);
    });

    it("should send is_closed=0 (falsy but valid)", async () => {
      const spy = mockResponse({ status: "success", data: { aucations: [] } });
      await aucationApi.getAucations({ isClosed: 0 });
      expect(spy.mock.calls[0][0]).toMatch(/\?is_closed=0$/);
    });

    it("should ignore empty, null and undefined is_closed", async () => {
      const spy = mockResponse({ status: "success", data: { aucations: [] } });
      await aucationApi.getAucations({ isClosed: "" });
      await aucationApi.getAucations({ isClosed: null });
      await aucationApi.getAucations({ isClosed: undefined });
      spy.mock.calls.forEach((call) => expect(call[0]).not.toContain("?"));
    });

    it("should return empty array when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await aucationApi.getAucations()).toEqual([]);
    });

    it("should accept success flag, and throw API or fallback message on failure", async () => {
      mockResponse({ success: true, data: { aucations: [{ id: 2 }] } });
      expect(await aucationApi.getAucations()).toEqual([{ id: 2 }]);

      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(aucationApi.getAucations()).rejects.toThrow("Unauthenticated.");

      mockResponse({ status: "fail" });
      await expect(aucationApi.getAucations()).rejects.toThrow("Gagal mengambil data lelang");
    });
  });

  describe("getAucationById", () => {
    it("should return the detail", async () => {
      const spy = mockResponse({ status: "success", data: { aucation: { id: 9 } } });
      expect(await aucationApi.getAucationById(9)).toEqual({ id: 9 });
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/aucations\/9$/), { method: "GET" });
    });

    it("should return undefined when data is missing and throw on failure", async () => {
      mockResponse({ status: "success" });
      expect(await aucationApi.getAucationById(9)).toBeUndefined();

      mockResponse({ status: "fail" });
      await expect(aucationApi.getAucationById(9)).rejects.toThrow("Gagal mengambil detail lelang");
    });
  });

  describe("postAucation", () => {
    it("should create an aucation with numeric start_bid", async () => {
      const spy = mockResponse({ status: "success", data: { aucation_id: 1 } });
      const data = await aucationApi.postAucation("Judul", "Deskripsi", "10000", "2026-12-31 23:59:59");

      expect(data).toEqual({ aucation_id: 1 });
      expect(spy.mock.calls[0][0]).toMatch(/\/aucations\/$/);
      expect(spy.mock.calls[0][1].method).toBe("POST");
      expect(JSON.parse(spy.mock.calls[0][1].body)).toEqual({
        title: "Judul",
        description: "Deskripsi",
        start_bid: 10000,
        closed_at: "2026-12-31 23:59:59",
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(aucationApi.postAucation("", "", 0, "")).rejects.toThrow("Data tidak valid");
      mockResponse({ status: "fail" });
      await expect(aucationApi.postAucation("", "", 0, "")).rejects.toThrow("Gagal menambahkan lelang");
    });
  });

  describe("putAucation", () => {
    it("should update an aucation", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });
      expect(await aucationApi.putAucation(3, "T", "D", 5000, "2026-01-01 10:00:00")).toBe(
        "Berhasil mengubah data"
      );
      expect(spy.mock.calls[0][0]).toMatch(/\/aucations\/3$/);
      expect(spy.mock.calls[0][1].method).toBe("PUT");
      expect(JSON.parse(spy.mock.calls[0][1].body).start_bid).toBe(5000);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(aucationApi.putAucation(3, "", "", 0, "")).rejects.toThrow("Gagal mengubah lelang");
    });
  });

  describe("postAucationCover", () => {
    it("should upload cover with FormData", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
      expect(await aucationApi.postAucationCover(1, file)).toBe("Berhasil mengubah cover");
      expect(spy.mock.calls[0][0]).toMatch(/\/aucations\/1\/cover$/);
      expect(spy.mock.calls[0][1].body.get("cover")).toBeInstanceOf(File);
    });

    it("should use default filename and throw on failure", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      await aucationApi.postAucationCover(2, new Blob(["x"], { type: "image/png" }));
      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");

      mockResponse({ status: "fail" });
      await expect(aucationApi.postAucationCover(1, new File(["x"], "c.png"))).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("deleteAucation", () => {
    it("should delete an aucation and throw on failure", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus data" });
      expect(await aucationApi.deleteAucation(4)).toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/aucations\/4$/), { method: "DELETE" });

      mockResponse({ status: "fail" });
      await expect(aucationApi.deleteAucation(4)).rejects.toThrow("Gagal menghapus lelang");
    });
  });

  describe("bids", () => {
    it("postBid should send numeric bid", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil memberikan tawaran pada lelang" });
      expect(await aucationApi.postBid(1, "10000")).toBe("Berhasil memberikan tawaran pada lelang");
      expect(spy.mock.calls[0][0]).toMatch(/\/aucations\/1\/bids$/);
      expect(JSON.parse(spy.mock.calls[0][1].body)).toEqual({ bid: 10000 });

      mockResponse({ status: "fail" });
      await expect(aucationApi.postBid(1, 1)).rejects.toThrow("Gagal mengajukan penawaran");
    });

    it("deleteBid should delete own bid", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus tawaran pada lelang" });
      expect(await aucationApi.deleteBid(1)).toBe("Berhasil menghapus tawaran pada lelang");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/aucations\/1\/bids$/), { method: "DELETE" });

      mockResponse({ status: "fail" });
      await expect(aucationApi.deleteBid(1)).rejects.toThrow("Gagal menghapus penawaran");
    });
  });

  describe("deleteAllAucations", () => {
    it("should delete all own aucations and throw on failure", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus semua data pelelangan" });
      expect(await aucationApi.deleteAllAucations()).toBe("Berhasil menghapus semua data pelelangan");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/aucations\/$/), { method: "DELETE" });

      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(aucationApi.deleteAllAucations()).rejects.toThrow("Unauthenticated.");
      mockResponse({ status: "fail" });
      await expect(aucationApi.deleteAllAucations()).rejects.toThrow("Gagal menghapus semua lelang");
    });
  });
});

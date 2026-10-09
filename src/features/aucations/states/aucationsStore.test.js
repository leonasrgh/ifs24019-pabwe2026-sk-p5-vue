import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAucationsStore } from "./aucationsStore";
import aucationApi from "../api/aucationApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const silent = () => Promise.resolve({});

describe("aucationsStore", () => {
  let store;

  beforeEach(() => {
    vi.restoreAllMocks();
    setActivePinia(createPinia());
    store = useAucationsStore();
  });

  it("should have the expected initial state", () => {
    expect(store.aucations).toEqual([]);
    expect(store.aucation).toBeNull();
    expect(store.isAucation).toBe(false);
    expect(store.query).toEqual({});
    [
      "isAucationAdd", "isAucationAdded", "isAucationChange", "isAucationChanged",
      "isAucationChangeCover", "isAucationChangedCover", "isAucationDelete", "isAucationDeleted",
      "isBidAdd", "isBidAdded", "isBidDelete", "isBidDeleted", "isAucationDeleteAll", "isAucationDeletedAll",
    ].forEach((key) => expect(store[key]).toBe(false));
  });

  it("should set list and detail", () => {
    store.setAucations([{ id: 1 }]);
    store.setAucation({ id: 2 });
    expect(store.aucations).toEqual([{ id: 1 }]);
    expect(store.aucation).toEqual({ id: 2 });
  });

  it.each([
    ["setIsAucation", "isAucation"],
    ["setIsAucationAdd", "isAucationAdd"],
    ["setIsAucationAdded", "isAucationAdded"],
    ["setIsAucationChange", "isAucationChange"],
    ["setIsAucationChanged", "isAucationChanged"],
    ["setIsAucationChangeCover", "isAucationChangeCover"],
    ["setIsAucationChangedCover", "isAucationChangedCover"],
    ["setIsAucationDelete", "isAucationDelete"],
    ["setIsAucationDeleted", "isAucationDeleted"],
    ["setIsBidAdd", "isBidAdd"],
    ["setIsBidAdded", "isBidAdded"],
    ["setIsBidDelete", "isBidDelete"],
    ["setIsBidDeleted", "isBidDeleted"],
    ["setIsAucationDeleteAll", "isAucationDeleteAll"],
    ["setIsAucationDeletedAll", "isAucationDeletedAll"],
  ])("%s should set %s", (setter, key) => {
    store[setter](true);
    expect(store[key]).toBe(true);
    store[setter](false);
    expect(store[key]).toBe(false);
  });

  describe("asyncSetAucations", () => {
    it("should load aucations and remember the query", async () => {
      const spy = vi.spyOn(aucationApi, "getAucations").mockResolvedValue([{ id: 1 }]);
      await store.asyncSetAucations({ isMe: true });
      expect(spy).toHaveBeenCalledWith({ isMe: true });
      expect(store.aucations).toEqual([{ id: 1 }]);
      expect(store.query).toEqual({ isMe: true });
    });

    it("should default to empty params and fall back to empty list on failure", async () => {
      const spy = vi.spyOn(aucationApi, "getAucations").mockRejectedValue(new Error("fail"));
      store.setAucations([{ id: 1 }]);
      await store.asyncSetAucations();
      expect(spy).toHaveBeenCalledWith({});
      expect(store.aucations).toEqual([]);
    });

    it("asyncReloadAucations should reuse the last query", async () => {
      const spy = vi.spyOn(aucationApi, "getAucations").mockResolvedValue([]);
      await store.asyncSetAucations({ isMe: true });
      await store.asyncReloadAucations();
      expect(spy).toHaveBeenLastCalledWith({ isMe: true });
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("asyncSetAucation", () => {
    it("should load detail and flag isAucation", async () => {
      vi.spyOn(aucationApi, "getAucationById").mockResolvedValue({ id: 7 });
      await store.asyncSetAucation(7);
      expect(store.aucation).toEqual({ id: 7 });
      expect(store.isAucation).toBe(true);
    });

    it("should set null and flag isAucation on failure", async () => {
      vi.spyOn(aucationApi, "getAucationById").mockRejectedValue(new Error("fail"));
      store.setAucation({ id: 1 });
      await store.asyncSetAucation(7);
      expect(store.aucation).toBeNull();
      expect(store.isAucation).toBe(true);
    });
  });

  describe("asyncSetIsAucationAdd", () => {
    it("should show success dialog and flag added", async () => {
      const spy = vi.spyOn(aucationApi, "postAucation").mockResolvedValue({ aucation_id: 1 });
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      await store.asyncSetIsAucationAdd("T", "D", 1000, "2026-01-01 10:00:00");
      expect(spy).toHaveBeenCalledWith("T", "D", 1000, "2026-01-01 10:00:00");
      expect(success).toHaveBeenCalledWith("Lelang berhasil ditambahkan!");
      expect(store.isAucationAdded).toBe(true);
      expect(store.isAucationAdd).toBe(true);
    });

    it("should show error dialog and flag not added on failure", async () => {
      vi.spyOn(aucationApi, "postAucation").mockRejectedValue(new Error("Data tidak valid"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
      await store.asyncSetIsAucationAdd("", "", 0, "");
      expect(error).toHaveBeenCalledWith("Data tidak valid");
      expect(store.isAucationAdded).toBe(false);
      expect(store.isAucationAdd).toBe(true);
    });
  });

  describe.each([
    ["asyncSetIsAucationChange", "putAucation", [1, "T", "D", 1000, "x"], "Lelang berhasil diperbarui!", "isAucationChanged", "isAucationChange"],
    ["asyncSetIsAucationChangeCover", "postAucationCover", [1, new File(["x"], "c.jpg")], "Cover berhasil diperbarui!", "isAucationChangedCover", "isAucationChangeCover"],
    ["asyncSetIsAucationDelete", "deleteAucation", [1], "Lelang berhasil dihapus!", "isAucationDeleted", "isAucationDelete"],
    ["asyncSetIsBidAdd", "postBid", [1, 5000], "Penawaran berhasil diajukan!", "isBidAdded", "isBidAdd"],
    ["asyncSetIsBidDelete", "deleteBid", [1], "Penawaran berhasil dihapus!", "isBidDeleted", "isBidDelete"],
    ["asyncSetIsAucationDeleteAll", "deleteAllAucations", [], "Semua lelang berhasil dihapus!", "isAucationDeletedAll", "isAucationDeleteAll"],
  ])("%s", (action, apiFn, args, defaultMessage, doneKey, finishKey) => {
    it("should show API message and flag done on success", async () => {
      vi.spyOn(aucationApi, apiFn).mockResolvedValue("Pesan API");
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      await store[action](...args);
      expect(success).toHaveBeenCalledWith("Pesan API");
      expect(store[doneKey]).toBe(true);
      expect(store[finishKey]).toBe(true);
    });

    it("should use default message when API message is empty", async () => {
      vi.spyOn(aucationApi, apiFn).mockResolvedValue(undefined);
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      await store[action](...args);
      expect(success).toHaveBeenCalledWith(defaultMessage);
    });

    it("should show error dialog and flag failure when request fails", async () => {
      vi.spyOn(aucationApi, apiFn).mockRejectedValue(new Error("Gagal"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
      await store[action](...args);
      expect(error).toHaveBeenCalledWith("Gagal");
      expect(store[doneKey]).toBe(false);
      expect(store[finishKey]).toBe(true);
    });
  });
});

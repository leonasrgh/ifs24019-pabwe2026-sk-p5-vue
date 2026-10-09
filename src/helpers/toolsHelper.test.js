import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
  formatRupiah,
  toApiDateTime,
  toInputDateTime,
  isAucationClosed,
  formatCountdown,
  getHighestBid,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showErrorDialog("Error test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showErrorDialog("Error test");
  });

  it("should call Swal.fire for showWarningDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showWarningDialog("Warning test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showWarningDialog("Warning test");
  });

  it("should call Swal.fire for showSuccessDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showSuccessDialog("Success test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showSuccessDialog("Success test");
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    const res = await showConfirmDialog("Confirm test?");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-02-26T02:34:26.000000Z");
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });
});

describe("auction helpers", () => {
  it("formatRupiah should format numbers as rupiah without decimals", () => {
    expect(formatRupiah(7000000).replace(/\s/g, " ")).toBe("Rp 7.000.000");
    expect(formatRupiah("10000").replace(/\s/g, " ")).toBe("Rp 10.000");
    expect(formatRupiah("abc").replace(/\s/g, " ")).toBe("Rp 0");
  });

  it("toApiDateTime should convert datetime-local value to API format", () => {
    expect(toApiDateTime("2026-12-31T23:59")).toBe("2026-12-31 23:59:00");
    expect(toApiDateTime("2026-12-31T23:59:30")).toBe("2026-12-31 23:59:30");
    expect(toApiDateTime("")).toBe("");
  });

  it("toInputDateTime should convert API format to datetime-local value", () => {
    expect(toInputDateTime("2024-10-05 22:00:00")).toBe("2024-10-05T22:00");
    expect(toInputDateTime(null)).toBe("");
  });

  it("isAucationClosed should compare closed_at with the current time", () => {
    const now = new Date("2026-10-06T12:00:00").getTime();
    expect(isAucationClosed("2026-10-06 11:59:59", now)).toBe(true);
    expect(isAucationClosed("2026-10-06 12:00:01", now)).toBe(false);
    expect(isAucationClosed("", now)).toBe(false);
    expect(typeof isAucationClosed("2000-01-01 00:00:00")).toBe("boolean");
  });

  it("formatCountdown should describe remaining time", () => {
    const now = new Date("2026-10-06T12:00:00").getTime();
    expect(formatCountdown("", now)).toBe("-");
    expect(formatCountdown("2026-10-06 11:00:00", now)).toBe("Ditutup");
    expect(formatCountdown("2026-10-06 12:30:00", now)).toBe("30 menit lagi");
    expect(formatCountdown("2026-10-06 14:15:00", now)).toBe("2 jam 15 menit lagi");
    expect(formatCountdown("2026-10-08 15:00:00", now)).toBe("2 hari 3 jam lagi");
    expect(typeof formatCountdown("2099-01-01 00:00:00")).toBe("string");
  });

  it("getHighestBid should read bid objects and ignore plain ids", () => {
    expect(getHighestBid([{ id: 1, bid: 5000 }, { id: 2, bid: "7000" }])).toBe(7000);
    expect(getHighestBid([2, 3])).toBeNull();
    expect(getHighestBid([])).toBeNull();
    expect(getHighestBid(undefined)).toBeNull();
    expect(getHighestBid([null, { id: 1, bid: 100 }])).toBe(100);
  });
});

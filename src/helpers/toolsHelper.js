import Swal from "sweetalert2";

export function showErrorDialog(message) {
  return Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showWarningDialog(message) {
  return Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#f59e0b",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showSuccessDialog(message) {
  return Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#10b981",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showConfirmDialog(message) {
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#94a3b8",
  });
}

export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRupiah(value) {
  const amount = Number(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isNaN(amount) ? 0 : amount);
}

// "2026-12-31T23:59" (datetime-local) -> "2026-12-31 23:59:00" (format API)
export function toApiDateTime(value) {
  if (!value) return "";
  const text = value.replace("T", " ");
  return text.length === 16 ? `${text}:00` : text;
}

// "2024-10-05 22:00:00" (format API) -> "2024-10-05T22:00" (datetime-local)
export function toInputDateTime(value) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

function parseClosedAt(closedAt) {
  return new Date(String(closedAt).replace(" ", "T"));
}

export function isAucationClosed(closedAt, now = Date.now()) {
  if (!closedAt) return false;
  return parseClosedAt(closedAt).getTime() <= now;
}

export function formatCountdown(closedAt, now = Date.now()) {
  if (!closedAt) return "-";
  const diff = parseClosedAt(closedAt).getTime() - now;
  if (diff <= 0) return "Ditutup";

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${minutes} menit lagi`;
  return `${minutes} menit lagi`;
}

// Pada daftar lelang API hanya mengirim id tawaran; pada detail berupa objek {id, bid}.
export function getHighestBid(bids) {
  const amounts = (bids || [])
    .filter((item) => item && typeof item === "object")
    .map((item) => Number(item.bid));
  return amounts.length ? Math.max(...amounts) : null;
}

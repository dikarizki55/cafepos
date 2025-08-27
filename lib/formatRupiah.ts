export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatRupiahK(value: number): string {
  return Math.floor(value / 1000).toString() + "K";
}

export function formatDate(unformatDate: string | Date) {
  const date = new Date(unformatDate);
  if (isNaN(date.getTime())) return "ERROR";
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  // format tanggal => 19 Aug 2025
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  // gabungkan
  const result = `${time} ${day}`;

  return result;
}

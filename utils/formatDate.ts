export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return date
    .toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\./g, "."); // hasil: 25/11/2025, 20.32.12
}

// Helper untuk menentukan warna status
export function getStatusColor(status: string) {
  if (status.includes("qualified") || status === "opp_qualified")
    return "green";
  if (status.includes("lost") || status === "opp_lost") return "red";
  if (status === "opp_sq") return "blue";
  if (status.includes("prospecting")) return "indigo";
  if (status.includes("new")) return "yellow";
  return "gray";
}

// Helper untuk menentukan variant badge status
export function getStatusVariant(status: string) {
  if (status.includes("qualified") || status === "opp_qualified")
    return "success";
  if (status.includes("lost") || status === "opp_lost") return "danger";
  if (status === "opp_sq") return "info";
  if (status.includes("prospecting")) return "default";
  if (status.includes("new")) return "warning";
  return "secondary";
}

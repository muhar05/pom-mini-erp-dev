import type { CSSObjectWithLabel } from "react-select";
import type { StylesConfig, GroupBase } from "react-select";
import { formatStatusDisplay } from "@/utils/formatStatus";

// Option constants
export const TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "government", label: "Government" },
];

export const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "cold_call", label: "Cold Call" },
  { value: "event", label: "Event" },
];

export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

export const LOCATION_OPTIONS = [
  ...PROVINCES.map((prov) => ({ value: prov, label: prov })),
  { value: "luar_negeri", label: "Luar negeri – Sebutkan nama Negara" },
];

// Fungsi helper
export function findOptionValue(
  raw?: string | null,
  options?: ReadonlyArray<{ value: string; label: string }>,
  fallback = ""
) {
  if (!raw) return fallback;
  const s = String(raw);

  if (options?.some((o) => o.value === s)) return s;

  const lower = s.toLowerCase();
  if (options?.some((o) => o.value.toLowerCase() === lower)) {
    return options!.find((o) => o.value.toLowerCase() === lower)!.value;
  }

  const byLabel = options?.find((o) => o.label.toLowerCase() === lower);
  if (byLabel) return byLabel.value;

  const normalized = lower.replace(/\s+/g, "_");
  if (options?.some((o) => o.value === normalized)) return normalized;

  return fallback;
}

export const selectStyles: StylesConfig<any, boolean, GroupBase<any>> = {
  control: (base: CSSObjectWithLabel, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#F3F4F6" : "#fff",
    borderColor: state.isFocused ? "#10B981" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 2px #10B98133" : "none",
    color: "#111827",
    minHeight: 40,
    fontSize: 15,
  }),
  option: (base: CSSObjectWithLabel, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#10B981"
      : state.isFocused
      ? "#ECFDF5"
      : "#fff",
    color: state.isSelected ? "#fff" : "#111827",
    fontWeight: state.isSelected ? 600 : 400,
    fontSize: 15,
  }),
  multiValue: (base: CSSObjectWithLabel) => ({
    ...base,
    backgroundColor: "#ECFDF5",
    color: "#047857",
    fontWeight: 500,
  }),
  multiValueLabel: (base: CSSObjectWithLabel) => ({
    ...base,
    color: "#047857",
    fontWeight: 500,
  }),
  multiValueRemove: (base: CSSObjectWithLabel) => ({
    ...base,
    color: "#047857",
    ":hover": {
      backgroundColor: "#10B981",
      color: "#fff",
    },
  }),
  menu: (base: CSSObjectWithLabel) => ({
    ...base,
    zIndex: 20,
  }),
};

import CustomSelect from "@/components/shared/custom-select";

export default function Filters() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <CustomSelect
        placeholder="Status"
        options={["Open", "Closed", "Pending"]}
      />
      {/* Tambahkan filter lain sesuai kebutuhan */}
    </div>
  );
}

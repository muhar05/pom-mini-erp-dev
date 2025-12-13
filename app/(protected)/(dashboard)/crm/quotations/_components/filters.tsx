import { Input } from "@/components/ui/input";
import CustomSelect from "@/components/shared/custom-select";

export default function Filters() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Input placeholder="Search No Quotation / Customer" />

      <CustomSelect
        placeholder="Status"
        options={["Open", "Closed", "Pending"]}
      />

      <CustomSelect
        placeholder="Sales / PIC"
        options={["Sales 1", "Sales 2"]}
      />

      <div className="flex gap-2 items-center">
        <label>Dari</label>
        <Input type="date" />
        <label>Sampai</label>
        <Input type="date" />
      </div>

      <CustomSelect placeholder="Type" options={["Personal", "Perusahaan"]} />
    </div>
  );
}

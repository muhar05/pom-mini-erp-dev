import React from "react";
import { Input } from "@/components/ui/input";
import CustomSelect from "@/components/shared/custom-select";

export default function LeadsFilter() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Input placeholder="Search Nama Customer / No Lead" />

      <CustomSelect
        placeholder="Status"
        options={[
          "New", // Baru masuk, belum disentuh.
          "Contacted", // Sudah dicoba dihubungi.
          "Nurturing", // Belum siap beli tapi potensial.
          "Unqualified", // Tidak layak jadi penjualan.
          "Invalid", // Data palsu atau salah.
          "Qualified", // Sudah layak diproses.
          "Converted", // Sudah naik level jadi Opportunity.
        ]}
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

      <CustomSelect
        placeholder="Company Type"
        options={["Personal", "Perusahaan"]}
      />

      <CustomSelect placeholder="Source" options={["Source 1", "Source 2"]} />

      <CustomSelect
        placeholder="Produk diminati"
        options={["Produk A", "Produk B"]}
      />
    </div>
  );
}

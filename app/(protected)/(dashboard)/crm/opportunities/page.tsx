"use client";

import React, { useState, useMemo } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import OpportunitiesTable from "./_components/opportunities-table";
import OpportunityDetailDrawer from "./_components/opportunity-detail-drawer";
import OpportunityEditForm from "./_components/opportunity-edit-form";
import OpportunityDeleteDialog from "./_components/opportunity-delete-dialog";
import { useSession } from "@/contexts/session-context";

// Dummy data untuk testing
const dummyOpportunities = [
  {
    id: 1,
    no: "OPP-001",
    date: "2025-12-10",
    customer: "PT. ABC",
    email: "abc@email.com",
    sales: "Sales 1",
    type: "Perusahaan",
    company: "PT. ABC",
    total: 10000000,
    status: "Prospecting",
    stage: "Prospecting",
    lastUpdate: "2025-12-11",
  },
  {
    id: 2,
    no: "OPP-002",
    date: "2025-12-09",
    customer: "Budi Santoso",
    email: "budi@email.com",
    sales: "Sales 2",
    type: "Personal",
    company: "-",
    total: 5000000,
    status: "Qualified",
    stage: "Qualified",
    lastUpdate: "2025-12-10",
  },
  // Tambahkan data lain sesuai kebutuhan
];

const stageOptions = [
  "All",
  "Prospecting",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

export default function OpportunitiesPage() {
  const { user } = useSession();
  const isSuperadmin = user?.role_name?.toLowerCase() === "superuser";

  // State
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    let data = dummyOpportunities;
    if (stage !== "All") data = data.filter((o) => o.stage === stage);
    if (search)
      data = data.filter((o) =>
        o.customer.toLowerCase().includes(search.toLowerCase())
      );
    return data;
  }, [search, stage]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const handleRowClick = (item: any) => setSelected(item);
  const handleCloseDetail = () => setSelected(null);
  const handleEdit = (item: any) => {
    setSelected(item);
    setShowEdit(true);
  };
  const handleDelete = (item: any) => {
    setSelected(item);
    setShowDelete(true);
  };

  return (
    <>
      <DashboardBreadcrumb
        title="Opportunity"
        text="Manage your sales opportunities here."
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">List Opportunities</h2>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Search by customer name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="max-w-xs"
                />
                <div className="max-w-xs">
                  <Select
                    value={stage}
                    onValueChange={(v) => {
                      setStage(v);
                      setPage(1);
                    }}
                  >
                    <SelectContent>
                      {stageOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="default" onClick={() => setShowAdd(true)}>
                Add Opportunity
              </Button>
            </div>

            {/* Table/List Data */}
            <OpportunitiesTable
              isSuperadmin={isSuperadmin}
              data={paged}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && !showEdit && !showDelete && (
        <OpportunityDetailDrawer
          opportunity={selected}
          onClose={handleCloseDetail}
          onEdit={() => {
            setShowEdit(true);
          }}
          onDelete={() => {
            setShowDelete(true);
          }}
        />
      )}

      {/* Add/Edit Modal/Drawer */}
      {showAdd && (
        <OpportunityEditForm
          mode="add"
          onClose={() => setShowAdd(false)}
          // onSuccess={...}
        />
      )}
      {showEdit && selected && (
        <OpportunityEditForm
          mode="edit"
          opportunity={selected}
          onClose={() => setShowEdit(false)}
          // onSuccess={...}
        />
      )}

      {/* Delete Dialog */}
      {showDelete && selected && (
        <OpportunityDeleteDialog
          opportunity={selected}
          onClose={() => setShowDelete(false)}
          // onSuccess={...}
        />
      )}
    </>
  );
}

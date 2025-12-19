"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import OpportunitiesTable from "./opportunities-table";
import OpportunityDeleteDialog from "./opportunity-delete-dialog";
import { useSession } from "@/contexts/session-context";
import { useRouter } from "next/navigation";
import { Opportunity } from "@/types/models";

const stageOptions = [
  "All",
  "Prospecting",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

interface OpportunitiesClientProps {
  opportunities: Opportunity[];
}

export default function OpportunitiesClient({
  opportunities,
}: OpportunitiesClientProps) {
  const { user } = useSession();
  const isSuperadmin = user?.role_name?.toLowerCase() === "superuser";

  // State untuk filter dan pagination
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  // Filter data berdasarkan search dan stage
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    if (stage !== "All") {
      filtered = filtered.filter((o) => o.stage === stage);
    }

    if (search) {
      filtered = filtered.filter((o) =>
        o.customer_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [opportunities, search, stage]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredOpportunities.length / pageSize);
  const paged = filteredOpportunities.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Event handlers
  const handleRowClick = (item: Opportunity) => setSelected(item);
  const handleEdit = (item: Opportunity) => {
    router.push(`/crm/opportunities/${item.id}/edit`);
  };
  const handleDelete = (item: Opportunity) => {
    setSelected(item);
    setShowDelete(true);
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">List Opportunities</h2>
        <div className="space-y-6">
          {/* Header dengan Filter */}
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
          </div>

          {/* Table */}
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

      {/* Delete Dialog */}
      {showDelete && selected && (
        <OpportunityDeleteDialog
          opportunity={selected}
          trigger={<span />}
          onDelete={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

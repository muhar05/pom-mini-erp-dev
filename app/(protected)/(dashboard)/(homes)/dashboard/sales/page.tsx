"use client";

import { useEffect, useState } from "react";
import DashboardSales from "./_components/dashboard-sales";
import DashboardManagerSales from "./_components/dashboard-manager-sales";

export default function DashboardSalesPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/_session");
        const session = await res.json();
        setRole(session?.user?.role_name || null);
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (role === "manager_sales") {
    return <DashboardManagerSales />;
  }

  if (role === "sales") {
    return <DashboardSales />;
  }

  // Jika bukan sales/manager_sales
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
      <div className="text-gray-600 text-lg mb-4">
        Anda tidak memiliki akses ke halaman Dashboard Sales.
      </div>
      <div className="text-gray-400">
        Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
      </div>
    </div>
  );
}

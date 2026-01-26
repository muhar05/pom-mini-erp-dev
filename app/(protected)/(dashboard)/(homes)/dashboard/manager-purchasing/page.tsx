"use client";

import { useSession } from "@/contexts/session-context";
import DashboardManagerPurchasing from "./_components/dashboard-manager-purchasing";
import { isSuperuser } from "@/utils/userHelpers";

export default function DashboardManagerPurchasingPage() {
  const session = useSession();
  const user = session?.user;
  const role = user?.role_name;

  if (!session) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (role === "manager-purchasing" || isSuperuser(user)) {
    return <DashboardManagerPurchasing />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
      <div className="text-gray-600 text-lg mb-4">
        Anda tidak memiliki akses ke halaman Dashboard Manager Purchasing.
      </div>
      <div className="text-gray-400">
        Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
      </div>
    </div>
  );
}

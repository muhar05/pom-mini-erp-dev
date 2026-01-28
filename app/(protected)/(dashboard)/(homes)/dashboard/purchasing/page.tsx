"use client";

import { useSession } from "@/contexts/session-context";
import DashboardPurchasing from "./_components/dashboard-purchasing";
import { isSuperuser, isPurchasing, isManagerPurchasing } from "@/utils/userHelpers";

export default function DashboardPurchasingPage() {
  const session = useSession();
  const user = session?.user;
  const isP = isPurchasing(user);
  const isMP = isManagerPurchasing(user);
  const isS = isSuperuser(user);

  if (isP || isMP || isS) {
    return <DashboardPurchasing />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
      <div className="text-gray-600 text-lg mb-4">
        Anda tidak memiliki akses ke halaman Dashboard Purchasing.
      </div>
      <div className="text-gray-400">
        Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
      </div>
    </div>
  );
}

"use client";

import { useSession } from "@/contexts/session-context";
import DashboardFinance from "./_components/dashboard-finance";
import { isSuperuser } from "@/utils/userHelpers";

export default function DashboardFinancePage() {
    const session = useSession();
    const user = session?.user;
    const role = user?.role_name;

    if (!session) {
        return <div className="p-8 text-center">Loading dashboard...</div>;
    }

    if (role === "finance" || role === "manager-finance" || isSuperuser(user)) {
        return <DashboardFinance />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
            <div className="text-gray-600 text-lg mb-4">
                Anda tidak memiliki akses ke halaman Dashboard Finance.
            </div>
            <div className="text-gray-400">
                Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
            </div>
        </div>
    );
}

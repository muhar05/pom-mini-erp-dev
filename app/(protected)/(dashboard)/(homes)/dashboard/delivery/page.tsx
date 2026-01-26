"use client";

import { useSession } from "@/contexts/session-context";
import DashboardDelivery from "./_components/dashboard-delivery";
import { isSuperuser } from "@/utils/userHelpers";

export default function DashboardDeliveryPage() {
    const session = useSession();
    const user = session?.user;
    const role = user?.role_name;

    if (!session) {
        return <div className="p-8 text-center">Loading dashboard...</div>;
    }

    // Allow superuser and potential delivery role
    if (role === "delivery" || isSuperuser(user)) {
        return <DashboardDelivery />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
            <div className="text-gray-600 text-lg mb-4">
                Anda tidak memiliki akses ke halaman Dashboard Delivery.
            </div>
            <div className="text-gray-400">
                Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
            </div>
        </div>
    );
}

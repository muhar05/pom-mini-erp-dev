"use client";

import { useSession } from "@/contexts/session-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, FileText, Package } from "lucide-react";

export default function DashboardPurchasingPage() {
  const session = useSession();
  const role = session?.user?.role_name;

  if (!session) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (role !== "purchasing") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-3xl font-bold text-red-600 mb-2">
          Akses Ditolak
        </div>
        <div className="text-gray-600 text-lg mb-4">
          Anda tidak memiliki akses ke halaman Dashboard Purchasing.
        </div>
        <div className="text-gray-400">
          Silakan hubungi administrator jika Anda membutuhkan akses ke fitur
          ini.
        </div>
      </div>
    );
  }

  // Dummy data, ganti dengan data asli dari API/hook
  const data = {
    totalPurchases: 12,
    totalPO: 8,
    totalVendors: 5,
    monthlyPurchases: [
      { month: "Jan", total: 3 },
      { month: "Feb", total: 2 },
      { month: "Mar", total: 7 },
    ],
    poStatus: [
      { status: "Open", total: 4 },
      { status: "Closed", total: 3 },
      { status: "Cancelled", total: 1 },
    ],
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Purchasing</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas purchasing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-green-600" />
                Total Purchases
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalPurchases}</div>
            <div className="text-muted-foreground">Jumlah pembelian</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Total PO
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalPO}</div>
            <div className="text-muted-foreground">Purchase Order</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-yellow-600" />
                Total Vendors
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalVendors}</div>
            <div className="text-muted-foreground">Vendor terdaftar</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Purchasing</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <Separator className="my-4" />
          <div className="mb-4">
            <div className="font-semibold mb-2">Monthly Purchases</div>
            <div className="flex flex-wrap gap-4">
              {data.monthlyPurchases.length === 0 && (
                <span className="text-muted-foreground">No data</span>
              )}
              {data.monthlyPurchases.map((item) => (
                <div
                  key={item.month}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {item.month}
                  </div>
                  <div className="font-bold">{item.total}</div>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <div className="font-semibold mb-2">PO Status</div>
            <div className="flex flex-wrap gap-4">
              {data.poStatus.length === 0 && (
                <span className="text-muted-foreground">No data</span>
              )}
              {data.poStatus.map((item) => (
                <div
                  key={item.status}
                  className="p-2 border rounded min-w-[100px] text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {item.status}
                  </div>
                  <div className="font-bold">{item.total}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

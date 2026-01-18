"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Truck, Receipt, CreditCard } from "lucide-react";
import Link from "next/link";

interface SalesOrderRelatedDataProps {
  salesOrderId: string;
}

// Mock data - replace with actual API calls
const mockDeliveryRequests = [
  {
    id: "DR-001",
    delivery_no: "DR-001",
    status: "Pending",
    delivery_date: "2025-12-20",
    items: 3,
  },
];

const mockInvoices = [
  {
    id: "INV-001",
    invoice_no: "INV-001",
    status: "Unpaid",
    amount: 50000000,
    due_date: "2025-12-30",
  },
];

const mockPayments = [
  {
    id: "PAY-001",
    payment_no: "PAY-001",
    status: "Completed",
    amount: 25000000,
    payment_date: "2025-12-15",
  },
];

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "unpaid":
      return "bg-red-100 text-red-800";
    case "paid":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function SalesOrderRelatedData({
  salesOrderId,
}: SalesOrderRelatedDataProps) {
  return (
    <div className="space-y-6">
      {/* Delivery Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Delivery Requests ({mockDeliveryRequests.length})
          </CardTitle>
          <Link href={`/warehouse/delivery/requests?so=${salesOrderId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockDeliveryRequests.length > 0 ? (
            <div className="space-y-3">
              {mockDeliveryRequests.map((dr) => (
                <div
                  key={dr.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{dr.delivery_no}</p>
                    <p className="text-sm text-gray-600">
                      {dr.items} items - Delivery: {dr.delivery_date}
                    </p>
                  </div>
                  <Badge className={getStatusColor(dr.status)}>
                    {dr.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No delivery requests found</p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoices ({mockInvoices.length})
          </CardTitle>
          <Link href={`/finance/invoice?so=${salesOrderId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockInvoices.length > 0 ? (
            <div className="space-y-3">
              {mockInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_no}</p>
                    <p className="text-sm text-gray-600">Due: {inv.due_date}</p>
                    <p className="text-sm font-medium mt-1">
                      {inv.amount.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(inv.status)}>
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No invoices found</p>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments ({mockPayments.length})
          </CardTitle>
          <Link href={`/finance/customer-payment?so=${salesOrderId}`}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockPayments.length > 0 ? (
            <div className="space-y-3">
              {mockPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{pay.payment_no}</p>
                    <p className="text-sm text-gray-600">
                      Date: {pay.payment_date}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {pay.amount.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(pay.status)}>
                    {pay.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No payments found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

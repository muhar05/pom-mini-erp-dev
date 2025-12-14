"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, FileText, ShoppingCart } from "lucide-react";
import Link from "next/link";

type DeliveryRequest = {
  id: string;
  dr_no: string;
  so_no: string;
  sr_no: string;
  customer_name: string;
  delivery_address: string;
  requested_by: string;
  warehouse: string;
  items_count: number;
  total_qty: number;
  request_date: string;
  required_date: string;
  delivery_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

interface DeliveryRequestRelatedDataProps {
  deliveryRequest: DeliveryRequest;
}

// Mock related data - replace with actual API calls
const getRelatedSalesOrder = (soNo: string) => ({
  id: "1",
  so_no: soNo,
  customer: "PT. ABC Technology",
  status: "Confirmed",
  total_amount: 15000000,
  order_date: "2025-12-08",
});

const getRelatedStockReservation = (srNo: string) => ({
  id: "1",
  sr_no: srNo,
  status: "Reserved",
  items_count: 5,
  total_qty: 25,
  reservation_date: "2025-12-10",
  expiry_date: "2025-12-20",
});

const getDeliveryItems = (drId: string) => [
  {
    id: "1",
    item_code: "ITM-001",
    item_name: "Laptop Dell XPS 13",
    requested_qty: 10,
    allocated_qty: 10,
    unit: "pcs",
  },
  {
    id: "2",
    item_code: "ITM-002",
    item_name: "Mouse Wireless",
    requested_qty: 15,
    allocated_qty: 15,
    unit: "pcs",
  },
];

export default function DeliveryRequestRelatedData({
  deliveryRequest,
}: DeliveryRequestRelatedDataProps) {
  const relatedSO = getRelatedSalesOrder(deliveryRequest.so_no);
  const relatedSR = getRelatedStockReservation(deliveryRequest.sr_no);
  const deliveryItems = getDeliveryItems(deliveryRequest.id);

  return (
    <div className="space-y-6">
      {/* Related Sales Order */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Related Sales Order
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{relatedSO.so_no}</div>
              <div className="text-sm text-gray-600">{relatedSO.customer}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{relatedSO.status}</Badge>
              <Link href={`/sales/orders/${relatedSO.id}`}>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total: Rp {relatedSO.total_amount.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Related Stock Reservation */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Related Stock Reservation
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{relatedSR.sr_no}</div>
              <div className="text-sm text-gray-600">
                {relatedSR.items_count} items, {relatedSR.total_qty} total qty
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{relatedSR.status}</Badge>
              <Link href={`/warehouse/reservations/${relatedSR.id}`}>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Items */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Delivery Items
        </h3>
        <div className="space-y-3">
          {deliveryItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border"
            >
              <div className="flex-1">
                <div className="font-medium">{item.item_name}</div>
                <div className="text-sm text-gray-600">{item.item_code}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {item.allocated_qty} / {item.requested_qty} {item.unit}
                </div>
                <div className="text-sm text-gray-600">
                  {item.allocated_qty === item.requested_qty ? (
                    <span className="text-green-600">Fully Allocated</span>
                  ) : (
                    <span className="text-yellow-600">Partially Allocated</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

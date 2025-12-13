import { Button } from "@/components/ui/button";

export default function SalesOrderDetailDrawer({
  open,
  salesOrder,
  onClose,
}: any) {
  if (!open || !salesOrder) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-md ml-auto h-full shadow-lg p-6 overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="font-bold text-lg mb-2">Sales Order Detail</h3>
        <div className="mb-2">No: {salesOrder.so_no}</div>
        <div className="mb-2">Customer: {salesOrder.customer}</div>
        <div className="mb-2">Email: {salesOrder.email}</div>
        <div className="mb-2">Quotation: {salesOrder.quotation_no}</div>
        <div className="mb-2">Total: {salesOrder.total?.toLocaleString()}</div>
        <div className="mb-2">Status: {salesOrder.status}</div>
        {/* Tambahkan info lain sesuai kebutuhan */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline">Edit</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
    </div>
  );
}

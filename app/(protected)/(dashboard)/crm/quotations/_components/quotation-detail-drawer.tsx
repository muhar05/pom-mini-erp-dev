import { Button } from "@/components/ui/button";

type QuotationDetailDrawerProps = {
  open: boolean;
  quotation: any;
  onClose?: () => void;
};

export default function QuotationDetailDrawer({
  open,
  quotation,
  onClose,
}: QuotationDetailDrawerProps) {
  if (!open || !quotation) return null;
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
        <h3 className="font-bold text-lg mb-2">Quotation Detail</h3>
        <div className="mb-2">No: {quotation.quotation_no}</div>
        <div className="mb-2">Customer: {quotation.customer}</div>
        <div className="mb-2">Email: {quotation.email}</div>
        <div className="mb-2">Total: {quotation.total?.toLocaleString()}</div>
        {/* Tambahkan info lain sesuai kebutuhan */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline">Edit</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
    </div>
  );
}

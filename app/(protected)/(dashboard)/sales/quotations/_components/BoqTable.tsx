import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getAllProductsAction } from "@/app/actions/products";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatCurrency";

export type BoqItem = {
  product_id?: number;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
};

interface BoqTableProps {
  items: BoqItem[];
  onChange: (items: BoqItem[]) => void;
}

export default function BoqTable({ items, onChange }: BoqTableProps) {
  const [editing, setEditing] = useState<null | number>(null);
  const [drafts, setDrafts] = useState<BoqItem[]>([]);
  const [productOptions, setProductOptions] = useState<
    Array<{ label: string; value: string; code?: string; price: number }>
  >([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getAllProductsAction();
        const options = (res || []).map((p: any) => ({
          label: p.name,
          value: p.id.toString(),
          code: p.product_code,
          price: Number(p.price) || 0,
        }));
        setProductOptions(options);
      } catch {
        setProductOptions([]);
      }
    }
    fetchProducts();
  }, []);

  // Add new empty row for input
  const handleAddRow = () => {
    setDrafts([
      ...drafts,
      {
        product_id: undefined,
        product_name: "",
        product_code: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  // Update draft row
  const handleDraftChange = (idx: number, field: keyof BoqItem, value: any) => {
    setDrafts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]: value,
              // Auto update product_name, product_code, unit_price if product_id changed
              ...(field === "product_id"
                ? (() => {
                    const selected = productOptions.find(
                      (p) => Number(p.value) === value
                    );
                    return {
                      product_name: selected?.label || "",
                      product_code: selected?.code || "",
                      unit_price: selected?.price || 0,
                      quantity: 1,
                    };
                  })()
                : {}),
            }
          : item
      )
    );
  };

  // Save all valid drafts to main items
  const handleSaveAll = () => {
    const validDrafts = drafts.filter(
      (d) =>
        d.product_id && d.product_name && d.quantity > 0 && d.unit_price >= 0
    );
    onChange([...items, ...validDrafts]);
    setDrafts([]);
  };

  // Edit existing item
  const handleEdit = (idx: number) => {
    setEditing(idx);
    setDrafts([
      {
        ...items[idx],
      },
    ]);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editing === null) return;
    const updated = [...items];
    const d = drafts[0];
    if (d.product_id && d.product_name && d.quantity > 0 && d.unit_price >= 0) {
      updated[editing] = d;
      onChange(updated);
    }
    setEditing(null);
    setDrafts([]);
  };

  // Cancel edit or add
  const handleCancel = () => {
    setEditing(null);
    setDrafts([]);
  };

  // Delete item
  const handleDelete = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <div className="flex w-full justify-end">
          <Button type="button" onClick={handleAddRow} variant="outline">
            Add
          </Button>
        </div>
        {drafts.length > 0 &&
          !drafts.some(
            (d) =>
              !d.product_id ||
              !d.product_name ||
              d.quantity <= 0 ||
              d.unit_price < 0
          ) && (
            <Button
              type="button"
              onClick={editing === null ? handleSaveAll : handleSaveEdit}
            >
              Save
            </Button>
          )}
        {drafts.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="ml-2"
          >
            Cancel
          </Button>
        )}
      </div>
      <Table className="mb-2">
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Draft rows for add/edit */}
          {drafts.map((draft, idx) => (
            <TableRow key={`draft-${idx}`}>
              <TableCell>
                <Select
                  value={draft.product_id ? draft.product_id.toString() : ""}
                  onValueChange={(value) =>
                    handleDraftChange(idx, "product_id", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {productOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label} {p.code ? `(${p.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={draft.quantity}
                  min={1}
                  onChange={(e) =>
                    handleDraftChange(idx, "quantity", Number(e.target.value))
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={draft.unit_price}
                  min={0}
                  readOnly
                  disabled
                />
              </TableCell>
              <TableCell>
                {formatCurrency(draft.unit_price * draft.quantity)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
          {/* Existing items */}
          {items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatCurrency(item.unit_price)}</TableCell>
              <TableCell>
                {formatCurrency(item.unit_price * item.quantity)}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleEdit(idx)}
                  disabled={drafts.length > 0}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(idx)}
                  disabled={drafts.length > 0}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <strong>Subtotal:</strong> {formatCurrency(subtotal)}
      </div>
    </div>
  );
}

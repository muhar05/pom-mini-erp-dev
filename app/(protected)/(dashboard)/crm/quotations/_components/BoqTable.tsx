import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BoqItem = {
  product_id?: number;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total: number;
};

interface BoqTableProps {
  items: BoqItem[];
  onChange: (items: BoqItem[]) => void;
}

export default function BoqTable({ items, onChange }: BoqTableProps) {
  const [editing, setEditing] = useState<null | number>(null);
  const [draft, setDraft] = useState<BoqItem>({
    product_id: undefined,
    product_name: "",
    product_code: "",
    quantity: 1,
    unit_price: 0,
    discount: 0,
    total: 0,
  });

  const handleAdd = () => {
    if (!draft.product_name || draft.quantity <= 0) return;
    onChange([
      ...items,
      {
        ...draft,
        total: draft.unit_price * draft.quantity - (draft.discount || 0),
      },
    ]);
    setDraft({
      product_id: undefined,
      product_name: "",
      product_code: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total: 0,
    });
  };

  const handleEdit = (idx: number) => {
    setEditing(idx);
    setDraft(items[idx]);
  };

  const handleSave = () => {
    if (editing === null) return;
    const updated = [...items];
    updated[editing] = {
      ...draft,
      total: draft.unit_price * draft.quantity - (draft.discount || 0),
    };
    onChange(updated);
    setEditing(null);
    setDraft({
      product_id: undefined,
      product_name: "",
      product_code: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total: 0,
    });
  };

  const handleDelete = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <table className="w-full border mb-2">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) =>
            editing === idx ? (
              <tr key={idx}>
                <td>
                  <Input
                    value={draft.product_name}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, product_name: e.target.value }))
                    }
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={draft.quantity}
                    min={1}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={draft.unit_price}
                    min={0}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        unit_price: Number(e.target.value),
                      }))
                    }
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={draft.discount}
                    min={0}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        discount: Number(e.target.value),
                      }))
                    }
                  />
                </td>
                <td>
                  {draft.unit_price * draft.quantity - (draft.discount || 0)}
                </td>
                <td>
                  <Button type="button" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ) : (
              <tr key={idx}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit_price}</td>
                <td>{item.discount || 0}</td>
                <td>{item.total}</td>
                <td>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleEdit(idx)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(idx)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            )
          )}
          <tr>
            <td>
              <Input
                value={draft.product_name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, product_name: e.target.value }))
                }
                placeholder="Product name"
              />
            </td>
            <td>
              <Input
                type="number"
                value={draft.quantity}
                min={1}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))
                }
              />
            </td>
            <td>
              <Input
                type="number"
                value={draft.unit_price}
                min={0}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    unit_price: Number(e.target.value),
                  }))
                }
              />
            </td>
            <td>
              <Input
                type="number"
                value={draft.discount}
                min={0}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, discount: Number(e.target.value) }))
                }
              />
            </td>
            <td>{draft.unit_price * draft.quantity - (draft.discount || 0)}</td>
            <td>
              <Button type="button" size="sm" onClick={handleAdd}>
                Add
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

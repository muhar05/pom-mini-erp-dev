"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatCurrency";
import { ITEM_STATUSES, isWarehouse, isSuperuser, isSales, ITEM_STATUS_DETAILS } from "@/utils/salesOrderPermissions";
import { updateSalesOrderItemStatusAction } from "@/app/actions/sales-orders";
import { getAllProductsAction } from "@/app/actions/products";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Edit2, Trash2, Check, X, ChevronDown } from "lucide-react";

export interface SaleOrderDetail {
    id: string | number | bigint;
    product_id?: string | number | bigint | null;
    product_name: string;
    price: number | string;
    qty: number;
    total: number | string;
    status: string;
}

interface SalesOrderItemsTableProps {
    items: SaleOrderDetail[];
    user: any;
    onStatusUpdated?: () => void;
    onChange?: (items: SaleOrderDetail[]) => void;
    editable?: boolean;
}

export default function SalesOrderItemsTable({
    items,
    user,
    onStatusUpdated,
    onChange,
    editable = false,
}: SalesOrderItemsTableProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editing, setEditing] = useState<null | number>(null);
    const [drafts, setDrafts] = useState<Partial<SaleOrderDetail>[]>([]);
    const [productOptions, setProductOptions] = useState<
        Array<{ label: string; value: string; code?: string; price: number }>
    >([]);

    const canUpdateStatus = isWarehouse(user) || isSuperuser(user);
    const isSalesUser = isSales(user) || isSuperuser(user);

    useEffect(() => {
        if (!editable) return;
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
    }, [editable]);

    const handleStatusChange = async (itemId: string | number | bigint, newStatus: string) => {
        const idStr = itemId.toString();
        if (idStr.startsWith("imp-") || idStr.startsWith("item-") || isNaN(Number(idStr))) {
            toast.error("Please save the Sales Order first before updating item status.");
            return;
        }

        setUpdatingId(idStr);
        try {
            const result = await updateSalesOrderItemStatusAction(Number(itemId), newStatus);
            if (result.success) {
                toast.success("Item status updated successfully");
                if (onStatusUpdated) onStatusUpdated();
            } else {
                toast.error(result.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAddRow = () => {
        setDrafts([
            ...drafts,
            {
                id: `new-${Date.now()}`,
                product_id: undefined,
                product_name: "",
                qty: 1,
                price: 0,
                total: 0,
                status: ITEM_STATUSES.ACTIVE,
            },
        ]);
    };

    const handleDraftChange = (idx: number, field: keyof SaleOrderDetail, value: any) => {
        setDrafts((prev) =>
            prev.map((item, i) =>
                i === idx
                    ? {
                        ...item,
                        [field]: value,
                        ...(field === "product_id"
                            ? (() => {
                                const selected = productOptions.find(
                                    (p) => p.value === value.toString(),
                                );
                                return {
                                    product_name: selected?.label || "",
                                    price: selected?.price || 0,
                                    total: (selected?.price || 0) * (Number(item.qty) || 1),
                                };
                            })()
                            : field === "qty"
                                ? { total: (Number(item.price) || 0) * (Number(value) || 0) }
                                : {}),
                    }
                    : item,
            ),
        );
    };

    const handleSaveAll = () => {
        const validDrafts = drafts.filter(
            (d) => d.product_id && d.product_name && Number(d.qty) > 0,
        ) as SaleOrderDetail[];

        if (onChange) {
            onChange([...items, ...validDrafts]);
        }
        setDrafts([]);
    };

    const handleEdit = (idx: number) => {
        setEditing(idx);
        setDrafts([{ ...items[idx] }]);
    };

    const handleSaveEdit = () => {
        if (editing === null) return;
        const updated = [...items];
        const d = drafts[0] as SaleOrderDetail;
        if (d.product_id && d.product_name && Number(d.qty) > 0) {
            updated[editing] = d;
            if (onChange) onChange(updated);
        }
        setEditing(null);
        setDrafts([]);
    };

    const handleCancel = () => {
        setEditing(null);
        setDrafts([]);
    };

    const handleDelete = (idx: number) => {
        if (onChange) {
            onChange(items.filter((_, i) => i !== idx));
        }
    };

    const getStatusBadge = (status: string) => {
        const details = ITEM_STATUS_DETAILS[status] || { label: status, desc: "" };
        switch (status) {
            case ITEM_STATUSES.ACTIVE:
                return (
                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">ACTIVE</Badge>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{details.desc}</span>
                    </div>
                );
            case ITEM_STATUSES.PARTIAL_DELIVERED:
                return (
                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">PARTIAL</Badge>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{details.desc}</span>
                    </div>
                );
            case ITEM_STATUSES.DELIVERED:
                return (
                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">DELIVERED</Badge>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{details.desc}</span>
                    </div>
                );
            case ITEM_STATUSES.CANCELLED:
                return (
                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">CANCELLED</Badge>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{details.desc}</span>
                    </div>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {editable && (
                <div className="flex justify-end gap-2">
                    {drafts.length > 0 && (
                        <>
                            <Button size="sm" onClick={editing === null ? handleSaveAll : handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4 mr-1" /> Save Items
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                                <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                        </>
                    )}
                    <Button size="sm" onClick={handleAddRow} variant="outline" disabled={editing !== null}>
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                </div>
            )}

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[40%]">Product Name</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[150px] text-center">Status</TableHead>
                            {editable && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Draft Rows */}
                        {drafts.map((draft, idx) => (
                            <TableRow key={idx} className="bg-blue-50/30">
                                <TableCell>
                                    <Select
                                        value={draft.product_id?.toString() || ""}
                                        onValueChange={(val) => handleDraftChange(idx, "product_id", val)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productOptions.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={draft.qty}
                                        onChange={(e) => handleDraftChange(idx, "qty", Number(e.target.value))}
                                        className="h-9 text-right font-mono"
                                    />
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {formatCurrency(Number(draft.price))}
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium">
                                    {formatCurrency(Number(draft.total))}
                                </TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-auto py-1.5 px-3 min-w-[140px] flex flex-col items-center hover:bg-gray-50 transition-all border-dashed"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {getStatusBadge(draft.status || ITEM_STATUSES.ACTIVE)}
                                                    <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
                                                </div>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="center" className="min-w-[160px]">
                                            {Object.entries(ITEM_STATUS_DETAILS).map(([value, detail]) => (
                                                <DropdownMenuItem
                                                    key={value}
                                                    onClick={() => handleDraftChange(idx, "status", value)}
                                                    className="flex flex-col items-start px-3 py-2 cursor-pointer"
                                                >
                                                    <span className="font-bold text-xs">{detail.label}</span>
                                                    <span className="text-[10px] text-muted-foreground">{detail.desc}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                {editable && <TableCell />}
                            </TableRow>
                        ))}

                        {items.length === 0 && drafts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={editable ? 6 : 5} className="h-24 text-center text-muted-foreground">
                                    No items found. Click "Add Item" to start.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, idx) => (
                                <TableRow key={item.id.toString()} className={editing === idx ? "opacity-30" : ""}>
                                    <TableCell className="font-medium">{item.product_name}</TableCell>
                                    <TableCell className="text-right font-mono">{item.qty}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(Number(item.price))}</TableCell>
                                    <TableCell className="text-right font-mono font-medium">{formatCurrency(Number(item.total))}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {updatingId === item.id.toString() && <Loader2 className="w-3 h-3 animate-spin text-primary" />}

                                            {canUpdateStatus && [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.PARTIAL_DELIVERED].includes(item.status as any) ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-auto py-1.5 px-3 min-w-[140px] flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border-dashed"
                                                            disabled={updatingId === item.id.toString()}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {getStatusBadge(item.status)}
                                                                <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
                                                            </div>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="center" className="min-w-[160px]">
                                                        {Object.entries(ITEM_STATUS_DETAILS).map(([value, detail]) => (
                                                            <DropdownMenuItem
                                                                key={value}
                                                                onClick={() => handleStatusChange(item.id, value)}
                                                                className="flex flex-col items-start px-3 py-2 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                                            >
                                                                <span className="font-bold text-xs">{detail.label}</span>
                                                                <span className="text-[10px] text-muted-foreground">{detail.desc}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                getStatusBadge(item.status)
                                            )}
                                        </div>
                                    </TableCell>
                                    {editable && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(idx)} disabled={drafts.length > 0}>
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(idx)} disabled={drafts.length > 0}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

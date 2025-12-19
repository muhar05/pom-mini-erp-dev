"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Package } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { Product } from "../page";

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

function getStockBadgeVariant(
  stock: number | null | undefined
): "default" | "secondary" | "destructive" | "outline" {
  if (!stock || stock === 0) return "destructive";
  if (stock < 10) return "secondary";
  return "default";
}

function getStockStatus(stock: number | null | undefined): string {
  if (!stock || stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
}

export default function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
}: ProductDetailDrawerProps) {
  if (!product) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md sm:max-w-lg p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2">
              <span>Product Details</span>
            </SheetTitle>
            <SheetDescription>
              View detailed information about this product
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <Badge variant={getStockBadgeVariant(product.stock)}>
                  {getStockStatus(product.stock)}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 font-mono">
                {product.product_code}
              </div>
            </div>

            {/* Product Information */}
            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Product Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <Info label="Item Group" value={product.item_group} />
                <Info label="Unit" value={product.unit} />
                <Info label="Part Number" value={product.part_number} />
                <Info label="Brand" value={product.brand} />
                <Info label="Rack Location" value={product.rack} />
                <Info label="Description" value={product.description} />
              </div>
            </section>

            {/* Pricing & Inventory */}
            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Pricing & Inventory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <Info label="Price" value={formatCurrency(product.price)} />
                <Info label="Stock" value={product.stock?.toString() ?? "0"} />
              </div>
            </section>

            {/* Metadata */}
            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                System Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs text-gray-500">
                <Info label="Created" value={formatDate(product.created_at)} />
                <Info label="Updated" value={formatDate(product.updated_at)} />
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="border-t px-6 py-4 flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/settings/products/${product.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper component for info rows
function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
        {value && value !== "" ? value : "-"}
      </div>
    </div>
  );
}

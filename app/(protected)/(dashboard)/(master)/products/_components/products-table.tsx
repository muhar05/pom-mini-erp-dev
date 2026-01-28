"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductActions from "./product-actions";
import { formatDate } from "@/utils/formatDate";
import { Product } from "@/types/models";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductsTableProps {
  products: Product[];
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
}

// Helper function to get stock status badge
function getStockBadgeClass(stock: number | null | undefined): string {
  if (!stock || stock === 0) {
    return "bg-red-100 text-red-800 border-red-200";
  } else if (stock < 10) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else {
    return "bg-green-100 text-green-800 border-green-200";
  }
}

function getStockStatus(stock: number | null | undefined): string {
  if (!stock || stock === 0) {
    return "Out of Stock";
  } else if (stock < 10) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
}

export default function ProductsTable({
  products,
  onProductUpdated,
  onProductDeleted,
}: ProductsTableProps) {
  // Drawer detail dinonaktifkan: tidak ada state, tidak ada komponen ProductDetailDrawer

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Product Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Item Group</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, idx) => (
            <TableRow
              key={product.id}
              // Drawer dinonaktifkan: tidak ada onClick
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">
                {product.product_code}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.part_number && (
                    <p className="text-xs text-gray-500">
                      PN: {product.part_number}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{product.item_group || "-"}</TableCell>
              <TableCell>{product.unit || "-"}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell className="font-medium">{product.stock || 0}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStockBadgeClass(
                    product.stock
                  )}`}
                >
                  {getStockStatus(product.stock)}
                </span>
              </TableCell>
              <TableCell>{product.brand || "-"}</TableCell>
              <TableCell>{formatDate(product.created_at)}</TableCell>
              <TableCell>
                <ProductActions
                  product={product}
                  onProductUpdated={onProductUpdated}
                  onProductDeleted={onProductDeleted}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/contexts/session-context";
import ProductDeleteDialog from "./product-delete-dialog";
import { Product } from "../page";

interface ProductActionsProps {
  product: Product;
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
}

export default function ProductActions({
  product,
  onProductUpdated,
  onProductDeleted,
}: ProductActionsProps) {
  const { user } = useSession();
  console.log("User role in ProductActions:", user?.role_name);                     
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isSuperuser = user?.role_name === "Superuser";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href={`/settings/products/${product.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/settings/products/${product.id}/edit`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Product
            </Link>
          </DropdownMenuItem>

          {isSuperuser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Product
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductDeleteDialog
        product={product}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={onProductDeleted}
      />
    </>
  );
}

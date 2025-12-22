"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AddProductButtonProps {
  onProductAdded?: () => void;
}

export default function AddProductButton({
  onProductAdded,
}: AddProductButtonProps) {
  return (
    <div className="flex justify-end">
      <Link href="/products/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </Link>
    </div>
  );
}

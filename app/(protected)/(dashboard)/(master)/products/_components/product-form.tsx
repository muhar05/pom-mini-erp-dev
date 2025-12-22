"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Product } from "@/types/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ProductFormProps {
  product?: Product | null;
  mode: "create" | "edit";
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | null>(
    null
  );
  const [dialogMessage, setDialogMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Simple client-side validation
    const formData = new FormData(e.currentTarget);
    const requiredFields = ["product_code", "name"];
    const newErrors: { [key: string]: string } = {};
    requiredFields.forEach((field) => {
      if (
        !formData.get(field) ||
        (formData.get(field) as string).trim() === ""
      ) {
        newErrors[field] = "This field is required";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Convert FormData to JSON object
      const data: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          const trimmedValue = value.trim();
          if (trimmedValue === "") {
            continue;
          } else {
            if (key === "price" || key === "stock") {
              const numValue = Number(trimmedValue);
              data[key] = isNaN(numValue) ? null : numValue;
            } else {
              data[key] = trimmedValue;
            }
          }
        }
      }

      const url =
        mode === "create" ? "/api/products" : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setDialogType("error");
        setDialogMessage(errorData.error || `Failed to ${mode} product`);
        setDialogOpen(true);
        throw new Error(errorData.error || `Failed to ${mode} product`);
      }

      setDialogType("success");
      setDialogMessage(
        mode === "create"
          ? "Product created successfully!"
          : "Product updated successfully!"
      );
      setDialogOpen(true);

      setTimeout(() => {
        setDialogOpen(false);
        router.push("/settings/products");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setDialogType("error");
      setDialogMessage(error?.message || `Failed to ${mode} product`);
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Add New Product" : "Edit Product"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Fill in the details to add a new product."
                : "Update the product information below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product_code">
                  Product Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_code"
                  name="product_code"
                  defaultValue={product?.product_code || ""}
                  placeholder="Enter product code"
                  required
                  className={errors.product_code ? "border-red-500" : ""}
                />
                {errors.product_code && (
                  <span className="text-xs text-red-500">
                    {errors.product_code}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name || ""}
                  placeholder="Enter product name"
                  required
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <span className="text-xs text-red-500">{errors.name}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="item_group">Item Group</Label>
                <Input
                  id="item_group"
                  name="item_group"
                  defaultValue={product?.item_group || ""}
                  placeholder="Enter item group"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit || ""}
                  placeholder="Enter unit (e.g., PCS, KG, M)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={product?.brand || ""}
                  placeholder="Enter brand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  name="part_number"
                  defaultValue={product?.part_number || ""}
                  placeholder="Enter part number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description || ""}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (IDR)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price?.toString() || ""}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock?.toString() || ""}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack">Rack Location</Label>
                <Input
                  id="rack"
                  name="rack"
                  defaultValue={product?.rack || ""}
                  placeholder="Enter rack location"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Product"
              : "Update Product"}
          </Button>
        </div>
      </form>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === "success" ? (
                <CheckCircle2 className="text-green-500 w-5 h-5" />
              ) : (
                <AlertCircle className="text-red-500 w-5 h-5" />
              )}
              {dialogType === "success" ? "Success" : "Error"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

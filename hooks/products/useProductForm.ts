import { useForm, UseFormReturn } from "react-hook-form";
import { Product } from "@/types/models";

export type ProductFormValues = {
  product_code: string;
  name: string;
  item_group?: string;
  unit?: string;
  brand?: string;
  part_number?: string;
  description?: string;
  price?: string;
  stock?: string;
  rack?: string;
};

export function useProductForm(
  defaultValues?: Partial<Product>
): UseFormReturn<ProductFormValues> {
  return useForm<ProductFormValues>({
    defaultValues: {
      product_code: defaultValues?.product_code || "",
      name: defaultValues?.name || "",
      item_group: defaultValues?.item_group || "",
      unit: defaultValues?.unit || "",
      brand: defaultValues?.brand || "",
      part_number: defaultValues?.part_number || "",
      description: defaultValues?.description || "",
      price:
        defaultValues?.price !== undefined ? String(defaultValues.price) : "",
      stock:
        defaultValues?.stock !== undefined ? String(defaultValues.stock) : "",
      rack: defaultValues?.rack || "",
    },
    mode: "onChange",
  });
}

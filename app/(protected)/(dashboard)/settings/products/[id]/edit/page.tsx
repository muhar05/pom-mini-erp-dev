import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import ProductForm from "../../_components/product-form";
import { notFound } from "next/navigation";
import { getProductByIdAction } from "@/app/actions/products";

interface EditProductPageProps {
  params: { id: string };
}

// Helper function to convert Decimal to number
function decimalToNumber(decimal: any): number | null {
  if (!decimal) return null;
  return typeof decimal.toNumber === "function"
    ? decimal.toNumber()
    : Number(decimal);
}

// Helper function to convert Date to string
function dateToString(date: Date | null): string {
  if (!date) return "";
  return date.toISOString();
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductByIdAction(Number(id));

  if (!product) {
    notFound();
  }

  // Convert Decimal and Date fields for form compatibility
  const productForForm = {
    ...product,
    price: decimalToNumber(product.price),
    created_at: dateToString(product.created_at),
    updated_at: dateToString(product.updated_at),
  };

  return (
    <div className="container mx-auto py-6">
      <DashboardBreadcrumb
        title="Edit Product"
        text="Update product information"
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-gray-600">Update product information</p>
      </div>

      <ProductForm product={productForForm} mode="edit" />
    </div>
  );
}

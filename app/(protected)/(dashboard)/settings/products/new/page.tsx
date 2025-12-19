import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import ProductForm from "../_components/product-form";

export default function NewProductPage() {
  return (
    <div className="container mx-auto py-6">
      <DashboardBreadcrumb
          title="Products"
          text="Add a new product to your catalog"
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <p className="text-gray-600">Add a new product to your catalog</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}

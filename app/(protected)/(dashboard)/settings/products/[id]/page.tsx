import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { notFound } from "next/navigation";
import { getProductByIdAction } from "@/app/actions/products";

interface ProductDetailPageProps {
  params: { id: string };
}

// Helper functions
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

// Helper function to convert Decimal to number
function decimalToNumber(decimal: any): number | null {
  if (!decimal) return null;
  return typeof decimal.toNumber === "function"
    ? decimal.toNumber()
    : Number(decimal);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductByIdAction(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardBreadcrumb
        title="Product Details"
        text="View detailed information about this product"
      />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/settings/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                {product.name}
              </h1>
              <p className="text-gray-600">{product.product_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStockBadgeVariant(product.stock)}>
              {getStockStatus(product.stock)}
            </Badge>
            <Link href={`/settings/products/${product.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Product Code
                </label>
                <p className="text-sm font-mono">{product.product_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Product Name
                </label>
                <p className="text-sm">{product.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Item Group
                </label>
                <p className="text-sm">{product.item_group || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Unit
                </label>
                <p className="text-sm">{product.unit || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Brand
                </label>
                <p className="text-sm">{product.brand || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Part Number
                </label>
                <p className="text-sm">{product.part_number || "-"}</p>
              </div>
            </div>

            {product.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Price
                </label>
                <p className="text-lg font-medium">
                  {formatCurrency(decimalToNumber(product.price))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Current Stock
                </label>
                <p className="text-lg font-medium">{product.stock || 0}</p>
              </div>
            </div>

            {product.rack && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Rack Location
                </label>
                <p className="text-sm">{product.rack}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-sm">{formatDate(product.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Updated At
                </label>
                <p className="text-sm">{formatDate(product.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

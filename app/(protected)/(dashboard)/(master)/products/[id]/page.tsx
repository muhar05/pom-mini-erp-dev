import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { notFound } from "next/navigation";
import { getProductByIdAction } from "@/app/actions/products";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductDetailPageProps {
  params: { id: string };
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

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = params;
  const product = await getProductByIdAction(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <DashboardBreadcrumb
        title="Product Details"
        text="View detailed information about this product"
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-7 h-7 text-primary" />
              {product.name}
            </h1>
            <p className="text-gray-500 text-sm">{product.product_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStockBadgeVariant(product.stock)}>
            {getStockStatus(product.stock)}
          </Badge>
          <Link href={`/products/${product.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="col-span-1 lg:col-span-2 bg-gray-800">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Product Code</div>
                <div className="font-mono">{product.product_code}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Product Name</div>
                <div className="font-semibold">{product.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Item Group</div>
                <div>{product.item_group || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Unit</div>
                <div>{product.unit || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Brand</div>
                <div>{product.brand || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Part Number</div>
                <div>{product.part_number || "-"}</div>
              </div>
            </div>
            {product.description && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div>{product.description}</div>
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
            <div>
              <div className="text-xs text-gray-500 mb-1">Price</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(product.price)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Current Stock</div>
              <div className="text-lg font-semibold">{product.stock || 0}</div>
            </div>
            {product.rack && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Rack Location</div>
                <div>{product.rack}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <div className="w-full lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Created At</div>
                <div>{formatDate(product.created_at)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Updated At</div>
                <div>{formatDate(product.updated_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

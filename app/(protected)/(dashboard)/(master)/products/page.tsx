import ProductsClient from "./_components/products-client";
import { getAllProductsAction } from "@/app/actions/products";

export default async function ProductsPage() {
  const products = await getAllProductsAction();
  // Tidak perlu serializeDecimal atau JSON.parse/stringify lagi di sini
  return <ProductsClient initialProducts={products} />;
}

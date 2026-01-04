"use client";

import { useEffect, useState } from "react";
import ProductsClient from "./_components/products-client";
import { getAllProductsAction } from "@/app/actions/products";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllProductsAction()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <DashboardBreadcrumb
          title="Product List"
          text="Manage and monitor your products"
        />
        <div className="flex justify-center items-center p-16 w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return <ProductsClient initialProducts={products} />;
}

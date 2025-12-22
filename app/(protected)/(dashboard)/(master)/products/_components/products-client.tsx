"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProductsTable from "./products-table";
import AddProductButton from "./add-product-button";
import ProductFilters from "./product-filters";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Product } from "@/types/models";
import { getAllProductsAction } from "@/app/actions/products";
import { serializeDecimal } from "@/utils/formatDecimal";

interface ProductsClientProps {
  initialProducts: Product[];
}

export default function ProductsClient({
  initialProducts,
}: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  console.log(products);  

  // Filter data (misal: search by name/code)
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.product_code.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    return filtered;
  }, [products, filters]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paged = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Optional: refresh data after add/edit/delete
  const refreshProducts = async () => {
    const data = await getAllProductsAction();
    setProducts(data.map(serializeDecimal));
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <DashboardBreadcrumb
        title="Product List"
        text="Manage and monitor your products"
      />
      <AddProductButton onProductAdded={refreshProducts} />
      <ProductFilters
        searchTerm={filters.search || ""}
        onSearchChange={(v: string) =>
          setFilters((f: any) => ({ ...f, search: v }))
        }
        itemGroupFilter={filters.itemGroup || ""}
        onItemGroupChange={(v: string) =>
          setFilters((f: any) => ({ ...f, itemGroup: v }))
        }
        itemGroups={
          Array.from(
            new Set(products.map((p) => p.item_group).filter(Boolean))
          ) as string[]
        }
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">List Products</h2>
        <ProductsTable
          products={paged}
          onProductUpdated={refreshProducts}
          onProductDeleted={refreshProducts}
        />
        <div className="flex justify-end items-center gap-2 mt-2">
          <button
            className="px-3 py-1 rounded border"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded border"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

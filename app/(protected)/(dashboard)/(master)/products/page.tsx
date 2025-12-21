"use client";

import React, { useState, useEffect } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import ProductsTable from "./_components/products-table";
import AddProductButton from "./_components/add-product-button";
import ProductFilters from "./_components/product-filters";
import { useSession } from "@/contexts/session-context";
import ProductDetailDrawer from "./_components/product-detail-drawer";
import Pagination from "@/components/ui/pagination";

export type Product = {
  id: number;
  product_code: string;
  name: string;
  item_group?: string | null;
  unit?: string | null;
  part_number?: string | null;
  description?: string | null;
  price?: number | null;
  stock?: number | null;
  brand?: string | null;
  rack?: string | null;
  images?: any;
  created_at: string;
  updated_at: string;
};

export default function ProductsPage() {
  const { user } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [itemGroupFilter, setItemGroupFilter] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.product_code
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.part_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Item group filter
    if (itemGroupFilter && itemGroupFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.item_group === itemGroupFilter
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, itemGroupFilter, products]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Get unique item groups for filter
  const itemGroups = Array.from(
    new Set(products.map((p) => p.item_group).filter(Boolean))
  ) as string[];

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <DashboardBreadcrumb
          title="Products"
          text="Manage your product catalog and inventory"
        />
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardBreadcrumb
        title="Products"
        text="Manage your product catalog and inventory"
      />

      <div className="mb-6">
        <div className="flex justify-end items-center mb-4">
          <AddProductButton onProductAdded={fetchProducts} />
        </div>

        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemGroupFilter={itemGroupFilter}
          onItemGroupChange={setItemGroupFilter}
          itemGroups={itemGroups}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} products
            </p>
          </div>

          <ProductsTable
            products={currentProducts}
            onProductUpdated={fetchProducts}
            onProductDeleted={fetchProducts}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

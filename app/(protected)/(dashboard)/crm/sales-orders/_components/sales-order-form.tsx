"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  FileText,
  Users,
  Calendar,
  CreditCard,
  Calculator,
  Truck,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import { formatCurrency } from "@/utils/formatCurrency";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";

// Import actions
import {
  createSalesOrderAction,
  updateSalesOrderAction,
  generateSalesOrderNumberAction,
} from "@/app/actions/sales-orders";
import {
  CreateSalesOrderData,
  UpdateSalesOrderData,
} from "@/lib/schemas/sales-orders";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllQuotationsAction } from "@/app/actions/quotations";
import { getAllProductsAction } from "@/app/actions/products";
import { validateSalesOrderFormData } from "@/lib/schemas/sales-orders";

// Add BOQ Item interface similar to quotation
interface BoqItem {
  id?: string;
  product_id: number | null;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

type SalesOrderFormData = {
  sale_no: string;
  customer_id: string;
  quotation_id: string;
  total: number;
  discount: number;
  shipping: number;
  tax: number;
  grand_total: number;
  status: string;
  note: string;
  sale_status: string;
  payment_status: string;
  file_po_customer: string;
};

type SalesOrder = {
  id?: string;
  sale_no: string;
  customer_id?: string | null;
  quotation_id?: string | null;
  total?: number | null;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  note?: string | null;
  sale_status?: string | null;
  payment_status?: string | null;
  file_po_customer?: string | null;
  created_at?: Date | null;
};

interface SalesOrderFormProps {
  mode: "add" | "edit";
  salesOrder?: SalesOrder;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SALE_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

export default function SalesOrderForm({
  mode,
  salesOrder,
  onClose,
  onSuccess,
}: SalesOrderFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SalesOrderFormData>({
    sale_no: salesOrder?.sale_no || "",
    customer_id: salesOrder?.customer_id || "",
    quotation_id: salesOrder?.quotation_id || "",
    total: Number(salesOrder?.total) || 0,
    discount: Number(salesOrder?.discount) || 0,
    shipping: Number(salesOrder?.shipping) || 0,
    tax: Number(salesOrder?.tax) || 0,
    grand_total: Number(salesOrder?.grand_total) || 0,
    status: salesOrder?.status || "DRAFT",
    note: salesOrder?.note || "",
    sale_status: salesOrder?.sale_status || "OPEN",
    payment_status: salesOrder?.payment_status || "UNPAID",
    file_po_customer: salesOrder?.file_po_customer || "",
  });

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [user, setUser] = useState<users | null>(null);

  // File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Add BOQ state
  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);

  // Generate sales order number for new sales orders
  useEffect(() => {
    if (mode === "add" && !salesOrder?.sale_no) {
      const generateNumber = async () => {
        try {
          setGeneratingNumber(true);
          const saleNo = await generateSalesOrderNumberAction();
          setFormData((prev) => ({ ...prev, sale_no: saleNo }));
        } catch (error) {
          console.error("Error generating sales order number:", error);
          toast.error("Failed to generate sales order number");
        } finally {
          setGeneratingNumber(false);
        }
      };

      generateNumber();
    }
  }, [mode, salesOrder]);

  // Handle quotation conversion
  useEffect(() => {
    const quotationId = searchParams.get("quotationId");
    if (quotationId && mode === "add") {
      setFormData((prev) => ({ ...prev, quotation_id: quotationId }));
    }
  }, [searchParams, mode]);

  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await getAllCustomersAction();
        setCustomerOptions(response.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomerOptions([]);
      }
    }
    fetchCustomers();
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await getAllProductsAction();
        setProductOptions(products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductOptions([]);
      }
    }
    fetchProducts();
  }, []);

  // Fetch quotations for selection
  useEffect(() => {
    async function fetchQuotations() {
      try {
        const quotations = await getAllQuotationsAction();
        const availableQuotations = (quotations || []).filter(
          (q: any) => q.status === "approved" || q.status === "sq_approved"
        );
        setQuotationOptions(availableQuotations);
      } catch (error) {
        console.error("Error fetching quotations:", error);
        setQuotationOptions([]);
      }
    }
    fetchQuotations();
  }, []);

  // Set user info when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as users);
    }
  }, [session]);

  const handleInputChange = (
    field: keyof SalesOrderFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // For now, just store the filename in the form data
      // In a real implementation, you'd upload the file to a server
      setFormData((prev) => ({ ...prev, file_po_customer: file.name }));
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "none") {
      setSelectedCustomer(null);
      setFormData((prev) => ({ ...prev, customer_id: "" }));
      return;
    }

    const customer = customerOptions.find(
      (c) => c.id.toString() === customerId
    );
    if (customer) {
      setSelectedCustomer(customer);
      setFormData((prev) => ({ ...prev, customer_id: customerId }));
    }
  };

  // Handle quotation selection - OPTIONAL
  const handleQuotationSelect = (quotationId: string) => {
    if (quotationId === "none") {
      setSelectedQuotation(null);
      setFormData((prev) => ({
        ...prev,
        quotation_id: "",
      }));
      return;
    }

    const quotation = quotationOptions.find(
      (q) => q.id.toString() === quotationId
    );
    if (quotation) {
      setSelectedQuotation(quotation);
      setFormData((prev) => ({
        ...prev,
        quotation_id: quotationId,
        customer_id: quotation.customer_id.toString(),
        total: Number(quotation.total) || 0,
        discount: Number(quotation.discount) || 0,
        shipping: Number(quotation.shipping) || 0,
        tax: Number(quotation.tax) || 0,
        grand_total: Number(quotation.grand_total) || 0,
      }));

      // Also set selected customer
      const customer = customerOptions.find(
        (c) => c.id === quotation.customer_id
      );
      if (customer) {
        setSelectedCustomer(customer);
      }

      // Import quotation detail items to BOQ
      if (
        quotation.quotation_detail &&
        Array.isArray(quotation.quotation_detail)
      ) {
        const importedItems: BoqItem[] = quotation.quotation_detail.map(
          (item: any, index: number) => ({
            id: `imported-${index}`,
            product_id: item.product_id || null,
            product_name: item.product_name || "",
            product_code: item.product_code || "",
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
            total: Number(item.total) || 0,
          })
        );
        setBoqItems(importedItems);
      }
    }
  };

  // BOQ Management Functions
  const addBoqItem = () => {
    const newItem: BoqItem = {
      id: Date.now().toString(),
      product_id: null,
      product_name: "",
      product_code: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setBoqItems([...boqItems, newItem]);
  };

  const removeBoqItem = (id: string) => {
    setBoqItems(boqItems.filter((item) => item.id !== id));
  };

  const updateBoqItem = (id: string, field: keyof BoqItem, value: any) => {
    setBoqItems(
      boqItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate total
          if (field === "quantity" || field === "unit_price") {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
          }

          // Auto-fill product details when product is selected
          if (field === "product_id" && value !== "manual") {
            const product = productOptions.find((p) => p.id === Number(value));
            if (product) {
              updatedItem.product_name = product.name;
              updatedItem.product_code = product.product_code;
              updatedItem.unit_price = Number(product.price) || 0;
              updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = boqItems.reduce((sum, item) => sum + item.total, 0);
    const discountPercent = formData.discount || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.11;
    const grandTotal = taxableAmount + tax; // shipping is always 0

    setFormData((prev) => ({
      ...prev,
      total: subtotal,
      tax: tax,
      grand_total: grandTotal,
      shipping: 0, // always 0
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [boqItems, formData.discount, formData.shipping]);

  // Client-side validation
  const validateForm = (): boolean => {
    try {
      const validationData = { ...formData };
      const { customer_id, ...dataForValidation } = validationData;

      validateSalesOrderFormData(
        dataForValidation,
        mode === "add" ? "create" : "update"
      );

      // Additional validation for BOQ items
      if (boqItems.length === 0) {
        toast.error("At least one product item is required");
        return false;
      }

      const invalidItems = boqItems.filter(
        (item) =>
          !item.product_name || item.quantity <= 0 || item.unit_price < 0
      );

      if (invalidItems.length > 0) {
        toast.error("Please check all product items have valid data");
        return false;
      }

      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      if (mode === "add") {
        const dataToSend: CreateSalesOrderData = {
          sale_no: formData.sale_no,
          quotation_id: formData.quotation_id || undefined,
          total: formData.total,
          discount: formData.discount,
          shipping: formData.shipping,
          tax: formData.tax,
          grand_total: formData.grand_total,
          status: formData.status,
          note: formData.note,
          sale_status: formData.sale_status,
          payment_status: formData.payment_status,
          file_po_customer: formData.file_po_customer || undefined,
        };

        const result = await createSalesOrderAction(dataToSend);

        if (result?.success) {
          toast.success("Sales order created successfully");

          // Reset form for new entry
          setFormData({
            sale_no: "",
            customer_id: "",
            quotation_id: "",
            total: 0,
            discount: 0,
            shipping: 0,
            tax: 0,
            grand_total: 0,
            status: "DRAFT",
            note: "",
            sale_status: "OPEN",
            payment_status: "UNPAID",
            file_po_customer: "",
          });

          setSelectedCustomer(null);
          setSelectedQuotation(null);
          setBoqItems([]);
          setSelectedFile(null);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/crm/sales-orders");
          }
        }
      } else {
        // Update mode
        const dataToSend: UpdateSalesOrderData = {
          sale_no: formData.sale_no,
          quotation_id: formData.quotation_id || undefined,
          total: formData.total,
          discount: formData.discount,
          shipping: formData.shipping,
          tax: formData.tax,
          grand_total: formData.grand_total,
          status: formData.status,
          note: formData.note,
          sale_status: formData.sale_status,
          payment_status: formData.payment_status,
          file_po_customer: formData.file_po_customer || undefined,
        };

        const result = await updateSalesOrderAction(
          salesOrder!.id!,
          dataToSend
        );

        if (result?.success) {
          toast.success("Sales order updated successfully");

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/crm/sales-orders");
          }
        }
      }
    } catch (error) {
      console.error("Error saving sales order:", error);
      toast.error("Failed to save sales order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid Layout - Similar to Quotation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Order Information Card */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {mode === "add"
                    ? "Create New Sales Order"
                    : "Edit Sales Order"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="sale_no"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Sales Order Number *
                    </Label>
                    <Input
                      id="sale_no"
                      name="sale_no"
                      value={formData.sale_no}
                      onChange={(e) =>
                        handleInputChange("sale_no", e.target.value)
                      }
                      placeholder={
                        generatingNumber ? "Generating..." : "SO number"
                      }
                      disabled={generatingNumber || mode === "edit"}
                      className={formErrors.sale_no ? "border-red-500" : ""}
                    />
                    {formErrors.sale_no && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.sale_no}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="flex items-center gap-2 mb-1"
                    >
                      <Calendar className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2 text-lg font-semibold">
                      <Package className="h-5 w-5" />
                      Product Items *
                    </Label>
                    <Button
                      type="button"
                      onClick={addBoqItem}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {boqItems.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 mb-3">No items added yet</p>
                        <Button
                          type="button"
                          onClick={addBoqItem}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Item
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {boqItems.map((item, index) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-end mb-3">
                              <Button
                                type="button"
                                onClick={() => removeBoqItem(item.id!)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              <div className="lg:col-span-2 space-y-2">
                                <Label className="mb-2">Product</Label>
                                <Select
                                  value={
                                    item.product_id
                                      ? item.product_id.toString()
                                      : "manual"
                                  }
                                  onValueChange={(value) =>
                                    updateBoqItem(
                                      item.id!,
                                      "product_id",
                                      value === "manual" ? null : Number(value)
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select product">
                                      {item.product_id ? (
                                        <span className="truncate block max-w-[180px]">
                                          {productOptions.find(
                                            (p) => p.id === item.product_id
                                          )
                                            ? `${
                                                productOptions.find(
                                                  (p) =>
                                                    p.id === item.product_id
                                                )?.product_code
                                              } - ${
                                                productOptions.find(
                                                  (p) =>
                                                    p.id === item.product_id
                                                )?.name
                                              }`
                                            : "Unknown Product"}
                                        </span>
                                      ) : (
                                        "Select product"
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">
                                      -- Manual Entry --
                                    </SelectItem>
                                    {productOptions.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id.toString()}
                                      >
                                        {product.product_code} - {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="mt-2 md:mt-0">
                                <Label className="mb-2">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateBoqItem(
                                      item.id!,
                                      "quantity",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  placeholder="1"
                                  min="0"
                                />
                              </div>

                              <div className="mt-2 md:mt-0">
                                <Label className="mb-2">Unit Price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateBoqItem(
                                      item.id!,
                                      "unit_price",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  min="0"
                                  disabled={!!item.product_id}
                                />
                              </div>
                            </div>

                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">
                                Total: {formatCurrency(item.total)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Information */}
                <div>
                  <Label className="flex items-center gap-2 mb-4">
                    <Calculator className="h-4 w-4" />
                    Financial Summary
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="mt-2 md:mt-0">
                      <Label htmlFor="discount" className="mb-2">
                        Discount (%)
                      </Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) =>
                          handleInputChange(
                            "discount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className={formErrors.discount ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Label htmlFor="tax" className="mb-2">
                        Tax (11%)
                      </Label>
                      <Input
                        id="tax"
                        name="tax"
                        type="number"
                        value={formData.tax}
                        disabled
                        className="bg-gray-100"
                        placeholder="Auto"
                      />
                    </div>
                  </div>

                  <div className="mt-2 p-6 rounded-lg dark:bg-gray-800 border dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                      <div>
                        <Label className="text-sm text-gray-600">
                          Subtotal
                        </Label>
                        <p className="text-lg font-semibold">
                          {formatCurrency(formData.total)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">
                          Discount
                        </Label>
                        <p className="text-lg font-semibold">
                          {formData.discount > 0
                            ? `-${formatCurrency(
                                (formData.total * formData.discount) / 100
                              )}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">
                          Tax (11%)
                        </Label>
                        <p className="text-lg font-semibold">
                          {formatCurrency(formData.tax)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">
                          Grand Total
                        </Label>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(formData.grand_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Customer & Additional Information */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <Users className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {/* Customer Selection - INDEPENDENT */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="customer_id"
                      className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-1"
                    >
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger className="h-11 dark:border-gray-600 dark:bg-gray-900 w-full mt-1">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          -- Select Customer --
                        </SelectItem>
                        {customerOptions.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            <div className="flex flex-row gap-2">
                              <span className="font-medium">
                                {customer.customer_name}
                              </span>
                              {customer.company?.company_name && (
                                <span className="text-sm">
                                  {customer.company.company_name}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Required: Select the customer for this sales order
                    </p>
                  </div>

                  {/* Customer Details Panel */}
                  {selectedCustomer && (
                    <div className="grid grid-cols-1 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="gap-2">
                        <Label className="text-xs mb-1 block">Company</Label>
                        <Input
                          value={selectedCustomer.company?.company_name || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Type</Label>
                        <Input
                          value={selectedCustomer.type || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Email</Label>
                        <Input
                          value={selectedCustomer.email || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Phone</Label>
                        <Input
                          value={selectedCustomer.phone || "—"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      {selectedCustomer.address && (
                        <div>
                          <Label className="text-xs mb-1 block">Address</Label>
                          <Textarea
                            value={selectedCustomer.address}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800/40 min-h-[60px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quotation Reference Card */}
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <FileText className="w-5 h-5" />
                  Reference Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Label className="font-medium text-gray-900 dark:text-gray-100">
                    Quotation (Optional)
                  </Label>
                  <Select
                    value={formData.quotation_id}
                    onValueChange={handleQuotationSelect}
                  >
                    <SelectTrigger className="h-11 dark:border-gray-600 dark:bg-gray-900 w-full">
                      <SelectValue placeholder="Select quotation (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No Quotation --</SelectItem>
                      {quotationOptions.map((quotation) => (
                        <SelectItem
                          key={quotation.id}
                          value={quotation.id.toString()}
                        >
                          {quotation.quotation_no} -{" "}
                          {quotation.customer?.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Optional: If this sales order is based on an existing
                    quotation, select it here. This will auto-fill customer and
                    product details.
                  </p>
                </div>

                {/* Selected Quotation Info */}
                {selectedQuotation && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium mb-3">Quotation Details</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">
                          Quotation No
                        </Label>
                        <Input
                          value={selectedQuotation.quotation_no}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Total</Label>
                        <Input
                          value={formatCurrency(selectedQuotation.total || 0)}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Status</Label>
                        <Input
                          value={selectedQuotation.status}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800/40 capitalize"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className="dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="pb-4 border-b dark:border-gray-700">
                <CardTitle className="text-lg font-medium flex items-center gap-3 dark:text-white">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {/* Sales & Payment Status */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="sale_status">
                        Sale Status
                      </Label>
                      <Select
                        value={formData.sale_status}
                        onValueChange={(value) =>
                          handleInputChange("sale_status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sale status" />
                        </SelectTrigger>
                        <SelectContent>
                          {SALE_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="payment_status"
                        className="flex items-center gap-2 mb-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Payment Status
                      </Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value) =>
                          handleInputChange("payment_status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="mb-2" htmlFor="note">
                      Notes
                    </Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={(e) =>
                        handleInputChange("note", e.target.value)
                      }
                      placeholder="Additional notes..."
                      rows={3}
                      className={formErrors.note ? "border-red-500" : ""}
                    />
                  </div>

                  {/* Customer PO File Upload */}
                  <div>
                    <Label
                      htmlFor="file_po_customer"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Upload className="h-4 w-4" />
                      Customer PO File
                    </Label>
                    <Input
                      id="file_po_customer"
                      name="file_po_customer"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="cursor-pointer"
                    />
                    {formData.file_po_customer && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.file_po_customer}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Upload customer purchase order file (PDF, DOC, Image
                      formats)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || generatingNumber}
                className="flex-1"
              >
                {loading
                  ? "Saving..."
                  : mode === "add"
                  ? "Create Sales Order"
                  : "Update Sales Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose || (() => router.back())}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

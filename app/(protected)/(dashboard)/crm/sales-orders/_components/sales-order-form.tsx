"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Plus, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  CreateSalesOrderData,
  UpdateSalesOrderData,
  validateSalesOrderFormData,
} from "@/lib/schemas/sales-orders";
import {
  createSalesOrderAction,
  updateSalesOrderAction,
  generateSalesOrderNumberAction,
} from "@/app/actions/sales-orders";
import { getAllCustomersAction } from "@/app/actions/customers";
import { getAllProductsAction } from "@/app/actions/products";
import { getAllQuotationsAction } from "@/app/actions/quotations";
import { getSalesOrderByIdAction } from "@/app/actions/sales-orders";
import { useSession } from "@/contexts/session-context";
import { users } from "@/types/models";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import POFileUpload from "./po-file-upload";

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

  // Load existing BOQ items for edit mode
  useEffect(() => {
    const loadExistingData = async () => {
      if (mode === "edit" && salesOrder?.id) {
        try {
          const fullSalesOrderData = await getSalesOrderByIdAction(
            salesOrder.id
          );

          // Update form data with all fields from database
          setFormData((prev) => ({
            ...prev,
            sale_no: fullSalesOrderData.sale_no || prev.sale_no,
            customer_id:
              fullSalesOrderData.customer_id?.toString() || prev.customer_id,
            quotation_id:
              fullSalesOrderData.quotation_id?.toString() || prev.quotation_id,
            total: Number(fullSalesOrderData.total) || prev.total,
            discount: Number(fullSalesOrderData.discount) || prev.discount,
            shipping: Number(fullSalesOrderData.shipping) || prev.shipping,
            tax: Number(fullSalesOrderData.tax) || prev.tax,
            grand_total:
              Number(fullSalesOrderData.grand_total) || prev.grand_total,
            status: fullSalesOrderData.status || prev.status,
            note: fullSalesOrderData.note || prev.note,
            sale_status: fullSalesOrderData.sale_status || prev.sale_status,
            payment_status:
              fullSalesOrderData.payment_status || prev.payment_status,
            file_po_customer:
              fullSalesOrderData.file_po_customer || prev.file_po_customer,
          }));

          // Load BOQ items from sale_order_detail
          if (
            fullSalesOrderData.sale_order_detail &&
            fullSalesOrderData.sale_order_detail.length > 0
          ) {
            const existingItems: BoqItem[] =
              fullSalesOrderData.sale_order_detail.map((item: any) => ({
                id: item.id || `existing-${Date.now()}-${Math.random()}`,
                product_id: item.product_id ? Number(item.product_id) : null,
                product_name: item.product_name || "",
                product_code: item.product_code || "",
                quantity: Number(item.qty) || 1,
                unit_price: Number(item.price) || 0,
                total:
                  Number(item.total) || Number(item.price) * Number(item.qty),
              }));
            setBoqItems(existingItems);
          }

          // Set selected customer - prioritize direct customer, fallback to quotation customer
          const customer =
            fullSalesOrderData.customers ||
            fullSalesOrderData.quotation?.customer;
          if (customer) {
            const matchedCustomer = customerOptions.find(
              (c) =>
                c.id === customer.id ||
                c.id.toString() === customer.id.toString()
            );
            if (matchedCustomer) {
              setSelectedCustomer(matchedCustomer);
            }
          }

          // Set selected quotation if exists
          if (fullSalesOrderData.quotation_id && fullSalesOrderData.quotation) {
            const matchedQuotation = quotationOptions.find(
              (q) =>
                q.id === fullSalesOrderData.quotation_id ||
                q.id.toString() === fullSalesOrderData.quotation_id?.toString()
            );
            if (matchedQuotation) {
              setSelectedQuotation(matchedQuotation);
            }
          }

          // Set selectedQuotation jika ada quotation
          if (fullSalesOrderData.quotation) {
            setSelectedQuotation(fullSalesOrderData.quotation);

            // Jika quotation tidak ada di quotationOptions, tambahkan
            setQuotationOptions((prev) => {
              const exists = prev.some(
                (q) => q.id === fullSalesOrderData.quotation.id
              );
              if (!exists) {
                return [...prev, fullSalesOrderData.quotation];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error loading existing sales order data:", error);
          toast.error(
            "Failed to load existing data: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
        }
      }
    };

    loadExistingData();
  }, [mode, salesOrder?.id, customerOptions.length, quotationOptions.length]);

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
          const field = err.path.join(".");
          newErrors[field] = err.message;
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
      return;
    }

    setLoading(true);

    try {
      if (mode === "add") {
        const dataToSend: CreateSalesOrderData = {
          sale_no: formData.sale_no,
          quotation_id: formData.quotation_id || undefined,
          customer_id: formData.customer_id || undefined, // Add customer_id support
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
          // Add BOQ items
          boq_items: boqItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_code: item.product_code,
            price: item.unit_price,
            qty: item.quantity,
            total: item.total,
            status: "ACTIVE",
          })),
        };

        const result = await createSalesOrderAction(dataToSend);

        if (result?.success) {
          toast.success("Sales order created successfully");

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/crm/sales-orders");
          }
        } else {
          toast.error(result?.message || "Failed to create sales order");
        }
      } else {
        // Update mode
        const dataToSend: UpdateSalesOrderData = {
          sale_no: formData.sale_no,
          quotation_id: formData.quotation_id || undefined,
          customer_id: formData.customer_id || undefined, // Add customer_id
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
          // Add BOQ items for update
          boq_items: boqItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_code: item.product_code,
            price: item.unit_price,
            qty: item.quantity,
            total: item.total,
            status: "ACTIVE",
          })),
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
        } else {
          toast.error(result?.message || "Failed to update sales order");
        }
      }
    } catch (error) {
      console.error("Error saving sales order:", error);
      toast.error("Failed to save sales order");
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan handler untuk update file_po_customer
  const handlePOUploadSuccess = (fileUrl: string) => {
    // Ambil nama file dari url
    const fileName = fileUrl.split("/").pop() || "";
    setFormData((prev) => ({
      ...prev,
      file_po_customer: fileName,
    }));
  };

  // Cek apakah sales order punya referensi quotation
  const hasQuotationReference =
    !!formData.quotation_id ||
    (salesOrder && salesOrder.quotation_id) ||
    (selectedQuotation && selectedQuotation.id);

  // Atau jika data sales order dari backend sudah include objek quotation:
  const hasQuotationObject = !!(salesOrder && (salesOrder as any).quotation);

  return (
    <div className="mx-auto p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid Layout - Similar to Quotation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sales Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sales Order Number */}
                  <div>
                    <Label htmlFor="sale_no">Sales Order Number *</Label>
                    <div className="relative">
                      <Input
                        id="sale_no"
                        value={formData.sale_no}
                        onChange={(e) =>
                          handleInputChange("sale_no", e.target.value)
                        }
                        disabled={generatingNumber || mode === "edit"} // Disable in edit mode
                        placeholder="Auto-generated"
                        className="font-mono"
                      />
                      {generatingNumber && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                    {formErrors.sale_no && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.sale_no}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  {/* Sale Status */}
                  <div>
                    <Label htmlFor="sale_status">Sale Status</Label>
                    <Select
                      value={formData.sale_status}
                      onValueChange={(value) =>
                        handleInputChange("sale_status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  {/* Payment Status */}
                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(value) =>
                        handleInputChange("payment_status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                {/* Note */}
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer & Quotation Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer & Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Selection */}
                  <div>
                    <Label htmlFor="customer">Customer *</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No customer</SelectItem>
                        {customerOptions.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            {customer.customer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quotation Selection - Optional */}
                  <div>
                    <Label htmlFor="quotation">From Quotation (Optional)</Label>
                    <Select
                      value={formData.quotation_id}
                      onValueChange={handleQuotationSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quotation or manual" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Manual Entry</SelectItem>
                        {quotationOptions.map((quotation) => (
                          <SelectItem
                            key={quotation.id}
                            value={quotation.id.toString()}
                          >
                            {quotation.quotation_no}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Customer Display */}
                {selectedCustomer && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Selected Customer
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedCustomer.customer_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedCustomer.email || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedCustomer.phone || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        <Badge variant="outline">{selectedCustomer.type}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Quotation Display */}
                {selectedQuotation && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Source Quotation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Number:</span>{" "}
                        {selectedQuotation.quotation_no}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>{" "}
                        {formatCurrency(selectedQuotation.grand_total || 0)}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant="outline">
                          {selectedQuotation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BOQ Items Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Bill of Quantities (BOQ)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBoqItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {boqItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items added yet. Click "Add Item" to start.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {boqItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">
                            Item {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBoqItem(item.id!)}
                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          {/* Product Selection */}
                          <div className="lg:col-span-2">
                            <Label>Product</Label>
                            <Select
                              value={item.product_id?.toString() || "manual"}
                              onValueChange={(value) =>
                                updateBoqItem(
                                  item.id!,
                                  "product_id",
                                  value === "manual" ? null : Number(value)
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">
                                  Manual Entry
                                </SelectItem>
                                {productOptions.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id.toString()}
                                  >
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Product Name (Manual) */}
                          <div className="lg:col-span-2">
                            <Label>Product Name *</Label>
                            <Input
                              value={item.product_name}
                              onChange={(e) =>
                                updateBoqItem(
                                  item.id!,
                                  "product_name",
                                  e.target.value
                                )
                              }
                              placeholder="Enter product name"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateBoqItem(
                                  item.id!,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          {/* Unit Price */}
                          <div>
                            <Label>Unit Price *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              disabled
                              onChange={(e) =>
                                updateBoqItem(
                                  item.id!,
                                  "unit_price",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          {/* Total (Read-only) */}
                          <div className="lg:col-span-3">
                            <Label>Total</Label>
                            <Input
                              value={formatCurrency(item.total)}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary & Actions */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    {formatCurrency(formData.total)}
                  </span>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      handleInputChange("discount", Number(e.target.value))
                    }
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Discount Amount:</span>
                    <span>
                      -
                      {formatCurrency(
                        (formData.total * formData.discount) / 100
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* After Discount */}
                <div className="flex justify-between">
                  <span>After Discount:</span>
                  <span className="font-mono">
                    {formatCurrency(
                      formData.total -
                        (formData.total * formData.discount) / 100
                    )}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between">
                  <span>Tax (11%):</span>
                  <span className="font-mono">
                    {formatCurrency(formData.tax)}
                  </span>
                </div>

                {/* Shipping (Always 0) */}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping:</span>
                  <span className="font-mono">{formatCurrency(0)}</span>
                </div>

                <Separator />

                {/* Grand Total */}
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="font-mono">
                    {formatCurrency(formData.grand_total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <POFileUpload
              salesOrderId={salesOrder?.id || ""}
              currentFile={formData.file_po_customer}
              onUploadSuccess={handlePOUploadSuccess}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        {mode === "add" ? "Creating..." : "Updating..."}
                      </>
                    ) : (
                      `${mode === "add" ? "Create" : "Update"} Sales Order`
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

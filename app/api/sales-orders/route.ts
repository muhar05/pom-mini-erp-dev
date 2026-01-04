import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { getAllSalesOrdersDb, createSalesOrderDb } from "@/data/sales-orders";

// GET: Ambil semua sales orders
export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const salesOrders = await getAllSalesOrdersDb();

    // Konversi BigInt dan Decimal ke format yang aman, termasuk nested relations
    const safeSalesOrders = salesOrders.map((so: any) => ({
      ...so,
      id: so.id.toString(),
      quotation_id: so.quotation_id?.toString() || null,
      total: so.total ? Number(so.total) : 0,
      shipping: so.shipping ? Number(so.shipping) : 0,
      discount: so.discount ? Number(so.discount) : 0,
      tax: so.tax ? Number(so.tax) : 0,
      grand_total: so.grand_total ? Number(so.grand_total) : 0,
      // Convert quotation relation
      quotation: so.quotation
        ? {
            id: so.quotation.id,
            quotation_no: so.quotation.quotation_no,
            customer_id: so.quotation.customer_id,
            total: so.quotation.total ? Number(so.quotation.total) : 0,
            shipping: so.quotation.shipping ? Number(so.quotation.shipping) : 0,
            discount: so.quotation.discount ? Number(so.quotation.discount) : 0,
            tax: so.quotation.tax ? Number(so.quotation.tax) : 0,
            grand_total: so.quotation.grand_total
              ? Number(so.quotation.grand_total)
              : 0,
            status: so.quotation.status,
            stage: so.quotation.stage,
            note: so.quotation.note,
            target_date: so.quotation.target_date,
            top: so.quotation.top,
            created_at: so.quotation.created_at,
            updated_at: so.quotation.updated_at,
            // Convert customer relation if it exists
            customer: so.quotation.customer
              ? {
                  id: so.quotation.customer.id,
                  customer_name: so.quotation.customer.customer_name,
                  email: so.quotation.customer.email,
                  phone: so.quotation.customer.phone,
                  address: so.quotation.customer.address,
                  type: so.quotation.customer.type,
                  company_id: so.quotation.customer.company_id,
                  note: so.quotation.customer.note,
                  created_at: so.quotation.customer.created_at,
                }
              : null,
          }
        : null,
      // Convert sale_order_detail relation
      sale_order_detail: so.sale_order_detail
        ? so.sale_order_detail.map((detail: any) => ({
            id: detail.id.toString(),
            sale_id: detail.sale_id.toString(),
            product_id: detail.product_id?.toString() || null,
            product_name: detail.product_name,
            price: Number(detail.price),
            qty: detail.qty,
            total: detail.total ? Number(detail.total) : null,
            status: detail.status,
          }))
        : [],
    }));

    return NextResponse.json(safeSalesOrders);
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales orders" },
      { status: 500 }
    );
  }
}

// POST: Tambah sales order baru
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || (!isSuperuser(user) && !isSales(user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Convert string IDs to BigInt for Prisma
    const prismaData = {
      ...data,
      quotation_id: data.quotation_id ? BigInt(data.quotation_id) : null,
    };

    const salesOrder = await createSalesOrderDb(prismaData);

    // Konversi BigInt dan Decimal ke format yang aman
    const safeSalesOrder = {
      ...salesOrder,
      id: salesOrder.id.toString(),
      quotation_id: salesOrder.quotation_id?.toString() || null,
      total: salesOrder.total ? Number(salesOrder.total) : 0,
      shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
      discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
      tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
      grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    };

    return NextResponse.json({
      success: true,
      message: "Sales order created successfully",
      data: safeSalesOrder,
    });
  } catch (error) {
    console.error("Sales order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create sales order" },
      { status: 400 }
    );
  }
}

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import CustomersClient from "./_components/customer-client";
import { getAllCustomersAction } from "@/app/actions/customers";

function serializeDecimal(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(serializeDecimal);

  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (
      value &&
      typeof value === "object" &&
      (typeof value.toNumber === "function" ||
        typeof value.toString === "function" ||
        value.constructor?.name === "Decimal" ||
        value.d !== undefined)
    ) {
      result[key] =
        typeof value.toNumber === "function"
          ? value.toNumber()
          : Number(value.toString());
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (typeof value === "object") {
      result[key] = serializeDecimal(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export default async function CustomerPage() {
  const data = await getAllCustomersAction();
  const customers = data.map(serializeDecimal);

  return (
    <>
      <DashboardBreadcrumb
        title="Customer List"
        text="Manage and monitor your customers"
      />
      <CustomersClient customers={customers} />;
    </>
  );
}

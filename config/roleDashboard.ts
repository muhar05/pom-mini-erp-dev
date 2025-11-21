// config/roleDashboard.ts

export type Role =
  | "superuser"
  | "sales"
  | "warehouse"
  | "finance"
  | "purchasing";

type DashboardConfig = {
  menu: string[];
  widgets: string[];
};

export const roleDashboard: Record<Role, DashboardConfig> = {
  superuser: {
    menu: ["Overview", "Users", "Sales", "Inventory", "Finance", "Settings"],
    widgets: [
      "UserStats",
      "SalesChart",
      "InventoryStatus",
      "RecentTransactions",
    ],
  },
  sales: {
    menu: ["Overview", "Sales", "Orders", "Clients"],
    widgets: ["SalesChart", "TopCustomers"],
  },
  warehouse: {
    menu: ["Overview", "Inventory", "Inbound", "Outbound"],
    widgets: ["InventoryStatus", "IncomingGoods", "StockAlerts"],
  },
  finance: {
    menu: ["Overview", "Transactions", "Expenses"],
    widgets: ["ExpensesChart", "RecentTransactions"],
  },
  purchasing: {
    menu: ["Overview", "PurchaseRequests", "Suppliers"],
    widgets: ["PurchaseRequests", "SupplierList"],
  },
};

// companies
export interface companies {
  id: number;
  group_name?: string | null;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  npwp?: string | null;
  level?: string | null;
  disc1?: number | null;
  disc2?: number | null;
  note?: string | null;
  status?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  quotations?: quotations[];
}

// leads
export interface leads {
  id: number;
  reference_no?: string | null;
  lead_name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  type?: string | null;
  company?: string | null;
  location?: string | null;
  product_interest?: string | null;
  source?: string | null;
  note?: string | null;
  id_user?: number | null;
  created_at?: Date | null;
  assigned_to?: number | null;
  status?: string | null;
  users_leads_assigned_toTousers?: users | null;
  users_leads_id_userTousers?: users | null;
}

// products
export interface products {
  id: number;
  product_code: string;
  item_group?: string | null;
  name: string;
  unit?: string | null;
  part_number?: string | null;
  description?: string | null;
  price?: number | null;
  stock?: number | null;
  brand?: string | null;
  rack?: string | null;
  images?: unknown;
  created_at?: Date | null;
  updated_at?: Date | null;
}

// quotations
export interface quotations {
  id: number;
  quotation_no: string;
  customer_id: number;
  quotation_detail: unknown;
  total?: number | null;
  shipping?: number | null;
  discount?: number | null;
  tax?: number | null;
  grand_total?: number | null;
  status?: string | null;
  stage?: string | null;
  note?: string | null;
  target_date?: Date | null;
  top?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  customers?: customers;
}

// roles
export interface roles {
  id: number;
  role_name: string;
  users?: users[];
}

// user_otp
export interface user_otp {
  id: number;
  user_id?: number | null;
  otp_code: string;
  expires_at: Date;
  is_used?: boolean | null;
  users?: users | null;
}

// users
export interface users {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role_id?: number | null;
  created_at?: Date | null;
  leads_leads_assigned_toTousers?: leads[];
  leads_leads_id_userTousers?: leads[];
  user_logs?: user_logs[];
  user_otp?: user_otp[];
  roles?: roles | null;
}

// company
export interface company {
  id: number;
  company_name: string;
  address?: string | null;
  npwp?: string | null;
  id_level?: number | null;
  note?: string | null;
  created_at?: Date | null;
  company_level?: company_level | null;
  customers?: customers[];
}

// company_level
export interface company_level {
  id_level: number;
  level_name: string;
  disc1?: number | null;
  disc2?: number | null;
  company?: company[];
}

// customers
export interface customers {
  id: number;
  customer_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  company_id?: number | null;
  note?: string | null;
  created_at?: Date | null;
  company?: company | null;
}

// user_logs
export interface user_logs {
  id: string; // BigInt as string
  user_id: number;
  activity: string;
  method?: string | null;
  endpoint?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  old_data?: unknown;
  new_data?: unknown;
  created_at?: Date | null;
  users?: users;
}

// warehouse
export interface warehouse {
  id: number;
  code: string;
  name: string;
  location?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

// delivery_orders
export interface delivery_orders {
  id: string; // BigInt as string
  do_no: string;
  delivery_request_id: string;
  sale_id: string;
  status?: string | null;
  customer_po?: string | null;
  note?: string | null;
  created_at?: Date | null;
}

// delivery_requests
export interface delivery_requests {
  id: string; // BigInt as string
  dr_no: string;
  sale_id: string;
  status?: string | null;
  note?: string | null;
  created_at?: Date | null;
}

// finance_approval
export interface finance_approval {
  id: string; // BigInt as string
  sale_id: string;
  status?: string | null;
  note?: string | null;
  created_at?: Date | null;
}

// finance_transactions
export interface finance_transactions {
  id: string; // BigInt as string
  sale_id: string;
  amount: number;
  payment_status?: string | null;
  note?: string | null;
  created_at?: Date | null;
}

// purchase_orders
export interface purchase_orders {
  id: string; // BigInt as string
  po_no: string;
  pr_id?: string | null;
  po_detail_items: unknown;
  total?: number | null;
  status?: string | null;
  supplier_do?: string | null;
  supplier_so?: string | null;
  created_at?: Date | null;
}

// sale_order_detail
export interface sale_order_detail {
  id: string; // BigInt as string
  sale_id: string;
  product_id?: string | null;
  product_name: string;
  price: number;
  qty: number;
  total?: number | null;
  status?: string | null;
}

// sales_orders
export interface sales_orders {
  id: string; // BigInt as string
  sale_no: string;
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
}

// stock_reservations
export interface stock_reservations {
  id: string; // BigInt as string
  item_detail: unknown;
  lead_id?: string | null;
  type?: string | null;
  status?: string | null;
  note?: string | null;
  created_at?: Date | null;
}

// suppliers
export interface suppliers {
  id: string; // BigInt as string
  supplier_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  created_at?: Date | null;
}

// warehouses_history
export interface warehouses_history {
  id: string; // BigInt as string
  wh_id: string;
  product_id: string;
  remark?: string | null;
  qty: number;
  part_number?: string | null;
  supplier_id?: string | null;
  po_id?: string | null;
  do_id?: string | null;
  note?: string | null;
  created_at?: Date | null;
  created_by?: string | null;
}

export type Opportunity = {
  id: string;
  opportunity_no: string;
  customer_name: string;
  customer_email: string;
  sales_pic: string;
  type: string;
  company: string;
  potential_value: number;
  status: string;
  created_at: string;
  updated_at: string;
  // Tambahan agar sama dengan form
  contact?: string | null;
  phone?: string | null;
  location?: string | null;
  source?: string | null;
  product_interest?: string | null;
  notes?: string | null;
  note?: string | null;
  id_user_name?: string;
  assigned_to_name?: string;
};

export interface Product {
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
}

export type OpportunityFormType = {
  id: string;
  opportunity_no: string;
  lead_name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  type?: string | null;
  company?: string | null;
  location?: string | null;
  product_interest?: string | null;
  source?: string | null;
  note?: string | null;
  id_user?: number | null;
  assigned_to?: number | null;
  status?: string | null;
  sales_pic?: string;
  potential_value: number;
  created_at: string;
  updated_at: string;
  id_user_name?: string;
  assigned_to_name?: string;
  customer_name?: string;
  customer_email?: string;
  expected_close_date?: string;
  notes?: string;
};

export interface OpportunityFormProps {
  mode: "add" | "edit";
  opportunity?: OpportunityFormType;
  onClose?: () => void;
  onSuccess?: () => void;
}

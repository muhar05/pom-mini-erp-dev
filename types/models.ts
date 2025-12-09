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
  images?: any;
  created_at?: Date | null;
  updated_at?: Date | null;
}

// quotations
export interface quotations {
  id: number;
  quotation_no: string;
  company_id: number;
  quotation_detail: any;
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
  companies?: companies;
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
  old_data?: any;
  new_data?: any;
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

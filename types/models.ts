// User
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role_id?: number | null;
  created_at?: string;
  leads_leads_assigned_toTousers?: Lead[];
  leads_leads_id_userTousers?: Lead[];
  user_logs?: UserLog[];
  user_otp?: UserOtp[];
  roles?: Role | null;
}

// Lead
export interface Lead {
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
  created_at?: string;
  assigned_to?: number | null;
  status?: string | null;
  users_leads_assigned_toTousers?: User | null;
  users_leads_id_userTousers?: User | null;
}

// Tambahkan interface lain sesuai kebutuhan model...

export interface Company {
  id: number;
  group_name?: string | null;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  npwp?: string | null;
  level?: string | null;
  disc1?: string | null;
  disc2?: string | null;
  note?: string | null;
  status?: boolean | null;
  created_at?: string;
  updated_at?: string;
  quotations?: Quotation[];
}

export interface Product {
  id: number;
  product_code: string;
  item_group?: string | null;
  name: string;
  unit?: string | null;
  part_number?: string | null;
  description?: string | null;
  price?: string | null;
  stock?: number | null;
  brand?: string | null;
  rack?: string | null;
  images?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Quotation {
  id: number;
  quotation_no: string;
  company_id: number;
  quotation_detail: any;
  total?: string | null;
  shipping?: string | null;
  discount?: string | null;
  tax?: string | null;
  grand_total?: string | null;
  status?: string | null;
  stage?: string | null;
  note?: string | null;
  target_date?: string | null;
  top?: string | null;
  created_at?: string;
  updated_at?: string;
  companies?: Company;
}

export interface Role {
  id: number;
  role_name: string;
  users?: User[];
}

export interface UserOtp {
  id: number;
  user_id?: number | null;
  otp_code: string;
  expires_at: string;
  is_used?: boolean | null;
  users?: User | null;
}

export interface CompanyLevel {
  id_level: number;
  level_name: string;
  disc1?: string | null;
  disc2?: string | null;
  company?: Company[];
}

export interface Company_ {
  id: number;
  company_name: string;
  address?: string | null;
  npwp?: string | null;
  id_level?: number | null;
  note?: string | null;
  created_at?: string;
  company_level?: CompanyLevel | null;
  customers?: Customer[];
}

export interface Customer {
  id: number;
  customer_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  company_id?: number | null;
  note?: string | null;
  created_at?: string;
  company?: Company_ | null;
}

export interface UserLog {
  id: string; // BigInt as string
  user_id: number;
  activity: string;
  method?: string | null;
  endpoint?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  old_data?: any;
  new_data?: any;
  created_at?: string;
  users?: User;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

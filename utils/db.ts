interface Role {
  id: string;
  role_name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role_id: string;
  created_at: string;
}

export const roles: Role[] = [
  { id: "1", role_name: "Superuser" },
  { id: "2", role_name: "Sales" },
  { id: "3", role_name: "Warehouse" },
  { id: "4", role_name: "Finance" },
  { id: "5", role_name: "Purchasing" },
];

const users: User[] = [
  {
    id: "1",
    name: "Admin Master",
    email: "superuser@erp.local",
    password_hash: "Pa$$w0rd!",
    role_id: "1",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sales One",
    email: "sales@erp.local",
    password_hash: "Sales123!",
    role_id: "2",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Warehouse Guy",
    email: "warehouse@erp.local",
    password_hash: "Warehouse123!",
    role_id: "3",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Finance Team",
    email: "finance@erp.local",
    password_hash: "Finance123!",
    role_id: "4",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Purchasing Staff",
    email: "purchasing@erp.local",
    password_hash: "Purchasing123!",
    role_id: "5",
    created_at: new Date().toISOString(),
  },
];

export async function getUserFromDb(
  email: string,
  hashedPassword: string
): Promise<User | null> {
  const find = users.find(
    (user) => user.email === email && user.password_hash === hashedPassword
  );
  return find || null;
}

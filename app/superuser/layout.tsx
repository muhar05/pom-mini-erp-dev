import { auth } from "@/auth";
import Link from "next/link";

export default async function SuperuserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Superuser</h2>

        <nav className="flex flex-col gap-2">
          <Link
            href="/superuser"
            className="hover:bg-sidebar-accent px-3 py-2 rounded"
          >
            Dashboard
          </Link>
          <Link
            href="/superuser/users"
            className="hover:bg-sidebar-accent px-3 py-2 rounded"
          >
            Manage Users
          </Link>
          <Link
            href="/superuser/roles"
            className="hover:bg-sidebar-accent px-3 py-2 rounded"
          >
            Manage Roles
          </Link>
          <Link
            href="/superuser/settings"
            className="hover:bg-sidebar-accent px-3 py-2 rounded"
          >
            Settings
          </Link>
        </nav>

        <div className="mt-auto text-sm text-muted-foreground">
          {session?.user?.email}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">{children}</section>
    </div>
  );
}

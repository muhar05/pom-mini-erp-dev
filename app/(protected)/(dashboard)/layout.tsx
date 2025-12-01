import { cookies } from "next/headers";
import { ClientRoot } from "@/app/client-root";
import { auth } from "@/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  try {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // ambil session langsung dari Auth.js v5
    const session = await auth();

    return (
      <ClientRoot defaultOpen={defaultOpen} session={session}>
        {children}
      </ClientRoot>
    );
  } catch (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We couldn't load the layout. Please try again later.
        </p>
      </div>
    );
  }
}

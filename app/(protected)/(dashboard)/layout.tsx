import { cookies } from "next/headers";
import { ClientRoot } from "@/app/client-root";
import { getToken } from "next-auth/jwt";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  try {
    const cookieStore = await cookies();

    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");

    const fakeReq = new Request("http://localhost", {
      headers: { cookie: cookieHeader },
    });

    const token = await getToken({
      req: fakeReq,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return (
      <ClientRoot defaultOpen={defaultOpen} session={token}>
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

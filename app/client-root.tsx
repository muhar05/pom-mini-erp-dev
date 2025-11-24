"use client";

import { SessionProvider } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import ThemeCustomizer from "@/components/theme-customizer/theme-customizer";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function ClientRoot({
  defaultOpen,
  children,
  session,
}: {
  defaultOpen: boolean;
  children: ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className="dashboard-body-wrapper grow-[1] flex flex-col">
            <SidebarInset>
              <Header />
            </SidebarInset>

            <div className="dashboard-body bg-neutral-100 dark:bg-[#1e2734] md:p-6 p-4 flex-1">
              {children}
            </div>

            <Footer />
          </main>
          <ThemeCustomizer />
          <Toaster position="top-center" reverseOrder={false} />
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

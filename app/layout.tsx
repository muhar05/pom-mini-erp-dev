import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "POM Mini ERP",
  description:
    "Aplikasi untuk mengelola lead, opportunity, quotation, sales order, purchasing, inventory, dan delivery dalam satu sistem terpadu.",
  metadataBase: new URL(
    "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app"
  ),
  authors: [{ name: "PT PRIMA OTOMASI MANDIRI" }],
  openGraph: {
    title: "Projek Sales & Purchasing Management",
    description:
      "Platform pengelolaan penjualan dan pembelian dari lead sampai delivery.",
    url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app",
    siteName: "POM-MINI-ERP",
    images: [
      {
        url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wowdash Admin Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}

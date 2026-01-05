"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SalesOrderNewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to sales orders list after showing message
    const timer = setTimeout(() => {
      router.push("/crm/sales-orders");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sales Order Cannot Be Created Manually
          </h2>
          <div className="text-gray-600 space-y-3 mb-6">
            <p>
              Sales Orders can only be created through the Quotation conversion
              process.
            </p>
            <p className="font-medium">To create a Sales Order:</p>
            <ol className="list-decimal list-inside text-left max-w-md mx-auto space-y-1">
              <li>Go to Quotations page</li>
              <li>Find an approved/winning quotation</li>
              <li>Click "Convert to Sales Order"</li>
              <li>The system will create the Sales Order automatically</li>
            </ol>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/crm/sales-orders")}
            >
              Back to Sales Orders
            </Button>
            <Button onClick={() => router.push("/crm/quotations")}>
              Go to Quotations
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            You will be redirected automatically in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

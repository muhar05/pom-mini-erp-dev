"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddSalesOrderButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Why Can't I Create SO?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Sales Order Creation
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>
                Sales Orders cannot be created manually. They must be generated
                from approved quotations to ensure data integrity.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">
                  To create a Sales Order:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Create and approve a quotation</li>
                  <li>Win the quotation</li>
                  <li>Convert it to Sales Order</li>
                </ol>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Link href="/crm/quotations">
            <Button className="flex items-center gap-2">
              Go to Quotations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

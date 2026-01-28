// PrintButton.tsx
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import { RefObject } from "react";
import { Button } from "../ui/button";

export function PrintButton({
  printRef,
  title,
}: {
  printRef: RefObject<HTMLDivElement>;
  title?: string;
}) {
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      body { -webkit-print-color-adjust: exact; }
    `,
  });

  return (
    <Button
      style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      onClick={handlePrint}
    >
      <Printer className="w-4 h-4 mr-2" />
      Print Quotation
    </Button>
  );
}

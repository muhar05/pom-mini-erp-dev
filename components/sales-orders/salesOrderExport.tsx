import React, { useRef, forwardRef, useImperativeHandle } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type SOItem = {
  product_name: string;
  price: number;
  qty: number;
  total: number;
  status?: string;
};

export type SOExportHandle = {
  download: () => void;
};

type Props = {
  soNumber: string;
  date: string;
  paymentTerm: string;
  currency?: string;

  customerName: string;
  customerAddress: string;
  customerEmail?: string;

  companyName: string;
  companyAddress: string;
  companyPhone?: string;

  items: SOItem[];

  notes?: string;
  project?: string;
  signatureName?: string;

  fileName?: string;
  status?: string;
  saleStatus?: string;
  paymentStatus?: string;
};

const SalesOrderExport = forwardRef<SOExportHandle, Props>(
  function SalesOrderExport(props, ref) {
    const {
      soNumber,
      date,
      paymentTerm,
      currency = "IDR",
      customerName,
      customerAddress,
      customerEmail,
      companyName,
      companyAddress,
      companyPhone,
      items,
      notes,
      project,
      signatureName,
      fileName = "sales-order.pdf",
      status,
      saleStatus,
      paymentStatus,
    } = props;

    const divRef = useRef<HTMLDivElement | null>(null);

    const total = items.reduce((s, it) => s + it.total, 0);
    const vat = Math.round(total * 0.11);
    const grandTotal = total + vat;

    const handleExport = async () => {
      if (!divRef.current) return;

      const options = {
        scale: 2,
        backgroundColor: "#fff",
        useCORS: true,
      } as any;

      const canvas = await html2canvas(divRef.current, options);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pxToMm = (px: number) => px * 0.264583;

      const imgW = pxToMm(canvas.width);
      const imgH = pxToMm(canvas.height);

      const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);

      pdf.addImage(
        imgData,
        "PNG",
        (pageWidth - imgW * ratio) / 2,
        10,
        imgW * ratio,
        imgH * ratio
      );

      pdf.save(fileName);
    };

    useImperativeHandle(ref, () => ({
      download: handleExport,
    }));

    return (
      <div
        ref={divRef}
        style={{
          width: 794,
          minHeight: 1123,
          padding: 32,
          fontFamily: "Arial, sans-serif",
          fontSize: 11,
          color: "#000",
          background: "#fff",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ width: 180, minHeight: 80 }}>
            <img
              src="/assets/pom-logo.png"
              alt="POM Logo"
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
              {companyName}
            </div>
            <div style={{ marginTop: 4 }}>{companyAddress}</div>
            {companyPhone && (
              <div style={{ marginTop: 2 }}>Tel: {companyPhone}</div>
            )}
          </div>
        </div>
        {/* Garis tebal */}
        <div
          style={{
            borderBottom: "3px solid #222",
            margin: "16px 0 12px 0",
            width: "100%",
          }}
        />

        {/* Info Customer & SO */}
        <div style={{ display: "flex", marginBottom: 8 }}>
          {/* Customer */}
          <div style={{ flex: 1 }}>
            <table style={{ fontSize: 11 }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, width: 80 }}>To</td>
                  <td>: {customerName}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Address</td>
                  <td>: {customerAddress}</td>
                </tr>
                {customerEmail && (
                  <tr>
                    <td style={{ fontWeight: 700 }}>Email</td>
                    <td>: {customerEmail}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* SO Info */}
          <div style={{ flex: 1 }}>
            <table style={{ fontSize: 11, float: "right" }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, width: 90 }}>SO No</td>
                  <td>: {soNumber}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Date</td>
                  <td>: {date}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Payment</td>
                  <td>: {paymentTerm}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Currency</td>
                  <td>: {currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Badges */}
        {(status || saleStatus || paymentStatus) && (
          <div style={{ marginBottom: 12 }}>
            <table style={{ fontSize: 10 }}>
              <tbody>
                <tr>
                  {status && (
                    <td style={{ paddingRight: 10 }}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(status),
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        Status: {status}
                      </span>
                    </td>
                  )}
                  {saleStatus && (
                    <td style={{ paddingRight: 10 }}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(saleStatus),
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        Sale: {saleStatus}
                      </span>
                    </td>
                  )}
                  {paymentStatus && (
                    <td>
                      <span
                        style={{
                          backgroundColor: getStatusColor(paymentStatus),
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        Payment: {paymentStatus}
                      </span>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Judul */}
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 20,
            margin: "18px 0 8px 0",
            letterSpacing: 1,
            color: "#222",
          }}
        >
          SALES ORDER
        </div>

        {/* Table of Items */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            marginBottom: 16,
          }}
        >
          <thead>
            <tr>
              <th style={thCell}>No</th>
              <th style={thCell}>Product Name</th>
              <th style={thCell}>Qty</th>
              <th style={thCell}>Unit Price</th>
              <th style={thCell}>Total Price</th>
              <th style={thCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td style={tdCellCenter}>{i + 1}</td>
                <td style={tdCellLeft}>{it.product_name}</td>
                <td style={tdCellRight}>{it.qty}</td>
                <td style={tdCellRight}>{fmt(it.price)}</td>
                <td style={tdCellRight}>{fmt(it.total)}</td>
                <td style={tdCellCenter}>{it.status || "ACTIVE"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes & Project */}
        {(notes || project) && (
          <div style={{ display: "flex", marginBottom: 8 }}>
            {notes && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Notes:</div>
                <div>{notes}</div>
              </div>
            )}
            {project && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Project:</div>
                <div>{project}</div>
              </div>
            )}
          </div>
        )}

        {/* Totals */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
        >
          <table style={{ fontSize: 11, minWidth: 220 }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 8px" }}>Total</td>
                <td style={tdCellRight}>{fmt(total)}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px" }}>VAT 11%</td>
                <td style={tdCellRight}>{fmt(vat)}</td>
              </tr>
              <tr style={{ fontWeight: 700 }}>
                <td style={{ padding: "4px 8px" }}>Grand Total</td>
                <td style={tdCellRight}>{fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div style={{ marginTop: 48, textAlign: "right" }}>
          <div>Best Regards,</div>
          <div style={{ marginTop: 48, fontWeight: 700, fontSize: 13 }}>
            {signatureName}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            bottom: 24,
            fontSize: 10,
            color: "#888",
            textAlign: "center",
          }}
        >
          Page 1 of 1
        </div>
      </div>
    );
  }
);

// Helper function to get status colors
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "draft":
      return "#6b7280"; // gray
    case "open":
      return "#3b82f6"; // blue
    case "confirmed":
      return "#10b981"; // green
    case "completed":
      return "#8b5cf6"; // purple
    case "cancelled":
      return "#ef4444"; // red
    case "paid":
      return "#10b981"; // green
    case "unpaid":
      return "#f59e0b"; // yellow
    default:
      return "#6b7280"; // gray
  }
}

// Table cell styles
const thCell = {
  border: "2px solid #000",
  padding: "7px 4px",
  background: "#e6f4e6",
  fontWeight: 700,
  textAlign: "center" as const,
};
const tdCellCenter = {
  border: "2px solid #000",
  padding: "5px 4px",
  textAlign: "center" as const,
};
const tdCellLeft = {
  border: "2px solid #000",
  padding: "5px 4px",
  textAlign: "left" as const,
};
const tdCellRight = {
  border: "2px solid #000",
  padding: "5px 4px",
  textAlign: "right" as const,
};

function fmt(v: number) {
  return v.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

export default SalesOrderExport;

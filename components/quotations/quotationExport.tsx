import React, { useRef, forwardRef, useImperativeHandle } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type SQItem = {
  partNo: string;
  desc: string;
  qty: number;
  unit: string;
  unitPrice: number;
};

export type SQExportHandle = {
  download: () => void;
};

type Props = {
  sqNumber: string;
  date: string;
  paymentTerm: string;
  currency: string;

  customerName: string;
  customerAddress: string;
  customerEmail?: string;

  companyName: string;
  companyAddress: string;
  companyPhone?: string;

  items: SQItem[];

  notes?: string;
  project?: string;
  signatureName?: string;

  fileName?: string;

  // Add discount props
  discount?: number; // discount percentage
  diskon1?: number;
  diskon2?: number;
  discountAmount?: number; // discount amount in rupiah
};

const SalesQuotationExport = forwardRef<SQExportHandle, Props>(
  function SalesQuotationExport(props, ref) {
    const {
      sqNumber,
      date,
      paymentTerm,
      currency,
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
      fileName = "sales-quotation.pdf",
      diskon1 = 0,
      diskon2 = 0,
      discount = 0,
      discountAmount = 0,
    } = props;

    const divRef = useRef<HTMLDivElement | null>(null);

    // Perhitungan sama persis dengan detail page
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const discount1Amount = (subtotal * diskon1) / 100;
    const afterDiscount1 = subtotal - discount1Amount;
    const discount2Amount = diskon2 > 0 ? (afterDiscount1 * diskon2) / 100 : 0;
    const afterDiscount2 = afterDiscount1 - discount2Amount;
    const additionalDiscountAmount =
      discount > 0 ? (afterDiscount2 * discount) / 100 : 0;
    const afterAllDiscount = afterDiscount2 - additionalDiscountAmount;
    const vat = Math.round(afterAllDiscount * 0.11);
    const grandTotal = afterAllDiscount + vat;

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
        imgH * ratio,
      );

      pdf.save(fileName);
    };

    useImperativeHandle(ref, () => ({
      download: handleExport,
    }));

    // Formatting helper
    const fmt = (v: number) => {
      return v.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };

    return (
      <div
        ref={divRef}
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "30px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "1.4",
          color: "#333",
          backgroundColor: "#fff",
          boxSizing: "border-box",
          margin: "0 auto",
          position: "relative"
        }}
      >
        {/* Container Header & Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>

          {/* Left Column: Company Info & TO Section */}
          <div style={{ flex: 1, paddingRight: "20px" }}>
            {/* Company Info */}
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{companyName}</h1>
              <p style={{ margin: "5px 0 0 0", fontSize: '12px', whiteSpace: "pre-line", lineHeight: "1.2" }}>
                {companyAddress}
                {companyPhone ? `\nTel: ${companyPhone}` : ""}
              </p>
            </div>

            {/* TO Section Label */}
            <div style={{
              borderTop: "1px solid #000",
              borderBottom: "1px solid #000",
              padding: "5px 0",
              fontWeight: "bold",
              marginBottom: "10px",
              width: "100%"
            }}>
              TO
            </div>

            {/* Customer Details */}
            <div>
              {/* Assuming customerName represents the Company (PT) which should be bold per request. 
                        If it represents a person, we treat it as the primary bold header here as well. */}
              <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{customerName}</div>

              {customerEmail && (
                <div style={{ marginBottom: "8px", fontSize: "12px" }}>Email: {customerEmail}</div>
              )}

              {/* Customer Address with Light Green Background */}
              <div style={{
                backgroundColor: "#e6f4e6",
                padding: "10px",
                fontSize: "12px",
                borderRadius: "4px",
                whiteSpace: "pre-line"
              }}>
                {customerAddress}
              </div>
            </div>
          </div>

          {/* Right Column: Logo, Title, Quote Details */}
          <div style={{ width: "40%", display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
            {/* Logo */}
            <img
              src="/assets/pom-logo.png"
              alt={companyName}
              style={{ maxHeight: "60px", marginBottom: "10px", objectFit: "contain" }}
            />

            {/* Title */}
            <h2 style={{
              margin: "0 0 15px 0",
              color: "#008000",
              fontSize: "22px",
              fontWeight: "bold",
              borderTop: "1px solid #000",
              borderBottom: "1px solid #000",
              padding: "5px 0",
              width: "100%",
              textAlign: "right"
            }}>
              SALES QUOTATION
            </h2>

            {/* Details Table */}
            <div style={{ backgroundColor: "#e6f4e6", padding: "10px", borderRadius: "4px" }}>
              <table style={{ borderCollapse: "collapse", fontSize: "12px" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 10px 2px 0", fontWeight: "bold" }}>No.</td>
                    <td style={{ textAlign: "left", padding: "2px" }}>: {sqNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 10px 2px 0", fontWeight: "bold" }}>Date</td>
                    <td style={{ textAlign: "left", padding: "2px" }}>: {date}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 10px 2px 0", fontWeight: "bold" }}>Payment Term</td>
                    <td style={{ textAlign: "left", padding: "2px" }}>: {paymentTerm}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 10px 2px 0", fontWeight: "bold" }}>Currency</td>
                    <td style={{ textAlign: "left", padding: "2px" }}>: {currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th style={styles.th}>No.</th>
              <th style={styles.th}>Part No.</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ ...styles.td, textAlign: "center", width: '40px' }}>{index + 1}</td>
                <td style={styles.td}>{item.partNo}</td>
                <td style={styles.td}>{item.desc}</td>
                <td style={{ ...styles.td, textAlign: "center", width: '80px', whiteSpace: 'nowrap' }}>{item.qty} {item.unit}</td>
                <td style={{ ...styles.td, textAlign: "right", whiteSpace: 'nowrap' }}>{fmt(item.unitPrice)}</td>
                <td style={{ ...styles.td, textAlign: "right", whiteSpace: 'nowrap' }}>{fmt(item.qty * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Table */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: "350px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={styles.summaryTd}>Total</td>
                <td style={{ ...styles.summaryTd, textAlign: "right" }}>{fmt(subtotal)}</td>
              </tr>
              {diskon1 > 0 && (
                <tr>
                  <td style={styles.summaryTd}>Diskon 1 ({diskon1}%)</td>
                  <td style={{ ...styles.summaryTd, textAlign: "right" }}>-{fmt(discount1Amount)}</td>
                </tr>
              )}
              {diskon2 > 0 && (
                <tr>
                  <td style={styles.summaryTd}>Diskon 2 ({diskon2}%)</td>
                  <td style={{ ...styles.summaryTd, textAlign: "right" }}>-{fmt(discount2Amount)}</td>
                </tr>
              )}
              {discount > 0 && (
                <tr>
                  <td style={styles.summaryTd}>Additional Discount ({discount}%)</td>
                  <td style={{ ...styles.summaryTd, textAlign: "right" }}>-{fmt(additionalDiscountAmount)}</td>
                </tr>
              )}

              {(diskon1 > 0 || diskon2 > 0 || discount > 0) && (
                <tr style={{ borderTop: '1px solid #ddd' }}>
                  <td style={styles.summaryTd}>Total After Discount</td>
                  <td style={{ ...styles.summaryTd, textAlign: "right" }}>{fmt(afterAllDiscount)}</td>
                </tr>
              )}

              <tr>
                <td style={styles.summaryTd}>VAT (11%)</td>
                <td style={{ ...styles.summaryTd, textAlign: "right" }}>{fmt(vat)}</td>
              </tr>
              <tr style={{ fontWeight: "bold", backgroundColor: "#e6f4e6" }}>
                <td style={styles.summaryTd}>Grand Total</td>
                <td style={{ ...styles.summaryTd, textAlign: "right" }}>{fmt(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div style={{ marginTop: "20px", fontStyle: "italic", fontSize: "11px" }}>
          <strong>Notes:</strong>
          <div style={{ marginTop: '4px' }}>
            {notes && <div style={{ marginBottom: '2px' }}>- {notes}</div>}
            {project && <div>- Project: {project}</div>}
          </div>
        </div>

        {/* Footer / Signature */}
        <div style={{ marginTop: "50px" }}>
          <p style={{ margin: 0 }}>Best Regards,</p>
          <div style={{ height: "80px" }}></div>
          <strong style={{ fontSize: '13px' }}>{signatureName || "PT. PRIMA OTOMASI MANDIRI"}</strong>
        </div>

        {/* Page Count Mockup (visual only since we are generating PDF) */}
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
        </div>

      </div>
    );
  },
);

const styles = {
  th: {
    backgroundColor: "#e6f4e6",
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center" as const,
    fontWeight: "bold",
    fontSize: "12px"
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    verticalAlign: "top"
  },
  summaryTd: {
    padding: "5px",
    border: "none",
    verticalAlign: "top"
  }
};

export default SalesQuotationExport;

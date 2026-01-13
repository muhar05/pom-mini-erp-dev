import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const VPS_UPLOAD_URL = process.env.VPS_UPLOAD_URL;

// Helper: Sanitize filename agar URL-safe
function sanitizeFileName(originalName: string): string {
  return originalName
    .normalize("NFD") // Normalize unicode
    .replace(/[\u0300-\u036f]/g, "") // Hapus diacritics
    .replace(/\s+/g, "_") // Spasi jadi underscore
    .replace(/[^a-zA-Z0-9._-]/g, "") // Hapus karakter khusus
    .replace(/_+/g, "_") // Multiple underscore jadi satu
    .replace(/^_|_$/g, ""); // Hapus underscore di awal/akhir
}

// Helper: Generate unique filename dengan format: PO_{salesOrderId}_{timestamp}_{sanitizedName}.pdf
function generateUniqueFileName(
  originalName: string,
  salesOrderId?: string
): string {
  const timestamp = Date.now();
  const ext = path.extname(originalName).toLowerCase() || ".pdf";
  const baseName = path.basename(originalName, ext);
  const sanitizedBase = sanitizeFileName(baseName);

  // Format: PO_{salesOrderId}_{timestamp}_{nama}.pdf
  // Jika tidak ada salesOrderId, gunakan "NEW"
  const soId = salesOrderId || "NEW";

  return `PO_${soId}_${timestamp}_${sanitizedBase}${ext}`;
}

// POST: Upload file PO customer
export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const salesOrderId = formData.get("salesOrderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique & sanitized filename
    const fileName = generateUniqueFileName(
      file.name,
      salesOrderId || undefined
    );

    console.log("Original filename:", file.name);
    console.log("Sanitized filename:", fileName);
    console.log("Sales Order ID:", salesOrderId);

    // Jika VPS_UPLOAD_URL tersedia, forward ke VPS
    if (VPS_UPLOAD_URL) {
      // Buat file baru dengan nama yang sudah disanitize
      const bytes = await file.arrayBuffer();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const sanitizedFile = new File([blob], fileName, {
        type: "application/pdf",
      });

      const vpsFormData = new FormData();
      vpsFormData.append("file", sanitizedFile);

      const vpsResponse = await fetch(`${VPS_UPLOAD_URL}/upload/po-customer`, {
        method: "POST",
        body: vpsFormData,
      });

      if (!vpsResponse.ok) {
        const errorText = await vpsResponse.text();
        console.error("VPS upload error:", errorText);
        return NextResponse.json(
          { error: "Failed to upload file to server" },
          { status: 500 }
        );
      }

      const result = await vpsResponse.json();

      // VPS mengembalikan "filename" (lowercase)
      // Gunakan nama file yang kita generate, bukan dari VPS
      // karena VPS mungkin menambahkan timestamp lagi
      const uploadedFileName = result.filename || fileName;

      return NextResponse.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          fileName: uploadedFileName,
          fileUrl: `/api/po-customer/${encodeURIComponent(uploadedFileName)}`,
        },
      });
    }

    // Fallback: Simpan file lokal (untuk development)
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "po-customer"
    );
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully (local)",
      data: {
        fileName: fileName,
        fileUrl: `/api/po-customer/${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const VPS_UPLOAD_URL = process.env.VPS_UPLOAD_URL;

// GET: Proxy file dari VPS atau lokal
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await context.params;
    // Decode filename dari URL
    const filename = decodeURIComponent(params.filename);

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    console.log("Fetching file:", filename);

    // Jika VPS_UPLOAD_URL tersedia, fetch dari VPS
    if (VPS_UPLOAD_URL) {
      const vpsUrl = `${VPS_UPLOAD_URL}/uploads/po-customer/${encodeURIComponent(
        filename
      )}`;
      console.log("Fetching from VPS:", vpsUrl);

      const vpsResponse = await fetch(vpsUrl, { method: "GET" });

      if (!vpsResponse.ok) {
        console.error("VPS file not found:", vpsResponse.status);
        return NextResponse.json(
          { error: "File not found on VPS" },
          { status: 404 }
        );
      }

      const fileBuffer = await vpsResponse.arrayBuffer();

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Fallback: Baca file lokal
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "po-customer",
      filename
    );

    console.log("Reading local file:", filePath);

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

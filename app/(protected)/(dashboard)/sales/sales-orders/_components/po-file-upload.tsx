"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface POFileUploadProps {
  salesOrderId: string;
  currentFile?: string | null;
  onUploadSuccess?: (fileName: string) => void;
  onDeleteSuccess?: () => void;
}

export default function POFileUpload({
  salesOrderId,
  currentFile,
  onUploadSuccess,
  onDeleteSuccess,
}: POFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Kirim salesOrderId untuk identifikasi file
      formData.append("salesOrderId", salesOrderId || "NEW");

      const response = await fetch("/api/po-customer", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("File uploaded successfully");
        setFileName(result.data.fileName);
        // Callback dengan fileName saja (bukan full URL)
        onUploadSuccess?.(result.data.fileName);
      } else {
        toast.error(result.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to remove this file?")) return;
    setFileName(null);
    onDeleteSuccess?.();
    toast.success("File removed");
  };

  const handlePreview = () => {
    if (fileName) {
      window.open(`/api/po-customer/${encodeURIComponent(fileName)}`, "_blank");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Customer PO File</h3>
          </div>

          {fileName ? (
            // File exists
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // No file - show upload area
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload customer PO (PDF only, max 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}

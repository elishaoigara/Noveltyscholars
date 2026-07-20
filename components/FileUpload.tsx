"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderFile } from "@/lib/types";

interface FileUploadProps {
  orderId: string;
  onUploadComplete?: (file: OrderFile) => void;
  fileType?: "REFERENCE" | "FINAL";
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({
  orderId,
  onUploadComplete,
  fileType = "REFERENCE",
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/zip": [".zip"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
  },
  maxSize = 20 * 1024 * 1024, // 20MB
}: FileUploadProps) {
  const [files, setFiles] = useState<
    { name: string; size: number; progress: number; status: "uploading" | "done" | "error"; error?: string }[]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<OrderFile[]>([]);

  const supabase = createClient();

  const uploadFile = async (file: File) => {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `orders/${orderId}/${timestamp}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from("order-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("order-files").getPublicUrl(data.path);
    void publicUrl;

    const { data: orderFile, error: dbError } = await supabase
      .from("order_files")
      .insert({
        order_id: orderId,
        file_name: file.name,
        file_url: data.path,
        file_type: fileType,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || "",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save file record:", dbError);
    }

    return orderFile as OrderFile;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const fileIndex = files.length;
        setFiles((prev) => [
          ...prev,
          { name: file.name, size: file.size, progress: 0, status: "uploading" },
        ]);

        try {
          const orderFile = await uploadFile(file);
          setFiles((prev) =>
            prev.map((f, i) => (i === fileIndex ? { ...f, progress: 100, status: "done" } : f))
          );
          if (orderFile) {
            setUploadedFiles((prev) => [...prev, orderFile]);
            onUploadComplete?.(orderFile);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Upload failed";
          setFiles((prev) =>
            prev.map((f, i) =>
              i === fileIndex ? { ...f, progress: 0, status: "error", error: message } : f
            )
          );
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderId, fileType, onUploadComplete, files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-heading">
          {isDragActive ? "Drop files here" : "Drag & drop files here, or tap to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOCX, ZIP, PNG, JPG &bull; Max {Math.round(maxSize / (1024 * 1024))}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                {file.status === "uploading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : file.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate text-heading">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                    {file.error && (
                      <span className="text-red-500 ml-2">{file.error}</span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded File Links */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Uploaded files:</p>
          {uploadedFiles.map((f) => (
            <p key={f.id} className="text-xs text-primary truncate">
              {f.file_name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

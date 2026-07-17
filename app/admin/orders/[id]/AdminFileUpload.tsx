"use client";

import { FileUpload } from "@/components/FileUpload";
import type { OrderFile } from "@/lib/types";

interface AdminFileUploadProps {
  orderId: string;
}

export function AdminFileUpload({ orderId }: AdminFileUploadProps) {
  const handleUploadComplete = (file: OrderFile) => {
    // The FileUpload component handles the upload and DB insert.
    // We just need to refresh to see the new file.
    window.location.reload();
  };

  return (
    <FileUpload
      orderId={orderId}
      fileType="FINAL"
      onUploadComplete={handleUploadComplete}
    />
  );
}

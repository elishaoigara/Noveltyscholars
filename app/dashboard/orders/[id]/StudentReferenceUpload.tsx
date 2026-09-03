"use client";

import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import type { OrderFile } from "@/lib/types";

export function StudentReferenceUpload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleUploadComplete = (file: OrderFile) => {
    toast({
      variant: "success",
      title: "Reference file uploaded",
      description: `"${file.file_name}" is now attached to this order.`,
    });
    router.refresh();
  };

  return (
    <FileUpload
      orderId={orderId}
      fileType="REFERENCE"
      onUploadComplete={handleUploadComplete}
    />
  );
}

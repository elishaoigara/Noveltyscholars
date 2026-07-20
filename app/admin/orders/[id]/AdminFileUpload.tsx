"use client";

import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import type { OrderFile } from "@/lib/types";

interface AdminFileUploadProps {
  orderId: string;
}

export function AdminFileUpload({ orderId }: AdminFileUploadProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleUploadComplete = (file: OrderFile) => {
    toast({
      variant: "success",
      title: "File uploaded",
      description: `"${file.file_name}" was delivered to the customer.`,
    });
    // Light refresh of server data — no full page reload, no lost scroll
    // position, far less data to re-fetch on a slow connection.
    router.refresh();
  };

  return (
    <FileUpload
      orderId={orderId}
      fileType="FINAL"
      onUploadComplete={handleUploadComplete}
    />
  );
}

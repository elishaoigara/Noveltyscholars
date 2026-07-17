"use client";

import { Download, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderFile } from "@/lib/types";

interface OrderFilesListProps {
  files: (OrderFile & { signedUrl: string | null })[];
}

export function OrderFilesList({ files }: OrderFilesListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No files uploaded yet.
      </p>
    );
  }

  const referenceFiles = files.filter((f) => f.file_type === "REFERENCE");
  const finalFiles = files.filter((f) => f.file_type === "FINAL");

  return (
    <div className="space-y-4">
      {finalFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-green-700">Final Deliverables</h4>
          <div className="space-y-2">
            {finalFiles.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
      {referenceFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            Reference Files
          </h4>
          <div className="space-y-2">
            {referenceFiles.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({ file }: { file: OrderFile & { signedUrl: string | null } }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate">{file.file_name}</span>
      </div>
      {file.signedUrl ? (
        <a href={file.signedUrl} target="_blank" rel="noopener noreferrer" download>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Download className="h-4 w-4" />
          </Button>
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Unavailable</span>
      )}
    </div>
  );
}

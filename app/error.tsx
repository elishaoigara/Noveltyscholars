"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Something went wrong</h1>
        <p className="text-body max-w-sm mx-auto">
          An unexpected error occurred. Please try again, or contact us if the problem persists.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button onClick={reset} className="gap-2 w-full sm:w-auto">
          <RotateCw className="h-4 w-4" />
          Try Again
        </Button>
        <a href="mailto:noveltyscholars@gmail.com" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Contact Support
          </Button>
        </a>
      </div>
    </div>
  );
}

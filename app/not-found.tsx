import Link from "next/link";
import { FileQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <FileQuestion className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Page not found</h1>
        <p className="text-body max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link href="/">
        <Button className="gap-2 w-full sm:w-auto">
          Back to Home <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

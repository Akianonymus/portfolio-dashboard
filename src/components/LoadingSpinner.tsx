import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({
  message = "Loading portfolio data...",
  className,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[80vh] space-y-4",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  );
};

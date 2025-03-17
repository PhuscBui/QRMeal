import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling
        "flex h-10 w-full rounded-md border bg-background px-4 py-2 text-sm",

        // Typography
        "font-medium text-foreground placeholder:text-muted-foreground",

        // Selection styling
        "selection:bg-primary/20 selection:text-primary-foreground",

        // File input styling
        "file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1",
        "file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15",

        // Focus states with smooth transitions
        "outline-none transition-all duration-200",
        "focus:border-primary/50 focus:ring-2 focus:ring-primary/25",

        // Invalid state
        "aria-invalid:border-destructive/50 aria-invalid:ring-destructive/20",

        // Dark mode adjustments
        "dark:border-input/40 dark:bg-background/80 dark:focus:border-primary/70",
        "dark:focus:ring-primary/30 dark:aria-invalid:border-destructive/60",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Custom className override
        className
      )}
      {...props}
    />
  );
}

export { Input };

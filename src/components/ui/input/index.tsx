import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-[var(--form-primary,var(--color-primary))] selection:text-white dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&:-webkit-autofill]:[-webkit-text-fill-color:var(--form-text,var(--color-foreground))] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_var(--form-bg,var(--color-background))_inset] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:var(--form-text,var(--color-foreground))] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:var(--form-text,var(--color-foreground))]",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type CSSProperties, type ReactNode } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
  variant?: "bottom" | "center";
  themeStyles?: CSSProperties;
}

/**
 * Reusable consent dialog wrapper - handles positioning and theming
 */
export function ConsentDialog({
  open,
  onOpenChange,
  children,
  title,
  variant = "bottom",
  themeStyles,
}: ConsentDialogProps) {
  const contentClassName =
    variant === "bottom"
      ? "!fixed !top-auto !bottom-8 !left-1/2 !z-50 !grid !w-[calc(100%-2rem)] !max-w-[800px] !-translate-x-1/2 !translate-y-0 !gap-0 rounded-lg border-[var(--consent-border)] bg-[var(--consent-bg)] p-0 text-[var(--consent-fg)] shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 sm:!w-[calc(100%-4rem)]"
      : "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg border-[var(--consent-border)] bg-[var(--consent-bg)] text-[var(--consent-fg)]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          style={themeStyles}
          className="bg-[var(--consent-backdrop)]/86"
        />
        <DialogPrimitive.Content
          style={themeStyles}
          className={contentClassName}
        >
          <div className="sr-only">
            <DialogTitle>{title}</DialogTitle>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

interface ConsentDialogCloseProps {
  onClose: () => void;
}

/**
 * Reusable close button for consent dialogs
 */
export function ConsentDialogClose({ onClose }: ConsentDialogCloseProps) {
  return (
    <DialogPrimitive.Close
      onClick={onClose}
      className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Close</title>
        <path
          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

export default ConsentDialog;

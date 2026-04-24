import { XIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface IModalProps {
  onClose?: () => void;
  isShow?: boolean; // For backward compatibility
  open?: boolean; // New prop to match Radix UI pattern
  onOpenChange?: (open: boolean) => void; // New prop to match Radix UI pattern
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  backgroundClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  components?: {
    modalClose?: React.ReactNode;
  };
  styles?: {
    modalCardBody?: React.CSSProperties;
  };
}

const Modal = (props: IModalProps) => {
  const modalClose = props.components?.modalClose ? (
    props.components.modalClose
  ) : (
    <XIcon className="w-5 h-5" />
  );

  // Support both old (isShow) and new (open) props
  const isOpen = props.open !== undefined ? props.open : props.isShow;

  if (!isOpen) return null;

  const handleClose = () => {
    props.onClose?.();
    if (props.onOpenChange) {
      props.onOpenChange(false);
    }
  };

  // Define size classes
  const sizeClasses = {
    sm: "max-w-[calc(100%-2rem)] md:max-w-md",
    md: "max-w-[calc(100%-2rem)] md:max-w-lg",
    lg: "max-w-[calc(100%-2rem)] md:max-w-2xl",
    xl: "max-w-[calc(100%-2rem)] md:max-w-4xl",
    full: "max-w-[95%]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal Background/Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity",
          props.backgroundClassName,
        )}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-50 w-full rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          props.size ? sizeClasses[props.size] : "max-w-[calc(100%-2rem)]",
          props.className,
        )}
      >
        {/* Modal Body */}
        <section
          className={cn(
            "relative w-full mx-auto bg-white p-6 rounded-lg border-none",
            props.bodyClassName,
          )}
          style={props.styles?.modalCardBody}
        >
          {/* Close Button */}
          <button
            className="absolute top-2.5 right-2.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm"
            onClick={handleClose}
          >
            {modalClose}
            <span className="sr-only">Close</span>
          </button>

          {/* Modal Content */}
          {props.children}
        </section>
      </div>
    </div>
  );
};

export default Modal;

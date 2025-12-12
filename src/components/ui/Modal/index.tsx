import React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IModalProps {
  onClose?: () => void;
  isShow: boolean;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  backgroundClassName?: string;
  components?: {
    modalClose?: React.ReactNode;
  };
  styles?: {
    modalCardBody?: React.CSSProperties;
  };
}

const Modal = (props: IModalProps) => {
  const modalClose =
    props.components && props.components.modalClose ? (
      props.components.modalClose
    ) : (
      <XIcon className="w-5 h-5" />
    );

  if (!props.isShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal Background/Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity",
          props.backgroundClassName,
        )}
        onClick={() => {
          props.onClose?.();
        }}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-50 w-full max-w-[calc(100%-2rem)] rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          props.className,
        )}
      >
        {/* Modal Body */}
        <section
          className={cn(
            "relative w-full mx-auto backdrop-blur-[40px] rounded-lg border-none",
            props.bodyClassName,
          )}
          style={props.styles?.modalCardBody}
        >
          {/* Close Button */}
          <button
            className="absolute top-2.5 right-2.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm"
            onClick={props.onClose}
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
export type { IModalProps };

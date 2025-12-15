import type React from "react";
import { CSS_CLASSES } from "../constants";

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`${CSS_CLASSES.CONTAINER} ${className || ""}`}>
      {children}
    </div>
  );
};

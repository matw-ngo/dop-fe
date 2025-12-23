import type React from "react";

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`max-w-2xl mx-auto p-4 ${className || ""}`}>{children}</div>
  );
};

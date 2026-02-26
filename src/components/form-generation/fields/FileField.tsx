/**
 * Form Generation Library - File Field Component
 *
 * File upload with preview, validation, and multiple file support.
 * Supports drag-and-drop, file type validation, size limits, and image previews.
 *
 * @example
 * ```tsx
 * // Single file upload
 * <FileField
 *   field={{
 *     id: 'document',
 *     name: 'document',
 *     type: 'file',
 *     label: 'Upload Document',
 *     options: {
 *       accept: '.pdf,.doc,.docx',
 *       maxSize: 10 * 1024 * 1024, // 10MB
 *     }
 *   }}
 *   value={selectedFile}
 *   onChange={setFile}
 * />
 *
 * // Multiple file upload with image preview
 * <FileField
 *   field={{
 *     id: 'images',
 *     name: 'images',
 *     type: 'file',
 *     label: 'Upload Images',
 *     options: {
 *       accept: 'image/*',
 *       multiple: true,
 *       maxSize: 5 * 1024 * 1024,
 *     }
 *   }}
 *   value={selectedFiles}
 *   onChange={setFiles}
 * />
 * ```
 */

"use client";

import { File as FileIcon, Image as ImageIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useFormTheme } from "../themes/ThemeProvider";
import {
  type FieldComponentProps,
  type FileFieldConfig,
  ValidationRuleType,
} from "../types";
import { cn, formatFileSize } from "../utils/helpers";

// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function FileField({
  field,
  value,
  onChange,
  error,
  disabled,
  className,
}: FieldComponentProps<File | File[] | null>) {
  const { theme } = useFormTheme();
  const fileField = field as FileFieldConfig;
  const options = fileField.options || {};
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  const files = value ? (Array.isArray(value) ? value : [value]) : [];
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const isDisabled = disabled || field.disabled;
  const internalLabel = theme.fieldOptions?.internalLabel;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );
  const fieldCssVars = {
    "--form-primary": theme.colors.primary,
    "--form-border": theme.colors.border,
    "--form-bg": theme.colors.background,
    "--form-text": theme.colors.textPrimary || "#073126",
    "--form-muted-bg": theme.colors.readOnly,
    "--form-disabled-bg": theme.colors.disabled,
    "--form-text-secondary": theme.colors.textSecondary || "#4d7e70",
  } as React.CSSProperties;

  // Base field wrapper styles
  const baseFieldStyles = [
    "w-full",
    "transition-all",
    "duration-200",
    // Error state
    error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    // Disabled state
    isDisabled && "opacity-60 cursor-not-allowed",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);

    // Validate file sizes
    for (const file of fileArray) {
      if (file.size > maxSize) {
        // Could trigger validation error here
        console.warn(
          `File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`,
        );
        return;
      }
    }

    const newValue = options.multiple ? fileArray : fileArray[0];
    onChange(newValue);

    // Generate previews for images
    fileArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) =>
            new Map(prev).set(file.name, reader.result as string),
          );
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemove = (fileToRemove: File) => {
    if (options.multiple) {
      const newFiles = files.filter((f) => f !== fileToRemove);
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }

    // Remove preview
    setPreviews((prev) => {
      const newPreviews = new Map(prev);
      newPreviews.delete(fileToRemove.name);
      return newPreviews;
    });
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className={cn(...baseFieldStyles, className)} style={fieldCssVars}>
      {files.length === 0 ? (
        <div className={cn("relative w-full", className)}>
          {/* Internal Label */}
          {internalLabel && field.label && (
            <label
              htmlFor={field.id}
              className="absolute top-2 left-4 text-xs font-medium text-[var(--form-primary)] pointer-events-none z-10"
            >
              {field.label}
              {isRequired && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32",
              // Base border styles using theme colors
              "border-2 border-dashed",
              "rounded-lg cursor-pointer",
              "transition-all duration-200",
              // Use theme colors
              "border-[var(--form-border)]",
              "bg-[var(--form-bg)]",
              "hover:border-[var(--form-primary)] hover:bg-[var(--form-muted-bg)]",
              // Focus styles using theme
              "focus:outline-none focus:ring-2 focus:ring-[var(--form-primary)]/20 focus:border-[var(--form-primary)]",
              // Error state
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              // Disabled state
              isDisabled &&
                "opacity-60 cursor-not-allowed bg-[var(--form-disabled-bg)]",
              // Add padding for internal label
              internalLabel && "pt-8",
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              {options.accept && (
                <p className="text-xs text-muted-foreground mt-1">
                  {options.accept}
                </p>
              )}
              {maxSize && (
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {formatFileSize(maxSize)}
                </p>
              )}
            </div>
            <input
              id={field.id}
              name={field.name}
              type="file"
              className="sr-only"
              accept={options.accept}
              multiple={options.multiple}
              onChange={handleFileChange}
              disabled={isDisabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => {
            const preview = previews.get(file.name);
            const showPreview = isImage(file) && preview;

            return (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  // File list item specific styles using theme colors
                  "border",
                  "border-[var(--form-border)]",
                  "bg-[var(--form-bg)]",
                  // Transition
                  "transition-all duration-200",
                )}
              >
                {showPreview ? (
                  <div className="shrink-0">
                    <img
                      src={preview}
                      alt={file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </div>
                ) : (
                  <div className="shrink-0">
                    {isImage(file) ? (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--form-text)] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  disabled={isDisabled}
                  className={cn(
                    "shrink-0 p-1 rounded transition-all duration-200",
                    // Use theme error color for remove button
                    "text-red-500 hover:text-red-600 hover:bg-red-50",
                    "focus:outline-none focus:ring-2 focus:ring-red-500/20",
                    // Disabled state
                    isDisabled && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            );
          })}
          {options.multiple && (
            <label
              className={cn(
                "flex items-center justify-center gap-2 p-3",
                // Add more files specific styles using theme colors
                "border-2 border-dashed rounded-lg cursor-pointer",
                "border-[var(--form-border)]",
                "bg-[var(--form-bg)]",
                "hover:border-[var(--form-primary)] hover:bg-[var(--form-muted-bg)]",
                "transition-all duration-200",
                "text-sm text-[var(--form-text-secondary)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--form-primary)]/20 focus:border-[var(--form-primary)]",
                // Disabled state
                isDisabled &&
                  "opacity-60 cursor-not-allowed bg-[var(--form-disabled-bg)]",
              )}
            >
              <Upload className="h-4 w-4" />
              <span>Add more files</span>
              <input
                type="file"
                className="sr-only"
                accept={options.accept}
                multiple={options.multiple}
                onChange={handleFileChange}
                disabled={isDisabled}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

FileField.displayName = "FileField";

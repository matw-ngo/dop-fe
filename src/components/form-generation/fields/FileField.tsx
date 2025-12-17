/**
 * Form Generation Library - File Field Component
 *
 * File upload with preview, validation, and multiple file support
 */

"use client";

import { File as FileIcon, Image as ImageIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, FileFieldConfig } from "../types";
import { cn, formatFileSize } from "../utils/helpers";

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
    <div className={cn("w-full", className)}>
      {files.length === 0 ? (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-32",
            // Apply theme control styles for base and variant
            theme.control.base,
            theme.control.variants.default,
            // File input specific styles (border-dashed for drop zone)
            "border-2 border-dashed rounded-lg cursor-pointer",
            "hover:bg-muted/50 transition-colors",
            // Theme-based focus styles
            theme.control.states.focus,
            // Error state
            error && theme.control.states.error,
            // Disabled state
            isDisabled && theme.control.states.disabled,
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
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
                  // Apply theme control base styles
                  theme.control.base,
                  theme.control.variants.default,
                  // File list item specific styles
                  "bg-muted border border-border",
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
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  disabled={isDisabled}
                  className={cn(
                    "shrink-0 text-destructive hover:text-destructive/80",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
                    // Apply theme disabled state
                    isDisabled && theme.control.states.disabled,
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
                // Apply theme control styles
                theme.control.base,
                theme.control.variants.default,
                theme.control.sizes.sm,
                // Add more files specific styles
                "border-2 border-dashed rounded-lg cursor-pointer",
                "hover:bg-muted/50 transition-colors text-sm text-muted-foreground",
                // Disabled state
                isDisabled && theme.control.states.disabled,
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

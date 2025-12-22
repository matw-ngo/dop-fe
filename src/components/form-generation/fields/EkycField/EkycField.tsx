import React from "react";
import { useFormTheme } from "../../themes/ThemeProvider";
import {
  type EkycFieldConfig,
  type EkycFieldProps,
  ValidationRuleType,
} from "../../types";
import { cn } from "../../utils/helpers";
import { useEkycField } from "./useEkycField";
import { getEkycStyles } from "./styles";

// Import sub-components
import { VerificationButton } from "./components/VerificationButton";
import { VerificationInline } from "./components/VerificationInline";
import { VerificationModal } from "./components/VerificationModal";
import { VerificationResult as ResultDisplay } from "./components/VerificationResult";

// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function EkycField(props: EkycFieldProps) {
  const { field, error, disabled } = props;
  const { theme } = useFormTheme();
  const ekycField = field as EkycFieldConfig;
  const internalLabel = theme.fieldOptions?.internalLabel;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );

  // Use the extracted hook
  const {
    isVerifying,
    status,
    result,
    currentError,
    showModal,
    setShowModal,
    handleVerify,
    handleCancel,
    renderProps,
  } = useEkycField(props);

  // Get styles
  const { wrapperClassName } = getEkycStyles({
    variant: ekycField.variant || "button",
    theme,
    error: error || currentError,
    disabled,
    internalLabel,
  });

  // Render based on mode
  if (ekycField.renderMode === "custom" && ekycField.customRender) {
    return (
      <div className="ekyc-field-custom">
        {ekycField.customRender(renderProps)}
      </div>
    );
  }

  // Render modal mode
  if (ekycField.renderMode === "modal") {
    return (
      <div
        className={cn(
          "ekyc-field-modal",
          (error || currentError) && "space-y-2",
        )}
      >
        <VerificationButton
          onStart={handleVerify}
          isVerifying={isVerifying}
          result={result}
          disabled={disabled}
          config={ekycField}
        />

        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onVerify={handleVerify}
          onCancel={() => setShowModal(false)}
          isVerifying={isVerifying}
          config={ekycField}
          error={currentError}
          result={result}
          onRetry={handleVerify} // Re-use handleVerify for retry in modal
        />

        {(error || currentError) && (
          <div className="text-sm text-red-500">{error || currentError}</div>
        )}
      </div>
    );
  }

  // Render inline mode
  if (ekycField.renderMode === "inline") {
    return (
      <div
        className={cn(
          "ekyc-field-inline",
          (error || currentError) && "space-y-2",
        )}
      >
        <VerificationInline
          onStart={handleVerify}
          onRetry={handleVerify}
          onCancel={handleCancel}
          isVerifying={isVerifying}
          status={status}
          result={result}
          error={currentError}
          disabled={disabled}
          config={ekycField}
          renderProps={renderProps}
        />
        {(error || currentError) && (
          <div className="text-sm text-red-500">{error || currentError}</div>
        )}
      </div>
    );
  }

  // Default: Button mode (with internal label and result display)
  return (
    <div className="space-y-2">
      <div className={wrapperClassName}>
        {/* Internal Label */}
        <label
          htmlFor={field.id}
          className={cn(
            "absolute top-2 left-4 text-xs font-medium pointer-events-none z-10",
            `text-[${theme.colors.primary}]`,
          )}
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        <div className="h-full flex items-center justify-between w-full">
          {/* Result Display or Placeholder */}
          <div className="flex-1 min-w-0">
            {result ? (
              <ResultDisplay result={result} variant="compact" />
            ) : (
              <div className="text-muted-foreground truncate pt-3">
                {ekycField.placeholder || "Chưa xác thực"}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 ml-4">
            <VerificationButton
              onStart={handleVerify}
              isVerifying={isVerifying}
              result={result}
              disabled={disabled}
              config={ekycField}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {currentError && (
        <div
          className={cn(
            "flex items-start gap-2 text-sm mt-1.5",
            `text-[${theme.colors.error}]`,
          )}
        >
          {currentError}
        </div>
      )}

      {/* Status indicator (if configured) */}
      {isVerifying && ekycField.verification?.uiConfig?.showProgress && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <div
            className={cn(
              "animate-spin rounded-full h-4 w-4 border-b-2",
              `border-[${theme.colors.primary}]`,
            )}
          ></div>
          <span>Verifying identity...</span>
        </div>
      )}
    </div>
  );
}

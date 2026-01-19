import { CheckCircle, Phone } from "lucide-react";
import { useCallback, useState } from "react";
import { OTPVerificationDialog } from "@/components/auth/OTPVerificationDialog";
import { Button } from "@/components/ui/button";
import type { FieldComponentProps } from "../../types";

export interface PhoneVerificationValue {
  phoneNumber: string;
  isVerified: boolean;
}

type Props = FieldComponentProps<PhoneVerificationValue>;

export function PhoneVerificationField({
  field,
  value,
  onChange,
  error,
  disabled,
  readOnly,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);

  const handlePhoneSubmit = useCallback(
    async (phoneNumber: string) => {
      onChange({ phoneNumber, isVerified: false });
    },
    [onChange],
  );

  const handleOTPSuccess = useCallback(
    (phoneNumber: string) => {
      onChange({ phoneNumber, isVerified: true });
      setShowDialog(false);
    },
    [onChange],
  );

  const handleResendOTP = useCallback(async (phone: string) => {
    // TODO: Implement actual resend OTP API call
    console.log("Resend OTP to:", phone);
  }, []);

  const handleRequestOTP = useCallback(async (phone: string) => {
    // TODO: Implement actual request OTP API call
    console.log("Request OTP for:", phone);
  }, []);

  const handleVerifyOTP = useCallback(
    async (otpCode: string): Promise<boolean> => {
      // TODO: Implement actual OTP verification API call
      // For now, we simulate a successful verification if OTP is "123456"
      if (otpCode === "123456") {
        return true;
      }
      return false;
    },
    [],
  );

  if (readOnly) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          {value?.isVerified ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Phone className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium">
            {value?.phoneNumber || "Chưa xác thực"}
          </span>
          {value?.isVerified && (
            <span className="text-sm text-green-600">✓ Đã xác thực</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{field.label}</p>
            <p className="text-sm text-muted-foreground">
              {value?.phoneNumber
                ? value.isVerified
                  ? `${value.phoneNumber} (Đã xác thực)`
                  : value.phoneNumber
                : "Chưa xác thực"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={value?.isVerified ? "outline" : "default"}
          onClick={() => setShowDialog(true)}
          disabled={disabled}
        >
          {value?.isVerified ? "Xác thực lại" : "Xác thực ngay"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <OTPVerificationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        phoneNumber={value?.phoneNumber}
        onPhoneSubmit={handlePhoneSubmit}
        onOTPVerify={handleVerifyOTP}
        onOTPRequest={handleRequestOTP}
        onOTPResend={handleResendOTP}
        onSuccess={handleOTPSuccess}
        title="Xác thực số điện thoại"
        description="Nhập số điện thoại để nhận mã OTP"
      />
    </div>
  );
}

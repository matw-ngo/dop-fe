"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitCreditCardConsent } from "@/lib/consent/credit-card-consent";
import { useConsentStore } from "@/store/use-consent-store";

interface ConsentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (consentId: string) => void;
}

export function ConsentModal({ open, setOpen, onSuccess }: ConsentModalProps) {
  const { setError, clearError, error } = useConsentStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleAgree = async () => {
    setIsLoading(true);
    clearError();
    try {
      const consentId = await submitCreditCardConsent();
      if (consentId) {
        onSuccess?.(consentId);
        setOpen(false);
      } else {
        setError("Không thể gửi yêu cầu đồng ý. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi gửi yêu cầu đồng ý.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setError("Bạn cần đồng ý với chính sách bảo mật để tiếp tục.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chính sách bảo mật</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Để tiếp tục đăng ký thẻ tín dụng, chúng tôi cần sự đồng ý của
                bạn về việc thu thập và sử dụng dữ liệu cá nhân.
              </p>
              <div>
                <p className="font-medium">Dữ liệu của bạn sẽ được:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Thu thập theo quy định của pháp luật Việt Nam và GDPR</li>
                  <li>Chỉ sử dụng cho mục đích đăng ký và xét duyệt hồ sơ</li>
                  <li>Không chia sẻ cho bên thứ ba mà không có sự đồng ý</li>
                </ul>
              </div>
              <p className="font-medium">
                Bạn có đồng ý với chính sách bảo mật này không?
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={handleDecline}>
            Từ chối
          </Button>
          <Button onClick={handleAgree} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đồng ý"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

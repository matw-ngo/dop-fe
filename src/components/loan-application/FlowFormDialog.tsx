"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StepWizard } from "@/components/form-generation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { finzoneConfig } from "@/configs/tenants/finzone";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { useFlow } from "@/hooks/flow/use-flow";
import { buildFormConfigFromFlow } from "@/lib/builders/flow-form-builder";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import "@/lib/builders/register-flow-components";

interface FlowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowFormDialog({ open, onOpenChange }: FlowFormDialogProps) {
  const router = useRouter();
  const tenantId = finzoneConfig.uuid;
  const { data: flowData, isLoading } = useFlow(tenantId);
  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();
  const { mutate: submitInfo, isPending: isSubmitting } = useSubmitLeadInfo();

  const [_leadId, setLeadId] = useState<string | null>(null);
  const [_isFinding, setIsFinding] = useState(false);

  const dynamicFormConfig = useMemo(() => {
    if (!flowData) return null;
    return buildFormConfigFromFlow(flowData);
  }, [flowData]);

  const handleComplete = (data: Record<string, unknown>) => {
    console.log("Wizard completed:", data);

    const flowId = flowData?.id || "00000000-0000-0000-0000-000000000000";
    const stepId =
      flowData?.steps[flowData.steps.length - 1]?.id ||
      "00000000-0000-0000-0000-000000000000";

    const apiPayload = mapFormDataToLeadInfo(data, flowId, stepId);
    console.log("Mapped Payload:", apiPayload);

    // Create lead and navigate to loan-info page
    createLead(
      {
        flowId,
        tenant: tenantId,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
      },
      {
        onSuccess: (leadData) => {
          console.log("Lead created successfully:", leadData);
          setLeadId(leadData.id);
          setIsFinding(true);

          // Navigate to loan-info page with leadId and token
          const params = new URLSearchParams({
            leadId: leadData.id,
            token: leadData.token,
          });
          router.push(`/loan-info?${params.toString()}`);
        },
        onError: (error) => {
          console.error("Failed to create lead:", error);
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-semibold pr-8">
            {flowData?.name || "Đang tải..."}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-muted-foreground">Đang tải cấu hình...</p>
          </div>
        )}

        {!isLoading && flowData && dynamicFormConfig && (
          <div className="mt-4">
            {flowData.description && (
              <p className="text-sm text-muted-foreground mb-6">
                {flowData.description}
              </p>
            )}

            <StepWizard
              config={dynamicFormConfig}
              onComplete={handleComplete}
            />
          </div>
        )}

        {!isLoading && (!flowData || !dynamicFormConfig) && (
          <div className="py-12 flex flex-col items-center gap-4">
            <p className="text-destructive">Không thể tải cấu hình form</p>
            <Button type="button" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

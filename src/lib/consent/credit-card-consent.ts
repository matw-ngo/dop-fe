import { consentClient } from "@/lib/api/services/consent";
import { useConsentStore } from "@/store/use-consent-store";

const DATA_CATEGORIES = ["personal_data", "financial_data", "contact_data"];

const controller_id = "dop-system";
const processor_id = "dop-system";
const consent_version_id = "v1";
const source = "credit_card_loan_application";
const action = "grant" as const;
const action_by = "user";

export async function submitCreditCardConsent(): Promise<string | null> {
  try {
    const consentResponse = await consentClient.POST("/consent", {
      body: {
        tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real tenant ID
        lead_id: "placeholder",
        consent_version_id,
        session_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real session ID
        source,
      },
    });

    if (consentResponse.error) {
      useConsentStore
        .getState()
        .setError(consentResponse.error.message || "Không thể tạo bản đồng ý.");
      return null;
    }

    const consentId = consentResponse.data?.id;
    if (!consentId) {
      useConsentStore.getState().setError("Không thể lấy ID đồng ý từ server.");
      return null;
    }

    useConsentStore.getState().setConsentId(consentId);

    for (const category of DATA_CATEGORIES) {
      try {
        await consentClient.POST("/consent-data-category", {
          body: {
            tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real tenant ID
            consent_id: consentId,
            data_category_id: category,
          },
        });
      } catch (categoryError) {
        console.error(
          `Failed to link data category ${category}:`,
          categoryError,
        );
      }
    }

    try {
      await consentClient.POST("/consent-log", {
        body: {
          tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real tenant ID
          consent_id: consentId,
          action,
          action_by,
          source,
        },
      });
    } catch (logError) {
      console.error("Failed to create consent log:", logError);
    }

    return consentId;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Đã xảy ra lỗi khi gửi yêu cầu đồng ý.";
    useConsentStore.getState().setError(errorMessage);
    return null;
  }
}

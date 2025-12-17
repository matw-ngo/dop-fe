import {
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailedCreditCardInfo } from "@/types/credit-card";

interface RequirementsTabProps {
  card: DetailedCreditCardInfo;
}

export const RequirementsTab: React.FC<RequirementsTabProps> = ({ card }) => {
  const t = useTranslations("features.credit-cards.detail");

  const getEmploymentTypeIcon = (type: string) => {
    switch (type) {
      case "full_time":
        return <Briefcase className="w-4 h-4" />;
      case "part_time":
        return <Calendar className="w-4 h-4" />;
      case "business_owner":
        return <Building className="w-4 h-4" />;
      case "freelancer":
        return <User className="w-4 h-4" />;
      case "retired":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getIncomeProofIcon = (type: string) => {
    switch (type) {
      case "payroll":
        return <FileText className="w-4 h-4" />;
      case "bank_statement":
        return <CreditCard className="w-4 h-4" />;
      case "tax_return":
        return <FileText className="w-4 h-4" />;
      case "business_license":
        return <Building className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Age Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("requirements.age.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {card.ageRequiredMin}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("requirements.age.minAge")}
              </div>
            </div>
            {card.ageRequiredMax && (
              <>
                <div className="text-muted-foreground">-</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {card.ageRequiredMax}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("requirements.age.maxAge")}
                  </div>
                </div>
              </>
            )}
            <div className="text-sm text-muted-foreground ml-4">
              {t("requirements.age.description")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t("requirements.income.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {card.incomeRequiredMin.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("requirements.income.minIncome")}
                </div>
              </div>
              {card.incomeRequiredMax && (
                <>
                  <div className="text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {card.incomeRequiredMax.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("requirements.income.maxIncome")}
                    </div>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("requirements.income.description")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Employment Type */}
      {card.employmentType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {t("requirements.employment.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {card.employmentType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getEmploymentTypeIcon(card.employmentType)}
                  {t(`requirements.employment.types.${card.employmentType}`)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Proof Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("requirements.documents.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {card.incomeProof.map((type, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {getIncomeProofIcon(type)}
                <span>{t(`requirements.documents.types.${type}`)}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {t("requirements.documents.note")}
          </p>
        </CardContent>
      </Card>

      {/* Required Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("requirements.additionalDocuments.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {card.documentsRequired.map((doc, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{doc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("requirements.location.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={card.nationalAvailability ? "default" : "secondary"}
              >
                {card.nationalAvailability
                  ? t("requirements.location.national")
                  : t("requirements.location.selected")}
              </Badge>
            </div>
            {!card.nationalAvailability && card.provinces.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("requirements.location.availableProvinces")}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {card.provinces.map((province, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {province}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsTab;

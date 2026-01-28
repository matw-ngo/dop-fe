import {
  Ambulance,
  Banknote,
  Clock,
  FileCheck,
  FileSearch,
  FileSignature,
  FileText,
  MessageCircle,
  Phone,
  Route,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { Progress } from "@/components/ui/progress";
import { getApprovalRateLevel } from "../../utils";
import { ClaimMethodCard } from "../ClaimMethodCard";

interface ClaimsTabProps {
  product: any;
  t: any;
}

export const ClaimsTab: React.FC<ClaimsTabProps> = ({ product, t }) => {
  const claimSteps = [
    {
      step: 1,
      title: t("tabs.claims.process.steps.report.title"),
      icon: <Phone className="w-5 h-5" />,
      desc: t("tabs.claims.process.steps.report.description"),
    },
    {
      step: 2,
      title: t("tabs.claims.process.steps.documents.title"),
      icon: <FileText className="w-5 h-5" />,
      desc: t("tabs.claims.process.steps.documents.description"),
    },
    {
      step: 3,
      title: t("tabs.claims.process.steps.assessment.title"),
      icon: <FileSearch className="w-5 h-5" />,
      desc: t("tabs.claims.process.steps.assessment.description"),
    },
    {
      step: 4,
      title: t("tabs.claims.process.steps.approval.title"),
      icon: <FileCheck className="w-5 h-5" />,
      desc: t("tabs.claims.process.steps.approval.description"),
    },
    {
      step: 5,
      title: t("tabs.claims.process.steps.payment.title"),
      icon: <Banknote className="w-5 h-5" />,
      desc: t("tabs.claims.process.steps.payment.description"),
    },
  ];

  const approvalRateLevel = getApprovalRateLevel(product.claims.approvalRate);

  return (
    <div className="mt-6 space-y-6">
      {/* Step-by-Step Process */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          {t("tabs.claims.process.title")}
        </h3>

        <div className="grid md:grid-cols-5 gap-4">
          {claimSteps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto mb-2 border shadow-sm">
                <span className="text-primary">{item.icon}</span>
              </div>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {item.step}
              </div>
              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-card rounded-lg border">
          <p className="text-sm text-foreground">
            {product.claims.processDescription}
          </p>
        </div>
      </div>

      {/* Required Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-primary" />
          {t("tabs.claims.documents.title")}
        </h3>
        <div className="grid gap-3">
          {product.claims.requiredDocuments.map(
            (doc: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{doc}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Claim Methods */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {t("tabs.claims.methods.title")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.claims.claimMethods.map((method: string, index: number) => (
            <ClaimMethodCard key={index} method={method} />
          ))}
        </div>
      </div>

      {/* Processing Time & Approval Rate */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-muted/30 p-6 rounded-xl">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t("tabs.claims.metrics.processingTime.title")}
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t("tabs.claims.metrics.processingTime.average")}</span>
                <span className="font-medium">
                  {product.claims.averageClaimTime} {t("units.days")}
                </span>
              </div>
              <Progress
                value={(product.claims.averageClaimTime / 30) * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {t("tabs.claims.metrics.processingTime.commitment")}
                </span>
                <span className="font-medium">
                  {product.claims.processingTime}{" "}
                  {t("tabs.claims.metrics.processingTime.workingDays")}
                </span>
              </div>
              <Progress
                value={(product.claims.processingTime / 30) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-6 rounded-xl">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t("tabs.claims.metrics.approvalRate.title")}
          </h4>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">
              {product.claims.approvalRate}%
            </div>
            <div className="flex-1">
              <Progress value={product.claims.approvalRate} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {t(`tabs.claims.metrics.approvalRate.${approvalRateLevel}`)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-destructive" />
          {t("tabs.claims.emergency.title")}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">
                  {t("tabs.claims.emergency.hotline")}
                </p>
                <p className="text-lg font-bold text-destructive">
                  {product.claims.contactInfo.hotline}
                </p>
                <p className="text-xs text-muted-foreground">24/7</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Ambulance className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">
                  {t("tabs.claims.emergency.emergency115")}
                </p>
                <p className="text-lg font-bold text-destructive">115</p>
                <p className="text-xs text-muted-foreground">
                  {t("tabs.claims.emergency.free")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">
                  {t("tabs.claims.emergency.zaloSupport")}
                </p>
                <p className="text-lg font-bold text-primary">
                  {product.claims.contactInfo.hotline}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("tabs.claims.emergency.hours")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

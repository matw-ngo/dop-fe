import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Briefcase,
  MapPin,
  Car,
  ShieldCheck,
  HeartPulse,
  Activity,
  Heart,
  UserX,
  Stethoscope,
  Building,
  AlertTriangle,
  Wallet,
  DollarSign,
  Home,
  Shield,
  Lock,
  AlertCircle,
  Cloud,
  Info,
  Calculator,
} from "lucide-react";
import { CoverageItem } from "../CoverageItem";
import { MAX_COVERAGE_LIMIT } from "../../constants";
import { formatCurrency } from "@/lib/utils";
import { getVehicleTypeText } from "../../utils";

interface CoverageTabProps {
  product: any;
  t: (key: string) => string;
}

export const CoverageTab: React.FC<CoverageTabProps> = ({ product, t }) => {
  return (
    <div className="mt-6 space-y-6">
      {/* Insured Objects Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {t("tabs.coverage.insuredObjects.title")}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">{t("tabs.coverage.insuredObjects.ageRangeTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("tabs.coverage.insuredObjects.ageRangeText", {
                    min: product.eligibility.ageRange.min,
                    max: product.eligibility.ageRange.max || "",
                  })}
                </p>
              </div>
            </div>
            {product.eligibility.occupation && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("tabs.coverage.insuredObjects.occupationTitle")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.eligibility.occupation.map((occ: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                      >
                        {occ}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">{t("tabs.coverage.insuredObjects.geographicScope")}</p>
                <p className="text-sm text-muted-foreground">
                  {product.availability.nationalAvailability
                    ? t("tabs.coverage.insuredObjects.nationwide")
                    : t("tabs.coverage.insuredObjects.provincesCount", {
                        count: product.availability.provinces.length,
                      })}
                </p>
              </div>
            </div>
            {product.category === "vehicle" && product.vehicleCoverage && (
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("tabs.coverage.insuredObjects.vehicleType")}</p>
                  <p className="text-sm text-muted-foreground">
                    {getVehicleTypeText(product.vehicleCoverage.vehicleType)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coverage Scope Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          {t("tabs.coverage.coverageScope.title")}
        </h3>

        {/* Personal Coverage */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-500" />
            {t("tabs.coverage.coverageScope.personalCoverage")}
          </h4>
          <div className="grid gap-3">
            {!product.coverage.personalAccident.disabled && (
              <CoverageItem
                title={t("coverageTypes.personalAccident")}
                limit={product.coverage.personalAccident.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Activity className="w-4 h-4" />}
                color="blue"
                t={t}
              />
            )}
            {!product.coverage.death.disabled && (
              <CoverageItem
                title={t("coverageTypes.death")}
                limit={product.coverage.death.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Heart className="w-4 h-4" />}
                color="red"
                t={t}
              />
            )}
            {!product.coverage.disability.disabled && (
              <CoverageItem
                title={t("coverageTypes.disability")}
                limit={product.coverage.disability.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<UserX className="w-4 h-4" />}
                color="orange"
                t={t}
              />
            )}
            {!product.coverage.medicalExpenses.disabled && (
              <CoverageItem
                title={t("coverageTypes.medicalExpenses")}
                limit={product.coverage.medicalExpenses.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Stethoscope className="w-4 h-4" />}
                color="green"
                t={t}
              />
            )}
            {!product.coverage.hospitalization.disabled && (
              <CoverageItem
                title={t("coverageTypes.hospitalization")}
                limit={product.coverage.hospitalization.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Building className="w-4 h-4" />}
                color="purple"
                t={t}
              />
            )}
            {!product.coverage.surgery.disabled && (
              <CoverageItem
                title={t("coverageTypes.surgery")}
                limit={product.coverage.surgery.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Activity className="w-4 h-4" />}
                color="pink"
                t={t}
              />
            )}
            {!product.coverage.criticalIllness.disabled && (
              <CoverageItem
                title={t("coverageTypes.criticalIllness")}
                limit={product.coverage.criticalIllness.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="yellow"
                t={t}
              />
            )}
            {!product.coverage.lossOfIncome.disabled && (
              <CoverageItem
                title={t("coverageTypes.lossOfIncome")}
                limit={product.coverage.lossOfIncome.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Wallet className="w-4 h-4" />}
                color="indigo"
                t={t}
              />
            )}
          </div>
        </div>

        {/* Property & Liability Coverage */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            {t("tabs.coverage.coverageScope.propertyLiability")}
          </h4>
          <div className="grid gap-3">
            {!product.coverage.propertyDamage.disabled && (
              <CoverageItem
                title={t("coverageTypes.propertyDamage")}
                limit={product.coverage.propertyDamage.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Home className="w-4 h-4" />}
                color="cyan"
                t={t}
              />
            )}
            {!product.coverage.thirdPartyLiability.disabled && (
              <CoverageItem
                title={t("coverageTypes.thirdPartyLiability")}
                limit={product.coverage.thirdPartyLiability.limit}
                maxLimit={MAX_COVERAGE_LIMIT}
                icon={<Shield className="w-4 h-4" />}
                color="teal"
                t={t}
              />
            )}

            {/* Vehicle-specific coverage */}
            {product.vehicleCoverage && (
              <>
                {!product.vehicleCoverage.ownDamage.disabled && (
                  <CoverageItem
                    title={t("coverageTypes.ownDamage")}
                    limit={product.vehicleCoverage.ownDamage.limit}
                    maxLimit={MAX_COVERAGE_LIMIT}
                    icon={<Car className="w-4 h-4" />}
                    color="blue"
                    t={t}
                  />
                )}
                {!product.vehicleCoverage.theft.disabled && (
                  <CoverageItem
                    title={t("coverageTypes.theft")}
                    limit={product.vehicleCoverage.theft.limit}
                    maxLimit={MAX_COVERAGE_LIMIT}
                    icon={<Lock className="w-4 h-4" />}
                    color="red"
                    t={t}
                  />
                )}
                {!product.vehicleCoverage.fire.disabled && (
                  <CoverageItem
                    title={t("coverageTypes.fire")}
                    limit={product.vehicleCoverage.fire.limit}
                    maxLimit={MAX_COVERAGE_LIMIT}
                    icon={<AlertCircle className="w-4 h-4" />}
                    color="orange"
                    t={t}
                  />
                )}
                {!product.vehicleCoverage.naturalDisasters.disabled && (
                  <CoverageItem
                    title={t("coverageTypes.naturalDisasters")}
                    limit={product.vehicleCoverage.naturalDisasters.limit}
                    maxLimit={MAX_COVERAGE_LIMIT}
                    icon={<Cloud className="w-4 h-4" />}
                    color="gray"
                    t={t}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Special Coverage Notes */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          {t("tabs.coverage.specialNotes.title")}
        </h4>
        <ul className="space-y-1 text-sm text-amber-700">
          <li>{t("tabs.coverage.specialNotes.note1")}</li>
          <li>{t("tabs.coverage.specialNotes.note2")}</li>
          {product.category === "vehicle" && (
            <li>
              {t("tabs.coverage.specialNotes.vehicleValue", {
                min: formatCurrency(
                  product.vehicleCoverage?.vehicleValueRange.min || 0,
                ),
                max: formatCurrency(
                  product.vehicleCoverage?.vehicleValueRange.max || 0,
                ),
              })}
            </li>
          )}
        </ul>
      </div>

      {/* Deductibles */}
      {product.deductibles.standardDeductible > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-yellow-600" />
            {t("tabs.coverage.deductibles.title")}
          </h4>
          <p className="text-sm text-yellow-700">
            {t("tabs.coverage.deductibles.standardAmount", {
              amount: formatCurrency(product.deductibles.standardDeductible),
            })}
            {product.deductibles.voluntaryDeductibleOptions.length > 0 &&
              t("tabs.coverage.deductibles.voluntaryOptions", {
                options: product.deductibles.voluntaryDeductibleOptions
                  .map((option: number) => formatCurrency(option))
                  .join(", "),
              })}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {t("tabs.coverage.deductibles.explanation")}
          </p>
        </div>
      )}
    </div>
  );
};
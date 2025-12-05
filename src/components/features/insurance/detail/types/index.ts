export type ColorVariant =
  | "blue"
  | "red"
  | "orange"
  | "green"
  | "purple"
  | "pink"
  | "yellow"
  | "indigo"
  | "cyan"
  | "teal"
  | "gray";

export interface CoverageItemProps {
  title: string;
  limit: number;
  maxLimit: number;
  icon: React.ReactNode;
  color: ColorVariant;
  t: (key: string) => string;
}

export interface ServiceCardProps {
  service: string;
  available: boolean;
}

export interface PaymentMethodCardProps {
  method: string;
}

export interface ClaimStep {
  step: number;
  title: string;
  icon: React.ReactNode;
  desc: string;
}

export interface ComparisonButtonProps {
  isInComparison: boolean;
  canAddMore: boolean;
  onCompareAction: () => void;
  t: (key: string) => string;
}

export interface ProductOverviewCardProps {
  product: any;
  t: (key: string) => string;
}

export interface CoverageScopeSectionProps {
  product: any;
  maxLimit: number;
  t: (key: string) => string;
}

export interface ClaimMethod {
  method: string;
  icon: string;
  name: string;
  description: string;
}

export interface ServiceInfo {
  [key: string]: {
    name: string;
    description: string;
  };
}

export interface PaymentMethodInfo {
  [key: string]: {
    name: string;
    icon: string;
    description: string;
  };
}

export interface InstallmentPlanCardProps {
  plan: any;
  totalPremium: number;
  t: (key: string) => string;
}

export interface NoClaimBonusDisplayProps {
  noClaimBonus: any;
  t: (key: string) => string;
}

export interface PreExistingConditionItem {
  condition: string;
  increase?: number;
}

export interface WaitingPeriodItem {
  [condition: string]: number;
}

export interface EmergencyContactProps {
  hotline: string;
  email: string;
  website?: string;
  t: (key: string) => string;
}
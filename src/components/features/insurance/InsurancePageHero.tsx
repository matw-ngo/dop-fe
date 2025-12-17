import { Heart, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useThemeUtils } from "@/components/renderer/theme";

interface InsurancePageHeroProps {
  titleKey: string;
  descriptionKey: string;
}

export default function InsurancePageHero({
  titleKey,
  descriptionKey,
}: InsurancePageHeroProps) {
  const { theme } = useThemeUtils();
  const t = useTranslations("features.insurance.listing");

  return (
    <section className="relative bg-muted border-b overflow-hidden">
      {/* Subtle background pattern for healthcare theme */}
      {theme.name === "medical" && (
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      <div className="relative container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-background rounded-full shadow-sm border">
              <div className="relative">
                <Shield className="w-12 h-12 text-primary" />
                <Heart className="w-5 h-5 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t(titleKey)}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(descriptionKey)}
          </p>
        </div>
      </div>
    </section>
  );
}

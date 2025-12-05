import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

interface InsurancePageHeroProps {
  titleKey: string;
  descriptionKey: string;
}

export default function InsurancePageHero({
  titleKey,
  descriptionKey,
}: InsurancePageHeroProps) {
  const t = useTranslations("pages.insurance");

  return (
    <section className="bg-muted border-b">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-background rounded-full">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
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

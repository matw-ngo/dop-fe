"use client"; // Cần client component để dùng hook

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExampleForm } from "@/components/features/example-form";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground mb-8">{t("welcome")}</p>
        <Button size="lg">{t("ctaButton")}</Button>
      </div>
      <div className="mt-12">
        <ExampleForm />
      </div>
    </main>
  );
}

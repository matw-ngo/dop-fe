import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn for utility classes

// @ts-ignore
import "./globals.css";

export async function generateMetadata() {
  const t = await getTranslations("pages.notFoundPage");

  return {
    title: t("title"),
  };
}

export default async function NotFoundPage() {
  const t = await getTranslations("pages.notFoundPage");

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="flex flex-col-reverse items-center justify-center gap-8 md:flex-row md:gap-16 max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-2xl">
        {/* Left Column: Text Content */}
        <div className="text-center md:text-left md:w-1/2">
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              {t("backToHome")}
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {t("contactSupport")}
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Icon */}
        <div className="md:w-1/2 flex items-center justify-center">
          <FileQuestion className="h-48 w-48 text-gray-300 md:h-64 md:w-64" />
        </div>
      </div>
    </main>
  );
}

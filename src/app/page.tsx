"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// This page acts as a client-side redirect for the root path.
// It attempts to redirect to a locale based on the user's browser language.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Get the user's preferred language from the browser.
    const browserLang = navigator.language.split("-")[0];

    // Define supported locales and a default.
    const supportedLocales = ["en", "vi"];
    const defaultLocale = "vi";

    // Determine the best locale to redirect to.
    const targetLocale = supportedLocales.includes(browserLang)
      ? browserLang
      : defaultLocale;

    // Perform the redirect.
    router.replace(`/${targetLocale}`);
  }, [router]);

  // Display a loading spinner while the redirect is happening.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}

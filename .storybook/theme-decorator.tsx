import React, { useEffect, useState } from "react";
import type { Decorator } from "@storybook/react";
import { ThemeProvider } from "../src/lib/theme/context";
import { themes } from "../src/lib/theme/themes";
import { applyTheme } from "../src/lib/theme/utils";

// Component to handle theme application
function ThemeWrapper({
  children,
  themeId,
  mode,
  userGroup,
}: {
  children: React.ReactNode;
  themeId: string;
  mode: string;
  userGroup: string;
}) {
  const [mounted, setMounted] = useState(false);

  // Apply theme when component mounts or props change
  useEffect(() => {
    const theme = themes[themeId];
    if (theme) {
      applyTheme(theme, mode as any);
    }
    setMounted(true);
  }, [themeId, mode]);

  // Apply dark class for dark mode
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (mode === "dark") {
      html.classList.add("dark");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
    }

    return () => {
      html.classList.remove("dark");
      body.classList.remove("dark");
    };
  }, [mode]);

  // Don't render until theme is applied
  if (!mounted) {
    return <div>Loading theme...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 min-w-3xl flex items-center justify-center">
      {children}
    </div>
  );
}

export const withTheme: Decorator = (Story, context) => {
  const {
    theme: themeId = "default",
    userGroup = "system",
    mode = "light",
  } = context.globals;

  return (
    <ThemeProvider
      defaultUserGroup={userGroup}
      storageKey="storybook-theme-config"
    >
      <ThemeWrapper themeId={themeId} mode={mode} userGroup={userGroup}>
        <Story />
      </ThemeWrapper>
    </ThemeProvider>
  );
};

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

  console.log("[DEBUG] ThemeWrapper rendered with props:", { themeId, mode });

  // Apply theme when component mounts or props change
  useEffect(() => {
    console.log(
      "[DEBUG] useEffect for theme application triggered for themeId:",
      themeId,
    );
    const theme = themes[themeId];
    if (theme) {
      console.log("[DEBUG] Applying theme object:", theme.name);
      applyTheme(theme, mode as any);
    } else {
      console.error(
        `[DEBUG] Theme with id '${themeId}' not found in themes object.`,
      );
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

  return <>{children}</>;
}

export const withTheme: Decorator = (Story, context) => {
  console.log(
    "[DEBUG] withTheme decorator running. Full context.globals:",
    context.globals,
  );

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

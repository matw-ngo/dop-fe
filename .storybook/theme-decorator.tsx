import type { Decorator } from "@storybook/react";
import type React from "react";
import { useEffect, useState } from "react";
import { themes } from "../src/components/renderer/theme/themes";
import { applyTheme } from "../src/components/renderer/theme/utils";

// Component to handle theme application
function _ThemeWrapper({
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

  // Apply data attributes for dark mode
  useEffect(() => {
    const html = document.documentElement;

    // Set data-color-scheme attribute for dark mode
    html.setAttribute("data-color-scheme", mode);

    return () => {
      // Cleanup if needed
      html.removeAttribute("data-color-scheme");
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

  // return (
  //   <ThemeProvider
  //     defaultUserGroup={userGroup}
  //     storageKey="storybook-theme-config"
  //   >
  //     <ThemeWrapper themeId={themeId} mode={mode} userGroup={userGroup}>
  //       <Story />
  //     </ThemeWrapper>
  //   </ThemeProvider>
  // );
  return <Story />;
};

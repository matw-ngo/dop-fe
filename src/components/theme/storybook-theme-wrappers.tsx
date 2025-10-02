import React, { useEffect } from "react";
import { ThemeProvider } from "@/lib/theme/context";
import { themes } from "@/lib/theme/themes";
import { applyTheme } from "@/lib/theme/utils";

interface ThemeWrapperProps {
  children: React.ReactNode;
  themeId: keyof typeof themes;
  userGroup: string;
  mode?: "light" | "dark";
}

function ThemeWrapperBase({
  children,
  themeId,
  userGroup,
  mode = "light",
}: ThemeWrapperProps) {
  useEffect(() => {
    const theme = themes[themeId];
    if (theme) {
      // Apply theme immediately
      applyTheme(theme, mode);

      // Also apply dark class if needed
      const html = document.documentElement;
      if (mode === "dark") {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }, [themeId, mode]);

  return (
    <ThemeProvider
      defaultUserGroup={userGroup}
      storageKey={`storybook-${themeId}-${mode}`}
    >
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: themes[themeId].colors[mode].primary,
                }}
              />
              <span className="text-sm font-medium">
                {themes[themeId].name} ({mode})
              </span>
            </div>
            <div className="px-3 py-1 bg-secondary rounded-full">
              <span className="text-xs text-muted-foreground">
                {userGroup} group
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}

// Individual theme wrappers
export function DefaultThemeWrapper({
  children,
  mode = "light",
}: {
  children: React.ReactNode;
  mode?: "light" | "dark";
}) {
  return (
    <ThemeWrapperBase themeId="default" userGroup="system" mode={mode}>
      {children}
    </ThemeWrapperBase>
  );
}

export function CorporateThemeWrapper({
  children,
  mode = "light",
}: {
  children: React.ReactNode;
  mode?: "light" | "dark";
}) {
  return (
    <ThemeWrapperBase themeId="corporate" userGroup="business" mode={mode}>
      {children}
    </ThemeWrapperBase>
  );
}

export function CreativeThemeWrapper({
  children,
  mode = "light",
}: {
  children: React.ReactNode;
  mode?: "light" | "dark";
}) {
  return (
    <ThemeWrapperBase themeId="creative" userGroup="creative" mode={mode}>
      {children}
    </ThemeWrapperBase>
  );
}

export function MedicalThemeWrapper({
  children,
  mode = "light",
}: {
  children: React.ReactNode;
  mode?: "light" | "dark";
}) {
  return (
    <ThemeWrapperBase themeId="medical" userGroup="healthcare" mode={mode}>
      {children}
    </ThemeWrapperBase>
  );
}

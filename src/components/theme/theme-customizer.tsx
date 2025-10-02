"use client";

import { Eye, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme/context";
import { themes } from "@/lib/theme/themes";
import type { ThemeColors } from "@/lib/theme/types";

interface ThemeCustomizerProps {
  onClose?: () => void;
}

// Color categories for better organization
const colorCategories = {
  base: {
    name: "Base Colors",
    colors: ["background", "foreground", "border", "input", "ring"],
  },
  semantic: {
    name: "Semantic Colors",
    colors: [
      "primary",
      "primaryForeground",
      "secondary",
      "secondaryForeground",
      "destructive",
    ],
  },
  utility: {
    name: "Utility Colors",
    colors: ["muted", "mutedForeground", "accent", "accentForeground"],
  },
  components: {
    name: "Component Colors",
    colors: ["card", "cardForeground", "popover", "popoverForeground"],
  },
  charts: {
    name: "Chart Colors",
    colors: ["chart1", "chart2", "chart3", "chart4", "chart5"],
  },
  sidebar: {
    name: "Sidebar Colors",
    colors: [
      "sidebar",
      "sidebarForeground",
      "sidebarPrimary",
      "sidebarPrimaryForeground",
      "sidebarAccent",
      "sidebarAccentForeground",
      "sidebarBorder",
      "sidebarRing",
    ],
  },
};

export function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
  const {
    currentTheme,
    customizations,
    setCustomizations,
    resetCustomizations,
    themeConfig,
  } = useTheme();

  const [localCustomizations, setLocalCustomizations] = useState<
    Partial<ThemeColors>
  >(customizations || {});
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
  const [previewMode, setPreviewMode] = useState(false);

  const baseTheme = themes[currentTheme];
  const baseColors = baseTheme?.colors[activeMode] || {};

  // Apply local customizations for preview
  useEffect(() => {
    if (previewMode && Object.keys(localCustomizations).length > 0) {
      setCustomizations(localCustomizations);
    }
  }, [localCustomizations, previewMode, setCustomizations]);

  const handleColorChange = (colorKey: string, value: string) => {
    setLocalCustomizations((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  const handleApply = () => {
    setCustomizations(localCustomizations);
    onClose?.();
  };

  const handleReset = () => {
    setLocalCustomizations({});
    resetCustomizations();
  };

  const handleCancel = () => {
    // Restore original customizations
    setCustomizations(customizations || {});
    onClose?.();
  };

  const togglePreview = () => {
    if (previewMode) {
      // Restore original customizations
      setCustomizations(customizations || {});
    } else {
      // Apply local customizations for preview
      setCustomizations(localCustomizations);
    }
    setPreviewMode(!previewMode);
  };

  // Helper to get effective color (custom or base)
  const getEffectiveColor = (colorKey: string): string => {
    return (
      localCustomizations[colorKey as keyof ThemeColors] ||
      baseColors[colorKey as keyof ThemeColors] ||
      ""
    );
  };

  // Helper to check if color is customized
  const isCustomized = (colorKey: string): boolean => {
    return colorKey in localCustomizations;
  };

  // Convert OKLCH to hex for color input (simplified)
  const _oklchToHex = (_oklch: string): string => {
    // This is a simplified conversion - in production you'd want a proper OKLCH to hex converter
    // For now, we'll extract RGB-like values and approximate
    return "#3b82f6"; // Fallback blue
  };

  // Convert hex to OKLCH (simplified)
  const _hexToOklch = (_hex: string): string => {
    // This is a simplified conversion - in production you'd want a proper hex to OKLCH converter
    // For now, we'll return a reasonable OKLCH value
    return "oklch(0.5 0.1 220)";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Theme Customization</h3>
          <p className="text-sm text-muted-foreground">
            Customize colors for the {baseTheme?.name} theme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={togglePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Previewing" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Mode Selector */}
      <Tabs
        value={activeMode}
        onValueChange={(value) => setActiveMode(value as "light" | "dark")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="light">Light Mode</TabsTrigger>
          <TabsTrigger value="dark">Dark Mode</TabsTrigger>
        </TabsList>

        <TabsContent value={activeMode} className="space-y-4">
          {/* Color Categories */}
          {Object.entries(colorCategories).map(([categoryKey, category]) => (
            <Card key={categoryKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{category.name}</CardTitle>
                <CardDescription className="text-xs">
                  Customize {category.name.toLowerCase()} for {activeMode} mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {category.colors.map((colorKey) => {
                    const effectiveColor = getEffectiveColor(colorKey);
                    const customized = isCustomized(colorKey);

                    return (
                      <div key={colorKey} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-8 h-8 rounded border-2 border-border"
                            style={{ backgroundColor: effectiveColor }}
                          />
                          <div className="flex-1">
                            <Label className="text-xs font-medium">
                              {colorKey}
                              {customized && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  Custom
                                </Badge>
                              )}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {effectiveColor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={effectiveColor}
                            onChange={(e) =>
                              handleColorChange(colorKey, e.target.value)
                            }
                            className="w-32 text-xs font-mono"
                            placeholder="oklch(...)"
                          />
                          {customized && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCustomizations = {
                                  ...localCustomizations,
                                };
                                delete newCustomizations[
                                  colorKey as keyof ThemeColors
                                ];
                                setLocalCustomizations(newCustomizations);
                              }}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <span className="text-xs text-muted-foreground">
            {Object.keys(localCustomizations).length} customizations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Changes</Button>
        </div>
      </div>
    </div>
  );
}

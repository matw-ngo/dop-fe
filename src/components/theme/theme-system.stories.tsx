import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSelector } from "./theme-selector";
import { ThemeCustomizer } from "./theme-customizer";
import { useTheme } from "@/lib/theme/context";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, AlertTriangle, CheckCircle, Palette } from "lucide-react";
import {
  DefaultThemeWrapper,
  CorporateThemeWrapper,
  CreativeThemeWrapper,
  MedicalThemeWrapper,
} from "./storybook-theme-wrappers";

// Demo component to showcase all theme features
function ThemeShowcase() {
  const { currentTheme, userGroup, themeConfig } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme System Demo
          </CardTitle>
          <CardDescription>
            Showcasing all components with current theme: {themeConfig?.name} (
            {userGroup} group)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge>Theme: {currentTheme}</Badge>
            <Badge variant="outline">Group: {userGroup}</Badge>
            <Badge variant="secondary">OKLCH Colors</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Buttons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>
            All button variants with current theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input components with theme colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Input Field</Label>
              <Input id="demo-input" placeholder="Enter text here..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-input-2">Another Input</Label>
              <Input id="demo-input-2" value="Pre-filled value" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>
            Alert components with semantic colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert using theme colors.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This is a destructive alert showing error states.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Progress & Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Progress & Stats</CardTitle>
          <CardDescription>
            Progress bars and statistical displays
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Primary Colors</span>
              <span>85%</span>
            </div>
            <Progress value={85} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Theme Completion</span>
              <span>92%</span>
            </div>
            <Progress value={92} />
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Current theme color variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
            {themeConfig &&
              Object.entries(themeConfig.colors.light)
                .slice(0, 24)
                .map(([key, color]) => (
                  <div key={key} className="space-y-1">
                    <div
                      className="w-full h-12 rounded border-2 border-border"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                    <p className="text-xs text-muted-foreground truncate text-center">
                      {key}
                    </p>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const meta: Meta<typeof ThemeShowcase> = {
  title: "Theme System/Showcase",
  component: ThemeShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete theme system showcase demonstrating all UI components with different themes and user groups.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeShowcase>;

export const AllComponents: Story = {
  name: "All Components",
  render: () => <ThemeShowcase />,
};

export const DefaultTheme: Story = {
  name: "Default Theme (System Users)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <DefaultThemeWrapper>
      <ThemeShowcase />
    </DefaultThemeWrapper>
  ),
};

export const CorporateTheme: Story = {
  name: "Corporate Theme (Business Users)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <CorporateThemeWrapper>
      <ThemeShowcase />
    </CorporateThemeWrapper>
  ),
};

export const CreativeTheme: Story = {
  name: "Creative Theme (Creative Users)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <CreativeThemeWrapper>
      <ThemeShowcase />
    </CreativeThemeWrapper>
  ),
};

export const MedicalTheme: Story = {
  name: "Medical Theme (Healthcare Users)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <MedicalThemeWrapper>
      <ThemeShowcase />
    </MedicalThemeWrapper>
  ),
};

// Dark mode variants
export const DefaultThemeDark: Story = {
  name: "Default Theme (Dark)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <DefaultThemeWrapper mode="dark">
      <ThemeShowcase />
    </DefaultThemeWrapper>
  ),
};

export const CorporateThemeDark: Story = {
  name: "Corporate Theme (Dark)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <CorporateThemeWrapper mode="dark">
      <ThemeShowcase />
    </CorporateThemeWrapper>
  ),
};

export const CreativeThemeDark: Story = {
  name: "Creative Theme (Dark)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <CreativeThemeWrapper mode="dark">
      <ThemeShowcase />
    </CreativeThemeWrapper>
  ),
};

export const MedicalThemeDark: Story = {
  name: "Medical Theme (Dark)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <MedicalThemeWrapper mode="dark">
      <ThemeShowcase />
    </MedicalThemeWrapper>
  ),
};

// Comparison view
export const AllThemesComparison: Story = {
  name: "All Themes Comparison",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      <div className="border-r border-gray-300">
        <DefaultThemeWrapper>
          <div className="scale-75 origin-top-left w-[133%] h-[133%]">
            <ThemeShowcase />
          </div>
        </DefaultThemeWrapper>
      </div>

      <div className="border-gray-300">
        <CorporateThemeWrapper>
          <div className="scale-75 origin-top-left w-[133%] h-[133%]">
            <ThemeShowcase />
          </div>
        </CorporateThemeWrapper>
      </div>

      <div className="border-r border-t border-gray-300">
        <CreativeThemeWrapper>
          <div className="scale-75 origin-top-left w-[133%] h-[133%]">
            <ThemeShowcase />
          </div>
        </CreativeThemeWrapper>
      </div>

      <div className="border-t border-gray-300">
        <MedicalThemeWrapper>
          <div className="scale-75 origin-top-left w-[133%] h-[133%]">
            <ThemeShowcase />
          </div>
        </MedicalThemeWrapper>
      </div>
    </div>
  ),
};

// Theme Selector Stories
const ThemeSelectorMeta: Meta<typeof ThemeSelector> = {
  title: "Theme System/ThemeSelector",
  component: ThemeSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export const SelectorDefault: StoryObj<typeof ThemeSelector> = {
  name: "Theme Selector",
  render: () => <ThemeSelector />,
};

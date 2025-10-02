# Theme System Documentation

## Tổng quan

Hệ thống theme được thiết kế để hỗ trợ nhiều nhóm người dùng khác nhau với các yêu cầu customization khác nhau. Hệ thống sử dụng CSS variables và OKLCH color space để đảm bảo tính nhất quán và khả năng mở rộng.

## Kiến trúc

### 1. Core Components

- **ThemeProvider**: Context provider quản lý state theme
- **ThemeSelector**: Component để chọn theme và user group
- **ThemeCustomizer**: Component để customize màu sắc
- **Theme Utilities**: Các helper functions để xử lý theme

### 2. Theme Configuration

```typescript
interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  group: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts?: {
    sans?: string;
    mono?: string;
  };
  radius?: string;
  customCSS?: string;
}
```

### 3. User Groups

Hệ thống hỗ trợ các nhóm người dùng:

- **System Users**: Người dùng thông thường, theme mặc định
- **Business Users**: Doanh nghiệp, có thể custom màu và branding
- **Creative Users**: Thiết kế sáng tạo, tự do custom đầy đủ
- **Healthcare Users**: Y tế, theme sạch sẽ, ít custom

## Cách sử dụng

### 1. Setup Theme Provider

```tsx
import { ThemeProvider } from '@/lib/theme/context';

function App() {
  return (
    <ThemeProvider defaultUserGroup="system">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Sử dụng Theme Hook

```tsx
import { useTheme } from '@/lib/theme/context';

function MyComponent() {
  const { 
    currentTheme, 
    setTheme, 
    userGroup, 
    setUserGroup,
    customizations,
    setCustomizations 
  } = useTheme();
  
  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <p>User group: {userGroup}</p>
    </div>
  );
}
```

### 3. Theme Selector Component

```tsx
import { ThemeSelector } from '@/components/theme/theme-selector';

function Header() {
  return (
    <header>
      <ThemeSelector />
    </header>
  );
}
```

## Themes có sẵn

### 1. Default Theme
- **Group**: System
- **Mô tả**: Theme mặc định của hệ thống
- **Màu chủ đạo**: Blue tones
- **Customization**: Không cho phép

### 2. Corporate Theme
- **Group**: Business
- **Mô tả**: Theme doanh nghiệp chuyên nghiệp
- **Màu chủ đạo**: Professional blues/grays
- **Customization**: Cho phép custom màu và branding

### 3. Creative Theme
- **Group**: Creative
- **Mô tả**: Theme sáng tạo với màu sắc sinh động
- **Màu chủ đạo**: Vibrant purples/oranges
- **Customization**: Toàn quyền custom

### 4. Medical Theme
- **Group**: Healthcare
- **Mô tả**: Theme y tế sạch sẽ
- **Màu chủ đạo**: Clean blues/whites
- **Customization**: Không cho phép, focus vào usability

## Tạo Theme mới

### 1. Định nghĩa Theme Config

```typescript
import { ThemeConfig } from '@/lib/theme/types';

const myCustomTheme: ThemeConfig = {
  id: 'my-theme',
  name: 'My Custom Theme',
  description: 'A custom theme for my organization',
  group: 'business',
  colors: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.1 0.02 220)',
      primary: 'oklch(0.5 0.15 280)',
      // ... other colors
    },
    dark: {
      // Dark mode colors
    }
  },
  radius: '0.5rem',
};
```

### 2. Đăng ký Theme

```typescript
import { themes } from '@/lib/theme/themes';

// Add to themes registry
themes['my-theme'] = myCustomTheme;
```

## Color System

### OKLCH Color Space

Hệ thống sử dụng OKLCH color space để đảm bảo:
- Consistent brightness across hues
- Better color manipulation
- Perceptually uniform color transitions

### Color Categories

1. **Base Colors**: background, foreground, border, input, ring
2. **Semantic Colors**: primary, secondary, destructive, etc.
3. **Utility Colors**: muted, accent colors
4. **Component Colors**: card, popover, sidebar
5. **Chart Colors**: chart1-5 for data visualization

## Best Practices

### 1. Color Consistency
- Sử dụng semantic color names thay vì specific colors
- Đảm bảo contrast ratio đạt WCAG standards
- Test theme trên cả light và dark mode

### 2. Performance
- CSS variables được cache và reuse
- Avoid inline styles, sử dụng CSS classes
- Lazy load theme customizer

### 3. Accessibility
- Maintain sufficient contrast ratios
- Support high contrast mode
- Keyboard navigation support

## Customization Guidelines

### Per User Group

#### Business Users
- Có thể custom brand colors
- Bắt buộc branding consistency
- Không được thay đổi functional colors

#### Creative Users  
- Toàn quyền custom colors
- Có thể thay fonts và radius
- Không bắt buộc branding

#### Healthcare Users
- Không cho phép custom để đảm bảo usability
- Focus vào readability và accessibility
- Consistent experience across users

## Troubleshooting

### Common Issues

1. **Colors not updating**: Check if CSS variables are properly applied
2. **Theme not persisting**: Verify localStorage permissions
3. **Performance issues**: Reduce number of color customizations

### Debug Mode

```typescript
// Enable debug mode
localStorage.setItem('theme-debug', 'true');
```

## API Reference

### useTheme Hook

```typescript
interface ThemeContextType {
  currentTheme: string;
  mode: ThemeMode;
  userGroup: string;
  customizations?: Partial<ThemeColors>;
  setTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
  setUserGroup: (groupId: string) => void;
  setCustomizations: (colors: Partial<ThemeColors>) => void;
  resetCustomizations: () => void;
  availableThemes: string[];
  canCustomize: boolean;
  themeConfig: ThemeConfig | null;
}
```

### Theme Utilities

```typescript
// Apply theme programmatically
applyTheme(theme: ThemeConfig, mode: ThemeMode, customizations?: Partial<ThemeColors>): void

// Export theme as CSS
exportThemeAsCSS(theme: ThemeConfig): string

// Validate theme configuration
validateTheme(theme: ThemeConfig): { valid: boolean; errors: string[] }

// Create theme variant
createThemeVariant(baseTheme: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig
```

## Examples

### Demo Page
Truy cập `/theme-demo` để xem demo đầy đủ các components với theme hiện tại.

### Integration với Storybook
Theme system tự động integrate với Storybook để preview components với các theme khác nhau.
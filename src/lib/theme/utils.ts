export const getThemeValue = (theme: any, path: string) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

export const applyTheme = (theme: any, mode: string) => {
  // Apply theme to CSS variables or document
  const root = document.documentElement;

  // Apply theme colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
  }

  // Apply mode (light/dark)
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
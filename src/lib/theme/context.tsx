import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  defaultUserGroup?: string;
  storageKey?: string;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  defaultUserGroup?: string;
  storageKey?: string;
  value?: Partial<ThemeContextValue>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultUserGroup = 'system',
  storageKey = 'theme',
  value
}) => {
  const [theme, setTheme] = React.useState('default');

  const contextValue: ThemeContextValue = {
    theme,
    setTheme,
    defaultUserGroup,
    storageKey,
    ...value,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
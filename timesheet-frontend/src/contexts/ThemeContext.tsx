import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, themes } from '../theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return defaultTheme;
  });

  const theme = themes[themeMode];

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(themeMode);
    
    // Apply CSS custom properties for theme colors
    const applyThemeColors = (theme: Theme) => {
      const root = document.documentElement;
      
      // Apply primary colors
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });
      
      // Apply semantic colors
      root.style.setProperty('--color-success', theme.colors.success[500]);
      root.style.setProperty('--color-warning', theme.colors.warning[500]);
      root.style.setProperty('--color-danger', theme.colors.danger[500]);
      root.style.setProperty('--color-info', theme.colors.info[500]);
      
      // Apply background colors
      root.style.setProperty('--color-bg-primary', theme.colors.background.primary);
      root.style.setProperty('--color-bg-secondary', theme.colors.background.secondary);
      root.style.setProperty('--color-bg-tertiary', theme.colors.background.tertiary);
      
      // Apply text colors
      root.style.setProperty('--color-text-primary', theme.colors.text.primary);
      root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
      root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary);
      root.style.setProperty('--color-text-inverse', theme.colors.text.inverse);
      
      // Apply border colors
      root.style.setProperty('--color-border-primary', theme.colors.border.primary);
      root.style.setProperty('--color-border-secondary', theme.colors.border.secondary);
      root.style.setProperty('--color-border-focus', theme.colors.border.focus);
      
      // Apply spacing
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
      
      // Apply border radius
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value);
      });
      
      // Apply shadows
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    };
    
    applyThemeColors(theme);
  }, [themeMode, theme]);

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;

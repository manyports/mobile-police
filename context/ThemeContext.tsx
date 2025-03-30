import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof Colors.light | typeof Colors.dark;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  colors: Colors.light,
  isDark: false
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme() || 'light';
  const [theme, setTheme] = useState<Theme>('system');
  
  // Calculate the effective theme based on system or user preference
  const effectiveTheme = theme === 'system' ? 
    deviceColorScheme as 'light' | 'dark' : 
    theme;
  
  const isDark = effectiveTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Listen for device theme changes
  useEffect(() => {
    if (theme === 'system') {
      // If we're using system theme, we don't need to do anything
      // as the effectiveTheme will update when deviceColorScheme changes
    }
  }, [deviceColorScheme, theme]);

  const value = {
    theme,
    setTheme,
    colors,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  tabBar: string;
  tabBarBorder: string;
  cardSelectedBg: string;
  badgeBg: string;
};

export const darkColors: ThemeColors = {
  background: '#050505',
  surface: '#111111',
  surfaceBorder: '#1e293b',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSubtle: '#64748b',
  primary: '#bdf522', // BRAND_GREEN
  tabBar: '#050505',
  tabBarBorder: '#111111',
  cardSelectedBg: '#0a0d02',
  badgeBg: '#1e293b',
};

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceBorder: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#334155',
  textSubtle: '#64748b',
  primary: '#b2eb15ff', // Brighter, punchier electric lime
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  cardSelectedBg: '#f2fae6', // faint green
  badgeBg: '#e2e8f0',
};

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'fintech-dark' | 'terminal' | 'paper';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'fintech-dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('hood1m_theme') as Theme | null;
    return saved || 'fintech-dark'; // Default to Modern Fintech Dark!
  });

  useEffect(() => {
    localStorage.setItem('hood1m_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-fintech-dark', 'theme-terminal', 'theme-paper');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'fintech-dark') return 'terminal';
      if (prev === 'terminal') return 'paper';
      return 'fintech-dark';
    });
  };

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'terminal' | 'paper';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'terminal',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('hood1m_theme') as Theme | null;
    return saved || 'terminal'; // Default to terminal ASCII theme!
  });

  useEffect(() => {
    localStorage.setItem('hood1m_theme', theme);
    const root = document.documentElement;
    if (theme === 'terminal') {
      root.classList.add('theme-terminal');
      root.classList.remove('theme-paper');
    } else {
      root.classList.add('theme-paper');
      root.classList.remove('theme-terminal');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'terminal' ? 'paper' : 'terminal'));
  };

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

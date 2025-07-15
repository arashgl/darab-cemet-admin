import { themeState } from '@/state/atoms';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export function useTheme() {
  const [theme, setTheme] = useRecoilState(themeState);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Store in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

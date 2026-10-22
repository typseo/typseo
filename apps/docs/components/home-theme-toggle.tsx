'use client';

import { useTheme } from 'fumadocs-ui/provider/base';

export function HomeThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className="home-theme-toggle"
      type="button"
      aria-label={
        resolvedTheme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
      title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <span aria-hidden="true">{resolvedTheme === 'dark' ? '☼' : '☾'}</span>
    </button>
  );
}

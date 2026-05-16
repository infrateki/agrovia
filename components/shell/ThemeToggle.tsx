'use client';

import { useEffect } from 'react';
import { hydrateThemeFromDom, useUiStore } from '@/lib/stores/ui-store';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  // Sync the store to whatever the FOUC-prevention <script> applied to <html>.
  useEffect(() => {
    hydrateThemeFromDom();
  }, []);

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={isLight ? 'Modo claro' : 'Modo oscuro'}
      onClick={toggleTheme}
      className={[styles.toggle, isLight ? styles.toggleOn : ''].join(' ')}
    >
      <span className={styles.knob} aria-hidden="true" />
    </button>
  );
}

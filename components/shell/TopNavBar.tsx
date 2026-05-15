'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useUiStore } from '@/lib/stores/ui-store';
import type { NavViewId } from '@/lib/types';
import styles from './TopNavBar.module.css';

interface NavLink {
  id: NavViewId;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { id: 'comando', label: 'Comando' },
  { id: 'operador', label: 'Operador' },
  { id: 'cuentas', label: 'Cuentas' },
  { id: 'calidad', label: 'Calidad' },
  { id: 'frio', label: 'Cadena de Frío' },
  { id: 'radar', label: 'Radar' },
  { id: 'social', label: 'Social' },
  { id: 'grafo', label: 'Grafo' },
  { id: 'config', label: 'Config' },
];

export function TopNavBar() {
  const activeView = useUiStore((s) => s.activeView);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const closeDetail = useUiStore((s) => s.closeDetail);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return;
    function onDown(e: MouseEvent) {
      if (!avatarRef.current) return;
      if (!avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [avatarOpen]);

  function handleNav(id: NavViewId) {
    setActiveView(id);
    setDrawerOpen(false);
    // Switching views closes any open detail panel so it doesn't carry across.
    closeDetail();
  }

  return (
    <>
      <header className={styles.bar} role="banner">
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={drawerOpen}
        >
          <Menu size={16} strokeWidth={1.6} />
        </button>

        <div className={styles.wordmark}>
          <span className={styles.wordmarkDot} aria-hidden="true" />
          <span>FRESCO</span>
        </div>

        <nav className={styles.center} aria-label="Navegación principal">
          {NAV_LINKS.map((link) => {
            const active = activeView === link.id;
            return (
              <button
                key={link.id}
                type="button"
                className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                onClick={() => handleNav(link.id)}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Buscar"
            title="Buscar"
          >
            <Search size={14} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell size={14} strokeWidth={1.6} />
            <span className={styles.bellDot} aria-hidden="true" />
          </button>
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => setAvatarOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
            >
              <span className={styles.avatarCircle}>SV</span>
              <span>Serge</span>
            </button>
            {avatarOpen && (
              <div className={styles.avatarMenu} role="menu">
                <button type="button" className={styles.avatarMenuItem} role="menuitem">
                  Cuenta
                </button>
                <button type="button" className={styles.avatarMenuItem} role="menuitem">
                  Preferencias
                </button>
                <div className={styles.avatarMenuDivider} />
                <button type="button" className={styles.avatarMenuItem} role="menuitem">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          className={`${styles.drawerBackdrop} ${styles.open}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        aria-label="Navegación móvil"
      >
        {NAV_LINKS.map((link) => {
          const active = activeView === link.id;
          return (
            <button
              key={link.id}
              type="button"
              className={`${styles.drawerItem} ${active ? styles.drawerItemActive : ''}`}
              onClick={() => handleNav(link.id)}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

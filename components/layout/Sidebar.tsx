"use client";

import { useState } from "react";
import {
  Gauge,
  MessageSquareText,
  UsersRound,
  PackageCheck,
  Thermometer,
  Radar,
  Ear,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Sidebar.module.css";

interface NavItem {
  id: string;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "comando", label: "Centro de Comando", Icon: Gauge },
  { id: "operador", label: "Operador Diario", Icon: MessageSquareText },
  { id: "cuentas", label: "Cuentas", Icon: UsersRound },
  { id: "calidad", label: "Calidad", Icon: PackageCheck },
  { id: "frio", label: "Cadena de Frío", Icon: Thermometer },
  { id: "senales", label: "Radar de Señales", Icon: Radar },
  { id: "social", label: "Escucha Social", Icon: Ear },
  { id: "grafo", label: "Inteligencia de Grafo", Icon: Network },
  { id: "config", label: "Configuración", Icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const [activeView, setActiveView] = useState<string>("comando");

  return (
    <div className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoDot} aria-hidden="true" />
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoMark}>FRESCO</span>
              <span className={styles.logoSub}>Operator</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className={styles.nav} aria-label="Navegación principal">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              data-id={id}
              className={cn(styles.navItem, active && styles.navItemActive)}
              onClick={() => setActiveView(id)}
              title={collapsed ? label : undefined}
            >
              <span className={styles.navIcon}>
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <span className={styles.navLabel}>{label}</span>
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className={styles.footer}>
          <span className={styles.footerBadge}>Datos mock</span>
          <p className={styles.footerNote}>
            Demo GraphRAG-ready para inteligencia postcosecha.
          </p>
        </div>
      )}
    </div>
  );
}

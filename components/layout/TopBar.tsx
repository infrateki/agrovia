"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import styles from "./TopBar.module.css";

export function TopBar() {
  const [query, setQuery] = useState("");

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.eyebrow}>FRESCO Operator MVP</span>
        <span className={styles.title}>Cockpit ejecutivo BI</span>
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Search size={14} strokeWidth={1.75} />
          </span>
          <input
            type="search"
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pregúntale a FRESCO sobre riesgo, clientes, embarques o reclamos..."
            aria-label="Buscar"
          />
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.mvpBadge}>MVP</span>
        <button type="button" className={styles.bellWrap} aria-label="Notificaciones">
          <Bell size={16} strokeWidth={1.75} />
          <span className={styles.bellDot} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

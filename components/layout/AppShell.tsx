"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { cn } from "@/lib/utils";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children?: ReactNode;
  rightPanel?: ReactNode;
  rightPanelOpen?: boolean;
}

export function AppShell({ children, rightPanel, rightPanelOpen = false }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(styles.shell, collapsed && styles.shellCollapsed)}>
      <div className={styles.sidebar}>
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      </div>
      <div className={styles.topbar}>
        <TopBar />
      </div>
      <main className={styles.main}>
        <div id="pipeline-canvas" className={styles.canvas} style={{ width: "100%", height: "100%", position: "relative" }}>
          {children}
        </div>
      </main>
      <div className={styles.bottom}>
        <BottomBar />
      </div>
      {rightPanel ? (
        <aside className={cn(styles.rightPanel, rightPanelOpen && styles.rightPanelOpen)}>
          {rightPanel}
        </aside>
      ) : null}
    </div>
  );
}

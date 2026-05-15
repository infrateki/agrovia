"use client";

import { type ReactNode } from "react";
import { TopNavBar } from "@/components/shell/TopNavBar";
import { GrainOverlay } from "@/components/shell/GrainOverlay";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <GrainOverlay />
      <TopNavBar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

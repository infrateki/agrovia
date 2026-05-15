"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { RightPanel } from "@/components/panels/RightPanel";
import { MobileHero } from "@/components/layout/MobileHero";
import styles from "./page.module.css";

const PipelineCanvas = dynamic(
  () =>
    import("@/components/three/PipelineCanvas").then((m) => ({
      default: m.PipelineCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.placeholder}>
        <div className={styles.logoBlock}>
          <span className={styles.logoDot} aria-hidden="true" />
          <div className={styles.logoText}>
            <span className={styles.logoMark}>FRESCO</span>
            <span className={styles.logoSub}>3D Pipeline Intelligence</span>
          </div>
        </div>
        <p className={styles.loadingText}>Inicializando pipeline 3D...</p>
      </div>
    ),
  },
);

export function HomePage() {
  return (
    <AppShell>
      <div className={styles.canvasWrap}>
        <PipelineCanvas />
      </div>
      <MobileHero />
      <RightPanel />
    </AppShell>
  );
}

export default HomePage;

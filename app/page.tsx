"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RightPanel } from "@/components/panels/RightPanel";
import { MobileHero } from "@/components/layout/MobileHero";
import { CinematicProvider } from "@/components/cinematic";
import { DataSourceBanner } from "@/components/layout/DataSourceBanner";
import { DashboardView } from "@/components/panels/DashboardView";
import { useUiStore } from "@/lib/stores/ui-store";
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
            <span className={styles.logoMark}>AgroVIA</span>
            <span className={styles.logoSub}>FRESCO Operator</span>
          </div>
        </div>
        <p className={styles.loadingText}>Inicializando pipeline 3D...</p>
      </div>
    ),
  },
);

function DashboardLoading() {
  return (
    <div className={styles.dashboardLoading} role="status">
      <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
      <span>Cargando dashboard...</span>
    </div>
  );
}

const PackingDashboard = dynamic(
  () =>
    import("@/components/dashboards/PackingDashboard").then((m) => ({
      default: m.PackingDashboard,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

const QualityDashboard = dynamic(
  () =>
    import("@/components/dashboards/QualityDashboard").then((m) => ({
      default: m.QualityDashboard,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

const ColdChainDashboard = dynamic(
  () =>
    import("@/components/dashboards/ColdChainDashboard").then((m) => ({
      default: m.ColdChainDashboard,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

function DashboardOverlay() {
  const activeView = useUiStore((s) => s.activeView);

  if (activeView === "comando") {
    return (
      <div className={styles.dashboardOverlay}>
        <DashboardView />
        <PackingDashboard />
      </div>
    );
  }

  if (activeView === "calidad") {
    return (
      <div className={styles.dashboardOverlay}>
        <QualityDashboard />
      </div>
    );
  }

  if (activeView === "frio") {
    return (
      <div className={styles.dashboardOverlay}>
        <ColdChainDashboard />
      </div>
    );
  }

  return null;
}

export function HomePage() {
  return (
    <AppShell>
      <DataSourceBanner />
      <div className={styles.canvasWrap}>
        <PipelineCanvas />
      </div>
      <DashboardOverlay />
      <MobileHero />
      <RightPanel />
      <CinematicProvider />
    </AppShell>
  );
}

export default HomePage;

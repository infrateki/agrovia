"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MobileHero } from "@/components/layout/MobileHero";
import { CinematicProvider } from "@/components/cinematic";
import { DataSourceBanner } from "@/components/layout/DataSourceBanner";
import { DashboardView } from "@/components/panels/DashboardView";
import { OperatorChat } from "@/components/panels/OperatorChat";
import { SignalQueue } from "@/components/panels/SignalQueue";
import { ConfigToggles } from "@/components/panels/ConfigToggles";
import { ShipmentDetailPanel } from "@/components/panels/ShipmentDetailPanel";
import { EmptyView } from "@/components/dashboards/EmptyView";
import { useUiStore } from "@/lib/stores/ui-store";
import styles from "./page.module.css";

function DashboardLoading() {
  return (
    <div className={styles.dashboardLoading} role="status">
      <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
      <span>Cargando vista...</span>
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

const GraphIntelligenceView = dynamic(
  () =>
    import("@/components/dashboards/GraphIntelligenceView").then((m) => ({
      default: m.GraphIntelligenceView,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

const OperationsSimView = dynamic(
  () =>
    import("@/components/dashboards/OperationsSimView").then((m) => ({
      default: m.OperationsSimView,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

const DataGridView = dynamic(
  () =>
    import("@/components/dashboards/DataGridView").then((m) => ({
      default: m.DataGridView,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

const SchemaView = dynamic(
  () =>
    import("@/components/dashboards/SchemaView").then((m) => ({
      default: m.SchemaView,
    })),
  { ssr: false, loading: () => <DashboardLoading /> },
);

function ScrollableContent({ children }: { children: React.ReactNode }) {
  return <div className={styles.scrollPane}>{children}</div>;
}

function ViewRouter() {
  const activeView = useUiStore((s) => s.activeView);

  switch (activeView) {
    case "comando":
      return (
        <ScrollableContent>
          <DashboardView />
          <PackingDashboard />
        </ScrollableContent>
      );
    case "operador":
      return (
        <div className={styles.operatorWrap}>
          <OperatorChat />
        </div>
      );
    case "cuentas":
      return (
        <EmptyView
          title="Cuentas"
          subtitle="Cartera de clientes, ranking de riesgo y exposición por cuenta. Próxima iteración."
        />
      );
    case "calidad":
      return (
        <ScrollableContent>
          <QualityDashboard />
        </ScrollableContent>
      );
    case "frio":
      return (
        <ScrollableContent>
          <ColdChainDashboard />
        </ScrollableContent>
      );
    case "radar":
      return (
        <div className={styles.panelWrap}>
          <SignalQueue />
        </div>
      );
    case "social":
      return (
        <EmptyView
          title="Escucha Social"
          subtitle="Menciones, reviews y patrones de cliente en tiempo real. Próxima iteración."
        />
      );
    case "sim":
      return <OperationsSimView />;
    case "data-grid":
      return <DataGridView />;
    case "grafo":
      return <GraphIntelligenceView />;
    case "schema":
      return <SchemaView />;
    case "config":
      return (
        <div className={styles.panelWrap}>
          <ConfigToggles />
        </div>
      );
    default:
      return null;
  }
}

function DetailMount() {
  const activeView = useUiStore((s) => s.activeView);
  const detailPanelOpen = useUiStore((s) => s.detailPanelOpen);
  const selectedShipmentId = useUiStore((s) => s.selectedShipmentId);
  const closeDetail = useUiStore((s) => s.closeDetail);

  if (
    activeView === "grafo" ||
    activeView === "sim" ||
    activeView === "data-grid" ||
    activeView === "schema"
  )
    return null;
  if (!detailPanelOpen || !selectedShipmentId) return null;

  return (
    <ShipmentDetailPanel id={selectedShipmentId} onClose={closeDetail} />
  );
}

export function HomePage() {
  return (
    <AppShell>
      <DataSourceBanner />
      <ViewRouter />
      <DetailMount />
      <MobileHero />
      <CinematicProvider />
    </AppShell>
  );
}

export default HomePage;

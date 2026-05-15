Read COMMS.md and CLAUDE.md. You are T2 — Data Layer owner.

ultrathink

Your job is to create the complete TypeScript type system, mock data, Zustand stores, and constants that T3 (3D engine) and T4 (UI panels) will consume. Everything you create is the contract that other terminals code against — be thorough and precise.

### Tasks P4 + P5 + P6 + P7:

**P4: TypeScript interfaces (lib/types.ts)**

Define ALL domain entity interfaces:

```typescript
// === Zone & View Types ===
export type PipelineZone = 'cosecha' | 'seleccion' | 'packing' | 'frio' | 'embarque' | 'transito' | 'llegada';
export type ViewMode = 'pipeline' | 'zone' | 'object';
export type DataFlowType = 'trazabilidad' | 'temperatura' | 'documentos' | 'senales' | 'reclamos';
export type BadgeVariant = 'good' | 'warn' | 'bad' | 'info';
export type SignalSource = 'internal' | 'market' | 'client' | 'regulatory';
export type ClaimStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type DefenseItemStatus = 'ready' | 'draft' | 'missing';
export type NavViewId = 'comando' | 'operador' | 'cuentas' | 'calidad' | 'frio' | 'senales' | 'social' | 'grafo' | 'config';

// === Domain Entities ===
export interface Lote {
  id: string;
  parcela: string;
  variedad: 'arandano' | 'uva' | 'palta' | 'mango' | 'citricos';
  calibre: string;
  brix: number;
  dryMatter: number;
  fechaCosecha: string; // ISO date
  riskScore: number; // 0-100
  zone: PipelineZone;
  embarqueId?: string;
}

export interface Embarque {
  id: string;
  contenedor: string;
  naviera: string;
  setPointTemp: number;
  fechaZarpe: string;
  eta: string;
  clienteId: string;
  loteIds: string[];
  status: 'en-camara' | 'cargado' | 'en-transito' | 'en-puerto' | 'entregado';
  riskScore: number;
  currentZone: PipelineZone;
}

export interface Cliente {
  id: string;
  nombre: string;
  pais: string;
  segmento: 'premium' | 'standard' | 'emergente';
  score: number; // 0-100
  preferencias: string[];
  totalReclamos: number;
  totalEmbarques: number;
  montoReclamosUsd: number;
}

export interface Reclamo {
  id: string;
  embarqueId: string;
  clienteId: string;
  tipo: 'calidad' | 'temperatura' | 'calibre' | 'documentacion' | 'demora';
  monto: number;
  fecha: string;
  status: ClaimStatus;
  evidenciaUrls: string[];
  descripcion: string;
}

export interface Temperatura {
  id: string;
  embarqueId: string;
  timestamp: string;
  valor: number;
  sensorId: string;
  zona: PipelineZone;
}

export interface Senal {
  id: string;
  tipo: 'riesgo' | 'mercado' | 'calidad' | 'regulatorio';
  fuente: SignalSource;
  score: number; // 0-100
  titulo: string;
  descripcion: string;
  accion: string;
  fecha: string;
}

// === UI Data Types ===
export interface KpiData {
  id: string;
  label: string;
  value: string;
  badge: string;
  badgeVariant: BadgeVariant;
  icon: string; // Lucide icon name
}

export interface ClaimDefenseItem {
  id: string;
  nombre: string;
  fuente: string;
  status: DefenseItemStatus;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// === 3D Types ===
export interface ZoneConfig {
  id: PipelineZone;
  label: string; // Spanish display name
  description: string; // Spanish description
  position: { x: number; y: number; z: number };
  size: { w: number; h: number; d: number };
  color: string; // hex
  accentColor: string; // hex for lighting
}

export interface LayerVisibility {
  flow: boolean;
  temperatura: boolean;
  riesgo: boolean;
  documentos: boolean;
  senales: boolean;
  grafo: boolean;
}

export interface NavItem {
  id: NavViewId;
  label: string;
  iconName: string;
}
```

**P5: Mock data (lib/data/)**

Create realistic mock data for a Peruvian agroexport operation. ALL labels and descriptions in Spanish.

`lib/data/mock-lotes.ts` — 20 lotes:
- Mix of varieties: 6 arándano, 5 uva, 4 palta, 3 mango, 2 cítricos
- Parcelas named like "Parcela Ica-Norte 12", "Fundo Chavimochic L3"
- Calibres like "10-12mm", "14-16mm", "cal. 18"
- Brix range: 10-16 for berries, 14-20 for grapes, 18-24 for mango
- Risk scores: most 15-45 (low), 4-5 at 55-75 (medium), 2-3 at 80-95 (high risk)
- Spread across zones: some in cosecha, some in packing, some in frio, some in transito

`lib/data/mock-embarques.ts` — 8 embarques:
- Containers named like "MSCU-7842190", "HLXU-3391028"
- Navieras: "Hapag-Lloyd", "MSC", "Maersk", "CMA CGM"
- Set points: -0.5°C for berries, -1°C for grapes, 5.5°C for avocado, 10°C for mango
- Mix of statuses: 2 en-transito, 2 en-puerto, 2 cargado, 1 en-camara, 1 entregado
- Risk scores varying, one high risk (S-8842 — the flagship alert from the PRD)

`lib/data/mock-clientes.ts` — 6 clientes:
- "Walmart US" (USA, premium, score 82, 3 reclamos, 45 embarques)
- "Driscoll's" (USA, premium, score 91, 1 reclamo, 32 embarques)
- "Tesco UK" (UK, standard, score 74, 5 reclamos, 28 embarques)
- "Carrefour France" (France, standard, score 68, 4 reclamos, 22 embarques)
- "AEON Japan" (Japan, premium, score 88, 2 reclamos, 18 embarques)
- "MercadoLibre Perú" (Peru, emergente, score 55, 7 reclamos, 15 embarques)

`lib/data/mock-reclamos.ts` — 5 reclamos:
- Mix of tipos: calidad, temperatura, calibre
- Montos: $12,000 to $85,000
- Statuses: 2 open, 1 investigating, 1 resolved, 1 closed
- Descriptions in Spanish explaining the issue

`lib/data/mock-temperaturas.ts` — Temperature time series:
- For embarque S-8842 (high risk): readings every 30 min for 7 days (336 entries)
  - Days 1-3: stable at 0.2°C ± 0.3°C (normal for blueberries)
  - Day 4: EXCURSION event — rises to 5.8°C for 2 hours, then recovers to 1.2°C
  - Days 5-7: slightly elevated at 1.0°C ± 0.5°C (post-excursion drift)
- For embarque S-8845 (normal): readings every 30 min for 5 days (240 entries)
  - Stable at -0.8°C ± 0.2°C (perfect for grapes)

`lib/data/mock-senales.ts` — 6 signals:
1. "Embarque de arándanos muestra patrón de excursión de temperatura" — score 91, internal, accion: "Preparar carpeta de defensa antes de llegada"
2. "Precios de uva en EE.UU. bajando mientras volumen llega a pico" — score 74, market, accion: "Priorizar lotes premium para compradores tier A"
3. "Aumento de quejas por llegadas blandas en categoría palta" — score 68, client, accion: "Revisar dry matter y ventanas de tránsito"
4. "APHIS actualiza requisitos fitosanitarios para cítricos" — score 62, regulatory, accion: "Verificar certificaciones vigentes con SENASA"
5. "Cliente Tesco reporta 3 reclamos en últimas 6 semanas" — score 78, client, accion: "Agendar llamada con account manager, preparar historial"
6. "Volumen de arándano peruano supera forecast en 15%" — score 45, market, accion: "Evaluar impacto en precios y reasignar destinos"

`lib/data/mock-kpis.ts` — 4 KPIs:
1. { id: 'revenue-risk', label: 'Ingresos en riesgo', value: '$1.84M', badge: '+12%', badgeVariant: 'bad', icon: 'DollarSign' }
2. { id: 'shipments', label: 'Embarques monitoreados', value: '428', badge: '36 críticos', badgeVariant: 'warn', icon: 'Ship' }
3. { id: 'claims-exposure', label: 'Exposición por reclamos', value: '$312K', badge: '-8%', badgeVariant: 'good', icon: 'ShieldAlert' }
4. { id: 'portfolio-health', label: 'Salud de cartera', value: '78/100', badge: '+4 pts', badgeVariant: 'good', icon: 'HeartPulse' }

`lib/data/mock-chat.ts` — 4 chat messages:
1. user: "¿Qué embarques necesitan acción hoy?"
2. bot: "3 embarques requieren atención. Prioridad máxima: S-8842, arándanos a EE.UU., porque los datos del logger, la blandura QC y el historial de reclamos del cliente convergen."
3. user: "Prepara el brief de acción."
4. bot: "Listo: avisar al responsable de cuenta, adjuntar curva de temperatura, pedir fotos de llegada y preparar respuesta comercial. ¿Quieres que genere la carpeta de defensa completa?"

`lib/data/mock-defense.ts` — 6 claim defense items:
1. "Fotos de inspección QC" — fuente: "Sistema QC", status: ready
2. "Curva de temperatura" — fuente: "Data logger Emerson", status: ready
3. "Línea de tiempo de packing" — fuente: "ERP Nisira", status: ready
4. "Registro de tratamiento" — fuente: "Sistema fitosanitario", status: ready
5. "Ficha técnica del cliente" — fuente: "CRM / GraphRAG", status: draft
6. "Respuesta comercial borrador" — fuente: "Operador FRESCO", status: draft

`lib/data/index.ts` — Re-export all mock data as named exports.

**P6: Zustand stores (lib/stores/)**

`lib/stores/pipeline-store.ts`:
```typescript
import { create } from 'zustand';
// Import all types and mock data
// Initialize store with mock data

interface PipelineState {
  lotes: Lote[];
  embarques: Embarque[];
  clientes: Cliente[];
  reclamos: Reclamo[];
  temperaturas: Temperatura[];
  senales: Senal[];
  kpis: KpiData[];
  chatMessages: ChatMessage[];
  defenseItems: ClaimDefenseItem[];
  addChatMessage: (message: ChatMessage) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  // Initialize with mock data imports
  // addChatMessage: appends to chatMessages array
}));
```

`lib/stores/ui-store.ts`:
```typescript
interface UiState {
  activeView: NavViewId;
  setActiveView: (view: NavViewId) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  cinematicMode: boolean;
  setCinematicMode: (on: boolean) => void;
}

// Default layers: flow=true, temperatura=true, riesgo=true, documentos=false, senales=true, grafo=false
```

`lib/stores/selection-store.ts`:
```typescript
interface SelectionState {
  selectedZone: PipelineZone | null;
  setSelectedZone: (zone: PipelineZone | null) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  hoveredObjectId: string | null;
  setHoveredObjectId: (id: string | null) => void;
  clearSelection: () => void;
}
```

**P7: Constants (lib/constants.ts)**

```typescript
export const ZONE_CONFIGS: ZoneConfig[] = [
  { id: 'cosecha', label: 'Cosecha', description: 'Recolección en parcela...', position: { x: -30, y: 0, z: 0 }, size: { w: 8, h: 4, d: 8 }, color: '#2D5A1E', accentColor: '#4CAF50' },
  { id: 'seleccion', label: 'Selección', description: 'Línea de selección...', position: { x: -20, y: 0, z: 0 }, size: { w: 8, h: 3, d: 6 }, color: '#5D4E37', accentColor: '#D4A843' },
  { id: 'packing', label: 'Packing', description: 'Empaque y etiquetado...', position: { x: -10, y: 0, z: 0 }, size: { w: 8, h: 3, d: 6 }, color: '#3E2723', accentColor: '#FF8800' },
  { id: 'frio', label: 'Frío', description: 'Cámara de frío...', position: { x: 0, y: 0, z: 0 }, size: { w: 8, h: 5, d: 8 }, color: '#1A3A5C', accentColor: '#4488FF' },
  { id: 'embarque', label: 'Embarque', description: 'Carga en contenedor...', position: { x: 10, y: 0, z: 0 }, size: { w: 10, h: 4, d: 6 }, color: '#4A3728', accentColor: '#FF8800' },
  { id: 'transito', label: 'Tránsito', description: 'Transporte marítimo...', position: { x: 20, y: 0, z: 0 }, size: { w: 12, h: 4, d: 8 }, color: '#1B3A4B', accentColor: '#4488FF' },
  { id: 'llegada', label: 'Llegada', description: 'Puerto destino...', position: { x: 32, y: 0, z: 0 }, size: { w: 8, h: 3, d: 6 }, color: '#1A5C3A', accentColor: '#2D8B5E' },
];

// Convenience lookups
export const ZONE_POSITIONS = Object.fromEntries(ZONE_CONFIGS.map(z => [z.id, z.position]));
export const ZONE_COLORS = Object.fromEntries(ZONE_CONFIGS.map(z => [z.id, z.color]));
export const ZONE_LABELS = Object.fromEntries(ZONE_CONFIGS.map(z => [z.id, z.label]));

export const PARTICLE_COLORS: Record<DataFlowType, string> = {
  trazabilidad: '#1A5C3A',
  temperatura: '#FF4444',
  documentos: '#D4A843',
  senales: '#6B5CE7',
  reclamos: '#FF8800',
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'comando', label: 'Centro de Comando', iconName: 'Gauge' },
  { id: 'operador', label: 'Operador Diario', iconName: 'MessageSquareText' },
  { id: 'cuentas', label: 'Cuentas', iconName: 'UsersRound' },
  { id: 'calidad', label: 'Calidad', iconName: 'PackageCheck' },
  { id: 'frio', label: 'Cadena de Frío', iconName: 'Thermometer' },
  { id: 'senales', label: 'Radar de Señales', iconName: 'Radar' },
  { id: 'social', label: 'Escucha Social', iconName: 'Ear' },
  { id: 'grafo', label: 'Inteligencia de Grafo', iconName: 'Network' },
  { id: 'config', label: 'Configuración', iconName: 'Settings' },
];
```

### Files you own (ONLY modify these)
- lib/types.ts
- lib/constants.ts
- lib/data/mock-lotes.ts
- lib/data/mock-embarques.ts
- lib/data/mock-clientes.ts
- lib/data/mock-reclamos.ts
- lib/data/mock-temperaturas.ts
- lib/data/mock-senales.ts
- lib/data/mock-kpis.ts
- lib/data/mock-chat.ts
- lib/data/mock-defense.ts
- lib/data/index.ts
- lib/stores/pipeline-store.ts
- lib/stores/ui-store.ts
- lib/stores/selection-store.ts

### Files you must NOT touch
- app/* (T1)
- components/* (T1, T3, T4)
- globals.css (T1)
- package.json (T1)
- CLAUDE.md (orchestrator)

### Dependencies
- T1 must have run first (package.json with zustand installed)
- Verify zustand is in node_modules: `ls node_modules/zustand`

### Constraints
- All mock data labels/descriptions in Spanish
- Named exports only — no default exports
- Use strict TypeScript — no `any` types, enable strict mode
- Zustand stores must be initialized with mock data (import from lib/data/)
- ZONE_CONFIGS X coordinates spread zones evenly from -30 to +32
- Temperature mock data must include a clear excursion event for S-8842
- Mock data IDs should be consistent: lotes use "L-XXXX", embarques "S-XXXX", clientes "C-XXXX", reclamos "R-XXXX"

### When done
1. Run `npx tsc --noEmit` — must pass with zero errors
2. Run `npm run build` — must pass with zero errors
3. Update COMMS.md: mark P4, P5, P6, P7 as ✅ DONE with timestamps
4. Note in COMMS.md T2 terminal log all export paths so T3 and T4 know exactly what to import

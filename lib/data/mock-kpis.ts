import type { KpiData } from '../types';

export const mockKpis: KpiData[] = [
  {
    id: 'revenue-risk',
    label: 'Ingresos en riesgo',
    value: '$1.84M',
    badge: '+12%',
    badgeVariant: 'bad',
    icon: 'DollarSign',
  },
  {
    id: 'shipments',
    label: 'Embarques monitoreados',
    value: '428',
    badge: '36 críticos',
    badgeVariant: 'warn',
    icon: 'Ship',
  },
  {
    id: 'claims-exposure',
    label: 'Exposición por reclamos',
    value: '$312K',
    badge: '-8%',
    badgeVariant: 'good',
    icon: 'ShieldAlert',
  },
  {
    id: 'portfolio-health',
    label: 'Salud de cartera',
    value: '78/100',
    badge: '+4 pts',
    badgeVariant: 'good',
    icon: 'HeartPulse',
  },
];

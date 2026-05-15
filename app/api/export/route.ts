import { NextResponse } from 'next/server';
import {
  mockClientes,
  mockEmbarques,
  mockKpis,
  mockLotes,
  mockReclamos,
  mockSenales,
} from '@/lib/data';
import type { Embarque, Lote, Senal } from '@/lib/types';

export const dynamic = 'force-dynamic';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function riskColor(score: number): string {
  if (score >= 80) return '#FF4444';
  if (score >= 55) return '#FF8800';
  return '#2D8B5E';
}

function riskLabel(score: number): string {
  if (score >= 80) return 'CRÍTICO';
  if (score >= 55) return 'ALTO';
  if (score >= 30) return 'MEDIO';
  return 'BAJO';
}

function buildHtml(opts: { source: 'mock' | 'imported' }): string {
  const generatedAt = new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
  });

  // Top 5 risks: highest-risk embarques first, then high-risk lotes
  const topEmbarques: Embarque[] = [...mockEmbarques]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const topLotes: Lote[] = [...mockLotes]
    .filter((l) => l.riskScore >= 60)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // Active alerts: signals with score >= 65
  const activeAlerts: Senal[] = [...mockSenales]
    .filter((s) => s.score >= 65)
    .sort((a, b) => b.score - a.score);

  const openClaims = mockReclamos.filter(
    (r) => r.status === 'open' || r.status === 'investigating',
  );
  const totalExposure = openClaims.reduce((sum, r) => sum + r.monto, 0);

  const clienteName = (id: string): string =>
    mockClientes.find((c) => c.id === id)?.nombre ?? id;

  const kpiRows = mockKpis
    .map(
      (k) => `
      <div class="kpi">
        <div class="kpi-label">${escapeHtml(k.label)}</div>
        <div class="kpi-value">${escapeHtml(k.value)}</div>
        <div class="kpi-badge kpi-badge--${k.badgeVariant}">${escapeHtml(k.badge)}</div>
      </div>`,
    )
    .join('');

  const embarqueRows = topEmbarques
    .map((e) => {
      const color = riskColor(e.riskScore);
      return `
      <tr>
        <td><strong>${escapeHtml(e.id)}</strong></td>
        <td>${escapeHtml(clienteName(e.clienteId))}</td>
        <td>${escapeHtml(e.naviera)}</td>
        <td>${escapeHtml(e.currentZone)}</td>
        <td><span class="risk-pill" style="background:${color}1f;color:${color};border:1px solid ${color}80;">
          ${e.riskScore} · ${riskLabel(e.riskScore)}
        </span></td>
      </tr>`;
    })
    .join('');

  const loteRows = topLotes.length
    ? topLotes
        .map(
          (l) => `
        <tr>
          <td><strong>${escapeHtml(l.id)}</strong></td>
          <td>${escapeHtml(l.variedad)}</td>
          <td>${escapeHtml(l.parcela)}</td>
          <td>${escapeHtml(l.zone)}</td>
          <td><span class="risk-pill" style="background:${riskColor(l.riskScore)}1f;color:${riskColor(l.riskScore)};">
            ${l.riskScore}
          </span></td>
        </tr>`,
        )
        .join('')
    : '<tr><td colspan="5" class="empty">Sin lotes de riesgo alto.</td></tr>';

  const alertRows = activeAlerts.length
    ? activeAlerts
        .map(
          (s) => `
        <tr>
          <td><strong>${s.score}</strong></td>
          <td>${escapeHtml(s.titulo)}</td>
          <td>${escapeHtml(s.descripcion)}</td>
          <td class="accion">${escapeHtml(s.accion)}</td>
        </tr>`,
        )
        .join('')
    : '<tr><td colspan="4" class="empty">Sin alertas activas.</td></tr>';

  const decisionsHtml = openClaims.length
    ? openClaims
        .slice(0, 4)
        .map(
          (r) => `
        <li>
          <strong>${escapeHtml(r.id)}</strong> · ${escapeHtml(clienteName(r.clienteId))} ·
          <span style="color:${riskColor(75)};">$${r.monto.toLocaleString('en-US')}</span> ·
          <em>${escapeHtml(r.tipo)}</em>
        </li>`,
        )
        .join('')
    : '<li class="empty">Sin decisiones pendientes.</li>';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>AgroVIA — Reporte Semanal de Riesgo</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
      max-width: 940px;
      margin: 0 auto;
      padding: 36px 32px;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.5;
    }
    header {
      border-bottom: 3px solid #1A5C3A;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #1A5C3A;
      font-weight: 700;
    }
    h1 {
      margin: 4px 0 0;
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: -0.01em;
    }
    .subtitle {
      color: #5a5a6e;
      font-size: 13px;
      margin: 6px 0 0;
    }
    .source-pill {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      background: ${opts.source === 'imported' ? '#1A5C3A' : '#D4A843'};
      color: #fff;
    }
    h2 {
      font-size: 16px;
      font-weight: 700;
      margin: 28px 0 12px;
      color: #1A5C3A;
      letter-spacing: -0.005em;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi {
      padding: 12px 14px;
      border: 1px solid #e0e0e8;
      border-radius: 8px;
      background: #fafafb;
    }
    .kpi-label {
      font-size: 10px;
      color: #5a5a6e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 700;
      margin-top: 2px;
      color: #1a1a2e;
    }
    .kpi-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
    }
    .kpi-badge--good { background: #e7f5ec; color: #1A5C3A; }
    .kpi-badge--warn { background: #fff1dd; color: #b35900; }
    .kpi-badge--bad { background: #ffe4e4; color: #c83030; }
    .kpi-badge--info { background: #e7eef8; color: #2a5b9e; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 12px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e8e8ee;
    }
    th {
      background: #f4f4f7;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5a5a6e;
      font-weight: 600;
    }
    .risk-pill {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .accion {
      color: #1A5C3A;
      font-weight: 500;
    }
    ul {
      padding-left: 18px;
      margin: 0;
    }
    li {
      margin-bottom: 4px;
      font-size: 12px;
    }
    .empty {
      color: #8a8a9e;
      font-style: italic;
      text-align: center;
    }
    .exposure-card {
      padding: 12px 16px;
      border-left: 4px solid #FF4444;
      background: #fff5f5;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .exposure-amount {
      font-size: 22px;
      font-weight: 700;
      color: #c83030;
    }
    footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e0e0e8;
      font-size: 10px;
      color: #8a8a9e;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
    .print-tip {
      margin-bottom: 16px;
      padding: 10px 14px;
      background: #f4f4f7;
      border-left: 3px solid #1A5C3A;
      border-radius: 4px;
      font-size: 12px;
      color: #5a5a6e;
    }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">AgroVIA · FRESCO Operator</div>
    <h1>Reporte Semanal de Riesgo</h1>
    <p class="subtitle">Resumen ejecutivo de inteligencia postcosecha y cadena de frío.</p>
    <span class="source-pill">${opts.source === 'imported' ? 'Datos importados' : 'Datos de demostración'}</span>
  </header>

  <div class="print-tip no-print">
    Usa <strong>Ctrl + P</strong> (o <strong>Cmd + P</strong>) y selecciona "Guardar como PDF" para exportar este reporte.
  </div>

  <h2>Resumen ejecutivo · KPIs</h2>
  <div class="kpi-grid">${kpiRows}</div>

  <div class="exposure-card">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#5a5a6e;">Exposición por reclamos abiertos</div>
    <div class="exposure-amount">$${totalExposure.toLocaleString('en-US')}</div>
    <div style="font-size:11px;color:#5a5a6e;margin-top:2px;">
      ${openClaims.length} reclamo(s) abierto(s) o en investigación
    </div>
  </div>

  <h2>Top 5 embarques en riesgo</h2>
  <table>
    <thead><tr>
      <th>ID</th><th>Cliente</th><th>Naviera</th><th>Zona</th><th>Riesgo</th>
    </tr></thead>
    <tbody>${embarqueRows}</tbody>
  </table>

  <h2>Lotes de riesgo alto</h2>
  <table>
    <thead><tr>
      <th>ID</th><th>Variedad</th><th>Parcela</th><th>Zona</th><th>Score</th>
    </tr></thead>
    <tbody>${loteRows}</tbody>
  </table>

  <h2>Alertas activas</h2>
  <table>
    <thead><tr>
      <th>Score</th><th>Título</th><th>Descripción</th><th>Acción recomendada</th>
    </tr></thead>
    <tbody>${alertRows}</tbody>
  </table>

  <h2>Decisiones pendientes</h2>
  <ul>${decisionsHtml}</ul>

  <footer>
    <span>Generado el ${escapeHtml(generatedAt)} · Datos: ${opts.source}</span>
    <span>AgroVIA · INFRATEK · v0.2.0</span>
  </footer>
</body>
</html>`;
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') === 'imported'
    ? 'imported'
    : 'mock') as 'mock' | 'imported';
  const html = buildHtml({ source });
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

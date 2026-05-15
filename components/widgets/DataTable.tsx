'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ColumnDef } from '@/lib/types';
import { MiniGauge } from './MiniGauge';
import styles from './DataTable.module.css';

interface Props {
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  pageSize?: number;
  searchable?: boolean;
  title?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function badgeColor(value: unknown): string {
  const s = String(value).toLowerCase();
  if (
    /(crítico|critico|alta|alto|rechazado|detenida|critic|fail|riesgo)/.test(s)
  )
    return 'var(--color-alert-red)';
  if (/(alerta|amber|advert|pausa|condicional|warning|medio)/.test(s))
    return 'var(--color-alert-amber)';
  if (/(normal|aprobado|activa|listo|ok|bajo|completo|good|verde)/.test(s))
    return 'var(--color-accent-green-light)';
  if (/(info|cargado|en-transito|en-puerto)/.test(s))
    return 'var(--color-cold-blue)';
  return 'var(--color-text-secondary)';
}

export function DataTable({
  columns,
  data,
  onRowClick,
  pageSize = 10,
  searchable = false,
  title,
  className,
}: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) =>
      columns
        .filter((c) => !c.type || c.type === 'text' || c.type === 'badge')
        .some((c) => String(row[c.key] ?? '').toLowerCase().includes(q)),
    );
  }, [data, columns, query, searchable]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const sign = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort(
      (a, b) => sign * compareValues(a[sortKey], b[sortKey]),
    );
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const handleSort = (col: ColumnDef) => {
    if (!col.sortable) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') {
      setSortDir(null);
      setSortKey(null);
    } else setSortDir('asc');
  };

  const renderCell = (col: ColumnDef, row: Record<string, unknown>) => {
    const value = row[col.key];
    if (col.render) return col.render(value, row);
    if (value == null) return <span className={styles.muted}>—</span>;
    if (col.type === 'badge') {
      const color = badgeColor(value);
      return (
        <span
          className={styles.badge}
          style={{
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        >
          {String(value)}
        </span>
      );
    }
    if (col.type === 'mini-gauge') {
      const num = typeof value === 'number' ? value : Number(value);
      return <MiniGauge value={num} max={100} />;
    }
    if (col.type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      return (
        <span className={styles.numeric}>
          {Number.isFinite(num) ? num.toLocaleString('es-PE') : String(value)}
        </span>
      );
    }
    if (col.type === 'date') {
      try {
        const d = new Date(String(value));
        if (!Number.isNaN(d.getTime())) {
          return (
            <span className={styles.numeric}>
              {d.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })}
            </span>
          );
        }
      } catch {
        /* fall-through */
      }
      return String(value);
    }
    return String(value);
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {(title || searchable) && (
        <div className={styles.toolbar}>
          {title ? <h3 className={styles.title}>{title}</h3> : <span />}
          {searchable ? (
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Buscar..."
                className={styles.search}
              />
            </div>
          ) : null}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key && sortDir !== null;
                return (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align ?? 'left',
                      cursor: col.sortable ? 'pointer' : 'default',
                    }}
                    onClick={() => handleSort(col)}
                    aria-sort={
                      isSorted
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <span className={styles.th}>
                      {col.label}
                      {col.sortable ? (
                        <span className={styles.sortIcons}>
                          {isSorted && sortDir === 'asc' ? (
                            <ChevronUp size={12} />
                          ) : isSorted && sortDir === 'desc' ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronUp size={12} className={styles.sortIdle} />
                          )}
                        </span>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  Sin registros
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={(row.id as string | undefined) ?? `row-${start + i}`}
                  className={onRowClick ? styles.rowClickable : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span className={styles.count}>
          {total === 0
            ? 'Sin resultados'
            : `${start + 1}-${Math.min(start + pageSize, total)} de ${total}`}
        </span>
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <span className={styles.pageOf}>
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

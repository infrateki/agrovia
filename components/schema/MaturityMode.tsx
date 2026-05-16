'use client';

import { useMemo } from 'react';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type Status,
} from '@/lib/architecture/schema-map';
import {
  getMaturityEntities,
  getMaturityCell,
  maturityColumnLabel,
  MATURITY_COLUMNS,
  type MaturityColumn,
} from '@/lib/architecture/helpers';
import styles from './MaturityMode.module.css';

interface Props {
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

interface RowCell {
  status: Status;
  sourceNodeId?: string;
  nextStep?: string;
}

export function MaturityMode({ selectedNodeId, onSelect }: Props) {
  const entities = useMemo(() => getMaturityEntities(), []);

  const rows = useMemo(() => {
    return entities.map((entity) => ({
      entity,
      cells: MATURITY_COLUMNS.map((col): RowCell => {
        const cell = getMaturityCell(entity.id, col);
        return {
          status: cell.status,
          sourceNodeId: cell.sourceNodeId,
          nextStep: cell.nextStep,
        };
      }),
    }));
  }, [entities]);

  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Madurez del modelo</h2>
        <p className={styles.lead}>
          Cada fila es una entidad del dominio. Cada columna es una capa de
          arquitectura. El color de la celda indica el mejor estado disponible
          para esa combinación. Pasa el cursor por una celda para ver el próximo
          paso.
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th className={styles.entityCol}>Entidad</th>
              {MATURITY_COLUMNS.map((col) => (
                <th key={col} className={styles.headCol}>
                  {maturityColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entity, cells }) => {
              const isSelected = selectedNodeId === entity.id;
              return (
                <tr key={entity.id}>
                  <th
                    scope="row"
                    className={[
                      styles.entityCell,
                      isSelected ? styles.entitySelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className={styles.entityBtn}
                      onClick={() => onSelect(entity.id)}
                    >
                      <span
                        className={styles.entityDot}
                        style={{ background: STATUS_COLORS[entity.status] }}
                        aria-hidden="true"
                      />
                      <span className={styles.entityLabel}>
                        {entity.label}
                      </span>
                      {entity.fields ? (
                        <span className={styles.entityCount}>
                          {entity.fields.length}
                        </span>
                      ) : null}
                    </button>
                  </th>
                  {cells.map((cell, i) => {
                    const col = MATURITY_COLUMNS[i]!;
                    const tooltip = cell.nextStep ?? STATUS_LABELS[cell.status];
                    const handleClick = () => {
                      if (cell.sourceNodeId) onSelect(cell.sourceNodeId);
                      else onSelect(entity.id);
                    };
                    return (
                      <td
                        key={`${entity.id}-${col}`}
                        className={styles.cellWrap}
                      >
                        <button
                          type="button"
                          className={styles.cell}
                          style={{
                            background: `${STATUS_COLORS[cell.status]}33`,
                            borderColor: `${STATUS_COLORS[cell.status]}aa`,
                          }}
                          onClick={handleClick}
                          title={tooltip}
                          aria-label={`${entity.label} · ${maturityColumnLabel(col)} · ${STATUS_LABELS[cell.status]}`}
                        >
                          <span
                            className={styles.cellDot}
                            style={{
                              background: STATUS_COLORS[cell.status],
                            }}
                            aria-hidden="true"
                          />
                          <span className={styles.cellLabel}>
                            {STATUS_LABELS[cell.status]}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

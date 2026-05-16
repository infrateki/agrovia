'use client';

import { X, FileCode2, Hash, Workflow } from 'lucide-react';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  LAYER_LABELS,
} from '@/lib/architecture/schema-map';
import {
  getNode,
  getConsumers,
  getConsumedBy,
  getExposedTo,
} from '@/lib/architecture/helpers';
import styles from './ArchNodeDetailPanel.module.css';

interface Props {
  nodeId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function ArchNodeDetailPanel({ nodeId, onClose, onNavigate }: Props) {
  const node = getNode(nodeId);
  if (!node) {
    return (
      <aside className={styles.panel} role="complementary">
        <header className={styles.head}>
          <h3 className={styles.title}>Nodo desconocido</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>
        <p className={styles.empty}>
          El id <code>{nodeId}</code> no está en el registry.
        </p>
      </aside>
    );
  }

  const consumes = getConsumers(node.id);
  const exposes = getExposedTo(node.id);
  const consumedBy = getConsumedBy(node.id);

  return (
    <aside className={styles.panel} role="complementary" aria-label={node.label}>
      <header className={styles.head}>
        <div className={styles.headInner}>
          <span
            className={styles.dot}
            style={{
              background: STATUS_COLORS[node.status],
              boxShadow: `0 0 8px ${STATUS_COLORS[node.status]}`,
            }}
            aria-hidden="true"
          />
          <div>
            <p className={styles.eyebrow}>
              {LAYER_LABELS[node.layer]} · {STATUS_LABELS[node.status]}
              {node.ownerPhase ? ` · Phase ${node.ownerPhase}` : ''}
            </p>
            <h3 className={styles.title}>{node.label}</h3>
          </div>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </header>

      <div className={styles.body}>
        <p className={styles.description}>{node.description}</p>

        {node.tech && (
          <div className={styles.meta}>
            <Hash size={11} strokeWidth={1.6} aria-hidden="true" />
            <span>{node.tech}</span>
          </div>
        )}

        {node.filePath && (
          <div className={styles.meta}>
            <FileCode2 size={11} strokeWidth={1.6} aria-hidden="true" />
            <code className={styles.path}>{node.filePath}</code>
          </div>
        )}

        {node.nextStep && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Próximo paso</h4>
            <p className={styles.nextStep}>
              <Workflow size={11} strokeWidth={1.6} aria-hidden="true" />
              <span>{node.nextStep}</span>
            </p>
          </section>
        )}

        {node.fields && node.fields.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Campos ({node.fields.length})
            </h4>
            <table className={styles.fieldsTable}>
              <thead>
                <tr>
                  <th>name</th>
                  <th>type</th>
                  <th>source</th>
                </tr>
              </thead>
              <tbody>
                {node.fields.map((f) => (
                  <tr key={f.name}>
                    <td>
                      <code className={styles.fieldName}>
                        {f.notes?.includes('PK') ? '🔑 ' : ''}
                        {f.notes?.match(/→\s*([A-Z][A-Za-z]+)/)
                          ? '→ '
                          : ''}
                        {f.name}
                        {!f.required ? '?' : ''}
                      </code>
                    </td>
                    <td>
                      <code className={styles.fieldType}>{f.type}</code>
                    </td>
                    <td>
                      <span className={styles.fieldSource}>{f.source}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {consumes.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Consume ({consumes.length})
            </h4>
            <ul className={styles.linkList}>
              {consumes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => onNavigate(n.id)}
                  >
                    <span
                      className={styles.linkDot}
                      style={{ background: STATUS_COLORS[n.status] }}
                      aria-hidden="true"
                    />
                    <span>{n.label}</span>
                    <span className={styles.linkLayer}>
                      {LAYER_LABELS[n.layer]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {exposes.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Expone para ({exposes.length})
            </h4>
            <ul className={styles.linkList}>
              {exposes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => onNavigate(n.id)}
                  >
                    <span
                      className={styles.linkDot}
                      style={{ background: STATUS_COLORS[n.status] }}
                      aria-hidden="true"
                    />
                    <span>{n.label}</span>
                    <span className={styles.linkLayer}>
                      {LAYER_LABELS[n.layer]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {consumedBy.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Consumido por ({consumedBy.length})
            </h4>
            <ul className={styles.linkList}>
              {consumedBy.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => onNavigate(n.id)}
                  >
                    <span
                      className={styles.linkDot}
                      style={{ background: STATUS_COLORS[n.status] }}
                      aria-hidden="true"
                    />
                    <span>{n.label}</span>
                    <span className={styles.linkLayer}>
                      {LAYER_LABELS[n.layer]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

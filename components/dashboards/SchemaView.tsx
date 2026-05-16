'use client';

import { useCallback, useState } from 'react';
import { SchemaToolbar, type SchemaMode } from '@/components/schema/SchemaToolbar';
import { StackMode } from '@/components/schema/StackMode';
import { MaturityMode } from '@/components/schema/MaturityMode';
import { ErdMode } from '@/components/schema/ErdMode';
import { FlowMode } from '@/components/schema/FlowMode';
import { ArchNodeDetailPanel } from '@/components/schema/ArchNodeDetailPanel';
import styles from './SchemaView.module.css';

export function SchemaView() {
  const [mode, setMode] = useState<SchemaMode>('stack');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedNodeId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className={styles.root}>
      <SchemaToolbar mode={mode} onModeChange={setMode} />

      <div className={styles.body}>
        {mode === 'stack' && (
          <StackMode
            selectedNodeId={selectedNodeId}
            onSelect={handleSelect}
          />
        )}
        {mode === 'erd' && (
          <ErdMode
            selectedNodeId={selectedNodeId}
            onSelect={handleSelect}
          />
        )}
        {mode === 'flow' && (
          <FlowMode
            selectedNodeId={selectedNodeId}
            onSelect={handleSelect}
          />
        )}
        {mode === 'maturity' && (
          <MaturityMode
            selectedNodeId={selectedNodeId}
            onSelect={handleSelect}
          />
        )}
      </div>

      {selectedNodeId && (
        <ArchNodeDetailPanel
          nodeId={selectedNodeId}
          onClose={handleClose}
          onNavigate={handleSelect}
        />
      )}
    </div>
  );
}

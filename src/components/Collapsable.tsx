import { IconButton } from '@grafana/ui';
import React, { ReactNode, useState } from 'react';

interface Props {
  label: ReactNode;
  onRemove: () => void;
  children: ReactNode;
  isOpen?: boolean;
  color?: string;
}

export function Collapsable({
  label,
  children,
  isOpen = false,
  color = '#307868',
  onRemove,
}: Props) {
  const [open, setOpen] = useState<boolean>(isOpen);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          padding: 4,
          display: 'flex',
          background: color,
          justifyContent: 'space-between',
          marginBottom: 10,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ margin: 4 }}>{label}</div>
        </div>
        <div>
          <IconButton style={{ margin: 4 }} name={'trash-alt'} onClick={() => onRemove()} />
          <IconButton
            style={{ margin: 4 }}
            name={open ? 'angle-up' : 'angle-down'}
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>
      {open && <div style={{ marginLeft: 20 }}>{children}</div>}
    </div>
  );
}

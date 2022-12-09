import { Switch} from '@grafana/ui';
import React from 'react';

interface Props {
  state: boolean
  onToggle: () => void;
}

export function SwitchControl({state, onToggle}: Props) {
  return (
      <Switch
        value={state}
        onClick={() => onToggle()}
      />
  );
}

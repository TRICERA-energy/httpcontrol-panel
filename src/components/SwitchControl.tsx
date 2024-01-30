import { Switch } from '@grafana/ui';
import React from 'react';

interface Props {
  state: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function SwitchControl({ state, disabled, onToggle }: Props) {
  return <Switch disabled={disabled} value={state} onClick={() => onToggle()} />;
}

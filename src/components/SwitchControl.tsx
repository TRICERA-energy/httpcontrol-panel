import { Switch} from '@grafana/ui';
import React from 'react';
import { ControlProps } from 'types';

interface Props {
  state: boolean
  control: ControlProps;
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

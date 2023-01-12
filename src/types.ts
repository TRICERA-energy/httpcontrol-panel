import { IconName } from '@grafana/data';

export interface HTTPControlOptions {
  connection: ConnectionProps;
  groups: GroupProps[];
}

export interface ConnectionProps {
  listenPath: string;
  listenPathEnabled: boolean;
}

export const availableControlIndex = {
  'button': true,
  'switch': true,
  'input': true,
  'slider': true,
}

export type ControlType = keyof typeof availableControlIndex

export interface ControlProps {
  type: ControlType;
  name: string;
  postPath: string;
  values: string[];
  payload: string;
  listenPath: string;
  color: string;
  icon: IconName;
}

export interface GroupProps {
  name: string;
  controls: ControlProps[];
  color: string;
  labelWidth: number
}

export interface ErrorProps {
  title: string;
  timestamp?: string;
  error: string;
}

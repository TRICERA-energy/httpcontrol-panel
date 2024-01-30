import { IconName } from '@grafana/data';

export interface HTTPControlOptions {
  datasource: DatasourceProps;
  groups: GroupProps[];
}

export interface DatasourceProps {
  datasource?: string;
}

export const availableControlIndex = {
  button: true,
  switch: true,
  input: true,
  slider: true,
};

export type ControlType = keyof typeof availableControlIndex;

export interface ControlProps {
  type: ControlType;
  name: string;
  values: string[];
  query: string;
  color: string;
  icon: IconName;
}

export interface GroupProps {
  name: string;
  controls: ControlProps[];
  color: string;
  labelWidth: number;
}

export interface ErrorProps {
  title: string;
  timestamp?: string;
  error: string;
}

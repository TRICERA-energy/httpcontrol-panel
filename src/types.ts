import { IconName } from '@grafana/data';
import { MqttClient } from 'mqtt';

export interface MQTTOptions {
  connection: ConnectionOptions;
  groups: GroupProps[];
}

type Protocol = 'ws' | 'wss' | 'mqtt' | 'mqtts';

export interface ConnectionOptions {
  protocol: Protocol;
  server: string;
  port: string;
  user: string;
  password: string;
  subscribe: string;
  client: MqttClient;
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
  publish: string;
  values: string[];
  path: string;
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

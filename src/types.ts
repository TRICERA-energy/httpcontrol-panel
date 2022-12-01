import { MqttClient } from 'mqtt';

export interface MQTTOptions {
  connection: ConnectionOptions;
  groups: GroupProps[];
}

type Protocol = 'ws' | 'wss';

export interface ConnectionOptions {
  protocol: Protocol;
  server: string;
  port: string;
  user: string;
  password: string;
  subscribe: string;
  client: MqttClient;
}

export interface ControlProps {
  type: 'button' | 'switch';
  name: string;
  publish: string;
  values: string[];
  path: string;
  color: string;
}

export interface GroupProps {
  name: string;
  controls: ControlProps[];
  color: string;
}

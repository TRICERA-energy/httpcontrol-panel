import { PanelPlugin } from '@grafana/data';
import { MQTTOptions } from './types';
import { MQTTPanel } from './editors/MQTTPanel';
import { ConnectionEditor } from 'editors/ConnectionEditor';
import { GroupEditor } from 'editors/GroupEditor';

export const plugin = new PanelPlugin<MQTTOptions>(MQTTPanel).setPanelOptions((builder) => {
  return builder
    .addCustomEditor({
      id: 'connection',
      path: 'connection',
      name: 'Connection',
      editor: ConnectionEditor,
      defaultValue: {
        protocol: 'ws',
        server: '',
        port: '',
        user: '',
        password: '',
        subscribe: '',
        publish: '',
        client: {},
      },
    })
    .addCustomEditor({
      id: 'groups',
      path: 'groups',
      name: 'Groups',
      editor: GroupEditor,
      defaultValue: [],
    });
});

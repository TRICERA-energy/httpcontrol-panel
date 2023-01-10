import { PanelPlugin } from '@grafana/data';
import { HTTPControlOptions } from './types';
import { HTTPControlPanel } from './editors/HTTPControlPanel';
import { GroupEditor } from './editors/GroupEditor';
import { ConnectionEditor } from './editors/ConnectionEditor';

export const plugin = new PanelPlugin<HTTPControlOptions>(HTTPControlPanel).setPanelOptions((builder) => {
  return builder
    .addCustomEditor({
      id: 'connection',
      path: 'connection',
      name: 'Connection',
      editor: ConnectionEditor,
      defaultValue: {},
    })
    .addCustomEditor({
      id: 'groups',
      path: 'groups',
      name: 'Groups',
      editor: GroupEditor,
      defaultValue: [],
    });
});

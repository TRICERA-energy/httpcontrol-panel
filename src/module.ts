import { PanelPlugin } from '@grafana/data';
import { HTTPControlOptions } from './types';
import { HTTPControlPanel } from './editors/HTTPControlPanel';
import { GroupEditor } from './editors/GroupEditor';
import { DatasourceEditor } from './editors/DatasourceEditor';

export const plugin = new PanelPlugin<HTTPControlOptions>(HTTPControlPanel).setPanelOptions(
  (builder) => {
    return builder
      .addCustomEditor({
        id: 'datasource',
        path: 'datasource',
        name: 'datasource',
        editor: DatasourceEditor,
        defaultValue: {},
      })
      .addCustomEditor({
        id: 'groups',
        path: 'groups',
        name: 'Groups',
        editor: GroupEditor,
        defaultValue: [],
      });
  }
);

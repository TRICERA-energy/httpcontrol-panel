import React, { FC, useEffect, useState } from 'react';
import { InlineField, Select } from '@grafana/ui';
import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { DatasourceProps } from 'types';
import { getBackendSrv } from '@grafana/runtime';

export const DatasourceEditor: FC<StandardEditorProps<DatasourceProps>> = ({ value, onChange }) => {
  const [datasource, setDatasource] = useState<DatasourceProps>(value);
  const tooltips = getTooltips();
  const [elems, setElems] = useState<Array<SelectableValue<string>>>();

  useEffect(() => {
    let cancel = false;
    const fetchData = async () => {
      const ds = await getBackendSrv().get('/api/datasources');
      if (!cancel) {
        setElems(ds.map((i: any) => ({ label: i.name, value: i.name, name: i.name })));
      }
    };
    fetchData();
    return (): void => {
      cancel = true;
    };
  }, []);

  return (
    <>
      <InlineField label="Datasource" tooltip={tooltips.datasource}>
        <Select
          onChange={(e: SelectableValue<string>) => {
            console.log(e.value);
            setDatasource({ datasource: e.value });
            onChange({ datasource: e.value });
          }}
          value={datasource.datasource}
          options={elems}
        />
      </InlineField>
    </>
  );
};

function getTooltips() {
  return {
    datasource: <p>The datasource to query too.</p>,
  };
}

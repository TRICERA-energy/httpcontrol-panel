import React, { FormEvent, useState } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { ConnectionProps } from 'types';

export const ConnectionEditor: React.FC<StandardEditorProps<ConnectionProps>> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<ConnectionProps>(value);

  const onChangeListenPath = (event: FormEvent<HTMLInputElement>) => {
    options.listenPath = event.currentTarget.value;
    setOptions({ ...options });
  };

  const onBlur = () => {
    onChange(options);
    setOptions({ ...options });
  };

  return (
    <>
      <InlineField label={'API Listen Path'} labelWidth={14} grow={true}>
        <Input
          value={options.listenPath}
          onChange={(event) => onChangeListenPath(event)}
          onBlur={onBlur}
        />
      </InlineField>
    </>
  );
};

import React, { FormEvent, useState } from 'react';
import { Button, InlineField, Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { ConnectionProps } from 'types';

export const ConnectionEditor: React.FC<StandardEditorProps<ConnectionProps>> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<ConnectionProps>(value);
  const tooltips = getTooltips();

  const onChangeListenPath = (event: FormEvent<HTMLInputElement>) => {
    options.listenPath = event.currentTarget.value;
    setOptions({ ...options });
  };

  const onToggleListenPath = () => {
    options.listenPathEnabled = !options.listenPathEnabled;
    setOptions({ ...options });
    onBlur();
  };

  const onBlur = () => {
    onChange(options);
    setOptions({ ...options });
  };

  return (
    <>
      <InlineField
        label={'API Listen Path'}
        labelWidth={16}
        grow={true}
        tooltip={tooltips.apiListenPath}
      >
        <Input
          value={options.listenPath}
          onChange={(event) => onChangeListenPath(event)}
          onBlur={onBlur}
        />
      </InlineField>
      <Button
        onClick={onToggleListenPath}
        variant={options.listenPathEnabled ? 'destructive' : 'primary'}
      >
        {!options.listenPathEnabled ? 'Enable' : 'Disable'}
      </Button>
    </>
  );
};

function getTooltips() {
  return {
    apiListenPath: (
      <p>
        An API path to request data each second. This is useful to sync states of switches or
        sliders
      </p>
    ),
  };
}

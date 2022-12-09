import React, { FormEvent, useEffect, useState } from 'react';
import { Select, InlineField, Input, Icon, IconButton } from '@grafana/ui';
import { SelectableValue, StandardEditorProps, toOption } from '@grafana/data';
import { ConnectionOptions } from 'types';
import { homedir } from 'os';
import { AES, enc } from 'crypto-js';
import { css } from '@emotion/css';
import { connectMQTT } from 'backend/mqttHandler';

export const ConnectionEditor: React.FC<StandardEditorProps<ConnectionOptions>> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<ConnectionOptions>(value);
  const [unsecure, setUnsecure] = useState<string>(
    AES.decrypt(options.password, homedir()).toString(enc.Utf8)
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(options.client?.connected);
  const selectProtocol = ['ws', 'wss'].map(toOption);
  const style = getStyle();

  useEffect(() => {
    onBlur();

    if (options.client.on) {
      options.client.on('reconnect', onConnectionLost);
      options.client.on('connect', onConnect);
    }

    return () => {
      if (options.client.off) {
        options.client.off('reconnect', onConnectionLost);
        options.client.off('connect', onConnect);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProtocolChange = (value: SelectableValue<string>) => {
    if (value.value === 'ws' || value.value === 'wss') {
      setOptions({ ...options, protocol: value.value });
    }
  };

  type OptionsName = 'server' | 'port' | 'user' | 'subscribe';
  const onChangeStringOption = (event: FormEvent<HTMLInputElement>, optionsName: OptionsName) => {
    options[optionsName] = event.currentTarget.value;
    setOptions({ ...options });
  };

  const onChangePassword = (event: FormEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      password: AES.encrypt(event.currentTarget.value, homedir()).toString(),
    });
    setUnsecure(event.currentTarget.value);
  };

  const onBlur = () => {
    options.client = connectMQTT(options);

    onChange(options);
    setOptions({ ...options });
  };

  const onConnectionLost = () => {
    setConnected(false);
  };

  const onConnect = () => {
    setConnected(true);
  };

  return (
    <>
      <InlineField label={'Protocol'} labelWidth={14} grow={true}>
        <Select
          options={selectProtocol}
          value={options.protocol}
          onChange={onProtocolChange}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Server'} labelWidth={14} grow={true}>
        <Input
          value={options.server}
          onChange={(event) => onChangeStringOption(event, 'server')}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Server Port'} labelWidth={14} grow={true}>
        <Input
          value={options.port}
          onChange={(event) => onChangeStringOption(event, 'port')}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'User'} labelWidth={14} grow={true}>
        <Input
          value={options.user}
          onChange={(event) => onChangeStringOption(event, 'user')}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Password'} labelWidth={14} grow={true}>
        <div className={style.password}>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={unsecure}
            onChange={onChangePassword}
            onBlur={onBlur}
          />
          {!!unsecure.length && (
            <IconButton
              name={'eye'}
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
            />
          )}
        </div>
      </InlineField>
      <InlineField label={'Subscribe Topic'} labelWidth={14} grow={true}>
        <Input
          value={options.subscribe}
          onChange={(event) => onChangeStringOption(event, 'subscribe')}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Connected'} labelWidth={14} className={style.connected} grow={true}>
        <Icon name={connected ? 'check' : 'fa fa-spinner'} />
      </InlineField>
    </>
  );
};

function getStyle() {
  return {
    password: css`
      display: flex;
      align-items: center;
      column-gap: 8px;
    `,
    connected: css`
      align-items: center;
    `,
  };
}

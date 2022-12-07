import React, { FormEvent, useEffect, useState } from 'react';
import { Select, InlineField, Input, SecretInput, Icon } from '@grafana/ui';
import { SelectableValue, StandardEditorProps, toOption } from '@grafana/data';
import { ConnectionOptions } from 'types';
import { homedir } from 'os';
import { AES, enc } from 'crypto-js';
import { connect, IClientOptions, MqttClient } from 'mqtt';

export const ConnectionEditor: React.FC<StandardEditorProps<ConnectionOptions>> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<ConnectionOptions>(value);
  const [unsecure, setUnsecure] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(options.client?.connected);
  const selectProtocol = ['ws', 'wss'].map(toOption);

  useEffect(() => {
    onBlur();

    return () => {};
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

  const onResetPassword = () => {
    setOptions({ ...options, password: '' });
    setUnsecure('');
  };

  const onBlur = () => {
    options.client = connectMQTT();
    onChange(options);
    setOptions({ ...options });
  };

  const connectMQTT = (): MqttClient => {
    // kill old client
    if (options.client.end) {
      options.client.end(true);
    }

    let optionsMqtt: IClientOptions = {};
    optionsMqtt.host = options.server;
    optionsMqtt.port = Number(options.port);
    optionsMqtt.protocol = options.protocol;

    if (options.user && options.password) {
      optionsMqtt.username = options.user;
      optionsMqtt.password = AES.decrypt(options.password, homedir()).toString(enc.Utf8);
    }

    let client = connect(optionsMqtt);

    client.on('reconnect', onConnectionLost);
    client.on('connect', onConnect);
    client.subscribe(options.subscribe);

    return client;
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
        <SecretInput
          isConfigured={false}
          onReset={onResetPassword}
          value={unsecure}
          onChange={onChangePassword}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Subscribe Topic'} labelWidth={14} grow={true}>
        <Input
          value={options.subscribe}
          onChange={(event) => onChangeStringOption(event, 'subscribe')}
          onBlur={onBlur}
        />
      </InlineField>
      <InlineField label={'Connected'} labelWidth={14} style={{ alignItems: 'center' }} grow={true}>
        <Icon name={connected ? 'check' : 'fa fa-spinner'}/>
      </InlineField>
    </>
  );
};

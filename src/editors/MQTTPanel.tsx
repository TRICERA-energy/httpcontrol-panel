import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { ControlProps, GroupProps, MQTTOptions } from 'types';
import {
  CustomScrollbar,
  Icon,
  InlineField,
  InlineFieldRow,
  Tab,
  TabContent,
  TabsBar,
} from '@grafana/ui';
import { get } from 'lodash';
import { SwitchControl } from 'components/SwitchControl';
import { ButtonControl } from 'components/ButtonControl';
import { TextInputControl } from 'components/TextInputControl';
import { ControlContainer } from 'components/ControlContainer';
import { SliderControl } from 'components/SliderControl';
import { css } from '@emotion/css';
import { connectMQTT } from 'backend/mqttHandler';
import { ErrorLog } from 'components/ErrorLog';
import { setError } from 'backend/errorHandler';

interface Props extends PanelProps<MQTTOptions> {}
interface SwitchState {
  keyGroup: number;
  keyControl: number;
  stateSwitch?: boolean;
  stateSlider?: number;
}

interface TabState {
  label: string;
  key: string;
  active: boolean;
  color: string;
}

export const MQTTPanel: React.FC<Props> = ({ options, onOptionsChange }) => {
  const groups = options.groups;
  const connection = options.connection;

  const [state, setState] = useState<SwitchState[]>([]);
  const [tabState, setTabState] = useState<TabState[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const style = getStyle();

  useEffect(() => {
    tryConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTabState([
      ...groups.map((group: GroupProps, key: number) => {
        return { label: group.name, key: `Tab-${key}`, active: !key, color: group.color };
      }),
      { label: 'Errors', key: `Tab-${groups.length}`, active: false, color: 'red' },
    ]);

    return () => {};
  }, [groups]);

  useEffect(() => {
    if (connection.client.on) {
      connection.client.on('message', onMessageMQTT);
      connection.client.on('reconnect', onConnectionLost);
      connection.client.on('connect', onConnect);
    }

    return () => {
      if (connection.client.off) {
        connection.client.off('message', onMessageMQTT);
        connection.client.off('reconnect', onConnectionLost);
        connection.client.off('connect', onConnect);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  const findStateIndex = (keyGroup: number, keyControl: number): number => {
    return state.findIndex(
      (state: SwitchState) => state.keyGroup === keyGroup && state.keyControl === keyControl
    );
  };

  const getSwitchState = (keyGroup: number, keyControl: number): boolean => {
    const index = findStateIndex(keyGroup, keyControl);
    return state[index]?.stateSwitch ?? false;
  };

  const getSliderState = (keyGroup: number, keyControl: number): number => {
    const index = findStateIndex(keyGroup, keyControl);
    return state[index]?.stateSlider || Number(groups[keyGroup].controls[keyControl].values[0]);
  };

  const setSwitchState = (keyGroup: number, keyControl: number, value?: boolean): boolean => {
    const index = findStateIndex(keyGroup, keyControl);

    if (index > -1) {
      state[index].stateSwitch = value !== undefined ? value : !state[index].stateSwitch;
      return state[index].stateSwitch!;
    } else {
      state.push({ keyGroup, keyControl, stateSwitch: value !== undefined ? value : true });
      return state[state.length - 1].stateSwitch!;
    }
  };

  const setSliderState = (keyGroup: number, keyControl: number, value?: number) => {
    const index = findStateIndex(keyGroup, keyControl);

    if (index > -1) {
      state[index].stateSlider = value !== undefined ? value : state[index].stateSlider;
    } else {
      state.push({
        keyGroup,
        keyControl,
        stateSlider:
          value !== undefined ? value : Number(groups[keyGroup].controls[keyControl].values[0]),
      });
    }
  };

  const publishMQTT = (publish: string, value: string) => {
    if (publish) {
      connection.client.publish(publish, value, (error: Error | undefined) => {
        if (error) {
          setError({ title: 'Publish', error: error.toString() });
        }
      });
    } else {
      setError({ title: 'Publish', error: 'Can not publish to empty topic!' });
    }
  };

  const onToggleSwitch = (
    publish: string,
    keyGroup: number,
    keyControl: number,
    values: string[]
  ) => {
    const newState = setSwitchState(keyGroup, keyControl);
    setState([...state]);
    publishMQTT(publish, values[newState ? 1 : 0]);
  };

  const onSliderChange = (publish: string, keyGroup: number, keyControl: number, value: number) => {
    setSliderState(keyGroup, keyControl, value);
    setState([...state]);
    publishMQTT(publish, String(value));
  };

  const onMessageMQTT = (topic: string, message: string) => {
    if (topic !== connection.subscribe) {
      return;
    }

    if (!message) {
      return;
    }

    try {
      const obj = JSON.parse(message);
      groups.forEach((group: GroupProps, keyGroup: number) => {
        group.controls.forEach((control: ControlProps, keyControl: number) => {
          if (control.type !== 'switch' && control.type !== 'slider') {
            return;
          }

          const value = get(obj, control.path);
          if (value === undefined) {
            return;
          }

          if (control.type === 'switch') {
            setSwitchState(keyGroup, keyControl, Boolean(value));
            return;
          }

          setSliderState(keyGroup, keyControl, Number(value));
        });
      });
      setState([...state]);
    } catch (error) {
      setError({title: 'Subscribe', error: `${error}`})
    }
  };

  const onConnectionLost = () => {
    setConnected(false);
  };

  const onConnect = () => {
    setConnected(true);
  };

  const tryConnect = () => {
    if (connection.server) {
      connection.client = connectMQTT(connection);
    }
    onOptionsChange(options);
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField label={'Connected'} labelWidth={10} className={style.connected} grow={true}>
          <Icon name={connected ? 'check' : 'fa fa-spinner'} />
        </InlineField>
      </InlineFieldRow>
      <TabsBar>
        {tabState.map((tab, index) => {
          return (
            <Tab
              key={tab.key}
              label={tab.label}
              active={tab.active}
              style={{ color: tab.color }}
              onChangeTab={() =>
                setTabState(tabState.map((tab, idx) => ({ ...tab, active: idx === index })))
              }
            />
          );
        })}
      </TabsBar>
      <TabContent className={style.container}>
        {/* @ts-ignore */}
        <CustomScrollbar>
          {!!groups.length &&
            groups.map((group: GroupProps, keyGroup: number) => {
              return (
                <div key={keyGroup}>
                  {tabState[keyGroup] && tabState[keyGroup].active && (
                    <>
                      {!!group.controls.length &&
                        group.controls.map((control: ControlProps, keyControl: number) => {
                          if (control.type === 'button') {
                            return (
                              <ControlContainer
                                control={control}
                                key={keyControl}
                                labelWidth={group.labelWidth}
                              >
                                <ButtonControl
                                  control={control}
                                  onClick={() => publishMQTT(control.publish, control.values[0])}
                                />
                              </ControlContainer>
                            );
                          } else if (control.type === 'switch') {
                            return (
                              <ControlContainer
                                control={control}
                                key={keyControl}
                                labelWidth={group.labelWidth}
                              >
                                <SwitchControl
                                  state={getSwitchState(keyGroup, keyControl)}
                                  onToggle={() =>
                                    onToggleSwitch(
                                      control.publish,
                                      keyGroup,
                                      keyControl,
                                      control.values
                                    )
                                  }
                                />
                              </ControlContainer>
                            );
                          } else if (control.type === 'input') {
                            return (
                              <ControlContainer
                                control={control}
                                key={keyControl}
                                labelWidth={group.labelWidth}
                              >
                                <TextInputControl
                                  control={control}
                                  onSend={(value: string) => publishMQTT(control.publish, value)}
                                />
                              </ControlContainer>
                            );
                          } else if (control.type === 'slider') {
                            return (
                              <ControlContainer
                                control={control}
                                key={keyControl}
                                labelWidth={group.labelWidth}
                              >
                                <SliderControl
                                  state={getSliderState(keyGroup, keyControl)}
                                  control={control}
                                  onChange={(value: number) =>
                                    onSliderChange(control.publish, keyGroup, keyControl, value)
                                  }
                                />
                              </ControlContainer>
                            );
                          } else {
                            return <div key={keyControl}></div>;
                          }
                        })}
                    </>
                  )}
                </div>
              );
            })}
          {tabState[groups.length] && tabState[groups.length].active && <ErrorLog />}
        </CustomScrollbar>
      </TabContent>
    </>
  );
};

function getStyle() {
  return {
    container: css`
      height: calc(100% - 80px);
    `,
    connected: css`
      column-gap: 8xp;
      align-items: center;
    `,
  };
}

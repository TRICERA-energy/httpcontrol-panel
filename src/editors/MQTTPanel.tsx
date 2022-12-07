import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { ControlProps, GroupProps, MQTTOptions } from 'types';
import { Tab, TabContent, TabsBar } from '@grafana/ui';
import { get } from 'lodash';
import { SwitchControl } from 'components/SwitchControl';
import { ButtonControl } from 'components/ButtonControl';
import { TextInputControl } from 'components/TextInputControl';
import { ControlContainer } from 'components/ControlContainer';

interface Props extends PanelProps<MQTTOptions> {}
interface SwitchState {
  keyGroup: number;
  keyControl: number;
  state: boolean;
}

interface TabState {
  label: string;
  key: string;
  active: boolean;
  color: string;
}

export const MQTTPanel: React.FC<Props> = ({ options }) => {
  const groups = options.groups;
  const connection = options.connection;

  const [switchState, setSwitchState] = useState<SwitchState[]>([]);
  const [tabState, setTabState] = useState<TabState[]>([]);

  useEffect(
    () => {
      setTabState([
        ...groups.map((group: GroupProps, key: number) => {
          return { label: group.name, key: `Tab-${key}`, active: !key, color: group.color };
        }),
      ]);

      return () => {}
    }, [groups]);

  useEffect(() => {
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
            if (control.type !== 'switch') {
              return;
            }

            const value = get(obj, control.path);
            if (value === undefined) {
              return;
            }

            setState(keyGroup, keyControl, Boolean(value));
          });
        });
        setSwitchState([...switchState]);
      } catch (error) {
        console.error(error);
      }
    };

    if (connection.client.on) {
      connection.client.on('message', onMessageMQTT);
    }

    return () => {
      if (connection.client.off) {
        connection.client.off('message', onMessageMQTT);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findStateIndex = (keyGroup: number, keyControl: number): number => {
    return switchState.findIndex(
      (state: SwitchState) => state.keyGroup === keyGroup && state.keyControl === keyControl
    );
  };

  const getState = (keyGroup: number, keyControl: number): boolean => {
    const index = findStateIndex(keyGroup, keyControl);
    return switchState[index]?.state ?? false;
  };

  const setState = (keyGroup: number, keyControl: number, value?: boolean): boolean => {
    const index = findStateIndex(keyGroup, keyControl);

    if (index > -1) {
      switchState[index].state = value !== undefined ? value : !switchState[index].state;
      return switchState[index].state;
    } else {
      switchState.push({ keyGroup, keyControl, state: value !== undefined ? value : true });
      return switchState[switchState.length - 1].state;
    }
  };

  const publishMQTT = (publish: string, value: string) => {
    connection.client.publish(publish, value, (error: any) => {
      if (error) {
        console.error(error);
      }
    });
  };

  const onToggleSwitch = (
    publish: string,
    keyGroup: number,
    keyControl: number,
    values: string[]
  ) => {
    const state = setState(keyGroup, keyControl);
    setSwitchState([...switchState]);
    publishMQTT(publish, values[state ? 1 : 0]);
  };

  return (
    <>
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
      <TabContent>
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
                                state={getState(keyGroup, keyControl)}
                                control={control}
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
                        } else {
                          return <div key={keyControl}></div>;
                        }
                      })}
                  </>
                )}
              </div>
            );
          })}
      </TabContent>
    </>
  );
};

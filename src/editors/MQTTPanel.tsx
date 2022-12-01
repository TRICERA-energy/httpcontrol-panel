import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { ControlProps, GroupProps, MQTTOptions } from 'types';
import { Button, InlineField, InlineFieldRow, Switch, Tab, TabContent, TabsBar } from '@grafana/ui';

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
  color: string
}

export const MQTTPanel: React.FC<Props> = ({ options }) => {
  const groups = options.groups;
  const connection = options.connection;

  const [switchState, setSwitchState] = useState<SwitchState[]>([]);
  const [tabState, setTabState] = useState<TabState[]>([]);

  useEffect(() => {
    setTabState([
      ...groups.map((group: GroupProps, key: number) => {
        return { label: group.name, key: `Tab-${key}`, active: !key, color: group.color };
      }),
    ]);
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

            const value = obj[control.path];
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
  });

  const findStateIndex = (keyGroup: number, keyControl: number): number => {
    return switchState.findIndex(
      (state: SwitchState) => state.keyGroup === keyGroup && state.keyControl === keyControl
    );
  };

  const getState = (keyGroup: number, keyControl: number): boolean => {
    const index = findStateIndex(keyGroup, keyControl);
    return switchState[index]?.state ?? false;
  };

  const setState = (keyGroup: number, keyControl: number, value?: boolean): SwitchState => {
    const index = findStateIndex(keyGroup, keyControl);

    if (index > -1) {
      switchState[index].state = value !== undefined ? value : !switchState[index].state;
    } else {
      switchState.push({ keyGroup, keyControl, state: value !== undefined ? value : false });
    }

    return switchState[index];
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
              style={{color: tab.color}}
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
                  <InlineFieldRow style={{ columnGap: 10, marginTop: 10 }}>
                    {!!group.controls.length &&
                      group.controls.map((control: ControlProps, keyControl: number) => {
                        if (control.type === 'button') {
                          return (
                            <Button
                              style={{
                                height: 'unset',
                                backgroundColor: control.color,
                                justifyContent: 'center',
                              }}
                              key={keyControl}
                              onClick={() => publishMQTT(control.publish, control.values[0])}
                            >
                              {control.name}
                            </Button>
                          );
                        } else if (control.type === 'switch') {
                          return (
                            <InlineField
                              key={keyControl}
                              label={control.name}
                              style={{
                                alignItems: 'center',
                                border: `1px solid ${control.color}`,
                                padding: 2,
                                margin: 'unset',
                                justifyContent: 'center'
                              }}
                            >
                              <Switch
                                value={getState(keyGroup, keyControl)}
                                onClick={() =>
                                  onToggleSwitch(
                                    control.publish,
                                    keyGroup,
                                    keyControl,
                                    control.values
                                  )
                                }
                              />
                            </InlineField>
                          );
                        } else {
                          return <></>;
                        }
                      })}
                  </InlineFieldRow>
                )}
              </div>
            );
          })}
      </TabContent>
    </>
  );
};

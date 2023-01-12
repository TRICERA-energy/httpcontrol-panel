import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { ControlProps, GroupProps, HTTPControlOptions } from 'types';
import { CustomScrollbar, Tab, TabContent, TabsBar } from '@grafana/ui';
import { SwitchControl } from '../components/SwitchControl';
import { ButtonControl } from '../components/ButtonControl';
import { TextInputControl } from '../components/TextInputControl';
import { ControlContainer } from '../components/ControlContainer';
import { SliderControl } from '../components/SliderControl';
import { css } from '@emotion/css';
import { ErrorLog } from '../components/ErrorLog';
import { setError } from '../backend/errorHandler';
import { getBackendSrv } from '@grafana/runtime';
import { get } from 'lodash';

interface Props extends PanelProps<HTTPControlOptions> {}
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

export const HTTPControlPanel: React.FC<Props> = ({ options, onOptionsChange }) => {
  const groups = options.groups;
  const connection = options.connection;

  const [state, setState] = useState<SwitchState[]>([]);
  const [tabState, setTabState] = useState<TabState[]>([]);
  const style = getStyle();

  useEffect(() => {
    const onListenPath = () => {
      getBackendSrv()
        .get(connection.listenPath)
        .then((payload) => {
          if (!payload) {
            return;
          }

          try {
            groups.forEach((group: GroupProps, keyGroup: number) => {
              group.controls.forEach((control: ControlProps, keyControl: number) => {
                if (
                  (control.type !== 'switch' && control.type !== 'slider') ||
                  !control.listenPath
                ) {
                  return;
                }

                const value = get(payload, control.listenPath);
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
            setState((state) => [...state]);
          } catch (error) {
            setError({ title: 'Listen', error: `${error}` });
          }
        })
        .catch((error) => {
          if (error.status && error.statusText) {
            setError({ title: 'Listen', error: `${error.status} ${error.statusText}` });
          } else {
            setError({ title: 'Listen', error: `${error}` });
          }
        });
    };

    if (connection.listenPath && connection.listenPathEnabled) {
      const interval = setInterval(onListenPath, 1000);

      return () => {
        clearInterval(interval);
      };
    }
    return () => {};

    // eslint-disable-next-line
  }, [connection.listenPath, connection.listenPathEnabled]);

  useEffect(() => {
    setTabState([
      ...groups.map((group: GroupProps, key: number) => {
        return { label: group.name, key: `Tab-${key}`, active: !key, color: group.color };
      }),
      { label: 'Errors', key: `Tab-${groups.length}`, active: false, color: 'red' },
    ]);

    return () => {};
  }, [groups]);

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

  const post = (path: string, value: string, payload: string) => {
    if (!path) {
      setError({ title: 'POST', error: 'Can not POST to empty api url!' });
      return;
    }

    if (payload) {
      const tmpValue = payload.replace('$value', value);

      if (tmpValue !== payload) {
        // hacky way to make json compact
        value = JSON.stringify(JSON.parse(tmpValue));
      } else {
        setError({
          title: 'Payload',
          error:
            'Did not find placeHolder $value in the payload string. Fallback to send only value.',
        });
      }
    }

    getBackendSrv()
      .post(path, value)
      .catch((error) => {
        if (error) {
          setError({ title: 'POST', error: error.toString() });
        }
      });
  };

  const onToggleSwitch = (
    path: string,
    keyGroup: number,
    keyControl: number,
    values: string[],
    payload: string
  ) => {
    const newState = setSwitchState(keyGroup, keyControl);
    setState([...state]);
    post(path, values[newState ? 1 : 0], payload);
  };

  const onSliderChange = (
    path: string,
    keyGroup: number,
    keyControl: number,
    value: number,
    payload: string
  ) => {
    setSliderState(keyGroup, keyControl, value);
    setState([...state]);
    post(path, String(value), payload);
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
                                  onClick={() =>
                                    post(control.postPath, control.values[0], control.payload)
                                  }
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
                                      control.postPath,
                                      keyGroup,
                                      keyControl,
                                      control.values,
                                      control.payload
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
                                  onSend={(value: string) =>
                                    post(control.postPath, value, control.payload)
                                  }
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
                                    onSliderChange(
                                      control.postPath,
                                      keyGroup,
                                      keyControl,
                                      value,
                                      control.payload
                                    )
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

import React, { useEffect, useState } from 'react';
import { PanelProps, AppEvents, DataQueryResponseData } from '@grafana/data';
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
import { getAppEvents, getBackendSrv, getDataSourceSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

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

export const HTTPControlPanel: React.FC<Props> = ({ options, replaceVariables }) => {
  const groups = options.groups;
  const datasource = options.datasource;

  const [state, setState] = useState<SwitchState[]>([]);
  const [tabState, setTabState] = useState<TabState[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const style = getStyle();

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

  const callQuery = async (name: string, value: string, query: string) => {
    setDisabled(true);
    let tmpValue = replaceVariables(query || '{}');
    tmpValue = tmpValue.replace('__VALUE__', value);
    const payload = JSON.parse(tmpValue);

    const ds = await getDataSourceSrv().get(datasource.datasource);
    const appEvents = getAppEvents();
    try {
      const obs = await getBackendSrv().fetch<DataQueryResponseData>({
        method: 'POST',
        url: 'api/ds/query',
        data: {
          queries: [
            {
              datasource: {
                uid: ds.uid,
              },
              refId: '1',
              ...payload,
            },
          ],
        },
      });

      const resp = await lastValueFrom<DataQueryResponseData>(obs);
      const msg = resp.data.results[1].frames[0].data.values[0][0];

      appEvents.publish({
        type: AppEvents.alertSuccess.name,
        payload: [name + ': ' + msg['success'] + ' (' + msg['message'] + ')'],
      });
    } catch (error: any) {
      setError({
        title: `publish of ${name} failed`,
        error: error.data.message,
        timestamp: Date().toString(),
      });
      appEvents.publish({
        type: AppEvents.alertError.name,
        payload: [name + ': ' + error.status + ' (' + error.statusText + ') ' + error.data.message],
      });
    }

    setDisabled(false);
  };

  const onToggleSwitch = (
    name: string,
    keyGroup: number,
    keyControl: number,
    values: string[],
    payload: string
  ) => {
    const newState = setSwitchState(keyGroup, keyControl);
    setState([...state]);
    callQuery(name, values[newState ? 1 : 0], payload);
  };

  const onSliderChange = (
    name: string,
    keyGroup: number,
    keyControl: number,
    value: number,
    payload: string
  ) => {
    setSliderState(keyGroup, keyControl, value);
    setState([...state]);
    callQuery(name, String(value), payload);
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
                                  disabled={disabled}
                                  control={control}
                                  onClick={() =>
                                    callQuery(control.name, control.values[0], control.query)
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
                                  disabled={disabled}
                                  state={getSwitchState(keyGroup, keyControl)}
                                  onToggle={() =>
                                    onToggleSwitch(
                                      control.name,
                                      keyGroup,
                                      keyControl,
                                      control.values,
                                      control.query
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
                                  disabled={disabled}
                                  control={control}
                                  onSend={(value: string) =>
                                    callQuery(control.name, value, control.query)
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
                                  disabled={disabled}
                                  state={getSliderState(keyGroup, keyControl)}
                                  control={control}
                                  onChange={(value: number) =>
                                    onSliderChange(
                                      control.name,
                                      keyGroup,
                                      keyControl,
                                      value,
                                      control.query
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

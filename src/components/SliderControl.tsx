import { css } from '@emotion/css';
import { Input } from '@grafana/ui';
import Slider from 'rc-slider';
import React, { useState } from 'react';
import { ControlProps } from 'types';

interface Props {
  state: number;
  control: ControlProps;
  onChange: (value: number) => void;
}

export function SliderControl({ state, control, onChange }: Props) {
  const style = getStyle();
  const [text, setText] = useState<string>(String(state));

  const onAfterChange = (value: number | number[]) => {
    if (value !== undefined) {
      const tmpValue = Array.isArray(value) ? value[0] : value;
      setText(String(tmpValue));
      onChange(tmpValue);
    }
  };

  return (
    <div className={style.container}>
      <Slider
        className={style.slider}
        value={state}
        min={Number(control.values[0])}
        max={Number(control.values[1])}
        onChange={onAfterChange}
      />
      <Input
        className={style.input}
        value={text}
        onChange={(value) => setText(value.currentTarget.value)}
        onBlur={() => onAfterChange(Number(text))}
      />
    </div>
  );
}

function getStyle() {
  return {
    container: css`
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-right: 4px;
    `,
    slider: css`
      margin-left: 12px;
      margin-right: 12px;

      .rc-slider-rail {
        background-color: #111217;
      }

      .rc-slider-track {
        background-color: #ccccdc;
      }

      .rc-slider-handle {
        background-color: #3d71d9;
        border: unset;
      }

      .rc-slider-handle:hover {
        width: 18px;
        height: 18px;
        margin-top: -7px;
      }

      .rc-slider-handle:active {
        width: 24px;
        height: 24px;
        border: unset;
        box-shadow: unset;
        margin-top: -10px;
      }
    `,
    input: css`
      width: 54px;
      input {
        text-align: center;
      }
    `,
  };
}

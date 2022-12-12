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
  const min = Number(control.values[0])
  const max = Number(control.values[1])

  const [text, setText] = useState<string>(String(state));

  const onAfterChange = (value: number | number[]) => {
    if (value !== undefined) {
      let tmpValue = Array.isArray(value) ? value[0] : value;
      
      if (tmpValue < min) {
        tmpValue = min
      } else if (tmpValue > max) {
        tmpValue = max
      }

      setText(String(tmpValue));
      onChange(tmpValue);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onAfterChange(Number(event.currentTarget.value))
    }
  }

  return (
    <div className={style.container}>
      <Slider
        className={style.slider}
        value={state}
        min={min}
        max={max}
        onChange={onAfterChange}
      />
      <Input
        className={style.input}
        value={text}
        type={'number'}
        onKeyDown={(event) => onKeyDown(event)}
        onWheel={(value) => onAfterChange(Number(value.currentTarget.value))}
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
      width: unset;

      input {
        text-align: center;
      }
    `,
  };
}

import { Input } from '@grafana/ui';
import React, { useState } from 'react';
import { ControlProps } from 'types';
import { css } from '@emotion/css';
import { ButtonControl } from './ButtonControl';

interface Props {
  control: ControlProps;
  onSend: (value: string) => void;
}

export function TextInputControl({ control, onSend }: Props) {
  const [textInput, setTextInput] = useState<string>('');

  const style = getStyle(control.color);

  return (
      <div className={style.container}>
        <Input
          value={textInput}
          onChange={(event) => setTextInput(event.currentTarget.value)}
          className={style.input}
        />
        <ButtonControl control={{...control, icon: 'arrow-right'}} onClick={() => onSend(textInput)} />
      </div>
  );
}

function getStyle(color: string) {
  return {
    container: css`
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-right: 4px;
    `,
    input: css`
      margin-right: 4px;
    `,
    icon: css`
      margin-left: 4px;
      margin-right: 4px;
    `,
  };
}

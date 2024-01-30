import { css } from '@emotion/css';
import { Button, Icon } from '@grafana/ui';
import React from 'react';
import { ControlProps } from 'types';

interface Props {
  disabled: boolean;
  control: ControlProps;
  onClick: () => void;
}

export function ButtonControl({ control, disabled, onClick }: Props) {
  const style = getStyle();

  return (
    <Button disabled={disabled} variant={'secondary'} onClick={onClick} className={style.button}>
      <Icon name={control.icon} />
    </Button>
  );
}

function getStyle() {
  return {
    button: css`
      justify-content: center;
    `,
  };
}

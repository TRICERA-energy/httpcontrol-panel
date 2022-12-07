import { css } from '@emotion/css';
import { InlineField, InlineFieldRow, InlineLabel } from '@grafana/ui';
import React, { ReactNode } from 'react';
import { ControlProps } from 'types';

interface Props {
  control: ControlProps;
  labelWidth?: number | 'auto';
  children: ReactNode;
}

export function ControlContainer({ control, labelWidth = 'auto', children }: Props) {
  const style = getStyle(control.color);

  return (
    <InlineFieldRow className={style.row}>
      <InlineField
        label={
          <InlineLabel width={labelWidth} className={style.label}>
            {control.name}
          </InlineLabel>
        }
        grow={true}
        className={style.field}
      >
        <>{children}</>
      </InlineField>
    </InlineFieldRow>
  );
}

function getStyle(color: string) {
  return {
    row: css`
      margin: 4px;
    `,
    field: css`
      padding: 2px;
      margin: unset;
      align-items: center;
      height: 100%;
    `,
    label: css`
      color: ${color};
    `,
  };
}

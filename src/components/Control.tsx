import React, { FormEvent, useState } from 'react';
import { SelectableValue, toOption } from '@grafana/data';
import { ColorPickerInput, InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';
import { ControlProps } from 'types';
import { Collapsable } from './Collapsable';

interface Props {
  onChange: (control: ControlProps) => void;
  onRemove: () => void;
  value: ControlProps;
}

export function Control({ value, onChange, onRemove }: Props) {
  const [control, setControl] = useState<ControlProps>(value);

  const selectType = ['button', 'switch'].map(toOption);
  const onTypeChange = (value: SelectableValue<string>) => {
    if (value.value === 'button' || value.value === 'switch') {
      control.type = value.value;
      setControl({ ...control });
    }
  };

  type OptionsName = 'name' | 'publish' | 'path';
  const onChangeStringOption = (event: FormEvent<HTMLInputElement>, optionsName: OptionsName) => {
    control[optionsName] = event.currentTarget.value;
    setControl({ ...control });
  };

  const onChangeValue = (event: FormEvent<HTMLInputElement>, index: number) => {
    control.values[index] = event.currentTarget.value;
    setControl({ ...control });
  };

  const onColorChange = (color: string) => {
    control.color = color
    setControl({ ...control });
    onBlur()
  };

  const onBlur = () => {
    onChange(control);
  };

  return (
    <Collapsable
      label={
        <>
          <b>control.name</b>
          <i>{' - (' + control.type + ')'}</i>
        </>
      }
      onRemove={onRemove}
      isOpen={true}
      color={control.color}
    >
      <InlineFieldRow>
        <InlineField label={'Protocol'} labelWidth={14}>
          <Select
            options={selectType}
            value={control.type}
            onChange={onTypeChange}
            onBlur={onBlur}
          />
        </InlineField>
        <InlineField label={'Name'} labelWidth={14}>
          <Input
            value={control.name}
            onChange={(event) => onChangeStringOption(event, 'name')}
            onBlur={onBlur}
          ></Input>
        </InlineField>
        <InlineField label={'Color'} labelWidth={14}>
          <ColorPickerInput 
          value={control.color} 
          onChange={onColorChange}
          />
        </InlineField>
        <InlineField label={'Publish Topic'} labelWidth={14}>
          <Input
            value={control.publish}
            onChange={(event) => onChangeStringOption(event, 'publish')}
            onBlur={onBlur}
          />
        </InlineField>
        {control.type === 'switch' && (
          <InlineField label={'Listen Path'} labelWidth={14}>
            <Input
              value={control.path}
              onChange={(event) => onChangeStringOption(event, 'path')}
              onBlur={onBlur}
            ></Input>
          </InlineField>
        )}
        <InlineField label={control.type === 'switch' ? 'Value Off' : 'Value'} labelWidth={14}>
          <Input
            value={control.values[0]}
            onChange={(event) => onChangeValue(event, 0)}
            onBlur={onBlur}
          ></Input>
        </InlineField>
        {control.type === 'switch' && (
          <InlineField label={'Value On'} labelWidth={14}>
            <Input
              value={control.values[1]}
              onChange={(event) => onChangeValue(event, 1)}
              onBlur={onBlur}
            ></Input>
          </InlineField>
        )}
      </InlineFieldRow>
    </Collapsable>
  );
}

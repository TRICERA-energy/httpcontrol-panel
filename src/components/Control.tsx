import React, { FormEvent, useEffect, useState } from 'react';
import { IconName, SelectableValue, toOption } from '@grafana/data';
import { ColorPickerInput, InlineField, Input, Select } from '@grafana/ui';
import { availableControlIndex, ControlProps, ControlType } from 'types';
import { Collapsable } from './Collapsable';
import { IconPicker } from './IconPicker';

interface Props {
  onChange: (control: ControlProps) => void;
  onRemove: () => void;
  value: ControlProps;
}

export function Control({ value, onChange, onRemove }: Props) {
  const [control, setControl] = useState<ControlProps>(value);

  useEffect(() => {
    setControl(value);
  }, [value]);

  const selectType = Object.keys(availableControlIndex).map(toOption);
  const onTypeChange = (value: SelectableValue<string>) => {
    if (selectType.some((type) => type.value === value.value)) {
      control.type = value.value as ControlType;
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
    control.color = color;
    setControl({ ...control });
    onBlur();
  };

  const onIconChange = (icon: IconName) => {
    control.icon = icon;
    setControl({ ...control });
    onBlur();
  };

  const onBlur = () => {
    onChange(control);
  };

  const getValueLabel = (type: ControlType, valueIndex: number): string => {
    switch(type) {
      case 'slider':
        return valueIndex > 0 ? 'To' : 'From';
      case 'switch':
        return valueIndex > 0 ? 'Value On' : 'Value Off';
      case 'button':
      case 'input':
      default:
        return 'Value';
    }
  }


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
      <InlineField label={'Protocol'} labelWidth={14} grow={true}>
        <Select options={selectType} value={control.type} onChange={onTypeChange} onBlur={onBlur} />
      </InlineField>
      <InlineField label={'Name'} labelWidth={14} grow={true}>
        <Input
          value={control.name}
          onChange={(event) => onChangeStringOption(event, 'name')}
          onBlur={onBlur}
        ></Input>
      </InlineField>
      <InlineField label={'Color'} labelWidth={14} grow={true}>
        <ColorPickerInput value={control.color} onChange={onColorChange} />
      </InlineField>
      {control.type === 'button' && (
        <InlineField label={'Icon'} labelWidth={14} grow={true}>
          <IconPicker icon={control.icon} onChange={onIconChange} />
        </InlineField>
      )}
      <InlineField label={'Publish Topic'} labelWidth={14} grow={true}>
        <Input
          value={control.publish}
          onChange={(event) => onChangeStringOption(event, 'publish')}
          onBlur={onBlur}
        />
      </InlineField>
      {(control.type === 'switch' || control.type === 'slider') && (
        <InlineField label={'Listen Path'} labelWidth={14} grow={true}>
          <Input
            value={control.path}
            onChange={(event) => onChangeStringOption(event, 'path')}
            onBlur={onBlur}
          ></Input>
        </InlineField>
      )}
      {control.type !== 'input' && (
        <InlineField
          label={getValueLabel(control.type, 0)}
          labelWidth={14}
          grow={true}
        >
          <Input
            value={control.values[0]}
            onChange={(event) => onChangeValue(event, 0)}
            onBlur={onBlur}
          ></Input>
        </InlineField>
      )}
      {(control.type === 'switch' || control.type === 'slider') && (
        <InlineField label={getValueLabel(control.type, 1)} labelWidth={14} grow={true}>
          <Input
            value={control.values[1]}
            onChange={(event) => onChangeValue(event, 1)}
            onBlur={onBlur}
          ></Input>
        </InlineField>
      )}
    </Collapsable>
  );
}

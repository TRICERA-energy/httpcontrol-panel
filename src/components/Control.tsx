import React, { FormEvent, useEffect, useState } from 'react';
import { IconName, SelectableValue, toOption } from '@grafana/data';
import { ColorPickerInput, InlineField, Input, Select, TextArea } from '@grafana/ui';
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
  const tooltips = getTooltips();

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

  type OptionsName = 'name';
  const onChangeStringOption = (event: FormEvent<HTMLInputElement>, optionsName: OptionsName) => {
    control[optionsName] = event.currentTarget.value;
    setControl({ ...control });
  };

  const onChangeValue = (event: FormEvent<HTMLInputElement>, index: number) => {
    control.values[index] = event.currentTarget.value;
    setControl({ ...control });
  };

  const onChangeQuery = (event: FormEvent<HTMLTextAreaElement>) => {
    control.query = event.currentTarget.value;
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
    switch (type) {
      case 'slider':
        return valueIndex > 0 ? 'To' : 'From';
      case 'switch':
        return valueIndex > 0 ? 'Value On' : 'Value Off';
      case 'button':
      case 'input':
      default:
        return 'Value';
    }
  };

  return (
    <Collapsable
      label={
        <>
          <b>{control.name}</b>
          <i>{' - (' + control.type + ')'}</i>
        </>
      }
      onRemove={onRemove}
      isOpen={true}
      color={control.color}
    >
      <InlineField label={'Type'} labelWidth={14} grow={true}>
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
      {control.type !== 'input' && (
        <InlineField label={getValueLabel(control.type, 0)} labelWidth={14} grow={true}>
          <Input
            value={control.values[0]}
            onChange={(event) => onChangeValue(event, 0)}
            onBlur={onBlur}
          />
        </InlineField>
      )}
      {(control.type === 'switch' || control.type === 'slider') && (
        <InlineField label={getValueLabel(control.type, 1)} labelWidth={14} grow={true}>
          <Input
            value={control.values[1]}
            onChange={(event) => onChangeValue(event, 1)}
            onBlur={onBlur}
          />
        </InlineField>
      )}
      <InlineField label={'Query'} labelWidth={14} grow={true} tooltip={tooltips.query}>
        <TextArea value={control.query} onChange={onChangeQuery} onBlur={onBlur} />
      </InlineField>
    </Collapsable>
  );
}

function getTooltips() {
  return {
    query: (
      <p>
        A payload wrapped around the value. The value will be insert for the placeholder{' '}
        <i>$value</i>. If <i>$value</i> is not found, only the value without the payload will be
        send
      </p>
    ),
  };
}

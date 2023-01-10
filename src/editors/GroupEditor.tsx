import React, { FormEvent, useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, ColorPickerInput, InlineField, Input } from '@grafana/ui';
import { ControlProps, GroupProps } from 'types';
import { Control } from '../components/Control';
import { Collapsable } from '../components/Collapsable';
import tinycolor from 'tinycolor2';

export const GroupEditor: React.FC<StandardEditorProps<GroupProps[]>> = ({ value, onChange }) => {
  const [groups, setGroups] = useState<GroupProps[]>(value);

  type OptionsName = 'name';
  const onChangeStringOption = (
    event: FormEvent<HTMLInputElement>,
    key: number,
    optionsName: OptionsName
  ) => {
    groups[key][optionsName] = event.currentTarget.value;
    setGroups([...groups]);
  };

  const addGroup = () => {
    groups.push({ name: 'NewGroup', controls: [], color: '#006051', labelWidth: 10 });
    setGroups([...groups]);
    onBlur();
  };

  const removeGroup = (key: number) => {
    groups.splice(key, 1);
    setGroups([...groups]);
    onBlur();
  };

  const addControl = (key: number) => {
    groups[key].controls.push({
      type: 'button',
      name: 'NewControl',
      postPath: '',
      values: ['', ''],
      payload: '',
      listenPath: '',
      color: tinycolor(groups[key].color).lighten(10).toString(),
      icon: 'circle',
    });
    setGroups([...groups]);
    onBlur();
  };

  const removeControl = (keyGroup: number, keyControl: number) => {
    groups[keyGroup].controls.splice(keyControl, 1);
    setGroups([...groups]);
    onBlur();
  };

  const onControlChange = (value: ControlProps, keyGroup: number, keyControl: number) => {
    groups[keyGroup].controls[keyControl] = value;

    let width = 10;
    groups[keyGroup].controls.forEach((control: ControlProps) => {
      if (width < control.name.length) {
        width = control.name.length;
      }
    });
    groups[keyGroup].labelWidth = width;

    setGroups([...groups]);
    onBlur();
  };

  const onColorChange = (color: string, key: number) => {
    groups[key].color = color;
    setGroups([...groups]);
    onBlur();
  };

  const onBlur = () => {
    onChange(groups);
  };

  return (
    <>
      {!!groups.length &&
        groups.map((group, keyGroup) => {
          return (
            <Collapsable
              label={<b>{group.name}</b>}
              isOpen={true}
              onRemove={() => removeGroup(keyGroup)}
              key={keyGroup}
              color={group.color}
            >
              <InlineField label={'Name'} labelWidth={14} grow={true}>
                <Input
                  value={group.name}
                  onChange={(event) => onChangeStringOption(event, keyGroup, 'name')}
                  onBlur={onBlur}
                ></Input>
              </InlineField>
              <InlineField label={'Color'} style={{ marginBottom: 10 }} labelWidth={14} grow={true}>
                <ColorPickerInput
                  value={group.color}
                  onChange={(color) => onColorChange(color, keyGroup)}
                  onBlur={onBlur}
                ></ColorPickerInput>
              </InlineField>
              {!!group.controls.length &&
                group.controls.map((control, keyControl) => {
                  return (
                    <Control
                      onRemove={() => removeControl(keyGroup, keyControl)}
                      value={control}
                      key={keyControl}
                      onChange={(value: ControlProps) =>
                        onControlChange(value, keyGroup, keyControl)
                      }
                    />
                  );
                })}
              <Button variant={'secondary'} onClick={() => addControl(keyGroup)}>
                + Add Control
              </Button>
            </Collapsable>
          );
        })}
      <Button variant={'secondary'} onClick={addGroup}>
        + Add Group
      </Button>
    </>
  );
};

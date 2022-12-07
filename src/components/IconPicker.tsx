import { css } from '@emotion/css';
import { availableIconsIndex, SelectableValue, toOption } from '@grafana/data';
import { Icon, IconName, Select } from '@grafana/ui'
import React from 'react'

interface Props {
  icon: IconName
  onChange: (value: IconName) => void
}

export function IconPicker({icon, onChange}: Props) {
  const style = getStyle()
  
  const selectType = Object.keys(availableIconsIndex).map(toOption);
  const onSelect = (value: SelectableValue<string>) => {
    if (selectType.some((type) => type.value === value.value)) {
      onChange(value.value as IconName)
    } 
  }

  return (
     <div className={style.div}>
        <Icon name={icon} className={style.icon}/>
        <Select
          options={selectType}
          value={icon}
          defaultValue={'circle'}
          onChange={onSelect}
        />
      </div>
  )
}

function getStyle() {
  return {
    div: css`
      display: flex;
      flex-direction: row;
      align-items: center;
    `,
    icon: css`
      margin-right: 8px;
      margin-left: 8px;
    `
  }
}

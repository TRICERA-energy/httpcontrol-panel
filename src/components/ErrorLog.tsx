import { css } from '@emotion/css';
import { getErrorEventEmitter, getErrors } from '../backend/errorHandler';
import React, { useEffect, useState } from 'react';
import { ErrorProps } from 'types';

export function ErrorLog() {
  const style = getStyle();
  const [errors, setErrors] = useState<ErrorProps[]>(getErrors());

  useEffect(() => {
    const onErrorsChanged = (errors: ErrorProps[]) => {
      if (errors) {
        setErrors([...errors]);
      }
    };

    getErrorEventEmitter().on('errorsChanged', onErrorsChanged);

    return () => {
      getErrorEventEmitter().off('errorsChanged', onErrorsChanged);
    };
  }, []);

  return (
    <div className={style.container}>
      {!!errors.length &&
        errors.map((error: ErrorProps, key: number) => {
          return (
            <p className={style.line} key={key}>{`${error.timestamp} [${error.title}]: ${error.error}`}</p>
          );
        })}
    </div>
  );
}

function getStyle() {
  return {
    container: css`
      margin: 8px;
      background-color: #22252b
    `,
    line: css`
      margin: 0 0 4px 4px;
    `
  };
}

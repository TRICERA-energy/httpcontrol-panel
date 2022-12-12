import EventEmitter from "events";
import { ErrorProps } from "types";

const errors: ErrorProps[] = []
const emitter = new EventEmitter();

export function getErrorEventEmitter() {
  return emitter;
}

export function setError(error: ErrorProps) {
  if (errors.length > 200) {
    errors.pop()
  }

  errors.unshift({...error, timestamp: new Date().toISOString()});
  emitter.emit('errorsChanged', errors);
}

export function getErrors(): ErrorProps[] {
  return errors;
}

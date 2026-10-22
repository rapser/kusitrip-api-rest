import { TransformFnParams } from 'class-transformer';

export function trim({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : (value as unknown);
}

export function trimLowercase({ value }: TransformFnParams): unknown {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : (value as unknown);
}

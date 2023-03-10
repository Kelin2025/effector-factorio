import { is } from 'effector';
import type { Unit } from 'effector';

type Shape = { [key: string]: unknown };

export type OnlyUnits<T> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends Unit<unknown> ? Key : never }[keyof T]
>;

export function removeNonUnit<T extends Shape>(shape: T): OnlyUnits<T> {
  return Object.keys(shape).reduce((acc, key) => {
    const value = shape[key];

    if (is.unit(value)) {
      // @ts-expect-error
      acc[key] = value;
    }

    return acc;
  }, {} as OnlyUnits<T>);
}

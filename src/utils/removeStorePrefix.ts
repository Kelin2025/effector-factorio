import type { Unit } from 'effector';

type Shape = { [key: string]: Unit<any> };

type UnprefixedKey<Original> = Original extends `$${infer Unprefixed}`
  ? Unprefixed
  : Original;

type PrefixedKey<Key extends string> = `$${Key}`;

type Unprefixed<T extends Shape> = {
  [key in UnprefixedKey<keyof T>]: T extends { [inner in key]: unknown }
    ? T[key]
    : key extends string
    ? T[PrefixedKey<key>]
    : never;
};

export function removeStorePrefix<T extends Shape>(shape: T): Unprefixed<T> {
  return Object.keys(shape).reduce((acc, key) => {
    const unprefixedKey = key.replace(/^\$/, '') as UnprefixedKey<keyof T>;
    // @ts-expect-error
    acc[unprefixedKey] = shape[key];
    return acc;
  }, {} as Unprefixed<T>);
}

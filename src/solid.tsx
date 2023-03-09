/* @jsxImportSource solid-js */
import type { Component } from 'solid-js';
import { createContext, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { removeNonUnit } from './utils/removeNonUnit';
import { removeStorePrefix } from './utils/removeStorePrefix';

/**
 * Creates model `factory`
 * @param creator Function that returns new `model` instance
 * @returns Factory with `createModel` method, `useModel` hook and model `Provider`
 */
export const modelFactory = <T extends (...args: any[]) => any>(creator: T) => {
  const ModelContext = createContext<ReturnType<typeof creator> | null>(null);
  const useModel = () => {
    const model = useContext(ModelContext);
    if (!model) {
      throw new Error('No model found');
    }
    return model;
  };
  const unitShape = () => {
    const model = useModel();
    const modelUnits = removeNonUnit(model);
    return removeStorePrefix(modelUnits);
  };

  return {
    /** Function that returns new `model` instance */
    createModel: creator,
    /** Hook that returns current `model` instance */
    useModel,
    /** `Provider` to pass current `model` instance into */
    Provider: ModelContext.Provider,
    '@@unitShape': unitShape,
  };
};

export type Model<Factory extends ReturnType<typeof modelFactory>> = ReturnType<
  Factory['createModel']
>;

/**
 * HOC that wraps your `View` into model `Provider`. Also adds `model` prop that will be passed into `Provider`
 * @param factory Factory that will be passed through Context
 * @param View Root component that will be wrapped into Context
 * @returns Wrapped component
 */
export const modelView = <
  U extends {},
  T extends ReturnType<typeof modelFactory>
>(
  factory: T,
  View: Component<U & { model: ReturnType<T['createModel']> }>
) => {
  const Render = (props: Parameters<typeof View>[0]) => {
    return (
      <factory.Provider value={props.model}>
        <Dynamic component={View} {...props} />
      </factory.Provider>
    );
  };
  // `as` is used for a better "Go To Definition"
  return Render as typeof View;
};

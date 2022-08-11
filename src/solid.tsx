/* @jsxImportSource solid-js */
import {useContext, createContext, Component} from "solid-js";
import {Dynamic} from "solid-js/web";

/**
 * Creates model `factory`
 * @param creator Function that returns new `model` instance
 * @returns Factory with `createModel` method, `useModel` hook and model `Provider`
 */
export const modelFactory = <T extends (...args: any[]) => any>(creator: T) => {
  // @ts-expect-error
  const ModelContext = createContext<ReturnType<typeof creator>>(null);
  const useModel = () => {
    const model = useContext(ModelContext);
    if (!model) {
      throw new Error('No model found');
    }
    return model;
  };

  return {
    /** Function that returns new `model` instance */
    createModel: creator,
    /** Hook that returns current `model` instance */
    useModel,
    /** `Provider` to pass current `model` instance into */
    Provider: ModelContext.Provider,
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

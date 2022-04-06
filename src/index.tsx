import React, { createContext, FC, useContext } from 'react';

export const modelFactory = <T extends (...args: any[]) => any>(factory: T) => {
  // @ts-expect-error
  const ModelContext = createContext<ReturnType<typeof factory>>(null);
  const useModel = () => {
    const model = useContext(ModelContext);
    if (!model) {
      throw new Error('No model found');
    }
    return model;
  };

  return {
    createModel: factory,
    useModel,
    Provider: ModelContext.Provider,
  };
};

export type Model<Factory extends ReturnType<typeof modelFactory>> = ReturnType<
  Factory['createModel']
>;

export const modelView = <
  U extends {},
  T extends ReturnType<typeof modelFactory>
>(
  model: T,
  View: FC<U & { model: ReturnType<T['createModel']> }>
) => {
  const Render = (props: Parameters<typeof View>[0]) => {
    return (
      <model.Provider value={props.model}>
        <View {...props} />
      </model.Provider>
    );
  };
  // `as` is used for a better "Go To Definition"
  return Render as typeof View;
};

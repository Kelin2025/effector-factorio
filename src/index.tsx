import { createEvent, Event, is } from 'effector';
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
    createModel: (
      ...args: Parameters<typeof factory>
    ): ReturnType<typeof factory> & { reset: Event<void> } => {
      const reset = createEvent();
      const model = factory(...args) as ReturnType<typeof factory>;
      for (const unitKey in model) {
        const unit = model[unitKey];
        // @ts-expect-error
        if (is.store(unit) && unit.defaultConfig.derived !== 1) {
          unit.reset(reset);
        }
      }
      return { ...model, reset };
    },
    useModel,
    Provider: ModelContext.Provider,
  };
};

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

export type Model<Factory extends ReturnType<typeof modelFactory>> = ReturnType<
  Factory['createModel']
>;

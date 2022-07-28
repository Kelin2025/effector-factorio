import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { modelFactory, modelView } from '../src/index';

const factory = modelFactory(() => {
  return {
    foo: 'bar',
  };
});

describe('modelFactory', () => {
  it('Creates model factory', () => {
    expect(factory).toHaveProperty('Provider');
    expect(factory).toHaveProperty('createModel');
    expect(factory).toHaveProperty('useModel');
  });

  it('createModel() returns model instance', () => {
    const model = factory.createModel();
    expect(model).toEqual({
      foo: 'bar',
    });
  });

  it('Provides model instance via Context', () => {
    const model = factory.createModel();
    const Provider = factory.Provider;

    const renderContext = (ui, { providerProps, ...renderOptions }) => {
      return render(
        <Provider {...providerProps}>{ui}</Provider>,
        renderOptions
      );
    };

    const View = () => {
      const model = factory.useModel();
      return <div data-testid="foo-value">{model.foo}</div>;
    };

    renderContext(<View />, { providerProps: { value: model } });
    expect(screen.getByTestId('foo-value')).toHaveTextContent('bar');
  });
});

describe('modelView', () => {
  it('Wraps view into model provider', () => {
    const model = factory.createModel();
    const View = modelView(factory, () => {
      return <Foo />;
    });

    const Foo = () => {
      const model = factory.useModel();

      return <div data-testid="foo-value">{model.foo}</div>;
    };

    render(<View model={model} />);
    expect(screen.getByTestId('foo-value')).toHaveTextContent('bar');
  });

  it('Has model prop', () => {
    const model = factory.createModel();
    const View = modelView(factory, ({ model }) => {
      return <div data-testid="foo-value">{model.foo}</div>;
    });

    render(<View model={model} />);
    expect(screen.getByTestId('foo-value')).toHaveTextContent('bar');
  });

  it('Receives other props', () => {
    const model = factory.createModel();
    const View = modelView<{ propA: string }, typeof factory>(
      factory,
      ({ propA }) => {
        return <div data-testid="prop-a">{propA}</div>;
      }
    );

    render(<View model={model} propA={'propA'} />);
    expect(screen.getByTestId('prop-a')).toHaveTextContent('propA');
  });
});

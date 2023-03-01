# Effector Factorio

The simplest way to write re-usable features with React + Effector

## Install

```bash
npm install effector-factorio
```

## Why this?

People became to obsessed with using React Hooks, which results in components being littered with a lot of business logic.  
And because of React runtime nature, writing logic inside components always leads to:

- **Unreadable code.** Tons of `useMemo`, `useCallback` and hooks limitations make code way harder to read and support.
- **Low performance.** A lot of memoization which anyway leads to extra re-renders.
- **Problems with testing.** You could just write your logic, create its instance and just test it. Instead you have to render your component, click buttons and do other irrelevant stuff just to test your logic.
- **Extra responsibility.** This one speaks for itself, components fastly get a lot of extra responsibility and break clean architecture.
- **Structural incongrity.** View composition can be structurally different to logic composition. Also, most of the logic gets used in several places. Also, with hooks, when the layout changes, you rewrite your logic as well.

However, when you extract logic from components, it usually means that it will be a singleton. So, if you want to re-use it, you can't.

This library allows you to extract all the logic from components, while still having opportunity to re-use components.  
It's based on factories and provides an API to make it in a unified way with less boilerplate.

## Usage

This library consists of just two functions: `modelFactory` and `modelView`.
Let's make a simple sign up form.

**Step 1. Create model factory.**

```tsx
import { modelFactory } from 'effector-factorio';
import { combine, sample, createStore, createEvent, Effect } from 'effector';

type FactoryOptions = {
  registerFx: Effect<{ name: string; password: string }, any>;
};

export const factory = modelFactory((options: FactoryOptions) => {
  const loginChanged = createEvent<string>();
  const passwordChanged = createEvent<string>();
  const submitPressed = createEvent();

  const $login = createStore('');
  const $password = createStore('');

  const $form = combine({ login: $login, password: $password });

  const $disabled = options.registerFx.pending;

  $login.on(loginChanged, (prev, next) => next);
  $password.on(passwordChanged, (prev, next) => next);

  sample({
    source: $form,
    clock: submitPressed,
    target: options.registerFx,
  });

  return {
    $login,
    $password,
    $disabled,
    loginChanged,
    passwordChanged,
    submitPressed,
  };
});
```

Here we created a factory that creates and returns model instance.  
And, as an example of customization, we can also pass external `registerFx` effect for each instance.

**Step 2. Create a view.**

```tsx
import { useStore } from 'effector-react'
import { modelView } from 'effector-factorio'

import { factory } from './factory' // from step 1

const Form = modelView(factory, () => {
  return (
    <div className="flex flex-col gap-2">
      <LoginField />
      <PasswordField />
      <RegisterButton />
    </div>
})

const LoginField = () => {
  const model = factory.useModel()
  const login = useStore(model.$login)

  return <input
    value={login}
    placeholder="Login"
    onChange={evt => model.loginChanged(evt.target.value)}
  />
}

const PasswordField = () => {
  const model = factory.useModel()
  const password = useStore(model.$password)

  return <input
    value={password}
    placeholder="Password"
    onChange={evt => model.passwordChanged(evt.target.value)}
  />
}

const RegisterButton = () => {
  const model = factory.useModel()
  const disabled = useStore(model.$disabled)

  return (
    <button
      disabled={disabled}
      onClick={() => model.submitPressed}
    >
      Save
    </button>
  )
}
```

Here, `modelView` wraps component into HOC that accepts `model` prop with the current model instance and passes it through **React Context**.

**Step 3. Export the whole thing**

```tsx
export const CreateUser = {
  factory,
  Form,
};
```

**Step 4. Use it wherever you want**

```tsx
import { CreateUser } from '@/features/create-user';

const createUserModel = CreateUser.factory.createModel({
  registerFx: registerUserFx,
});

const Page = () => {
  return <CreateUser.Form model={createUserModel} />;
};
```

And here, we created model instance and passed it as a prop to our Form component

That's it!
The benefit might be not that obvious on simple example, but I decided to keep it small in order to avoid frustration from huge irrelevant code.
The key point is that if you correctly split your app into multiple layers, each segment will look small and clean, and you can easily compose all the stuff.

## Utilities

#### `Model<Factory>` - utility type to extract model type from factory

Usage:

```tsx
import { modelFactory, Model } from 'effector-factorio';

const fooFactory = modelFactory(() => {
  return {
    foo: createStore(''),
  };
});

type FooModel = Model<typeof fooFactory>;
// { foo: Store<string> }
```

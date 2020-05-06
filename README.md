# @react-native-community/peek-and-pop

React Native component which exposes the Peek and Pop pattern on iOS.

## Getting started

### Installation

Open a Terminal in the project root and run:

```sh
yarn add @react-native-community/peek-and-pop
```

Or if you use `npm`:

```sh
npm install @react-native-community/peek-and-pop --save
```

### Linking

The library includes native code and needs to be linked. If you're using React Native 0.60+, then this step should be fully automatic. Otherwise, you'll need to link the library with one of the following methods:

#### Mostly automatic linking

```
# RN >= 0.60
npx pod-install

# RN < 0.60
react-native link @react-native-community/peek-and-pop
```

#### Manual linking (iOS)

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@react-native-community/peek-and-pop` and add `PeekAndPop.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libPeekAndPop.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

## Usage

```js
import * as React from 'react';
import { View } from 'react-native';
import PeekAndPop from '@react-native-community/peek-and-pop';

export default function App() {
  return (
    <PeekAndPop
      renderPreview={() => (
        <View
          style={{ width: 100, height: 100, backgroundColor: 'papayawhip' }}
        />
      )}
    >
      <View
        style={{
          backgroundColor: 'tomato',
          width: 130,
          height: 130,
        }}
      />
    </PeekAndPop>
  );
}
```

## API reference

The package exports the `PeekAndPop` component as the default export. It can be used to wrap any component to provide the peek and pop behavior for the component.

The component accepts the following props:

### `renderPreview` (required)

Callback which returns a React element to display as the preview on the force touch gesture.

```js
renderPreview={() => (
  <Text>This text will be shown on force touch</Text>
)}
```

### `onPeek`

Callback which is called when a peek is triggered, i.e. the preview is shown.

```js
onPeek={() => console.log('Peeked')}
```

### `onPop`

Callback which is called when a pop is triggered, i.e. the user lifts their finger.

```js
onPop={() => console.log('Popped')}
```

### `onDisappear`

Callback which is called when the preview disappears.

```js
onDisappear={() => console.log('Disappeared')}
```

### `previewActions`

Array of action objects to show as action buttons in the preview.

Each object contains of following properties:

#### `label`

Label text for the button.

#### `type`

`normal` or `group` (defaults to `normal`). Controls whether the button has sub-actions.

#### `selected`

If `type` is `normal`, then this specifies if a tick mark should be visible or not (default to `false`).

#### `onPress`

If `type` is `normal`, then this specifies the function to call when the button is pressed.

#### `actions`

If `type` is `group`, sub-actions for the group can be nested under `actions` key.

Usage:

```js
previewActions={[
  {
    type: 'destructive',
    label: 'remove',
    onPress: () => {},
  },
  {
    label: 'normal',
    onPress: () => {},
  },
  {
    type: 'destructive',
    label: 'remove',
    onPress: () => {},
  },
  {
    type: 'group',
    label: 'group',
    actions: [
      {
        selected: true,
        label: 'selected',
        onPress: () => {},
      },
      {
        type: 'normal',
        selected: false,
        label: 'not selected',
        onPress: () => {},
      },
    ],
  },
]}
```

## Contributing

To setup the development environment, open a Terminal in the repo directory and run the following:

```sh
yarn bootstrap
```

While developing, you can run the example app to test your changes:

```sh
cd example && react-native run-ios
```

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typescript
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

For bigger changes, please open a issue to discuss it first before sending a pull request.

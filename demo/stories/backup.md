```js script
import {
  withWebComponentsKnobs,
  Story,
  Preview,
  Meta,
  Props,
  action,
  withKnobs,
  text,
  number,
  html,
} from '@open-wc/demoing-storybook';

import '../demo-wc-card.js';

export default {
  title: 'Demo Card/Docs',
  component: 'demo-wc-card',
  options: { selectedPanel: 'storybookjs/knobs/panel' },
};
```

# Demo Web Component Card

A component meant to display small information with additional data on the back.

## Features:

- looks like a game card
- content in the front
- data in the back

## How to use

### Installation

```bash
yarn add @foo/demo-wc-card
```

```js
import '@foo/demo-wc-card/demo-wc-card.js';
```

A simple example:

<docs-story name="Simple">
  <demo-wc-card>Hello World</demo-wc-card>
</docs-story>

## API

<Props of="demo-wc-card" />

## Playground

For each story you see here you have a menu point on the left.
Click on canvas and then knobs to see and modify the public api.

### Variations

###### Header

<docs-preview>

  <docs-story name="CustomHeader">
    <demo-wc-card header="Harry Potter">A character that is part of a book series...</demo-wc-card>
  </docs-story>

</docs-preview>

###### Back Side

<docs-story>

```js script
export const showBack = () =>
  html`
    <demo-wc-card back-side>Hello World</demo-wc-card>
  `;
```

</docs-story>

###### Providing Rows

<docs-story>

```js script
export const provideRows = () => {
  const rows = [
    { header: 'health', value: '200' },
    { header: 'mana', value: '100' },
  ];
  return html`
    <demo-wc-card back-side .rows=${rows}>
      A card with data on the back
    </demo-wc-card>
  `;
};
```

</docs-story>

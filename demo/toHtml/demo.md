```js script
import { html, render } from '/node_modules/lit-html/lit-html.js';
import { DemoWcCard } from '/demo/src/DemoWcCard.js';

import '/demo/demo-wc-card.js';

export default {
  title: 'Demo Card/Docs',
  component: 'demo-wc-card',
  options: { selectedPanel: 'storybookjs/knobs/panel' },
};
```

# Demo Web Component Card

A component meant to display small information with additional data on the back.

### Installation

```bash
yarn add @foo/demo-wc-card
```

```js
import '@foo/demo-wc-card/demo-wc-card.js';
```

## An html story

Just html, only supports title

```html story
<demo-wc-card back-side>Hello World</demo-wc-card>
```

## A template story

Purely providing the template for a story, only supports at title

```js story
html`
  <demo-wc-card .header=${'foo'}>Hello World</demo-wc-card>
`
```

## Story Function

A regular function with full power

```js script
export const showBack = () =>
  html`
    <demo-wc-card back-side>Hello World</demo-wc-card>
  `;
showBack.story = {
  name: 'Showing it back',
  decorators: []
}
```
[](story "showBack")

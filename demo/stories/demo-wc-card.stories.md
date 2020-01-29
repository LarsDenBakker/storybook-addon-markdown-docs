```js script
import { html } from 'lit-html';
import '../demo-wc-card.js';

export default { title: 'My docs' };
```

# Heading 1

Foo

## Heading 2

<sb-story name="HTML Story">
  <demo-wc-card>HTML Story</demo-wc-card>
</sb-story>

<sb-story>

```js script
export const JsStory = () =>
  html`
    <demo-wc-card>JS Story</demo-wc-card>
  `;
```

</sb-story>

<sb-preview>
  <sb-story>

```js script
export const JsStory2 = () =>
  html`
    <demo-wc-card>JS Story with preview</demo-wc-card>
  `;
```

  </sb-story>
</sb-preview>

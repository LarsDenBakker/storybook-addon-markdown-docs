```js script
import { html } from 'lit-html';

export default { title: 'My docs' };
```

Before

<sb-story name="HTML Story">
  <demo-wc-card>Hello World</demo-wc-card>
</sb-story>

<sb-story>

```js script
export const JsStory = () =>
  html`
    <demo-wc-card></demo-wc-card>
  `;
```

</sb-story>

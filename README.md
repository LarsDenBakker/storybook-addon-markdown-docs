# Storybook Addon: Markdown Docs

Write storybook docs using regular markdown and HTML.

> Warning: this project is still experimental, not all features are supported. Join the discussion in the [issues](https://github.com/LarsDenBakker/storybook-addon-markdown-docs/issues).

## Writing Docs

You can write documentation using regular markdown, this is converted to HTML and rendered in a storybook docs tab.

Write a module script with a default export containing storybook metadata, and optionally importing any dependencies to be used in your stories.

```md
<script type="module">
  import { html } from '@open-wc/demoing-storybook';

  export default { title: 'Elements/Button' };
</script>
```

## Writing Code

To write code inside your docs you can write module scripts. All module scripts on the page are combined into one module, imports and variables between scripts are shared.

Module scripts can give problems with some markdown renderers or code formatters like prettier. They can be aliased using a fenced codeblock with a type that ends with `script`. For example `js script` or `ts script`:

````md
<docs-story>

```js script
export const MyStory = () =>
  html`
    <my-element></my-element>
  `;
```

</docs-story>
````

Or using a `js script` codeblock:

````md
<docs-story>

```js script
export const MyStory = () =>
  html`
    <my-element></my-element>
  `;
```

</docs-story>
````

## Writing Inline Stories

Stories can be written inline using `docs-story` elements.

The embedded story can be plain HTML:

```html
<docs-story name="My Story">
  <my-element></my-element>
</docs-story>
```

Or an embedded script or js code block:

```html
<docs-story>
  <script type="module">
    export const MyStory = () => html`
      <my-element></my-element>
    `;
  </script>
</docs-story>
```

````md
<docs-story>

```js script
export const MyStory = () => html`
  <my-element></my-element>
`;
```

</docs-story>
````

## Usage

### With `@open-wc/demoing-storybook`

To use this addon with `@open-wc/demoing-storybook`, add this `main.js` to your `.storybook` directory:

```js
const { markdownToStories } = require('storybook-addon-markdown-docs');

module.exports = {
  stories: ['./stories/*.stories.{js,md}'],
  esDevServer: {
    fileExtensions: ['.js', '.mjs', '.md'],
    responseTransformers: [
      async function mdToStories({ url, body }) {
        const cleanURL = url.split('?')[0].split('#')[0];

        if (cleanURL.endsWith('md')) {
          return { body: await markdownToStories(body) };
        }
      },
    ],
  },
};
```

### Regular Storybook

To use this addon with regular storybook, you need to add a webpack transformation step. We don't have any defaults for this yet.

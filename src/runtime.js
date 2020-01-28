import './elements/react-doc-blocks.js';
import { createElement } from 'storybook-prebuilt/react';
import { withTheme } from 'storybook-prebuilt/theming.js';
import { MarkdownDocsPage } from './elements/docs-page.js';

export function createDocsPage(componentMeta, html, stories) {
  return () => createElement(withTheme(MarkdownDocsPage), { html, componentMeta, stories });
}

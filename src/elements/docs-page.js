import highlightStyles from './highlight-styles.js';
import globalStyles from './markdown-styles.js';

export class DocsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  initialize(html, stories) {
    this.render(html);
    const storyElements = this.shadowRoot.querySelectorAll('docs-story');
    if (storyElements.length !== stories.length) {
      throw new Error(
        `Found ${storyElements.length} story elements, but have ${stories.length} stories`,
      );
    }

    storyElements.forEach((element, i) => {
      element.story = stories[i];
    });
  }

  render(html) {
    this.shadowRoot.innerHTML = `
      <style>
        ${globalStyles}
        ${highlightStyles}
      </style>
      <div class="markdown-body">
      ${html}
      </div>
    `;
  }
}

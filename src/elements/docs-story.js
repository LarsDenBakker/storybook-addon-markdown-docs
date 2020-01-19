import { render } from 'lit-html';

class DocsStory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get story() {
    return this._story;
  }

  set story(story) {
    this._story = story;
    let renderValue = story();
    if (typeof renderValue === 'string') {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderValue;
      renderValue = wrapper;
    }
    render(renderValue, this.shadowRoot);
  }
}

customElements.define('docs-story', DocsStory);

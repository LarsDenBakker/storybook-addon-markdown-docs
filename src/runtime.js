import { DocsPage } from './elements/docs-page.js';
import './elements/docs-story.js';

let docsI = 0;

function nextElementName() {
  const name = `docs-page-${docsI}`;
  docsI += 1;
  // check if element does not already exist
  if (customElements.get(name)) {
    return nextElementName();
  }
  return name;
}

export function createDocsPage(html, stories) {
  const name = nextElementName();

  customElements.define(
    name,
    class extends DocsPage {
      connectedCallback() {
        this.initialize(html, stories);
      }
    },
  );

  return name;
}

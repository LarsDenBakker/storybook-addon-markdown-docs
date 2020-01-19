import test from 'ava';
import { markdownToStory } from '../src/markdown-to-story.js';

test('creates a docspage with the page HTML and registers it to storybook on the default export', async t => {
  const result = await markdownToStory(
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

# Heading

Lorem ipsum

## Subtitle

- A
- B
- C
`,
  );

  t.snapshot(result);
});

test('concatenates all code blocks', async t => {
  const result = await markdownToStory(
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

# Heading

Lorem ipsum

## Subtitle

\`\`\`js script
console.log('hello world');
\`\`\`

- A
- B
- C

\`\`\`js script
function myFunction (a, b) {
  return a + b;
}

myFunction(1, 2);
\`\`\`
`,
  );

  t.snapshot(result);
});

test('concatenates all story code', async t => {
  const result = await markdownToStory(
    `
# Title

\`\`\`js script
export default { title: 'My docs' };
\`\`\`

<docs-story>

\`\`\`js script
  export const MyStory = () => html\`<div>Hello world</div>\`;
\`\`\`

</docs-story>

## Subtitle

<docs-story>

\`\`\`js script
  export const MyOtherStory = () => html\`<div>Hello other world</div>\`;
\`\`\`

</docs-story>
`,
  );

  t.snapshot(result);
});

import test from 'ava';
import * as parseMarkdownModule from '../src/parse-markdown.js';

const { parseMarkdown } = parseMarkdownModule;

test('transforms markdown to html', async t => {
  const result = await parseMarkdown(
    `
# Title

## Subtitle

Lorem ipsum

* A
* B
* C
`,
  );

  t.deepEqual(result.stories, []);
  t.deepEqual(result.codeBlocks, []);
  t.snapshot(result.html);
});

test('extracts module scripts as codeblocks', async t => {
  const result = await parseMarkdown(
    `
<script type="module">
  export default { title: 'My docs' };
</script>
`,
  );

  t.deepEqual(result.stories, []);
  t.deepEqual(result.codeBlocks, [`\n  export default { title: 'My docs' };\n`]);
  t.snapshot(result.html);
});

test('transforms stories with with module scripts', async t => {
  const result = await parseMarkdown(
    `# Title

<docs-story>
  <script type="module">
    export const MyStory = () => html\`<div>Hello world</div>\`;
  </script>
</docs-story>

## Subtitle

<docs-story>
  <script type="module">
    export const MyOtherStory = () => html\`<div>Hello other world</div>\`;
  </script>
</docs-story>
`,
  );

  t.deepEqual(result.stories, [
    '\n    export const MyStory = () => html`<div>Hello world</div>`;\n  ',
    '\n    export const MyOtherStory = () => html`<div>Hello other world</div>`;\n  ',
  ]);
  t.deepEqual(result.codeBlocks, []);
  t.snapshot(result.html);
});

test('transforms stories without module script as a story with the HTML content', async t => {
  const result = await parseMarkdown(
    `# Title

<docs-story name="Story A">
  <p>Hello world</p>
</docs-story>

## Subtitle

<docs-story name="StoryB">
  <ul>
    <li>A</li>
    <li>B</li>
    <li>C</li>
  </ul>
</docs-story>
`,
  );

  t.deepEqual(result.stories, [
    'export const Story_A = () => "\\n  <p>Hello world</p>\\n"',
    'export const StoryB = () => "\\n  <ul>\\n    <li>A</li>\\n    <li>B</li>\\n    <li>C</li>\\n  </ul>\\n"',
  ]);
  t.deepEqual(result.codeBlocks, []);
  t.snapshot(result.html);
});

test('transforms fenced codeblocks with the "script" keyword', async t => {
  const result = await parseMarkdown(
    `
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

  t.deepEqual(result.stories, [
    '    export const MyStory = () => html`<div>Hello world</div>`;',
    '    export const MyOtherStory = () => html`<div>Hello other world</div>`;',
  ]);
  t.deepEqual(result.codeBlocks, [`  export default { title: 'My docs' };`]);
  t.snapshot(result.html);
});

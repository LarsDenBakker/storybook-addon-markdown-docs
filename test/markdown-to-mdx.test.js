import test from 'ava';
import { markdownToMdx } from '../src/markdown-to-mdx.js';

test('combines user default export with storybook default export', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`
`,
  );

  t.snapshot(result);
});

test('handles default export exporting a variable', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
const meta = { title: 'My docs' };
export default meta;
\`\`\`
`,
  );

  t.snapshot(result);
});

test('handles multiple codeblocks, preserving order', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

\`\`\`js script
function foo (x, y) {
  return x * y;
}
\`\`\`

\`\`\`js script
function bar (a, b) {
  return a + b;
}
\`\`\`
`,
  );

  t.snapshot(result);
});

test('can define inline stories with a <sb-story> element and codeblock', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

<sb-story>

\`\`\`js script
  export const MyStory = () => html\`<p>Hello world</p>\`;
\`\`\`

</sb-story>

`,
  );

  t.snapshot(result);
});

test('can define inline stories using <sb-story> and HTML', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

<sb-story name="StoryA">
  <my-element></my-element>
</sb-story>
`,
  );

  t.snapshot(result);
});

test('preserves order of multiple stories', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

<sb-story name="StoryA">
  <my-element></my-element>
</sb-story>

<sb-story>

\`\`\`js script
  export const StoryB = () => html\`<p>Hello world</p>\`;
\`\`\`

</sb-story>

<sb-story name="StoryC">
  <my-element></my-element>
</sb-story>
`,
  );

  t.snapshot(result);
});

test('can use preview code blocks', async t => {
  const result = await markdownToMdx(
    '/foo.js',
    `
\`\`\`js script
export default { title: 'My docs' };
\`\`\`

<sb-preview>
  <sb-story name="StoryA">
    <my-element></my-element>
  </sb-story>
</sb-preview>

<sb-preview>
  <sb-story>

\`\`\`js script
export const StoryA = () => html\`<p>Story A</p>\`;
\`\`\`

  </sb-story>
</sb-preview>
`,
  );

  t.snapshot(result);
});

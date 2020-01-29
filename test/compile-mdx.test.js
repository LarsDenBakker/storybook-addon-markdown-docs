import test from 'ava';
import { parse } from '@babel/parser';
import { compileMdx } from '../src/compile-mdx.js';

const defaultCode = () =>
  parse('export default { title: "Hello world" }', { sourceType: 'module' }).program.body;

test('combines user default export with storybook default export', async t => {
  const result = await compileMdx('/foo.js', {
    html: '',
    stories: [],
    code: defaultCode(),
  });

  t.snapshot(result);
});

test('handles multiple code statements, preserving order', async t => {
  const result = await compileMdx('/foo.js', {
    html: `
      <h1>Hello world</h1>
    `,
    stories: [],
    code: parse(
      `const meta = { title: "Hello world" };

       export default meta;

       const foo = 'bar';
       function bar() {
         return foo;
       }
       `,
      { sourceType: 'module' },
    ).program.body,
  });

  t.snapshot(result);
});

test('compiles HTML to MDX', async t => {
  const result = await compileMdx('/foo.js', {
    html: `<h1>Hello world</h1>

<p>Lorem ipsum</p>

<h2>Goodbye world</h2>

Foo bar
`,
    stories: [],
    code: defaultCode(),
  });

  t.snapshot(result);
});

test('compiles MD to MDX', async t => {
  const result = await compileMdx('/foo.js', {
    html: `# Hello world

Lorem ipsum

- A
- B
- C

\`\`\`js
const foo = "bar";
\`\`\`
`,
    stories: [],
    code: defaultCode(),
  });

  t.snapshot(result);
});

test('compiles JSX in MD to MDX', async t => {
  const result = await compileMdx('/foo.js', {
    html: `# Hello world

Lorem ipsum

<MyComponent />
      `,
    stories: [],
    code: defaultCode(),
  });

  t.snapshot(result);
});

test('compiles a single story to MDX', async t => {
  const result = await compileMdx('/foo.js', {
    html: `# My story

<Story name="Story A"></Story>
      `,
    stories: [
      {
        key: 'StoryA',
        name: 'Story A',
        code: parse('export const StoryA = () => html`<p>Hello world</p>`', {
          sourceType: 'module',
        }).program.body,
        codeString: 'export const StoryA = () => html`<p>Hello world</p>',
      },
    ],
    code: defaultCode(),
  });

  t.snapshot(result);
});

test('compiles stories to MDX', async t => {
  const result = await compileMdx('/foo.js', {
    html: `# My stories

## Story A

<Story name="Story A"></Story>

## Story B

<Story name="Story B"></Story>

## Story C

<Story name="Story C"></Story>`,
    stories: [
      {
        key: 'StoryA',
        name: 'Story A',
        code: parse('export const StoryA = () => html`<p>This is story a</p>`', {
          sourceType: 'module',
        }).program.body,
        codeString: 'export const StoryA = () => html`<p>This is story a</p>',
      },
      {
        key: 'StoryB',
        name: 'Story B',
        code: parse('export const StoryB = () => html`<p>This is story b</p>`', {
          sourceType: 'module',
        }).program.body,
        codeString: 'export const StoryB = () => html`<p>This is story b</p>',
      },
      {
        key: 'StoryC',
        name: 'Story C',
        code: parse('export const StoryC = () => html`<p>This is story c</p>`', {
          sourceType: 'module',
        }).program.body,
        codeString: 'export const StoryC = () => html`<p>This is story c</p>',
      },
    ],
    code: defaultCode(),
  });

  t.snapshot(result);
});

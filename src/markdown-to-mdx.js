/** @typedef {import('@types/babel__core').types.ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import('@types/babel__core').types.File} File */
/** @typedef {import('@types/babel__core').types.Program} Program */
/** @typedef {import('@types/babel__core').Visitor} Visitor */

const mdx = require('@mdx-js/mdx');
const { transformAsync } = require('@babel/core');
const createCompiler = require('./mdx-compiler-plugin');
const { parseMarkdown } = require('./parse-markdown');
const { babelPluginMarkdownToMdx } = require('./babel-plugin-markdown-to-mdx');

async function markdownToMdx(filePath, body) {
  const markdownResult = await parseMarkdown(body);
  const storyNameToKey = {};

  for (const { key, name } of markdownResult.stories) {
    storyNameToKey[name] = key;
  }

  const compilers = [createCompiler({}, storyNameToKey)];
  const jsx = `

    /** Start of generated storybook docs */

    import * as React from 'storybook-prebuilt/react.js';
    import { mdx } from 'storybook-prebuilt/addon-docs/blocks.js';

    ${await mdx(
      `import { Story, Preview } from 'storybook-prebuilt/addon-docs/blocks.js';\n\n${markdownResult.html}`,
      { compilers, filepath: filePath },
    )}
  `.replace('@storybook/addon-docs/blocks', 'storybook-prebuilt/addon-docs/blocks.js');

  const result = await transformAsync(jsx, {
    filename: filePath,
    sourceMaps: true,
    plugins: [
      require.resolve('@babel/plugin-transform-react-jsx'),
      [babelPluginMarkdownToMdx, markdownResult],
    ],
  });
  return result.code;
}

module.exports = { markdownToMdx };

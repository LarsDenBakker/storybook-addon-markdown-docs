/** @typedef {import('./types').MarkdownResult} MarkdownResult */

const mdx = require('@mdx-js/mdx');
const { transformAsync } = require('@babel/core');
const createCompiler = require('./mdx-compiler-plugin');
const { babelPluginMarkdownToMdx } = require('./babel-plugin-markdown-to-mdx');

/**
 * @param {string} filePath
 * @param {MarkdownResult} markdownResult
 */
async function compileMdx(filePath, markdownResult) {
  /** @type {Record<string, string>} */
  const storyNameToKey = {};

  for (const { key, name } of markdownResult.stories) {
    storyNameToKey[name] = key;
  }

  const compilers = [createCompiler(storyNameToKey)];
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

  if (!result) {
    throw new Error('TODO');
  }

  return result.code;
}

module.exports = { compileMdx };

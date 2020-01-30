/** @typedef {import('@babel/types').Node} Node */

const mdxToJsx = require('@mdx-js/mdx/mdx-hast-to-jsx');

/**
 * @param {*} node
 * @param {*} options
 * @param {Record<string, string>} storyNameToKey
 */
function extractExports(node, options, storyNameToKey) {
  // we're overriding default export
  const defaultJsx = mdxToJsx.toJSX(node, {}, { ...options, skipExport: true });

  const fullJsx = [
    'import { assertIsFn, AddContext } from "@storybook/addon-docs/blocks";',
    defaultJsx,
    `const componentMeta = {};`,
    `const mdxStoryNameToKey = ${JSON.stringify(storyNameToKey)};`,
    'componentMeta.parameters = componentMeta.parameters || {};',
    'componentMeta.parameters.docs = componentMeta.parameters.docs || {};',
    'componentMeta.parameters.docs.page = () => <AddContext mdxStoryNameToKey={mdxStoryNameToKey} mdxComponentMeta={componentMeta}><MDXContent /></AddContext>',
    'export default componentMeta;',
  ].join('\n\n');

  return fullJsx;
}

/**
 * @param {Record<string, string>} storyNameToKey
 */
function createCompiler(storyNameToKey) {
  return function compiler(options = {}) {
    // @ts-ignore
    this.Compiler = tree => extractExports(tree, options, storyNameToKey);
  };
}

module.exports = createCompiler;

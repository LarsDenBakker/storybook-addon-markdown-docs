const mdxToJsx = require('@mdx-js/mdx/mdx-hast-to-jsx');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;

// insert `mdxStoryNameToKey` and `mdxComponentMeta` into the context so that we
// can reconstruct the Story ID dynamically from the `name` at render time
const wrapperJs = `
componentMeta.parameters = componentMeta.parameters || {};
componentMeta.parameters.docs = {
  ...(componentMeta.parameters.docs || {}),
  page: () => <AddContext mdxStoryNameToKey={mdxStoryNameToKey} mdxComponentMeta={componentMeta}><MDXContent /></AddContext>,
};
`.trim();

// Use this rather than JSON.stringify because `Meta`'s attributes
// are already valid code strings, so we want to insert them raw
// rather than add an extra set of quotes
function stringifyMeta(meta) {
  let result = '{ ';
  Object.entries(meta).forEach(([key, val]) => {
    if (val) {
      result += `${key}: ${val}, `;
    }
  });
  result += ' }';
  return result;
}

const hasStoryChild = node => {
  if (node.openingElement && node.openingElement.name.name === 'Story') {
    return node;
  }
  if (node.children && node.children.length > 0) {
    return node.children.find(child => hasStoryChild(child));
  }
  return null;
};

function extractExports(node, options, mdxOptions, storyNameToKey) {
  node.children.forEach(child => {
    // TODO: is this snippet needed?

    if (child.type === 'jsx') {
      try {
        const ast = parser.parseExpression(child.value, { plugins: ['jsx'] });
        if (
          ast.openingElement &&
          ast.openingElement.type === 'JSXOpeningElement' &&
          ast.openingElement.name.name === 'Preview' &&
          !hasStoryChild(ast)
        ) {
          const previewAst = ast.openingElement;
          previewAst.attributes.push({
            type: 'JSXAttribute',
            name: {
              type: 'JSXIdentifier',
              name: 'mdxSource',
            },
            value: {
              type: 'StringLiteral',
              value: encodeURI(
                ast.children
                  .map(
                    el =>
                      generate(el, {
                        quotes: 'double',
                      }).code,
                  )
                  .join('\n'),
              ),
            },
          });
        }
        const { code } = generate(ast, {});
        // eslint-disable-next-line no-param-reassign
        child.value = code;
      } catch {
        /** catch erroneous child.value string where the babel parseExpression makes exception
         * https://github.com/mdx-js/mdx/issues/767
         * eg <button>
         *      <div>hello world</div>
         *
         *    </button>
         * generates error
         * 1. child.value =`<button>\n  <div>hello world</div`
         * 2. child.value =`\n`
         * 3. child.value =`</button>`
         *
         */
      }
    }
  });
  // we're overriding default export
  const defaultJsx = mdxToJsx.toJSX(node, {}, { ...options, skipExport: true });
  const storyExports = [];
  const metaExport = {};

  const fullJsx = [
    'import { assertIsFn, AddContext } from "@storybook/addon-docs/blocks";',
    defaultJsx,
    ...storyExports,
    `const componentMeta = ${stringifyMeta(metaExport)};`,
    `const mdxStoryNameToKey = ${JSON.stringify(storyNameToKey)};`,
    wrapperJs,
    'export default componentMeta;',
  ].join('\n\n');

  return fullJsx;
}

function createCompiler(mdxOptions, storyNameToKey) {
  return function compiler(options = {}) {
    this.Compiler = tree => extractExports(tree, options, mdxOptions, storyNameToKey);
  };
}

module.exports = createCompiler;

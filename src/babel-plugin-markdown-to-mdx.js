/** @typedef {import('@types/babel__core').types.ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import('@types/babel__core').types.File} File */
/** @typedef {import('@types/babel__core').types.Program} Program */
/** @typedef {import('@types/babel__core').Visitor} Visitor */

const { types: t } = require('@babel/core');

/**
 * @param {Program} program
 * @param {File} codeBlocks
 */
function injectCodeBlocks(program, codeBlocks) {
  const { body } = codeBlocks.program;
  // ensure there is a default export
  const [defaultExport] = body.filter(n => t.isExportDefaultDeclaration(n));
  if (!defaultExport) {
    throw new Error('Markdown must have a default export');
  }

  // replace the user's default export with a variable, so that we can add it to the storybook
  // default export later
  const defaultExportReplacement = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('__userDefaultExport__'), defaultExport.declaration),
  ]);
  body.splice(body.indexOf(defaultExport), 1, defaultExportReplacement);

  // add the user's code on top in the correct order
  program.node.body.unshift(...body);

  // look for storybook addon docs' default export object
  const componentMeta = program.node.body.find(
    node =>
      t.isVariableDeclaration(node) &&
      t.isVariableDeclarator(node.declarations[0]) &&
      node.declarations[0].id.name === 'componentMeta',
  );

  if (!componentMeta) {
    throw new Error(
      'Something went wrong compiling to storybook docs, could not find component meta.',
    );
  }

  // add user's default export to storybook addon docs' default export
  componentMeta.declarations[0].init.properties.unshift(
    t.spreadElement(t.identifier('__userDefaultExport__')),
  );
}

function babelPluginMarkdownToMdx() {
  return {
    visitor: {
      /**
       * @param {Program} program
       * @param {*} state
       */
      Program(program, state) {
        const { codeBlocks, stories } = state.opts;
        for (const story of stories.map(s => s.ast.program.body).reverse()) {
          if (Array.isArray(story)) {
            program.node.body.unshift(...story);
          } else {
            program.node.body.unshift(story);
          }
        }
        injectCodeBlocks(program, codeBlocks);
      },
    },
  };
}

module.exports = { babelPluginMarkdownToMdx };

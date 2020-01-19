/** @typedef {import('@babel/types').File} File */
/** @typedef {import('./types').MarkdownResult} MarkdownResult */
/** @typedef {import('./types').Story} Story */

const { types: t } = require('@babel/core');
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const { parseMarkdown } = require('./parse-markdown');

/**
 * @param {Story} story
 */
function parseStory(story) {
  const ast = parse(story, { sourceType: 'module' });

  if (ast.program.body.length === 0) {
    throw new Error('<docs-story> codeblock cannot be empty');
  }

  const namedExports = ast.program.body.filter(node => node.type === 'ExportNamedDeclaration');

  if (namedExports.length === 0)
    throw new Error('<docs-story> codeblock should have a named export with a story');

  if (namedExports.length > 1)
    throw new Error('<docs-story> codeblock may not have more than one named export');

  const [namedExport] = namedExports;
  if (!namedExport || !namedExport.declaration)
    throw new Error('Unknown named export in <docs-story>');

  if (namedExport.declaration.type === 'VariableDeclaration') {
    if (namedExport.declaration.declarations.length > 1) {
      throw new Error('<docs-story> codeblock may not have more than one named export');
    }
    const { name } = namedExport.declaration.declarations[0].id;
    return { ast, name };
  }

  if (namedExport.declaration.type === 'FunctionDeclaration') {
    const { name } = namedExport.declaration.id;
    return { ast, name };
  }
  throw new Error('Unknown named export in <docs-story>');
}

/**
 * @param {File} ast
 * @param {MarkdownResult} markdownResult
 */
function injectStories(ast, markdownResult) {
  const stories = markdownResult.stories.map(story => parseStory(story));
  ast.program.body.push(...stories.map(s => s.ast));
  return stories.map(s => s.name);
}

/**
 * @param {File} ast
 * @param {MarkdownResult} markdownResult
 */
function injectDocsComponent(ast, markdownResult, storyNames, runtimeImport) {
  const [defaultExport] = ast.program.body.filter(n => t.isExportDefaultDeclaration(n));
  if (!defaultExport) {
    throw new Error('Markdown must have a default export');
  }

  ast.program.body.splice(ast.program.body.indexOf(defaultExport), 1);
  ast.program.body.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier('__moduleMeta__'), defaultExport.declaration),
    ]),
  );

  const storyNamesJson = `[${storyNames}]`;
  const htmlJson = JSON.stringify(markdownResult.html);
  const addDocsPageAst = parse(
    `
    import { createDocsPage } from '${runtimeImport}';

    __moduleMeta__.parameters = __moduleMeta__.parameters || {};
    __moduleMeta__.parameters.docs = {
      ...(__moduleMeta__.parameters.docs || {}),
      page: createDocsPage(${htmlJson}, ${storyNamesJson})
    };
    export default __moduleMeta__;
  `,
    { sourceType: 'module' },
  );

  ast.program.body.push(addDocsPageAst);
}

async function markdownToStories(code, runtimeImport = 'storybook-addon-markdown-docs/runtime.js') {
  const markdownResult = await parseMarkdown(code);
  const ast = parse(markdownResult.codeBlocks.join('\n'), { sourceType: 'module' });

  const storyNames = injectStories(ast, markdownResult);
  injectDocsComponent(ast, markdownResult, storyNames, runtimeImport);

  return generate(ast).code;
}

module.exports = { markdownToStories };

/** @typedef {import('@babel/types').ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import('./types').Code} Code */
/** @typedef {import('./types').Story} Story */

const { parse: parseJs } = require('@babel/parser');
const {
  isIdentifier,
  isExportNamedDeclaration,
  isVariableDeclaration,
  isExportSpecifier,
  expressionStatement,
  assignmentExpression,
  memberExpression,
  logicalExpression,
  identifier,
  stringLiteral,
} = require('@babel/types');

/**
 * @param {string} [name]
 * @param {string} codeString
 * @returns {Story}
 */
function createStory(name, codeString) {
  const ast = parseJs(codeString, { sourceType: 'module' });
  const { body: code } = ast.program;
  const namedExports = /** @type {ExportNamedDeclaration[]} */ (code.filter(n =>
    isExportNamedDeclaration(n),
  ));

  if (namedExports.length === 0) {
    throw new Error(`Story ${name ? `${name} ` : ''}should contain a named export.`);
  }

  if (namedExports.length > 1) {
    throw new Error(`Story ${name ? `${name} ` : ''}should not contain more than one named export`);
  }
  const [namedExport] = namedExports;
  let key;

  if (isVariableDeclaration(namedExport.declaration)) {
    const { declarations } = namedExport.declaration;
    if (declarations.length === 0 || declarations.length > 1) {
      throw new Error(`Story ${name} should have one named export.`);
    }
    if (!isIdentifier(declarations[0].id)) {
      throw new Error('TODO: correct error message');
    }

    key = declarations[0].id.name;
  } else {
    const exportSpecifiers = namedExport.specifiers.filter(s => isExportSpecifier(s));
    if (exportSpecifiers.length === 0) {
      throw new Error(`Story ${name ? `${name} ` : ''}should contain a named export.`);
    }

    if (exportSpecifiers.length > 1) {
      throw new Error(
        `Story ${name ? `${name} ` : ''}should not contain more than one named export`,
      );
    }
    key = exportSpecifiers[0].exported.name;
  }

  // inject story name (if it was a custom name) and source code string
  // TODO: make code string only the function, or the return value of the function and not the
  // full codeblock?
  const storyParameters = parseJs(
    `
    ${key}.story = ${key}.story || {};
    ${name ? `${key}.story.name = ${JSON.stringify(name)};` : ''}
    ${key}.story.parameters = ${key}.story.parameters || {};
    ${key}.story.parameters.mdxSource = ${JSON.stringify(codeString.trim())};`,
    { sourceType: 'module' },
  ).program.body;

  code.push(...storyParameters);

  return { key, name: key || name, code, codeString };
}

module.exports = { createStory };

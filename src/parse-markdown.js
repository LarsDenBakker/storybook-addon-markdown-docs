/* eslint-disable no-param-reassign */
const marked = require('marked');
const { types: t } = require('@babel/core');
const { parse: parseJs } = require('@babel/parser');
const { highlightAuto } = require('highlight.js');
const { parse: parseHtml, serialize } = require('parse5');
const {
  query,
  queryAll,
  predicates,
  getAttribute,
  setAttribute,
  getTextContent,
  remove,
} = require('dom5');
const { promisify } = require('util');
const startCase = require('lodash/startCase');

const renderer = new marked.Renderer();
const originalCodeHandler = renderer.code;

// rewrite codeblocks with `js run` as module scripts
renderer.code = function code(content, info, escaped) {
  if (info && info.trim().endsWith('script')) {
    return `<script type="module">${content}</script>`;
  }

  return originalCodeHandler.call(this, content, info, escaped);
};

marked.setOptions({
  renderer,
  highlight(code) {
    return `<span class="hljs">${highlightAuto(code).value}</span>`;
  },
});

const transform = promisify(marked.parse);

const { AND, hasTagName, hasAttrValue } = predicates;

/**
 * @param {DocumentAst} documentAst
 */
function findModuleScripts(documentAst) {
  const moduleScripts = queryAll(
    documentAst,
    AND(hasTagName('script'), hasAttrValue('type', 'module')),
  );
  const codeBlocks = [];
  for (const moduleScript of moduleScripts) {
    codeBlocks.push(getTextContent(moduleScript));
    remove(moduleScript);
  }

  return parseJs(codeBlocks.join('\n'), { sourceType: 'module' });
}

function parseStory(title, code) {
  const ast = parseJs(code, { sourceType: 'module' });
  const { body } = ast.program;
  const namedExports = /** @type {ExportNamedDeclaration[]} */ (body.filter(n =>
    t.isExportNamedDeclaration(n),
  ));

  if (namedExports.length === 0) {
    throw new Error(`Story ${title ? `${title} ` : ''}should contain a named export.`);
  }

  if (namedExports.length > 1) {
    throw new Error(
      `Story ${title ? `${title} ` : ''}should not contain more than one named export`,
    );
  }
  const [namedExport] = namedExports;

  if (t.isVariableDeclaration(namedExport.declaration)) {
    const { declarations } = namedExport.declaration;
    if (declarations.length === 0 || declarations.length > 1) {
      throw new Error(`Story ${title} should have one named export.`);
    }
    return { key: declarations[0].id.name, ast };
  }

  const exportSpecifiers = namedExport.specifiers.filter(s => t.isExportSpecifier(s));
  if (exportSpecifiers.length === 0) {
    throw new Error(`Story ${title ? `${title} ` : ''}should contain a named export.`);
  }

  if (exportSpecifiers.length > 1) {
    throw new Error(
      `Story ${title ? `${title} ` : ''}should not contain more than one named export`,
    );
  }

  return { key: exportSpecifiers[0].exported.name, ast };
}

/**
 * @param {DocumentAst} documentAst
 */
function findStories(documentAst) {
  const storyNodes = queryAll(documentAst, hasTagName('sb-story'));
  const stories = [];

  for (const storyNode of storyNodes) {
    let name = getAttribute(storyNode, 'name');
    const scriptNode = query(storyNode, AND(hasTagName('script'), hasAttrValue('type', 'module')));
    let codeString;
    if (scriptNode) {
      codeString = getTextContent(scriptNode);
    } else {
      if (!name) {
        throw new Error('A <sb-story> element without a codeblock must have a name attribute.');
      }

      const htmlStory = serialize(storyNode);
      // TODO: This replacement can generate incorrect coe;
      const key = name.replace(' ', '_');
      codeString = `
      export const ${key} = () => Object.assign(document.createElement('div'), {
        innerHTML: ${JSON.stringify(htmlStory)}
      });
      ${key}.story = { name: ${JSON.stringify(name)} };
      `;
    }
    // clear story text content
    storyNode.childNodes = [];

    const { key, ast } = parseStory(name, codeString);
    if (!name) {
      name = key;
      setAttribute(storyNode, 'name', key);
    }
    stories.push({ key, name, ast, codeString });
  }
  return stories;
}

function renameSbElementsToJsx(documentAst) {
  queryAll(documentAst, () => true).forEach(node => {
    if (node.tagName.startsWith('sb-')) {
      const jsxName = startCase(node.tagName.replace('sb-', '')).replace(' ', '');
      node.nodeName = jsxName;
      node.tagName = jsxName;
    }
  });
}

/**
 * @param {string} markdown
 */
async function parseMarkdown(markdown) {
  const html = await transform(markdown);
  const documentAst = parseHtml(html);
  const stories = findStories(documentAst);
  const codeBlocks = findModuleScripts(documentAst);
  renameSbElementsToJsx(documentAst);

  return { html: serialize(query(documentAst, hasTagName('body'))), stories, codeBlocks };
}

module.exports = { parseMarkdown };

/** @typedef {import('parse5').Document} DocumentAst */
/** @typedef {import('@babel/types').Statement} Statement */
/** @typedef {import('@babel/types').ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import('./types').MarkdownResult} MarkdownResult */
/** @typedef {import('./types').Code} Code */
/** @typedef {import('./types').Story} Story */

/* eslint-disable no-param-reassign */
const marked = require('marked');
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
const { createStory } = require('./create-story');

const renderer = new marked.Renderer();
const originalCodeHandler = renderer.code;

// rewrite codeblocks with `js run` as module scripts
// @ts-ignore
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
 * @returns {Code}
 */
function findCode(documentAst) {
  const moduleScripts = queryAll(
    documentAst,
    AND(hasTagName('script'), hasAttrValue('type', 'module')),
  );
  const codeBlocks = [];
  for (const moduleScript of moduleScripts) {
    codeBlocks.push(getTextContent(moduleScript));
    remove(moduleScript);
  }

  return parseJs(codeBlocks.join('\n'), { sourceType: 'module' }).program.body;
}

/**
 * @param {DocumentAst} documentAst
 * @returns {Story[]}
 */
function findStories(documentAst) {
  const storyNodes = queryAll(documentAst, hasTagName('sb-story'));
  const stories = [];

  for (const storyNode of storyNodes) {
    let name = getAttribute(storyNode, 'name') || undefined;
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

    const { key, code } = createStory(name, codeString);
    if (!name) {
      name = key;
      setAttribute(storyNode, 'name', key);
    }
    stories.push({ key, name, code, codeString });
  }
  return stories;
}

/**
 * @param {DocumentAst} documentAst
 */
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
 * @returns {Promise<MarkdownResult>}
 */
async function parseMarkdown(markdown) {
  const html = await transform(markdown);
  const documentAst = parseHtml(html);
  const stories = findStories(documentAst);
  const code = findCode(documentAst);
  renameSbElementsToJsx(documentAst);
  const body = query(documentAst, hasTagName('body'));

  return { html: serialize(body), stories, code };
}

module.exports = { parseMarkdown };

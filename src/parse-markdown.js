/** @typedef {import('parse5').Document} DocumentAst */
/** @typedef {import('./types').MarkdownResult} MarkdownResult */
/** @typedef {import('./types').Story} Story */

const marked = require('marked');
const { highlightAuto } = require('highlight.js');
const { parse, serialize } = require('parse5');
const { query, queryAll, predicates, getAttribute, getTextContent, remove } = require('dom5');
const { promisify } = require('util');

const renderer = new marked.Renderer();
const originalCodeHandler = renderer.code;

// rewrite codeblocks with `js run` as module scripts
renderer.code = function code(content, info, escaped) {
  if (info.trim().endsWith('script')) {
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
 * @returns {string[]}
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

  return codeBlocks;
}

/**
 * @param {DocumentAst} documentAst
 * @returns {string[]}
 */
function findStories(documentAst) {
  const storyNodes = queryAll(documentAst, hasTagName('docs-story'));
  const stories = [];

  for (const storyNode of storyNodes) {
    const scriptNode = query(storyNode, AND(hasTagName('script'), hasAttrValue('type', 'module')));
    if (scriptNode) {
      stories.push(getTextContent(scriptNode));
      remove(scriptNode);
    } else {
      const name = getAttribute(storyNode, 'name');
      if (!name) {
        throw new Error('A <docs-story> element without a codeblock must have a name attribute.');
      }

      const sanitizedName = name.replace(' ', '_');
      const htmlStory = serialize(storyNode);
      stories.push(`export const ${sanitizedName} = () => ${JSON.stringify(htmlStory)}`);
    }
  }
  return stories;
}

/**
 * @param {string} markdown
 * @returns {MarkdownResult}
 */
async function parseMarkdown(markdown) {
  const html = await transform(markdown);

  const documentAst = parse(html);
  const stories = findStories(documentAst);
  const codeBlocks = findModuleScripts(documentAst);

  return { html: serialize(query(documentAst, hasTagName('body'))), stories, codeBlocks };
}

module.exports = { parseMarkdown };

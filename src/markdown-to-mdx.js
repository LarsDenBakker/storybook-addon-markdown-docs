const { parseMarkdown } = require('./parse-markdown');
const { compileMdx } = require('./compile-mdx');

/**
 * @param {string} filePath
 * @param {string} markdown
 */
async function markdownToMdx(filePath, markdown) {
  const markdownResult = await parseMarkdown(markdown);
  return compileMdx(filePath, markdownResult);
}

module.exports = { markdownToMdx };

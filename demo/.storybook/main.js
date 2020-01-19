const { markdownToStories } = require('../../src/markdown-to-stories');

module.exports = {
  stories: ['./stories/*.stories.{js,md}'],
  esDevServer: {
    open: true,
    nodeResolve: true,
    fileExtensions: ['.js', '.mjs', '.md'],
    responseTransformers: [
      async function mdToStory({ url, body }) {
        const cleanURL = url.split('?')[0].split('#')[0];

        if (cleanURL.endsWith('md')) {
          const markdownStory = await markdownToStories(body, '/src/runtime.js');
          return { body: markdownStory };
        }
      },
    ],
  },
};

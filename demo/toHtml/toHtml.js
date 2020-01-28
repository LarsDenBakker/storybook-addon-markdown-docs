const fs = require('fs');
const { Parser, HtmlRenderer, Node } = require('commonmark');

const reader = new Parser();
const writer = new HtmlRenderer();
const demoText = fs.readFileSync('./demo.md', 'utf-8');
const parsed = reader.parse(demoText);

let jsCode = '';
let templateCounter = 0;
const templateStories = [];

let fnCounter = 0;
const fnStories = [];

const walker = parsed.walker();
let event = walker.next()
while (event) {
  const { node } = event;
  if (event.entering && node.type === 'code_block') {
    if (node.info === 'js story') {
      const htmlBlock = new Node('html_block');
      htmlBlock.literal = `<div id="story-${templateCounter}"></div>`;
      node.insertAfter(htmlBlock);
      templateStories.push(node.literal);
      templateCounter += 1;
      node.unlink();
    }
    if (node.info === 'js script') {
      node.unlink();
      jsCode += node.literal;
    }
    if (node.info === 'html story') {
      const htmlBlock = new Node('html_block');
      htmlBlock.literal = node.literal;
      node.insertAfter(htmlBlock);
      node.unlink();
    }
  }
  if (event.entering && node.type === 'link') {
    if (node.destination === 'story') {
      const htmlBlock = new Node('html_block');
      htmlBlock.literal = `<div id="fn-story-${fnCounter}"></div>`;
      node.insertAfter(htmlBlock);
      fnStories.push(node.title);
      fnCounter += 1;
      node.unlink();
    }
  }
  event = walker.next();
}

const result = writer.render(parsed); // result is a String

const html = `
  <script type="module">
    ${jsCode}

    const templateStories = [${templateStories.join(',')}];
    templateStories.forEach((template, i) => {
      render(template, document.getElementById(\`story-$\{i}\`));
    });
    const fnStories = [${fnStories.join(',')}];
    fnStories.forEach((templateFn, i) => {
      render(templateFn(), document.getElementById(\`fn-story-$\{i}\`));
    });
  </script>
  ${result}
`;

fs.writeFileSync('./index.html', html, 'utf-8');

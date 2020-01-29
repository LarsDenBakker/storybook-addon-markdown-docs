const fs = require('fs');
const { Parser, Node } = require('commonmark');
const MdxRenderer = require('./MdxRenderer');

const reader = new Parser();
const writer = new MdxRenderer();
const demoText = fs.readFileSync('./demo.md', 'utf-8');
const parsed = reader.parse(demoText);

let jsCode = '';
let templateCounter = 0;
const templateStories = [];

let fnCounter = 0;
const fnStories = [];


// console.log(parsed);

// console.log(astToMdx(parsed, demoText));

const result = writer.render(parsed); // result is a String

console.log('--------');
console.log(result);

// const html = `
//   <script type="module">
//     ${jsCode}

//     const templateStories = [${templateStories.join(',')}];
//     templateStories.forEach((template, i) => {
//       render(template, document.getElementById(\`story-$\{i}\`));
//     });
//     const fnStories = [${fnStories.join(',')}];
//     fnStories.forEach((templateFn, i) => {
//       render(templateFn(), document.getElementById(\`fn-story-$\{i}\`));
//     });
//   </script>
//   ${result}
// `;

// fs.writeFileSync('./index.html', html, 'utf-8');

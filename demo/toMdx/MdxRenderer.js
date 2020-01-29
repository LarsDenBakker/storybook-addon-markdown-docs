var { Renderer } = require('commonmark');

function MdxRenderer(options) {
  options = options || {};
  this.options = options;
}

function render(ast) {
  this.buffer = '';

  var attrs;
  var walker = ast.walker();
  var event, node, entering;
  var container;
  var selfClosing;
  var nodetype;

  var options = this.options;

  while ((event = walker.next())) {
    entering = event.entering;
    node = event.node;
    nodetype = node.type;
    container = node.isContainer;

    if (entering) {
      switch (nodetype) {
        case 'document':
          break;
        case 'list':
          // if (node.listType !== null) {
          //   attrs.push(['type', node.listType.toLowerCase()]);
          // }
          // if (node.listStart !== null) {
          //   attrs.push(['start', String(node.listStart)]);
          // }
          // if (node.listTight !== null) {
          //   attrs.push(['tight', (node.listTight ? 'true' : 'false')]);
          // }
          // var delim = node.listDelimiter;
          // if (delim !== null) {
          //   var delimword = '';
          //   if (delim === '.') {
          //     delimword = 'period';
          //   } else {
          //     delimword = 'paren';
          //   }
          //   attrs.push(['delimiter', delimword]);
          // }
          break;
        case 'code_block':
          if (node.info === 'js story') {
            this.buffer += '<Story name="test">';
            this.buffer += '\n  {';
            this.buffer += node.literal;
            this.buffer += '  }\n';
            this.buffer += '</Story>';
          } else {
            this.buffer += '```';
            this.buffer += node.info + '\n';
            this.buffer += node.literal;
            this.buffer += '```';
          }
          // if (node.info) {
          //   attrs.push(['info', node.info]);
          // }
          break;
        case 'heading':
          // console.log("in", node.literal);
          this.buffer += '#'.repeat(node.level) + ' ';
          break;
        case 'text':
          this.buffer += node.literal;
          break;
        case 'link':
        case 'image':
          attrs.push(['destination', node.destination]);
          attrs.push(['title', node.title]);
          break;
        case 'custom_inline':
        case 'custom_block':
          attrs.push(['on_enter', node.onEnter]);
          attrs.push(['on_exit', node.onExit]);
          break;
        case 'paragraph':
          // this.buffer += node.literal;
          break;
        default:
          break;
      }
    } else {
      this.buffer += '\n\n';
    }

  }
  this.buffer += '\n';
  return this.buffer;
}

// quick browser-compatible inheritance
MdxRenderer.prototype = Object.create(Renderer.prototype);

MdxRenderer.prototype.render = render;

module.exports = MdxRenderer;

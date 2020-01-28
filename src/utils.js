const RESERVED = /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|await|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/;
const camelCase = require('lodash/camelCase');

const isReserved = name => RESERVED.exec(name);
const startsWithNumber = name => /^\d/.exec(name);

function getStoryKey(name) {
  let key = camelCase(name);
  if (startsWithNumber(key)) {
    key = `_${key}`;
  } else if (isReserved(key)) {
    key = `${key}Story`;
  }
  return key;
}

module.exports = { getStoryKey };

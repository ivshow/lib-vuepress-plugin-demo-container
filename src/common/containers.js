const mdContainer = require('markdown-it-container');
const path = require('path');
const fs = require('fs');

const requireCode = (content) => {
  const codePath = content.match(/^iframe\s*(.*)/);

  if (!codePath) {
    return {
      code: content,
      iframe: ''
    };
  }

  const resolvePath = path.join(process.cwd(), '/docs/.vuepress/iframe/', codePath[1]);
  const code = fs.readFileSync(resolvePath, 'utf8');
  return {
    code: code.replace(/<!--[\s\S]*?-->/g, '').trim(),
    iframe: '/iframe/' + codePath[1].replace(/\.vue/g, '')
  };
}

module.exports = options => {
  const {
    component = 'demo-block'
  } = options;
  const componentName = component
    .replace(/^\S/, s => s.toLowerCase())
    .replace(/([A-Z])/g, "-$1").toLowerCase();
  return md => {
    md.use(mdContainer, 'demo', {
      validate(params) {
        return params.trim().match(/^demo\s*(.*)/);
      },
      render(tokens, idx) {
        const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
        if (tokens[idx].nesting === 1) {
          const description = m && m.length > 1 ? m[1] : '';
          const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
          const encodeOptionsStr = encodeURI(JSON.stringify(options));
          const { code, iframe } = requireCode(content);
          tokens[idx + 1].content = code;
          return `<${componentName} :options="JSON.parse(decodeURI('${encodeOptionsStr}'))">
            ${iframe ? `<iframe slot="iframe" src="${iframe}"></iframe>` : `<template slot="demo"><!--pre-render-demo:${content}:pre-render-demo--></template>`}
            ${description ? `<div slot="description">${md.render(description).html}</div>` : ''}
            <template slot="source">
          `;
        }
        return `</template></${componentName}>`;
      }
    });
  };
}
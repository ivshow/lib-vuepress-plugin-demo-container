const mdContainer = require('markdown-it-container');

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
        return params.trim().match(/^demo\s*(.*)$/);
      },
      render(tokens, idx) {
        const [desc, iframe] = tokens[idx].info.trim().split('iframe:');
        const m = desc.match(/^demo\s*(.*)$/);
        const iframeUrl = iframe.trim();
        if (tokens[idx].nesting === 1) {
          const description = m && m.length > 1 ? m[1] : '';
          const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
          const encodeOptionsStr = encodeURI(JSON.stringify(options));
          return `<${componentName} :options="JSON.parse(decodeURI('${encodeOptionsStr}'))">
            ${iframeUrl ? `<iframe slot="iframe" src="${iframeUrl}"></iframe>` : `<template slot="demo"><!--pre-render-demo:${content}:pre-render-demo--></template>`}
            ${description ? `<div slot="description">${md.render(description).html}</div>` : ''}
            <template slot="source">
          `;
        }
        return `</template></${componentName}>`;
      }
    });
  };
}
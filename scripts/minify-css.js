'use strict';

const CleanCSS = require('clean-css');

hexo.extend.filter.register('after_generate', () => {
  const key = 'css/custom.css';
  const stream = hexo.route.get(key);
  if (!stream) return;

  return new Promise((resolve, reject) => {
    let css = '';
    stream.on('data', (chunk) => { css += chunk; });
    stream.on('error', reject);
    stream.on('end', () => {
      const result = new CleanCSS({}).minify(css);
      if (result.errors.length) {
        reject(new Error('clean-css failed: ' + result.errors.join('; ')));
        return;
      }
      if (result.warnings.length) {
        hexo.log.warn('clean-css warnings: ' + result.warnings.join('; '));
      }
      hexo.route.set(key, result.styles);
      resolve();
    });
  });
});

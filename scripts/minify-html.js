'use strict';

const { minify } = require('html-minifier-terser');

hexo.extend.filter.register('after_render:html', (str, data) =>
  minify(str, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    keepClosingSlash: true,
  }).catch((err) => {
    hexo.log.warn('minify-html skipped %s: %s', (data && data.path) || '?', err.message);
    return str;
  })
);

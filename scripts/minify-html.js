'use strict';

const { minify } = require('html-minifier-terser');

hexo.extend.filter.register('after_render:html', (str) =>
  minify(str, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    keepClosingSlash: true,
  })
);

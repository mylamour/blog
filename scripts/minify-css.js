'use strict';

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

hexo.extend.filter.register('after_generate', () => {
  const file = path.join(hexo.public_dir, 'css/custom.css');
  if (!fs.existsSync(file)) return;

  const result = new CleanCSS({}).minify(fs.readFileSync(file, 'utf8'));
  if (result.errors.length) {
    throw new Error('clean-css failed: ' + result.errors.join('; '));
  }
  fs.writeFileSync(file, result.styles);
});

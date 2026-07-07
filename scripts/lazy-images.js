'use strict';

hexo.extend.filter.register('after_render:html', (str) =>
  str.replace(/<img (?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async" ')
);

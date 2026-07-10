'use strict';

const { resolveBilingualUrls, slugFromPairingKey } = require('../lib/site-policy');

function register(hexoInstance) {
  hexoInstance.extend.helper.register('bilingual_urls', function (targetPage) {
    const page = targetPage || this.page;
    const canonical = (page.permalink || this.full_url_for(page.canonical_path || page.path || ''))
      .replace(/\/index\.html$/, '/');
    return resolveBilingualUrls({
      siteId: this.config.language === 'en' ? 'en' : 'zh',
      canonicalUrl: canonical,
      pagePath: page.canonical_path || page.path || '',
      source: page.source || '',
      layout: page.layout,
      translated: page.translated
    });
  });

  hexoInstance.extend.filter.register('before_generate', function () {
    if (hexoInstance.config.language !== 'en') return;

    return Promise.all(hexoInstance.locals.get('posts').map((post) => {
      const slug = slugFromPairingKey(post.source, 1);
      if (post.slug === slug) return undefined;
      post.slug = slug;
      return post.update({ slug });
    }));
  });
}

if (typeof hexo !== 'undefined') register(hexo);
module.exports = { register };

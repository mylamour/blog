'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('../scripts/bilingual');

function registeredBilingual({ language = 'en', posts = [] } = {}) {
  let registeredName;
  let helper;
  let registeredFilterName;
  let beforeGenerate;
  const mockHexo = {
    config: { language },
    locals: {
      get(name) {
        assert.equal(name, 'posts');
        return posts;
      }
    },
    extend: {
      helper: {
        register(name, implementation) {
          registeredName = name;
          helper = implementation;
        }
      },
      filter: {
        register(name, implementation) {
          registeredFilterName = name;
          beforeGenerate = implementation;
        }
      }
    }
  };

  register(mockHexo);

  assert.equal(registeredName, 'bilingual_urls');
  assert.equal(typeof helper, 'function');
  return { helper, registeredFilterName, beforeGenerate };
}

function registeredHelper() {
  return registeredBilingual().helper;
}

function postRecord(source, slug) {
  let persistedSlug = slug;
  return {
    source,
    slug,
    getPersistedSlug() {
      return persistedSlug;
    },
    update(values) {
      persistedSlug = values.slug;
      return Promise.resolve({ ...this, ...values });
    }
  };
}

function helperContext({ language, url, page }) {
  return {
    config: { language, url },
    page,
    full_url_for(publicPath) {
      return new URL(publicPath, `${this.config.url}/`).href;
    }
  };
}

test('registers Chinese translated post metadata with a lowercase English alternate', () => {
  const helper = registeredHelper();
  const context = helperContext({
    language: 'zh-CN',
    url: 'https://fz.cool',
    page: {
      permalink: 'https://fz.cool/Deep-Dive-Into-Clearing-Network/',
      path: 'Deep-Dive-Into-Clearing-Network/index.html',
      source: '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
      layout: 'post',
      translated: true
    }
  });

  assert.deepEqual(helper.call(context), {
    canonicalUrl: 'https://fz.cool/Deep-Dive-Into-Clearing-Network/',
    language: 'zh-CN',
    locale: 'zh_CN',
    alternateUrl: 'https://iami.xyz/deep-dive-into-clearing-network/',
    alternateLanguage: 'en',
    alternateLocale: 'en_US',
    xDefaultUrl: 'https://iami.xyz/deep-dive-into-clearing-network/'
  });
});

test('registers English translated post metadata with a case-preserving Chinese alternate', () => {
  const helper = registeredHelper();
  const context = helperContext({
    language: 'en',
    url: 'https://iami.xyz',
    page: {
      permalink: 'https://iami.xyz/deep-dive-into-clearing-network/',
      path: 'deep-dive-into-clearing-network/index.html',
      source: '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
      layout: 'post',
      translated: true
    }
  });

  assert.deepEqual(helper.call(context), {
    canonicalUrl: 'https://iami.xyz/deep-dive-into-clearing-network/',
    language: 'en',
    locale: 'en_US',
    alternateUrl: 'https://fz.cool/Deep-Dive-Into-Clearing-Network/',
    alternateLanguage: 'zh-CN',
    alternateLocale: 'zh_CN',
    xDefaultUrl: 'https://iami.xyz/deep-dive-into-clearing-network/'
  });
});

test('registers the About landing-page alternate without a translated flag', () => {
  const helper = registeredHelper();
  const context = helperContext({
    language: 'en',
    url: 'https://iami.xyz',
    page: {
      canonical_path: 'about/index.html',
      path: 'about/index.html',
      layout: 'page'
    }
  });

  assert.deepEqual(helper.call(context), {
    canonicalUrl: 'https://iami.xyz/about/',
    language: 'en',
    locale: 'en_US',
    alternateUrl: 'https://fz.cool/about/',
    alternateLanguage: 'zh-CN',
    alternateLocale: 'zh_CN',
    xDefaultUrl: 'https://iami.xyz/about/'
  });
});

test('does not invent an alternate for a taxonomy detail page', () => {
  const helper = registeredHelper();
  const context = helperContext({
    language: 'en',
    url: 'https://iami.xyz',
    page: {
      permalink: 'https://iami.xyz/tags/security/',
      path: 'tags/security/index.html',
      layout: 'tag'
    }
  });

  assert.deepEqual(helper.call(context), {
    canonicalUrl: 'https://iami.xyz/tags/security/',
    language: 'en',
    locale: 'en_US',
    alternateUrl: null,
    alternateLanguage: null,
    alternateLocale: null,
    xDefaultUrl: null
  });
});

test('targetPage overrides this.page and terminal index.html is canonicalized', () => {
  const helper = registeredHelper();
  const context = helperContext({
    language: 'en',
    url: 'https://iami.xyz',
    page: {
      permalink: 'https://iami.xyz/ignored/',
      path: 'ignored/index.html',
      layout: 'page'
    }
  });
  const targetPage = {
    permalink: 'https://iami.xyz/about/index.html',
    canonical_path: 'about/index.html',
    path: 'wrong/index.html',
    layout: 'page'
  };

  const urls = helper.call(context, targetPage);

  assert.equal(urls.canonicalUrl, 'https://iami.xyz/about/');
  assert.equal(urls.alternateUrl, 'https://fz.cool/about/');
  assert.equal(urls.xDefaultUrl, 'https://iami.xyz/about/');
});

test('before_generate derives English slugs from source basenames using shared policy', async () => {
  const posts = [
    postRecord(
      '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
      'unrelated-CURRENT-slug'
    ),
    postRecord('_posts/2018-02-13-ELK小记.md', 'DIFFERENT-current-slug')
  ];
  const registration = registeredBilingual({ language: 'en', posts });

  assert.equal(registration.registeredFilterName, 'before_generate');
  assert.equal(typeof registration.beforeGenerate, 'function');
  await registration.beforeGenerate();

  assert.equal(posts[0].slug, 'deep-dive-into-clearing-network');
  assert.equal(posts[1].slug, 'elk小记');
  assert.equal(posts[0].getPersistedSlug(), 'deep-dive-into-clearing-network');
  assert.equal(posts[1].getPersistedSlug(), 'elk小记');
});

test('before_generate leaves Chinese post slugs untouched', async () => {
  const post = postRecord(
    '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
    'Deep-Dive-Into-Clearing-Network'
  );
  const registration = registeredBilingual({ language: 'zh-CN', posts: [post] });

  assert.equal(registration.registeredFilterName, 'before_generate');
  assert.equal(typeof registration.beforeGenerate, 'function');
  await registration.beforeGenerate();

  assert.equal(post.slug, 'Deep-Dive-Into-Clearing-Network');
  assert.equal(post.getPersistedSlug(), 'Deep-Dive-Into-Clearing-Network');
});

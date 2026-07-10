'use strict';

const { loadTrackedInventory } = require('../lib/content-inventory');
const {
  buildEnglishRedirects,
  parseNetlifyRedirects,
  validateEnglishRedirects
} = require('../lib/english-redirects');

function register(hexoInstance) {
  hexoInstance.extend.generator.register('english_redirects', async function () {
    if (hexoInstance.config.language !== 'en') return [];

    const inventory = await loadTrackedInventory(hexoInstance.base_dir || process.cwd());
    const data = buildEnglishRedirects(inventory);
    validateEnglishRedirects({
      rules: parseNetlifyRedirects(data),
      inventory
    });
    return { path: '_redirects', data };
  });
}

if (typeof hexo !== 'undefined') register(hexo);
module.exports = { register };

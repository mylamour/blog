const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const md5 = (p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex').slice(0, 8);

const targets = [
  { asset: 'source/css/styles.css', ref: 'layout/_partial/style.ejs', re: /styles\.css\?v=[a-z0-9]+/g, name: 'styles.css' },
  { asset: 'source/css/custom.css', ref: 'layout/_partial/head.ejs', re: /custom\.css\?v=[a-z0-9]+/g, name: 'custom.css' },
  { asset: 'source/js/bundle.js', ref: 'layout/_partial/load-script.ejs', re: /bundle\.js\?v=[a-z0-9]+/g, name: 'bundle.js' },
];

for (const t of targets) {
  const hash = md5(path.join(__dirname, t.asset));
  const ref = path.join(__dirname, t.ref);
  const src = fs.readFileSync(ref, 'utf8');
  if (!t.re.test(src)) {
    console.error(`WARN: no ${t.name}?v= reference found in ${t.ref}`);
    continue;
  }
  t.re.lastIndex = 0;
  const out = src.replace(t.re, `${t.name}?v=${hash}`);
  if (out !== src) fs.writeFileSync(ref, out);
  console.log(`${t.name} ?v=${hash}`);
}

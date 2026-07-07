#!/usr/bin/env python3
"""从主题 layout/配置/关于页提取 FZShuSong 需要的字符集。加字后重跑 subset.sh 即可。"""
import glob, pathlib, string

ROOT = pathlib.Path(__file__).resolve().parents[3]  # blog 根目录
chars = set()
sources = [
    'themes/fexo2/layout/**/*.ejs',
    'themes/fexo2/_config.yml',
    '_config.yml',
    'source/about/*.md',
]
for pattern in sources:
    for f in glob.glob(str(ROOT / pattern), recursive=True):
        chars |= set(pathlib.Path(f).read_text('utf-8', errors='ignore'))

chars |= set(string.printable)
chars |= set('，。、；：？！「」『』（）《》〈〉·—…''""～×©®年月日字次分钟预计阅读访问搜索分类标签归档订阅')
text = ''.join(sorted(c for c in chars if c.isprintable()))
out = pathlib.Path(__file__).parent / 'charset.txt'
out.write_text(text, 'utf-8')
print(f'{len(text)} chars -> {out}')

#!/bin/sh
set -e
cd "$(dirname "$0")"
python3 make-charset.py
python3 -m fontTools.subset fzssjt.ttf \
  --text-file=charset.txt \
  --flavor=woff2 \
  --no-hinting --desubroutinize \
  --output-file=../source/fonts/fzshusong-subset.woff2
ls -lh ../source/fonts/fzshusong-subset.woff2

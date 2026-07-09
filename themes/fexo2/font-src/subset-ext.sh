#!/bin/sh
# 方正书宋简体字库缺繁体「開」(U+958B)，从思源宋体（SIL OFL 授权，可自由子集分发）补字。
# 思源宋体源文件体积大（~23MB）不入库，按需下载：
#   curl -sL -o /tmp/SourceHanSerifSC-Regular.otf \
#     https://github.com/adobe-fonts/source-han-serif/raw/release/OTF/SimplifiedChinese/SourceHanSerifSC-Regular.otf
# 若日后有其他缺字（简体字库外的繁体/生僻字），把字符追加到 --text= 里重跑即可，
# 并在 _fonts.scss 对应 @font-face 的 unicode-range 中补上码位。
set -e
cd "$(dirname "$0")"
SRC=${1:-/tmp/SourceHanSerifSC-Regular.otf}
python3 -m fontTools.subset "$SRC" \
  --text=開 \
  --flavor=woff2 \
  --no-hinting --desubroutinize \
  --output-file=../source/fonts/fzshusong-ext.woff2
ls -lh ../source/fonts/fzshusong-ext.woff2

#!/bin/sh
set -e

# compile our library, stripping out everything that is not necessary, and applying optimizations.
# -O3 generates a slightly smaller binary even though -Os "optimizes for size"
clang \
  --target=wasm32 \
  -fvisibility=hidden \
  -nostdlib \
  -O3 \
  -Wl,--no-entry \
  -Wl,--export-dynamic \
  -Wl,--allow-undefined \
  -Wl,--strip-all \
  -Wl,--import-memory \
  -o demo.wasm \
  demo.c

# create a QR code with the WASM file as input
# --secure=1 means low error correction level: 1 (of 4)
zint \
  --barcode=58 \
  --secure=1 \
  --binary \
  --quietzones \
  --scale 2 \
  --input=demo.wasm \
  --output=qrcode.png

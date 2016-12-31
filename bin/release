#!/bin/bash -ex

npm run -s build

rm -rvf web-ext-artifacts dist*
mkdir -p dist/assets
cp -rv manifest.json third-party build dist
cp -rv assets/icon*.png dist/assets

web-ext -s dist lint
web-ext -s dist build
. ~/.firefox-creds
web-ext -s dist sign
ls -l web-ext-artifacts

echo "done"

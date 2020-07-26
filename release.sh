#!/usr/bin/env bash

set -exo pipefail

cd "$(dirname $0)"

mkdir -p build
cp -rv src/*.js src/*.css build

rm -rvf web-ext-artifacts dist*
mkdir -p dist/assets
cp -rv manifest.json build dist
cp -rv assets/icon*.png dist/assets

web-ext -s dist lint
web-ext -s dist build
. ~/.firefox-creds
web-ext -s dist sign
ls -l web-ext-artifacts

echo "done"

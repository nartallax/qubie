#!/usr/bin/env bash
set -e
cd `dirname "$0"`
cd ..

PROJECT_NAME="$1"

scripts/prepare_release.sh "${PROJECT_NAME}"

cd "${PROJECT_NAME}/target"
rm -rf *.tgz
TARBALL=`npm pack 2> /dev/null`
mv "${TARBALL}" package.tgz
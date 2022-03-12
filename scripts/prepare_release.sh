#!/usr/bin/env bash
set -e
cd `dirname "$0"`
cd ..

PROJECT_NAME="$1"
cd "${PROJECT_NAME}"

rm -rf target
../node_modules/.bin/imploder --tsconfig tsconfig.json --profile release
../scripts/generate_dts.sh "${PROJECT_NAME}"
cp "package.json" "target/package.json"
cp "README.md" "target/README.md"
cp "../LICENSE" "target/LICENSE"
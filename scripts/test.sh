#!/usr/bin/env bash
set -e
cd `dirname "$0"`
cd ..

scripts/package.sh transformer

cd test_project
npm install ../transformer/target/package.tgz
../node_modules/.bin/imploder --tsconfig tsconfig.json
node js/test_project.js

echo "Testing successful."

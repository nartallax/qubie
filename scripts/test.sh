#!/usr/bin/env bash
set -e
cd `dirname "$0"`
cd ..

scripts/package.sh core

cd transformer
npm install ../core/target/package.tgz
cd - > /dev/null
scripts/package.sh transformer

cd pg
npm install ../core/target/package.tgz
cd - > /dev/null
scripts/package.sh pg

cd test_project
npm install \
	../transformer/target/package.tgz \
	../core/target/package.tgz \
	../pg/target/package.tgz
../node_modules/.bin/imploder --tsconfig tsconfig.json
node js/test_project.js

echo "Testing successful."

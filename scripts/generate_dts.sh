#!/usr/bin/env bash
set -e
cd `dirname "$0"`
cd ..

PROJECT_NAME="$1"

ENTRYPOINT_FILE="${PROJECT_NAME}/ts/${PROJECT_NAME}_main.ts"
TSCONFIG_FILE="${PROJECT_NAME}/tsconfig.json"

DTS_FILE="${PROJECT_NAME}/target/qubie_${PROJECT_NAME}.d.ts"
if [ "${PROJECT_NAME}" = "core" ]; then
  DTS_FILE="${PROJECT_NAME}/target/qubie.d.ts"
fi


TMP_TSCONFIG_FILE="$TSCONFIG_FILE.tmp.json"
trap '{ rm -- "$TMP_TSCONFIG_FILE"; }' EXIT
cat "$TSCONFIG_FILE" | sed 's/"compilerOptions": {/"compilerOptions": {"removeComments":false,/' > "$TMP_TSCONFIG_FILE"

TMP_DTS_FILE="$DTS_FILE.tmp"
./node_modules/.bin/dts-bundle-generator -o "$DTS_FILE" --project "$TMP_TSCONFIG_FILE" --no-banner "$ENTRYPOINT_FILE"
sed 's/export [*] from.*//g' "$DTS_FILE" | sed 's/export [{][}].*//g' > $TMP_DTS_FILE
mv $TMP_DTS_FILE "$DTS_FILE"
#!/usr/bin/env bash

PKG_NAME=$(cat package.json | jq -r '.name')
EXT_VERSION=$(cat package.json | jq -r '.version')

pnpm zip
pnpm zip -b firefox

pnpm submit \
    --chrome-zip ".output/$PKG_NAME-$EXT_VERSION-chrome.zip" \
    --firefox-zip ".output/$PKG_NAME-$EXT_VERSION-firefox.zip" \
    --firefox-sources-zip ".output/$PKG_NAME-$EXT_VERSION-sources.zip"

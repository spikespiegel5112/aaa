#!/bin/zsh -ilex
git pull --rebase origin dev;
node -v;
npm -v;
npm i;
npm run build:prod;
ls dist;

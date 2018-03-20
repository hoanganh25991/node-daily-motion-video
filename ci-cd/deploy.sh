#!/bin/bash
# Sanity check
whoami
node --version
which node

# env file
cp ~/env-files/convert-mp3/.env $WORKSPACE

# Install & build
yarn install
yarn build

# Start with pm2
export BUILD_ID=dontKillMe
export SERVER_PORT=4567
# TODO: Graceful restart
pm2 stop convert_mp3 || true
pm2 start dist/server.js --name=convert_mp3 --no-autorestart

# Regis startup
pm2 save
pm2 startup || true
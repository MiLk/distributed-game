#!/usr/bin/env bash

./scripts/stop.sh

docker-compose up -d

pushd game >/dev/null

NODE_ENV=one node . &
echo $! > ../scripts/game-one.pid
NODE_ENV=two node . &
echo $! > ../scripts/game-two.pid
NODE_ENV=three node . &
echo $! > ../scripts/game-three.pid

popd >/dev/null

pushd router >/dev/null

NODE_ENV=one node . &
echo $! > ../scripts/router-one.pid
NODE_ENV=two node . &
echo $! > ../scripts/router-two.pid
NODE_ENV=three node . &
echo $! > ../scripts/router-three.pid

popd >/dev/null

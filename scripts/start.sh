#!/usr/bin/env bash

docker-compose up -d

pushd router >/dev/null

NODE_ENV=one node . &
echo $! > ../scripts/one.pid
NODE_ENV=two node . &
echo $! > ../scripts/two.pid
NODE_ENV=three node . &
echo $! > ../scripts/three.pid

popd >/dev/null

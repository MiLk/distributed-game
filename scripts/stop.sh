#!/usr/bin/env bash

ls scripts/*.pid &>/dev/null || exit 0

for pidfile in $(ls scripts/*.pid); do
  kill $(cat ${pidfile}) && rm ${pidfile}
done

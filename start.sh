#!/bin/bash

export PATH="$(yarn global bin):$PATH"

# Stop all servers and start the server as a daemon
cd /coopbot
yarn start

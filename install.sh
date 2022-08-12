#!/bin/bash

cd /coopbot
yarn start

curl -o- -L https://yarnpkg.com/install.sh | bash
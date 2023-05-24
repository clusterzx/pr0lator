#!/bin/bash

# create a screen with name "pr0lator-web" and inside this screen execute command "npm run devStart"
screen -dmS pr0lator-web bash -c 'npm run devStart'

# create a screen with name "pr0lator-bot" and inside this screen execute command "node bot.js"
screen -dmS pr0lator-bot bash -c 'node bot.js'
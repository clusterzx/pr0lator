# pr0lator - Intro

![](https://avatars.githubusercontent.com/u/59977471?s=200&v=4)

![GitHub last commit](https://img.shields.io/github/last-commit/clusterzx/pr0lator)
![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/clusterzx/pr0lator/main)
![Scrutinizer code quality (GitHub/Bitbucket)](https://img.shields.io/scrutinizer/quality/g/clusterzx/pr0lator/master)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)


# Beschreibung

pr0lator ist ein Nutzer-Bot für ein deutsches Imageboard. Er wurde entwickelt um Videos in anderen Sprachen ins Englische zu übersetzen. Er kann auf Kommentare reagieren in denen er markiert/getagged wurde. 

Wurde pr0lator erwähnt nimmt er sich die Daten zu dem dazugehörigen Post, prüft ob es sich um ein Video handelt und übersetzt gesprochene Sprache ins Englische. 

Die Technik hinter dem übersetzen basiert auf dem von OpenAI erstellten ASR Model "**Whisper**". Hierbei handelt es sich um ein Custom Model mit SRT Conversion.

Hat pr0lator nun erfolgreich das Video übersetzt, postet er einen Antwortkommentar an den Tagger/Nutzer mit einem Link zum Webservice in dem sich das konvertierte Video anschauen lässt.

Ansicht des Webservices:
![Dashboard](https://raw.githubusercontent.com/clusterzx/pr0lator/main/public/webservice.png "Dashboard")

# Installation

Folgende Abhängigkeiten werden vorausgesetzt:

Für den Bot:
1. NodeJS (>= 18.6.6)
2. NPM

Für den Converter:
1. Python (>= 3.10)
2. ffmpeg
3. torch
4. whisper_timestamped
5. OpenAI

Für den Webservice:
1. NodeJS (>= 18.6.6)

**Einfach die Dependencies installieren und los gehts.**

# Thanks to

holzmaster (node-pr0gramm-api ❤️)
https://github.com/holzmaster/node-pr0gramm-api

FFmpeg
https://ffmpeg.org/

OpenAI (für so vieles und noch mehr ❤️)
https://openai.com/


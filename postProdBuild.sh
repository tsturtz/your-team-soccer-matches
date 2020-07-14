#!/usr/bin/env bash

GREEN='\033[0;32m'
LIGHT_BLUE='\033[1;34m'
NC='\033[0m'

echo "‣ Bustin some cache..."
rm -r build
rm -r .cache

echo "‣ Prepending header-data (shebang, birbar meta data, user config) to index.js..."
echo -e "‣ Moving and renaming index.js to ${LIGHT_BLUE}soccer_team_matches.10m.js${NC} in build directory..."
mkdir ./build
cat ./header-data.js ./temp/index.js >> ./build/soccer_team_matches.10m.js

echo "‣ Cleaning up..."
rm -r temp

echo -e "${GREEN}✔ Ready for bitbar production!${NC}"
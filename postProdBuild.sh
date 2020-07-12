#!/usr/bin/env bash

GREEN='\033[0;32m'
LIGHT_BLUE='\033[1;34m'
NC='\033[0m'

echo "‣ Prepending header-data (shebang, birbar meta data, user config) to index.js..."
echo -e "‣ Moving and renaming index.js to ${LIGHT_BLUE}fav_soccer_team_matches.10m.js${NC} in build directory..."
cat ./header-data.js ./build/index.js >> ./build/fav_soccer_team_matches.10m.js

echo -e "${GREEN}✔ Ready for bitbar production!${NC}"
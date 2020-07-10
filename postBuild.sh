#!/usr/bin/env bash

# TODO: Add bitbar meta tags

echo "Prepending shebang..."
echo "#!/usr/bin/env /usr/local/bin/node"|cat - ../fav_soccer_team_matches.10m.js > /tmp/out && mv /tmp/out ../fav_soccer_team_matches.10m.js
echo "Granting execution access..."
chmod +x ../fav_soccer_team_matches.10m.js
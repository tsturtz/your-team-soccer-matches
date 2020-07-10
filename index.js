const bitbar = require('bitbar');
const fetch = require('node-fetch').default;
const { format, parseISO } = require('date-fns');

const TEAM_ID = 73; // Maybe record a dictionary of team ids here for easy team selection
const ACCENT_COLOR = 'blue'; // Options are: black, red, green, yellow, blue, magenta, cyan, white
const SHOW_FINISHED_NUM = 3;
const SHOW_SCHEDULED_NUM = 3;

(async () => {
  const response = await fetch(`https://api.football-data.org/v2/teams/${TEAM_ID}/matches`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': 'FOOTBALL-DATA API KEY HERE',
    },
  })
  const matches = await response.json();

  let finishedMatches = [];
  let scheduledMatches = [];
  matches.matches.forEach((match) => {
    if (match.status === 'FINISHED') {
      finishedMatches = [
        ...finishedMatches,
        bitbar.separator,
        {
          text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
          color: 'white',
          size: 16,
        },
        {
          text: `‣ Winner: ${
            match.score.winner === 'HOME_TEAM' ? match.homeTeam.name : match.awayTeam.name
          } (${match.score.fullTime.homeTeam} - ${match.score.fullTime.awayTeam})`,
          color: ACCENT_COLOR,
          size: 12,
        },
      ];
    }
    if (match.status === 'SCHEDULED') {
      scheduledMatches = [
        ...scheduledMatches,
        bitbar.separator,
        {
          text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
          color: 'white',
          size: 16,
        },
        {
          text: `‣ ${format(parseISO(match.utcDate), 'MM/dd/yyyy hh:mm a')}`,
          color: ACCENT_COLOR,
          size: 12,
        },
      ];
    }
  });

  bitbar([
    {
      text: '⚽︎', // TODO: make a cool logo
      color: bitbar.darkMode ? 'white' : 'blueBright',
      dropdown: false
    },
    bitbar.separator,
    { text: 'Tottenham Hotspur', size: 40 },
    bitbar.separator,
    { text: 'Finished Matches', size: 20 },
    ...finishedMatches.slice(-SHOW_FINISHED_NUM * 3),
    bitbar.separator,
    { text: 'Scheduled Matches', size: 20 },
    ...scheduledMatches.slice(-SHOW_SCHEDULED_NUM * 3),
  ]);
})();
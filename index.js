const bitbar = require('bitbar');
const fetch = require('node-fetch').default;
const { format, parseISO } = require('date-fns');

const OPTIONS = {
  FOOTBALL_DATA_API_KEY: USER_OPTIONS && USER_OPTIONS.FOOTBALL_DATA_API_KEY,
  TEAM_ID: USER_OPTIONS && USER_OPTIONS.TEAM_ID || 73,
  NUMBER_OF_FINISHED_MATCHES: USER_OPTIONS && USER_OPTIONS.NUMBER_OF_FINISHED_MATCHES || 5,
  NUMBER_OF_SCHEDULED_MATCHES: USER_OPTIONS && USER_OPTIONS.NUMBER_OF_SCHEDULED_MATCHES || 3,
};

if (OPTIONS.NUMBER_OF_FINISHED_MATCHES > 7) {
  OPTIONS.NUMBER_OF_FINISHED_MATCHES = 7;
}

(async () => {
  const apiUrl = 'https://api.football-data.org/v2';
  const apiData = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': OPTIONS.FOOTBALL_DATA_API_KEY,
    },
  };

  // Get team info
  const myTeamResponse = await fetch(`${apiUrl}/teams/${OPTIONS.TEAM_ID}`, apiData);
  const myTeam = await myTeamResponse.json();

  // Get active competitions standings
  // NOTE: The free API only supports some competitions: https://www.football-data.org/coverage
  const supportedCompetitions = new Set(['BSA', 'PL', 'ELC', 'CL', 'EC', 'FL1', 'BL1', 'SA', 'DED', 'PPL', 'PD', 'WC']);
  const activeCompetitionsPromises = myTeam.activeCompetitions
    .filter((comp) => supportedCompetitions.has(comp.code))
    .map((comp) => fetch(`${apiUrl}/competitions/${comp.code}/standings?standingType=TOTAL`, apiData));
  const activeCompetitionsPromisesResponses = await Promise.all(activeCompetitionsPromises);
  const activeCompetitionsStandings = await Promise.all(activeCompetitionsPromisesResponses.map((resp) => resp.json()));
  let activeCompetitionsStandingsRender = [];
  activeCompetitionsStandings.forEach((comp) => {
    activeCompetitionsStandingsRender = [
      ...activeCompetitionsStandingsRender,
      {
        text: comp.competition.name,
        href: `https://www.google.com/search?q=${comp.competition.name.split(' ').join('+')}`,
        size: 14,
        submenu: comp.standings.map((standing) => ({
          text: standing.stage === 'GROUP_STAGE' ? standing.group : standing.stage,
          size: 14,
          submenu: [
            { text: 'Pos. Team - Points' },
            bitbar.separator,
            ...standing.table.map((table, idx) => {
              return ({
                text: `${
                  table.position
                }. ${
                  table.team.name
                } - ${
                  table.points
                }`,
                href: `https://www.google.com/search?q=${table.team.name.split(' ').join('+')}`,
                ...(table.team.id === OPTIONS.TEAM_ID && { font: 'Helvetica-Bold' }),
              })
            }),
          ],
        })),
      },
    ];
  });

  // Get matches
  const matchesResponse = await fetch(
    `${apiUrl}/teams/${OPTIONS.TEAM_ID}/matches`,
    apiData
  );
  const matchesResponseJson = await matchesResponse.json();
  const finishedMatches = matchesResponseJson.matches.filter((match) => match.status === 'FINISHED');
  const scheduledMatches = matchesResponseJson.matches.filter((match) => match.status === 'SCHEDULED');
  const liveMatches = matchesResponseJson.matches.filter((match) => match.status === 'LIVE');

  // Finished/completed matches
  let finishedMatchesRender = [];
  if (finishedMatches) {
    let idx = 0;
    // Use for..of here instead of forEach because it plays nice with async/await
    for (match of finishedMatches) {
      if (idx >= finishedMatches.length - OPTIONS.NUMBER_OF_FINISHED_MATCHES) {
        // Determine winner
        const isDraw = match.score.winner === 'DRAW';
        let winningTeamName = 'Draw';
        if (match.score.winner === 'HOME_TEAM') {
          winningTeamName = match.homeTeam.name;
        } else if (match.score.winner === 'AWAY_TEAM') {
          winningTeamName = match.awayTeam.name;
        }
        const myTeamWon = winningTeamName === myTeam.name;
        const myTeamIsHome = match.homeTeam.name === myTeam.name;
        // Get TLA
        const opponentTeamId = myTeamIsHome ? match.awayTeam.id : match.homeTeam.id;
        const opponentTeamResponse = await fetch(`${apiUrl}/teams/${opponentTeamId}`, apiData);
        const opponentTeam = await opponentTeamResponse.json();
        // Check if there was extra time
        const showExtraTime = (match.score.extraTime.homeTeam || match.score.extraTime.awayTeam);
        // Check if there were penalties
        const showPenalties = (match.score.penalties.homeTeam || match.score.penalties.awayTeam);
        // Render regular scores
        const regularScoreRender = `${
          myTeamIsHome ? myTeam.tla : opponentTeam.tla
        } ${
          match.score.fullTime.homeTeam
        } - ${
          match.score.fullTime.awayTeam
        } ${
          myTeamIsHome ? opponentTeam.tla : myTeam.tla
        }`;
        // Render extra time scores
        const extraTimeRender = `(ET: ${match.score.extraTime.homeTeam} - ${match.score.extraTime.awayTeam})`;
        // Render extra time scores
        const penaltiesRender = `(Pen: ${match.score.penalties.homeTeam} - ${match.score.penalties.awayTeam})`;
        finishedMatchesRender = [
          ...finishedMatchesRender,
          {
            text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
            size: 14,
            href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
          },
          {
            text: `${
              myTeamWon ? '🟢' : isDraw ? '⚪️' : '🔴'
            } ${
              regularScoreRender
            } ${
              showExtraTime ? extraTimeRender : ''
            } ${
              showPenalties ? penaltiesRender : ''
            }`,
            size: 14,
          },
        ];
      }
      idx++;
    };
  }

  // Scheduled/upcoming matches
  let scheduledMatchesRender = [];
  if (scheduledMatches) {
    scheduledMatches.forEach((match, idx) => {
      if (idx < OPTIONS.NUMBER_OF_SCHEDULED_MATCHES) {
        scheduledMatchesRender = [
          ...scheduledMatchesRender,
          {
            text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
            size: 14,
            href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
          },
          {
            text: `${match.competition.name} - ${match.group || match.stage}${match.matchday ? ` - Match day: ${match.matchday}` : ''}`,
            size: 14,
          },
          {
            text: `${format(parseISO(match.utcDate), 'MM/dd/yyyy - hh:mm a')}`,
            size: 14,
          },
        ];
      }
    });
  }

  // Live matches
  let liveMatchesRender = [];
  if (liveMatches) {
    liveMatches.forEach(async (match) => {
      liveMatchesRender = [
        ...liveMatchesRender,
        {
          text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
          size: 14,
          href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
        },
        {
          text: `${match.competition.name} - ${match.group || match.stage}${match.matchday ? ` - Match day: ${match.matchday}` : ''}`,
          size: 14,
        },
        {
          text: 'Click here to check the score',
          size: 14,
          href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
        },
      ];
    });
  }

  // Prepare render sections
  const activeCompetitionsStandingsSection = activeCompetitionsStandingsRender.length ? [
    bitbar.separator,
    { text: 'Standings', size: 22 },
    ...activeCompetitionsStandingsRender,
  ] : [
    bitbar.separator,
    { text: 'Standings', size: 22 },
    { text: 'No active competitions.', size: 14 },
  ];
  const finishedMatchesSection = finishedMatchesRender.length ? [
    bitbar.separator,
    { text: 'Completed Matches', size: 22 },
    ...finishedMatchesRender,
  ] : [
    bitbar.separator,
    { text: 'Completed Matches', size: 22 },
    { text: 'No recently completed matches.', size: 14 },
  ];
  const scheduledMatchesSection = scheduledMatchesRender.length ? [
    bitbar.separator,
    { text: 'Upcoming Matches', size: 22 },
    ...scheduledMatchesRender,
  ] : [
    bitbar.separator,
    { text: 'Upcoming Matches', size: 22 },
    { text: 'No upcoming matches.', size: 14 },
  ];
  const liveMatchesSection = liveMatchesRender.length ? [
    bitbar.separator,
    { text: 'Live Matches', size: 22 },
    ...liveMatchesRender,
  ] : [
    bitbar.separator,
    { text: 'Live Matches', size: 22 },
    { text: 'No live matches right now.', size: 14 },
  ];

  // Render the bitbar dropdown
  bitbar([
    {
      text: `⚽︎ ${myTeam.tla}`,
      dropdown: false,
    },
    bitbar.separator,
    {
      text: myTeam.name,
      size: 30,
      href: myTeam.website,
    },
    ...activeCompetitionsStandingsSection,
    ...finishedMatchesSection,
    ...scheduledMatchesSection,
    ...liveMatchesSection,
  ]);
})();
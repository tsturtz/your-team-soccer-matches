const bitbar = require('bitbar');
const fetch = require('node-fetch').default;
const { format, parseISO } = require('date-fns');

const OPTIONS = {
  FOOTBALL_DATA_API_KEY: USER_OPTIONS && USER_OPTIONS.FOOTBALL_DATA_API_KEY,
  TEAM_ID: USER_OPTIONS && USER_OPTIONS.TEAM_ID || 73,
  NUMBER_OF_FINISHED_MATCHES: USER_OPTIONS && USER_OPTIONS.NUMBER_OF_FINISHED_MATCHES || 4,
  NUMBER_OF_SCHEDULED_MATCHES: USER_OPTIONS && USER_OPTIONS.NUMBER_OF_SCHEDULED_MATCHES || 3,
};

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
  const myTeamResponse = await fetch(`${apiUrl}/teams/${OPTIONS.TEAM_ID}`, apiData)
  const myTeam = await myTeamResponse.json();

  // Get active competitions standings
  const activeCompetitionsPromises = myTeam.activeCompetitions.map((comp) => fetch(`${apiUrl}/competitions/${comp.id}/standings?standingType=TOTAL`, apiData));
  const activeCompetitionsPromisesResponses = await Promise.all(activeCompetitionsPromises);
  const activeCompetitionsStandings = await Promise.all(activeCompetitionsPromisesResponses.map((resp) => resp.json()));
  let activeCompetitionsStandingsRender = [];
  activeCompetitionsStandings.forEach((comp) => {
    activeCompetitionsStandingsRender = [
      ...activeCompetitionsStandingsRender,
      {
        text: comp.competition.name,
        href: `https://www.google.com/search?q=${comp.competition.name.split(' ').join('+')}`,
        color: 'white',
        size: 14,
        submenu: comp.standings.map((standing) => ({
          text: standing.stage === 'GROUP_STAGE' ? standing.group : standing.stage,
          color: 'white',
          size: 14,
          submenu: [
            { text: '#. Team - Points' },
            ...standing.table.map((table, idx) => {
              let color = 'white';
              // If Premier League
              if (comp.competition.id === 2021) {
                if (idx === 0) {
                  color = '#00b800';
                } else if (idx > 0 && idx < 4) {
                  color = 'green';
                } else if (idx === 4) {
                  color = '#c2bf00';
                } else if (idx > 16) {
                  color = 'red';
                }
              }
              // If Champions League
              if (comp.competition.id === 2001) {
                if (idx < 2) {
                  color = 'green';
                } else {
                  color = 'red';
                }
              }
              return ({
                text: `${
                  table.position
                }. ${
                  table.team.name
                } - ${
                  table.points
                }`,
                color,
                ...(table.team.id === OPTIONS.TEAM_ID && { font: 'Helvetica-Bold' }),
              })
            }),
          ],
        })),
      },
    ];
  });

  // Get finished matches
  const finishedMatchesResponse = await fetch(
    `${apiUrl}/teams/${OPTIONS.TEAM_ID}/matches?status=FINISHED&limit=${OPTIONS.NUMBER_OF_FINISHED_MATCHES}`,
    apiData
  );
  const finishedMatches = await finishedMatchesResponse.json();
  let finishedMatchesRender = [];
  finishedMatches.matches.forEach((match) => {
    // Determine winner
    let winningTeamName = 'Draw';
    if (match.score.winner === 'HOME_TEAM') {
      winningTeamName = match.homeTeam.name
    } else if (match.score.winner === 'AWAY_TEAM') {
      winningTeamName = match.awayTeam.name
    }
    const myTeamWon = winningTeamName === myTeam.name;

    // Check if there was extra time
    const showExtraTime = (match.score.extraTime.homeTeam || match.score.extraTime.awayTeam);
    // Check if there were penalties
    const showPenalties = (match.score.penalties.homeTeam || match.score.penalties.awayTeam);

    // Render regular scores
    const regularScoreRender = `(${match.score.fullTime.homeTeam} - ${match.score.fullTime.awayTeam})`;
    // Render extra time scores
    const extraTimeRender = `(ET: ${match.score.extraTime.homeTeam} - ${match.score.extraTime.awayTeam})`;
    // Render extra time scores
    const penaltiesRender = `(Pen: ${match.score.penalties.homeTeam} - ${match.score.penalties.awayTeam})`;

    finishedMatchesRender = [
      ...finishedMatchesRender,
      {
        text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
        color: 'white',
        size: 14,
        href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
      },
      {
        text: `‣ ${winningTeamName} ${regularScoreRender} ${showExtraTime ? extraTimeRender : ''} ${showPenalties ? penaltiesRender : ''}`,
        color: myTeamWon ? 'green' : winningTeamName === 'Draw' ? 'yellow' : 'red',
        size: 12,
      },
    ];
  });

  // Get scheduled matches
  const scheduledMatchesResponse = await fetch(
    `${apiUrl}/teams/${OPTIONS.TEAM_ID}/matches?status=SCHEDULED&limit=${OPTIONS.NUMBER_OF_SCHEDULED_MATCHES}`,
    apiData
  );
  const scheduledMatches = await scheduledMatchesResponse.json();
  let scheduledMatchesRender = [];
  scheduledMatches.matches.forEach((match) => {
    scheduledMatchesRender = [
      ...scheduledMatchesRender,
      {
        text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
        color: 'white',
        size: 14,
        href: `https://www.google.com/search?q=${match.homeTeam.name.split(' ').join('+')}+vs.+${match.awayTeam.name.split(' ').join('+')}`,
      },
      {
        text: `‣ ${format(parseISO(match.utcDate), 'MM/dd/yyyy hh:mm a')}`,
        color: 'yellow',
        size: 12,
      },
    ];
  });

  // Get live matches
  const liveMatchesResponse = await fetch(`https://api.football-data.org/v2/teams/${OPTIONS.TEAM_ID}/matches?status=LIVE`, apiData)
  const liveMatches = await liveMatchesResponse.json();
  let liveMatchesRender = [];
  liveMatches.matches.forEach((match) => {
    // Check if there was extra time
    const showExtraTime = (match.score.extraTime.homeTeam || match.score.extraTime.awayTeam);
    // Check if there were penalties
    const showPenalties = (match.score.penalties.homeTeam || match.score.penalties.awayTeam);
    // Render regular scores
    const regularScoreRender = `(${match.score.fullTime.homeTeam} - ${match.score.fullTime.awayTeam})`;
    // Render extra time scores
    const extraTimeRender = `(ET: ${match.score.extraTime.homeTeam} - ${match.score.extraTime.awayTeam})`;
    // Render extra time scores
    const penaltiesRender = `(Pen: ${match.score.penalties.homeTeam} - ${match.score.penalties.awayTeam})`;
    liveMatchesRender = [
      ...liveMatchesRender,
      {
        text: `${match.homeTeam.name} vs. ${match.awayTeam.name}`,
        color: 'white',
        size: 14,
      },
      {
        text: `‣ ${winningTeamName} ${regularScoreRender} ${showExtraTime ? extraTimeRender : ''} ${showPenalties ? penaltiesRender : ''}`,
        color: 'yellow',
        size: 12,
      },
    ];
  });

  // Prepare render sections
  const activeCompetitionsStandingsSection = activeCompetitionsStandingsRender.length ? [
    bitbar.separator,
    { text: 'Standings', size: 20 },
    bitbar.separator,
    ...activeCompetitionsStandingsRender,
  ] : [];
  const finishedMatchesSection = finishedMatchesRender.length ? [
    bitbar.separator,
    { text: 'Finished Matches', size: 20 },
    bitbar.separator,
    ...finishedMatchesRender,
  ] : [];
  const scheduledMatchesSection = scheduledMatchesRender.length ? [
    bitbar.separator,
    { text: 'Scheduled Matches', size: 20 },
    bitbar.separator,
    ...scheduledMatchesRender,
  ] : [];
  const liveMatchesSection = liveMatchesRender.length ? [
    bitbar.separator,
    { text: 'Live Matches', size: 20 },
    bitbar.separator,
    ...liveMatchesRender,
  ] : [];

  // Render the bitbar dropdown
  bitbar([
    {
      text: '⚽︎', // TODO: make a cool logo
      color: bitbar.darkMode ? 'white' : 'blueBright',
      dropdown: false
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
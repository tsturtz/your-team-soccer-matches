const bitbar = require('bitbar');



bitbar([
  {
    text: '⚽︎',
    color: bitbar.darkMode ? 'darkGrey' : 'white',
    dropdown: false
  },
  bitbar.separator,
  {
    text: 'TEAM NAME vs. OPPONENT',
    color: '#ff79d7',
  },
  {
    text: 'SCORE: ___',
    color: '#ff79d7',
  },
  bitbar.separator,
  {
    text: 'TEAM NAME vs. OPPONENT',
    color: '#ff79d7',
  },
  {
    text: 'DATE/TIME: ___',
    color: '#ff79d7',
  },
]);
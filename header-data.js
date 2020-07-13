#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Soccer Team Matches</bitbar.title>
// <bitbar.version>1.0.0</bitbar.version>
// <bitbar.author>Taylor Sturtz</bitbar.author>
// <bitbar.author.github>tsturtz</bitbar.author.github>
// <bitbar.desc>Show standings and match information about your favorite soccer team</bitbar.desc>
// <bitbar.image>TODO: add image</bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.dependencies.npm>bitbar, node-fetch, date-fns</bitbar.dependencies.npm>
// <bitbar.abouturl>https://github.com/tsturtz/bitbar-soccer-matches</bitbar.abouturl>

// -----------------------------------------------------------------------------
// 🙋‍♂️ Start here!
// -----------------------------------------------------------------------------
// 1. Ensure you have the proper node and npm dependencies installed.
// 2. Get a free API key from https://www.football-data.org/client/register.
// 3. Configure the USER_OPTIONS object.
//   - FOOTBALL_DATA_API_KEY: Plug your API key you just got in here.
//   - TEAM_ID: You must provide a team ID or it will default to my team, Tottenham 😎.
//     - Use the a dictionary of *some* teams and their IDs below to find your team's ID.
//   - NUMBER_OF_FINISHED_MATCHES: Retrieve and display how many finished matches?
//   - NUMBER_OF_SCHEDULED_MATCHES: Retrieve and display how many scheduled matches?

// -----------------------------------------------------------------------------
// 👀 Below are some team id lookup dictionaries.
// Search the file to get your team's football-data ID, but don't touch this code.
// -----------------------------------------------------------------------------
const NATIONAL_TEAM_IDS = { Argentina: 762, Australia: 779, Belgium: 805, Brazil: 764, Colombia: 818, Costa_Rica: 793, Croatia: 799, Denmark: 782, Egypt: 825, England: 770, France: 773, Germany: 759, Iceland: 1066, Iran: 840, Japan: 766, Korea_Republic: 772, Mexico: 769, Morocco: 815, Nigeria: 776, Panama: 1836, Peru: 832, Poland: 794, Portugal: 765, Russia: 808, Saudi_Arabia: 801, Senegal: 804, Serbia: 780, Spain: 760, Sweden: 792, Switzerland: 788, Tunisia: 802, Uruguay: 758, };
const GERMAN_LEAGUE_TEAM_IDS = { Augsburg: 16, Bayer_04_Leverkusen: 3, Bayern_München: 5, Borussia_Mönchengladbach: 18, Bremen: 12, Dortmund: 4, FC_Köln: 1, Frankfurt: 19, Freiburg: 17, Hannover: 8, Hertha_BSC: 9, Hoffenheim: 2, HSV: 7, Kaiserslautern: 13, Mainz: 15, Nürnberg: 14, RB_Leipzig: 721, RB_Salzburg: 1877, Schalke_04: 6, Stuttgart: 10, Wolfsburg: 11, };
const ENGLISH_LEAGUE_TEAM_IDS = { Arsenal: 57, Aston_Villa: 58, Barnsley: 357, Birmingham: 332, Blackburn_Rovers: 59, Bolton_Wanderers: 60, Bournemouth: 1044, Brentford: 402, Brighton_And_Hove_Albion: 397, Bristol_City: 387, Burnley: 328, Burton_Albion: 1072, Charlton: 348, Chelsea: 61, Crystal_Palace: 354, Derby: 342, England: 770, Everton: 62, Fulham: 63, Huddersfield: 394, Hull_City: 322, Ipswich_Town: 349, Leeds: 341, Leicester_City: 338, Liverpool: 64, Luton_Town: 389, Manchester_City: 65, Manchester_United: 66, Middlesbrough: 343, Millwall: 384, Newcastle: 67, Norwich: 68, Nottingham_Forest: 351, Preston_North_End: 1081, QPR: 69, Reading: 355, Rotherham_Utd: 385, Sheffield_United: 356, Sheffield_Wednesday: 345, Southampton: 340, Stoke: 70, Sunderland: 71, Swansea: 72, Tottenham_Hotspur: 73, Watford: 346, West_Brom: 74, West_Ham: 563, Wigan: 75, Wolverhampton: 76, };
const SPANISH_LEAGUE_TEAM_IDS = { Atlético_de_Madrid: 78, Barcelona: 81, Real_Madrid: 86, Valencia: 95, };
const ITALY_LEAGUE_TEAM_IDS = { Atalanta: 102, Inter: 108, Juventus: 109, Napoli: 113, };
const FRANCE_LEAGUE_TEAM_IDS = { Lille: 521, Lyon: 523, PSG: 524, };
const NETHERLANDS_LEAGUE_TEAM_IDS = { Ajax: 678, PSV: 674, };
const MISC_LEAGUE_TEAM_IDS = { AIK_Fotboll: 5277, APOEL: 752, Astana_FK: 1884, Başakşehir: 1897, Basel: 729, BATE: 748, Celtic: 732, Club_Brugge: 851, Crvena_Zvedza: 7283, Dinamo_Zagreb: 755, Dundalk: 1873, Dynamo_Kyiv: 842, F91_Dudelange: 1875, Galatasaray: 610, HJK: 5123, København: 1876, KRC_Genk: 1858, LASK: 2016, Linfield: 1896, Ludogorets: 1901, Maribor: 734, Nõmme_Kalju: 5106, Olympiakos: 654, PAOK_FC: 6146, Porto: 503, Qarabağ_Ağdam: 611, Rosenborg: 889, Santa_Coloma: 1879, Sarajevo: 4275, Shaktar: 1887, Sheriff: 1880, SL_Benfica: 1903, Slavia_Praha: 930, The_New_Saints: 1904, Viktoria_Plzeň: 1881, Young_Boys: 1871, Zenit: 731, };

// -----------------------------------------------------------------------------
// ✍️ CONFIGURE API KEY AND OPTIONS HERE!
// -----------------------------------------------------------------------------
const USER_OPTIONS = {
  FOOTBALL_DATA_API_KEY: 'c502bdfa2bfb401f8a13bcf240ae9c47',
  TEAM_ID: ENGLISH_LEAGUE_TEAM_IDS.Tottenham_Hotspur,
  NUMBER_OF_FINISHED_MATCHES: 5,
  NUMBER_OF_SCHEDULED_MATCHES: 3,
};

// -----------------------------------------------------------------------------
// 🚨 You shouldn't need to change anything below this line.
// -----------------------------------------------------------------------------


import { intersection } from 'lodash';
import * as db_commons from '../db/commons';
let db;

const teams = [
    'New York Giants',
    'Tampa Bay Buccaneers',
    'Buffalo Bills',
    'Pittsburgh Steelers',
    'New England Patriots',
    'San Francisco 49ers',
    'Minnesota Vikings',
    'Green Bay Packers',
    'San Diego Chargers',
    'Detroit Lions',
    'Philadelphia Eagles',
    'Baltimore Colts',
    'Oakland Raiders',
    'Dallas Cowboys',
    'Atlanta Falcons',
    'Chicago Bears',
    'Seattle Seahawks',
    'Washington Redskins',
    'Miami Dolphins',
    'Denver Broncos',
    'Houston Oilers',
    'Cincinnati Bengals',
    'Cleveland Browns',
    'Los Angeles Rams',
    'St. Louis Cardinals',
    'Kansas City Chiefs',
    'New York Jets',
    'New Orleans Saints',
    'Los Angeles Raiders',
    'Indianapolis Colts',
    'Phoenix Cardinals',
    'Arizona Cardinals',
    'St. Louis Rams',
    'Jacksonville Jaguars',
    'Carolina Panthers',
    'Baltimore Ravens',
    'Tennessee Oilers',
    'Tennessee Titans',
    'Houston Texans',
    'Los Angeles Chargers'
];

function getTeam(team:String, oneOf:string[]=[]){
    team = team.replace(/^at\s+/, '').trim();

    const result:string[] =  teams.filter((cteam:string) => cteam.match(new RegExp(team,"i")));
    if (result.length === 0) {
        return null;
    }

    const iTeam = intersection(result, oneOf);

    if (iTeam.length === 1) {
        return iTeam[0];
    }

    return null;
}


/**
 * Gather all info and standarizes team names
 */
function getOdd(winner, loser, date, week) {
   const odds = db.run("SELECT * FROM odds WHERE date = ? AND week = ?", [date, week]);
   const fodds = odds.filter(odd =>
       getTeam(odd.underdog, [winner, loser]) && getTeam(odd.favorite, [winner, loser]));

   if (fodds.length === 1) {
       return {
           ...fodds[0],
           favorite: getTeam(fodds[0].favorite, [winner, loser]),
           underdog: getTeam(fodds[0].underdog, [winner, loser]),
           local: getTeam(fodds[0].underdog, [winner, loser])
       }
   } else if (fodds.length === 0) {
       console.log('nothing');
   } else {
       console.log('more');
   }
}

async function buildHistoryOdds(history) {
    const odd = getOdd(history.winner, history.loser, history.date, history.week);
    const {id, ...warehouse} =  { ...odd, ...history};
    if (warehouse.underdog) {
        db.insert('warehouse', warehouse);
    }
}

async function main() {
    db = db_commons.connect();

    const histories = db.run('SELECT * FROM history ORDER BY date');
    histories.map( (his) => buildHistoryOdds(his));
    db.close();
}

main();


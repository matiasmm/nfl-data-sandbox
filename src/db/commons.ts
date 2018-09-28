import * as sqlite from 'sqlite-sync';

const path:string = './data/database.db';

export function connect() {
    sqlite.connect(path);
    return sqlite;
}

export function addHistory(match:Map<any, any>) {
    console.log(match);
    sqlite.run(`INSERT INTO history (date, week, winner, pointsW, pointsL, loser, local) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [match.date, match.week, match.winner, match.pointsW, match.pointsL, match.loser, match.local]);
}

export function addOdds(odd:Map<any, any>) {
    console.log(odd);
    sqlite.run(`INSERT INTO odds (date, week, favorite, underdog, point_spread, over_under, local) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [odd.Date, odd.week, odd.Favorite, odd.UnderDog, odd.PointSpread, odd.OverUnder, odd.Local]);
}

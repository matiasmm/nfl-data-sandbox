import * as request from 'request';
import * as moment from 'moment';
import * as db_commons from '../db/commons';


const months:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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

function getTeam(team:String){
    team = team.replace(/^at\s+/, '').trim();

    const result:string[] =  teams.filter((cteam:string) => cteam.match(new RegExp(team,"i")));
    if (result.length == 1) {
        return result[0];
    }
    return team;
}

function req(year:Number, week:Number): Promise<any>
{
    return new Promise((resolve, reject) => {
        const headers = {
            'origin': 'https://fantasydata.com',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'es,en-AU;q=0.9,en;q=0.8',
            'x-requested-with': 'XMLHttpRequest',
            'cookie': 'LastVisited=B2C; _ga=GA1.2.997911939.1536168501; _gid=GA1.2.1871121193.1536168501; _cio=88db4ebe-4978-256c-9fee-8469a6b7471a; ASP.NET_SessionId=skulwjbsbt0ldljq5l15yxvo; _hjIncludedInSample=1; _gat=1',
            'pragma': 'no-cache',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'cache-control': 'no-cache',
            'authority': 'fantasydata.com',
            'referer': `https://fantasydata.com/nfl-stats/point-spreads-and-odds?season=${year}&seasontype=1&week=${week}`
        };

        const dataString = `sort=&page=1&pageSize=50&group=&filter=&filters.position=&filters.team=&filters.season=${year}&filters.seasontype=1&filters.scope=&filters.subscope=&filters.redzonescope=&filters.scoringsystem=&filters.leaguetype=&filters.playerid=&filters.searchtext=&filters.week=${week}&filters.startweek=&filters.endweek=&filters.minimumsnaps=&filters.teamaspect=&filters.stattype=&filters.exportType=&filters.desktop=`;

        const options = {
            url: 'https://fantasydata.com/NFLTeamStats/Odds_Read',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function format(obj:any) {
            const s:string = obj.Date.match(/([a-z]+)\s+([0-9]+)\s*,\s*([0-9]+)/i);
            return {
                ...obj,
                Week: week,
                Season: year,
                Favorite: getTeam(obj.Favorite),
                UnderDog: getTeam(obj.UnderDog),
                Local: (obj.Favorite.startsWith('at ')) ? getTeam(obj.Favorite) : getTeam(obj.UnderDog),
                Date: moment(new Date(Number.parseInt(s[3]), months.indexOf(s[1]), Number.parseInt(s[2]))).format('YYYY-MM-DD'),
            }
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                body.Data.length? resolve(body.Data.map(row => format(row))) : reject('NAT');
            } else {
                reject('not 200');
            }
        }

        request(options, callback);
    });
}

async function main() {
    const db = db_commons.connect();
    for (let year=2002; year <= (new Date()).getFullYear(); year++) {
        let week = 0;

        while (++week > 0) {
            try {
                console.log(year, week);
                const odds = await req(year, week);
                console.log(odds);
                odds.map(odd => db_commons.addOdds({...odd, week}));
            } catch (err) {
                week = -1;
                console.log("No results", err)
            }
        }
    }
    db.close();
}

main();

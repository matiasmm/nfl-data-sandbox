import * as scrapeIt from 'scrape-it';
import * as moment from 'moment';
import * as db_commons from '../db/commons';

const host:string = 'https://www.pro-football-reference.com/',
      urlTeams = (year:number, week:number) => `${host}years/${year}/week_${week}.htm`;
const months:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];

function req(year:number, week:number): Promise<any> {
    return new Promise((resolve, reject) => {

      scrapeIt(urlTeams(year, week), {
          games: {
              listItem: ".game_summary",
              data: {
                  date: {
                      selector: '.date',
                      convert: v => {
                          const s:string = v.match(/([a-z]+)\s+([0-9]+)\s*,\s*([0-9]+)/i);
                          return moment(new Date(Number.parseInt(s[3]), months.indexOf(s[1]), Number.parseInt(s[2])))
                              .format('YYYY-MM-DD');
                      }
                  },
                  winner: {
                      selector: '.winner td:first-of-type a'
                  },
                  pointsW: {
                      selector: '.winner td:nth-of-type(2)'
                  },
                  pointsL: {
                      selector: '.loser td:nth-of-type(2)'
                  },
                  loser: {
                      selector: '.loser td:first-of-type a '
                  },
                  local: {
                      selector: '.teams tr:last-of-type a',
                      convert: v => {
                          return v;
                      }
                  }
              }
          }
    }).then((data:any) => {
          const games = data.data.games.length ? resolve(data.data.games) : reject(`No data for year:${year} week:${week}`);
    }).catch(() => reject(`Error: No data for year:${year} week:${week}`));
  });
}

async function main() {
    const db = db_commons.connect();

    for (let year=1988; year <= (new Date()).getFullYear(); year++) {
        let week = 0;

        while (++week > 0)
        try {
            console.log(year, week);
            const matches = await req(year, week);
            matches.map(match => db_commons.addHistory({...match, week, year}));
        } catch (err) {
            week = -1;
            console.log("No results", err);
        }
    }
    db.close();
}

main();


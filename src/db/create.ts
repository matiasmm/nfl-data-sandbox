import * as db_commons from '../db/commons';
import * as fs from 'fs';

const path:string = './data/database.db';
if (fs.existsSync(path))
    fs.unlinkSync(path);

const db = db_commons.connect();

db.run("DROP TABLE IF EXISTS history");
db.run(`CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, 
   date TEXT, week TEXT, winner TEXT, pointsW INTEGER, pointsL INTEGER, loser TEXT, local TEXT)`);
db.run("DROP TABLE IF EXISTS odds");
db.run(`CREATE TABLE IF NOT EXISTS odds (id INTEGER PRIMARY KEY AUTOINCREMENT, 
    date TEXT, week TEXT, favorite TEXT, underdog TEXT, point_spread REAL, over_under REAL, local TEXT)`);
db.run("DROP TABLE IF EXISTS warehouse");
db.run(`CREATE TABLE IF NOT EXISTS warehouse (id INTEGER PRIMARY KEY AUTOINCREMENT, 
   date TEXT, week TEXT, favorite TEXT, underdog TEXT, point_spread REAL, over_under REAL, local TEXT, winner TEXT, 
   pointsW INTEGER, pointsL INTEGER, loser TEXT)`);

db.close()
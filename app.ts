import * as express from "express";
import * as fs from "fs";
import * as sqlite3 from "sqlite3";
declare var __dirname:string;
//import * as bodyParser from "body-parser"
let app = express();
let db = new sqlite3.Database("test.sqlite3");
app.use(express.static('public'));
app.get('/api/configs', (req, res) => 
    db.all('select * from configs', (err, rows) => {
        if (err != null) return console.log("query error "+err);
        res.json(rows);
    }));
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/build/client.js'));
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

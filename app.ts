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
        if (err != null) {
            console.log("query error "+err);
            return;
        }
        res.json(rows);
    }));
app.get('/api/config/:config/images', (req, res) => {
    console.log("name "+req.params.config);
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        console.log("row "+row);
        if (err != null) res.status(500).send({error:'query '+err});
        else fs.readdir(row.image_directory, (rErr, items) => {
            if (rErr) res.status(500).send({error:'readdir ' +err});
            else res.json(items); 
        });
    });
});
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/build/client.js'));
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

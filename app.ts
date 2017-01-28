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
        if (err != null)  res.status(500).send({error:'configs query ' +err});
        else res.json(rows);
}));
app.get('/api/config/:config/badges', (req, res) =>
    db.all('select first, last, badges.id, badges.filename from badges inner join configs on badges.configId = configs.id where configs.name = ?', req.param.name, (err, rows) => {
        if (err != null) res.status(500).send({error:'query ' +err})
        else res.json(rows);
}));
app.get('/api/config/:config/images', (req, res) => {
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        console.log("row "+row);
        if (err != null) res.status(500).send({error:'query '+err});
        else fs.readdir(row.image_directory, (rErr, items) => {
            if (rErr) res.status(500).send({error:'readdir ' +err});
            else res.json(items.filter((x:string)=> x.toLowerCase().endsWith('.jpg'))); 
        });
    });
});
app.get('/api/config/:config/image/:image', (req, res) => {
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        console.log("row "+JSON.stringify(row));
        if (err != null) res.status(500).send({error:'query '+err});
        else {
            let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
            if (match == null) res.status(500).send({error:'bad image name'}); 
            else res.sendFile(row.image_directory + '/'+req.params.image);
        }
    });
});
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/client.js'));
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

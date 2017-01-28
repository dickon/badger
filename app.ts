import * as express from "express";
import * as fs from "fs";
import * as sqlite3 from "sqlite3";
import * as sizeOf from "image-size";

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
app.get('/api/configs/:config/badges', (req, res) => {
    db.all('select first, last, badges.id, badges.filename from badges inner join configs on badges.configId = configs.id where configs.name = ?', req.params.config, (err, rows) => {
        if (err != null) res.status(500).send({error:'query ' +err})
        else res.json(rows);
    });
}));
app.get('/api/configs/:config/images', (req, res) => {
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        if (err != null) res.status(500).send({error:'query '+err});
        else fs.readdir(row.image_directory, (rErr, items) => {
            if (rErr) res.status(500).send({error:'readdir ' +err});
            else res.json(items.filter((x:string)=> x.toLowerCase().endsWith('.jpg'))); 
        });
    });
});
app.get('/api/configs/:config/image/:image', (req, res) => {
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        if (err != null) res.status(500).send({error:'query '+err});
        else {
            let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
            if (match == null) res.status(500).send({error:'bad image name'}); 
            else res.sendFile(row.image_directory + '/'+req.params.image);
        }
    });
});
app.get('/api/configs/:config/image/:image/size', (req, res) => {
    db.get('select image_directory from configs where name=?', req.params.config, (err, row) => {
        if (err != null) res.status(500).send({error:'query '+err});
        else {
            let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
            if (match == null) res.status(500).send({error:'bad image name'}); 
            else sizeOf(row.image_directory + '/'+req.params.image, (err, dimensions) => {
                    if (err != null) res.status(500).send({error:err});
                    else res.json(dimensions);
            });
        });
    });
});
app.put('/api/configs/:config/badges/:badgeId/image/:filename', (req, res) => {
    console.log(`putting ${req.params.badgeId} on filename ${req.params.filename}`);
    db.run('update badges set filename=? where id=?', req.params.filename, parseInt(req.params.badgeId));
    res.json({});
});
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/client.js'));
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

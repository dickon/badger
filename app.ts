import * as express from "express";
import * as fs from "fs";
import * as sqlite3 from "sqlite3";
import * as sizeOf from "image-size";
import * as client from "knex";
declare var __dirname:string;

function jsonResponse(res: any, x: client.QueryBuilder) {
    x.then(x => res.json(x)).catch(err => res.status(500).send({error:err}));
}

//import * as bodyParser from "body-parser"
let app = express();

let db = new sqlite3.Database("test.sqlite3");
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});
app.use(express.static('public'));
app.get('/api/configs', (req, res) => jsonResponse(res, knex.select('*').from('configs')));
app.get('/api/configs/:config/badges', (req, res) => jsonResponse(res, knex('badges').join('configs', 'badges.configId', '=', 'configs.id')
            .select('first', 'last', 'badges.id', 'badges.filename', 'badges.rotation').where('configs.name', req.params.config)));
app.get('/api/configs/:config/images', (req, res) => 
    knex.select('image_directory').from('configs').where('name', req.params.config).first().then(row=> {
        fs.readdir(row.image_directory, (rErr, items) => {
            if (rErr) res.status(500).send({error:'readdir ' +err});
            else res.json(items.filter((x:string)=> x.toLowerCase().endsWith('.jpg'))); 
        });
    }).catch(err=>res.status(500).send({error:'query '+err})));
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
        }
    });
});
app.get('/api/configs/:config/background', (req, res) => {
    db.get('select background_image_file from configs where name=?', req.params.config, (err, row) => {
        if (err != null) res.status(500).send({error:'query '+err});
        else res.sendFile(row.background_image_file);
    });
});
app.get('/api/configs/:config/background/size', (req, res) => {
    db.get('select background_image_file from configs where name=?', req.params.config, (err, row) => {
        if (err != null) res.status(500).send({error:'query '+err});
        else {
            sizeOf(row.background_image_file, (err, dimensions) => {
                if (err != null) res.status(500).send({error:err});
                else res.json(dimensions);
            });
        }
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

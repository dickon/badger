import * as express from "express";
import * as fs from "fs";
import * as sqlite3 from "sqlite3";
import * as sizeOf from "image-size";
import * as client from "knex";
import * as Promise from "promise";
let app = express();
let readdir:(path:string)=>Promise<string[]> = Promise.denodeify(fs.readdir);
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});
let jsonResponse = (res: any, x: Promise) => x.then(x => res.json(x)).catch(err => res.status(500).send({error:err}));
let getImageDirectory = (req): Promise<string> => knex.select('image_directory').from('configs').where('name', req.params.config).first().then(x=>x.image_directory);
let getBackgroundImageFile = (req): Promise<string> => knex.select('background_image_file').from('configs').where('name', req.params.config).first().then(x=>x.background_image_file);

//import * as bodyParser from "body-parser"


let db = new sqlite3.Database("test.sqlite3");

app.use(express.static('public'));
app.get('/api/configs', (req, res) => jsonResponse(res, knex.select('*').from('configs')));
app.get('/api/configs/:config/badges', (req, res) => jsonResponse(res, knex('badges').join('configs', 'badges.configId', '=', 'configs.id')
            .select('first', 'last', 'badges.id', 'badges.filename', 'badges.rotation').where('configs.name', req.params.config)));
app.get('/api/configs/:config/images', (req, res) => 
    getImageDirectory(req).then(i=>readdir(i)).then(items=>res.json(items.filter(x=>x.toLowerCase().endsWith('.jpg'))))
    .catch(err=>res.status(500).send({error:'query '+err})));
app.get('/api/configs/:config/image/:image', (req, res) => getImageDirectory(req).then(i=> {
    let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else res.sendFile(i+'/'+req.params.image);
}));
app.get('/api/configs/:config/image/:image/size', (req, res) => getImageDirectory(req).then(i=> {
    let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else sizeOf(`${i}/${req.params.image}`, (err, dimensions) => {
        if (err != null) res.status(500).send({error:err});
        else res.json(dimensions);
    });
}));
app.get('/api/configs/:config/background', (req, res) => getBackgroundImageFile(req).then(f=>res.sendFile(f)));
app.get('/api/configs/:config/background/size', (req, res) => getBackgroundImageFile(req).then(f=> sizeOf(f, (err, dimensions) => {
                if (err != null) res.status(500).send({error:err});
                else res.json(dimensions);
})));;
app.put('/api/configs/:config/badges/:badgeId/image/:filename', (req, res) => {
    console.log(`putting ${req.params.badgeId} on filename ${req.params.filename}`);
    db.run('update badges set filename=? where id=?', req.params.filename, parseInt(req.params.badgeId));
    res.json({});
});
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/build/client.js'));
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

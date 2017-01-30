import * as express from "express";
import * as fs from "fs";
import * as sizeOf from "image-size";
import * as client from "knex";
import * as Promise from "promise";
let app = express();
let sizeofPromise:(path:string)=>Promise<any> = Promise.denodeify(sizeOf);
let readdir:(path:string)=>Promise<string[]> = Promise.denodeify(fs.readdir);
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});
let jsonResponse = (res: any, x: Promise) => x.then(x => res.json(x)).catch(err => res.status(500).send({error:err}));
let getImageDirectory = (req): Promise<string> => knex.select('image_directory').from('configs').where('name', req.params.config).first().then(x=>x.image_directory);
let getBackgroundImageFile = (req): Promise<string> => knex.select('background_image_file').from('configs').where('name', req.params.config).first().then(x=>x.background_image_file);

//import * as bodyParser from "body-parser"

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
app.get('/api/configs/:config/background/size', (req, res) => getBackgroundImageFile(req).then(sizeofPromise).then(dimensions => res.json(dimensions)));
app.put('/api/configs/:config/badges/:badgeId/image/:filename', (req, res) => 
    knex('badges').where('id', '=', parseInt(req.params.badgeId)).update({filename: req.params.filename}).then(x=>res.json(x)));
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/build/client.js'));
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

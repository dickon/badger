/// <reference path="typings/globals/node/index.d.ts" />
/// <reference path="typings/modules/bluebird/index.d.ts" />

import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import * as sizeOf from "image-size";
import * as client from "knex";
import * as Promise from "promise";
import * as process from "process";
let app = express();
let low = true;
let sizeofPromise:(path:string)=>Promise<any> = Promise.denodeify(sizeOf);
let readdir:(path:string)=>Promise<string[]> = Promise.denodeify(fs.readdir);
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});
let getImageDirectory = (req): Promise<string> => knex.select('image_directory').from('configs').where('name', req.params.config).first().then(x=>x.image_directory);
let getBackgroundImageFile = (req): Promise<string> => knex.select('background_image_file').from('configs').where('name', req.params.config).first().then(x=>x.background_image_file);
let jsonGet = (urlPattern, fn) => app.get(urlPattern, (req,res)=> fn(req).then(x=>res.json(x)).catch(err => res.status(500).send({error:err})));        

//import * as bodyParser from "body-parser"

jsonGet('/api/configs', req => knex.select('*').from('configs'));
jsonGet('/api/configs/:config/badges', req => knex('badges').join('configs', 'badges.configId', '=', 'configs.id')
            .select('first', 'last', 'title', 'badges.id', 'badges.filename', 'badges.rotation', 'left', 'top', 'right', 'bottom', 'brightness', 'contrast').where('configs.name', req.params.config));
jsonGet('/api/configs/:config/images', req => getImageDirectory(req).then(i=>readdir(i)).then(items=>items.filter(x=>x.toLowerCase().endsWith('.jpg') && !x.match(/.*tmp.jpg/) && !x.toLowerCase().endsWith('.512.jpg'))));
app.get('/api/configs/:config/image/:image', (req, res) => getImageDirectory(req).then(i=> {
    let low = req.query.low;
    console.log(`image ${req.params.image}  low ${low}`)
    let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else {
        let fullres = path.resolve(i, req.params.image);
        let lowres = path.resolve(i, req.params.image+'.512.jpg');
        let complete = () => res.sendFile(low?lowres:fullres);
        if (!low) return complete();
        console.log(`full ${fullres} quarter ${lowres}`);
        fs.stat(lowres, (errStat, stats) => {
            if (errStat == null) {
                complete();
            } else {
                console.log(`scaling ${fullres} to missing ${lowres}`);
                var tmp = `${fullres}.${Math.random()}.jpg`;
                const ffmpeg = process.platform == 'darwin' ? '/Applications/ffmpeg':'C:\\Users\\dicko\\downloads\\ffmpeg.exe';
                let cmd = `${ffmpeg} -i "${fullres}" -vf scale=512:-1 "${tmp}"`;
                console.log('+'+cmd);
                child_process.exec(cmd, (err) => {
                        console.log(`completed temp error [${err}]`);
                        if (err != null) {
                            res.status(500).send({error:`resize failed ${err.toString()}`});
                        } else {
                            fs.rename(tmp, lowres, (err2) => {
                                console.log(`completed ren error [${err2}]`);

                                if (err2 != null) res.status(500).send({error:`rename failed ${err2.toString()}`});
                                else complete();
                            });
                        }
                });
            }
        });
    }
}));

app.get('/api/configs/:config/image/:image/size', (req, res) => getImageDirectory(req).then(i=> {
    let low = req.query.low;
    let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
    console.log(`size ${req.params.image}  low ${low}`)
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else sizeOf(`${i}/${req.params.image}`, (err, dimensions) => {
        if (err != null) res.status(500).send({error:err});
        else res.json(low ? {width:512, height: Math.ceil(dimensions.height/dimensions.width*512)} : dimensions);
    });
}));
app.get('/api/configs/:config/background', (req, res) => getBackgroundImageFile(req).then(f=>res.sendFile(f)));
app.get('/api/configs/:config/background/size', (req, res) => getBackgroundImageFile(req).then(sizeofPromise).then(dimensions => res.json(dimensions)));
app.put('/api/configs/:config/badges/:badgeId/image/:filename', (req, res) => 
    knex('badges').where('id', '=', parseInt(req.params.badgeId)).update({filename: req.params.filename}).then(x=>res.json(x)));
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/client.js'));
app.get('/js/snap.js', (req, res) => res.sendFile(path.resolve(__dirname,'..','node_modules', 'snapsvg', 'dist', 'snap.svg.js')));
app.get('/compose', (req,res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'compose.html')));
app.get('/view', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'view.html')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html')))
console.log("running");
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 

/// <reference path="typings/globals/node/index.d.ts" />
/// <reference path="typings/modules/bluebird/index.d.ts" />

// TODO: remove this hack and get the es6 declarations in place properly
interface String {
    endsWith(searchString: string, endPosition?: number): boolean;
    toLowerCase(): String;
}

import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import * as sizeOf from "image-size";
import * as client from "knex";
import * as Promise from "promise";
import * as process from "process";
import * as socketIo from "socket.io";
import * as http from "http";
import * as chokidar from "chokidar";

let app = express();
let server = http.createServer(app);
let io = socketIo(server);
let low = true;
let sizeofPromise:(path:string)=>Promise<any> = Promise.denodeify(sizeOf);
let readdir:(path:string)=>Promise<string[]> = Promise.denodeify(fs.readdir);
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});
let getImageDirectory = (req): Promise<string> => knex.select('image_directory').from('configs').where('name', req.params.config).first().then(x=>x.image_directory);
let getBackgroundImageFile = (req): Promise<string> => knex.select('background_image_file').from('configs').where('name', req.params.config).first().then(x=>x.background_image_file);
let jsonGet = (urlPattern, fn) => app.get(urlPattern, (req,res)=> fn(req).then(x=>res.json(x)).catch(err => {
    console.log(`query error ${err}`);
    res.status(500).send({error:err});
    }));        

jsonGet('/api/configs', req => knex.select('*').from('configs'));
jsonGet('/api/configs/:config/badges', req => knex('badges').join('configs', 'badges.configId', '=', 'configs.id').join('images', 'badges.filename', '=', 'images.filename')
            .select('first', 'last', 'title', 'badges.id', 'badges.filename', 'images.rotation', 'images.left', 'images.top', 'images.right', 'images.bottom', 'images.brightness', 'images.contrast').where('configs.name', req.params.config));
jsonGet('/api/configs/:config/images', req => knex('images').join('configs', 'images.configId', '=', 'configs.id').where('configs.name', req.params.config));
app.get('/api/configs/:config/image/:image', (req, res) => getImageDirectory(req).then(i=> {
    let low = req.query.low;
    let match = req.params.image.match(/[0-9\.a-zA-Z\-_]/);
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else {
        let fullres = path.resolve(i, req.params.image);
        let lowres = path.resolve(i, req.params.image+'.512.jpg');
        let complete = () => res.sendFile(low?lowres:fullres);
        if (!low) return complete();
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
                        } else {``
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
    if (match == null) res.status(500).send({error:'bad image name'}); 
    else sizeOf(`${i}/${req.params.image}`, (err, dimensions) => {
        if (err != null) res.status(500).send({error:err});
        else res.json(low ? {width:512, height: Math.ceil(dimensions.height/dimensions.width*512)} : dimensions);
    });
}));
app.get('/api/configs/:config/background', (req, res) => getBackgroundImageFile(req).then(f=> {
    if (f == null) res.status(404).send('no background');
    else res.sendFile(f);
}));
app.get('/api/configs/:config/background/size', (req, res) => getBackgroundImageFile(req).then(sizeofPromise).then(dimensions => res.json(dimensions)));
app.put('/api/configs/:config/badges/:badgeId/image/:filename', (req, res) => 
    knex('badges').where('id', '=', parseInt(req.params.badgeId)).update({filename: req.params.filename}).then(x=>res.json(x)));
app.delete('/api/configs/:config/image/:filename', (req, res) => {
    knex.select('id').from('configs').where('name', req.params.config).first().pluck('id').then((configIds:number[])=> {
        let q= {filename:req.params.filename, configId:configIds[0]};
        console.log(`hide ${req.params.config} ${req.params.filename} ${JSON.stringify(q)}`);
        knex('images').where(q).update({hidden: 1}).then(y=> {
            knex('images').where(q).then(x=>res.json(x));
        });
    });
});
app.get('/js/client.js', (req, res) => res.sendFile(__dirname+'/client.js'));
app.get('/js/snap.js', (req, res) => res.sendFile(path.resolve(__dirname,'..','node_modules', 'snapsvg', 'dist', 'snap.svg.js')));
app.get('/configs/:config/compose', (req,res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'compose.html')));
app.get('/configs/:config/view', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'view.html')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html')))

console.log("running");
server.listen(3000, () => console.log(`listening on ${server.address().port}`)); 
console.log("listening");

function considerImage(filename:String, configId: number) {
    let lf:String = filename.toLowerCase();
    if (lf.endsWith('.jpg') && !lf.endsWith('.512.jpg')) {
        knex('images').where({filename: filename, configId: configId}).count().first().then(n=> {
            let coverage = n['count(*)'];
            if (coverage==0) {
                knex('images').insert({filename:filename, hidden:0, configId:configId}).then(x=>{ 
                    knex('images').where('filename', filename).where('configId', configId).first().then((image:Image)=> io.sockets.emit('newImage', image));
                });
            }
        });
    }
}

//knex.select('*').from('configs').then(configs=> configs.map(config=> chokidar.watch(config.image_directory, {depth: 0}).on('add', (path, stats) => considerImage(path.split('/').slice(-1)[0], config.id))));
io.on('connection', (socket) => {
    console.log('user connected');
    socket.emit('message', {'message':'hello world'});
    socket.on('usingConfig', (id) => {
        console.log(`client using ${id}`);
    });
});
console.log("finished");
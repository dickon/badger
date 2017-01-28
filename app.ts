import * as express from "express";
import * as fs from "fs";
//import * as bodyParser from "body-parser"
let app = express();
app.use(express.static('public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));
app.get("/", (req,res)=> fs.readFile(__dirname + "/index.html", (err, data) => {
       if (err) return console.error(`file read error ${err}`);
        res.send(data);
    }));
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 


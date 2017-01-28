import * as express from "express";
//import * as bodyParser from "body-parser"
let app = express();

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));
app.get("/", (req,res)=> res.send("hello world"));
let server = app.listen(3000, () => console.log(`listening on ${server.address().port}`)); 


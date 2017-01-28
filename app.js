"use strict";
var express = require("express");
var fs = require("fs");
//import * as bodyParser from "body-parser"
var app = express();
app.use(express.static('public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));
app.get("/", function (req, res) { return fs.readFile(__dirname + "/index.html", function (err, data) {
    if (err)
        return console.error("file read error " + err);
    res.send(data);
}); });
var server = app.listen(3000, function () { return console.log("listening on " + server.address().port); });
//# sourceMappingURL=app.js.map
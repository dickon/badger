"use strict";
var express = require("express");
//import * as bodyParser from "body-parser"
var app = express();
app.use(express.static('public'));
app.get('/js/client.js', function (req, res) { return res.sendFile(__dirname + '/build/client.js'); });
var server = app.listen(3000, function () { return console.log("listening on " + server.address().port); });
//# sourceMappingURL=app.js.map
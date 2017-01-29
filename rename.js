"use strict";
var client = require("knex");
;
var knex = client({ client: 'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3" } });
console.log('starting');
knex.select('*').from('badges').then(function (rows) {
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        var elem = row.filename.split('.');
        console.log("badge " + row.filename + " " + elem[0] + " " + elem[1] + " end " + row.id);
        knex.select('*').from('badges').where('id', '=', row.id).update({ filename: elem[0] + "." + (elem[1].toLowerCase()) });
    }
});

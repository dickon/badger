import * as client from "knex";

let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});

knex('badges').then(x=> console.log(JSON.stringify(x)));;


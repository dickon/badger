import * as client from "knex";
let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});

function manage(row) {
        let elem = row.filename.split('.');
        let subst = elem[0]+"."+elem[1].toLowerCase();
        console.log(`badge ${row.filename} ${elem[0]} ${elem[1]} end ${row.id} subst ${subst}`);
        knex.select('*').from('badges').where('id', '=', row.id).update({filename:subst}).then(x=>console.log('updated '+subst+' '+row.id));     
}
console.log('starting');
knex.select('*').from('badges').then(rows => {
    for (var row of rows) {
        manage(row);
     }
});
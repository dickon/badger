import * as client from "knex";
import * as fs from "fs";

let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});

console.log('starting');

knex.select('*').from('configs').first().then(config=> {
    console.log(JSON.stringify(config))
    let buf = fs.readFileSync(config.image_directory + "/names.txt", "utf8");

    let lines = buf.toString().split("\n"); 
    lines.map(line=> {
        let words = line.split(/\s+/);
        console.log(`words ${JSON.stringify(words)}`);
        knex.select('*').from('badges').where({first:words[0], last:words[1]}).then(y=> {
            console.log(`matches for ${JSON.stringify(words)} are ${JSON.stringify(y)}`)
            if (y.length === 0) {
                console.log("inserting "+line);
                knex('badges').insert({first:words[0], last:words[1], title:words.slice(2).join(" "), configId:config.id}).then(z=>false)
            }
        });
    });
});


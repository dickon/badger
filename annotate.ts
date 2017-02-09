import * as client from "knex";

let knex: client = client({client:'sqlite3', useNullAsDefault: true, connection: { filename: "test.sqlite3"}});

knex('badges').join('configs', 'configs.id', '=', 'badges.configId').then(badges =>
  badges.map(badge=> {
      console.log(`outer ${JSON.stringify(badge)}`);
      knex('images').where({filename:badge.filename, configId:badge.configId}).update(
          {recentFirst: badge.first, recentLast: badge.last, recentTitle: badge.title}).then(x=> {
              console.log(JSON.stringify(badge));
              knex('images').where({filename:badge.filename, configId:badge.configId}).first().then(res=>console.log(`got ${JSON.stringify(res)}`));
          });
  }));

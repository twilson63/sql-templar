var st = require('sql-templar')({
  templates: {
    dir: __dirname + '/sql',
    ext: 'sql'
  }, db: {
    host: localhost,
    port: 3306
  }
});

st('customers', [100], function(err, rows) {
  console.log(rows);
});
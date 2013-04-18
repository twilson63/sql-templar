var st = require('../')({
  templates: {
    dir: __dirname + '/sql',
    ext: 'sql'
  }, db: {
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root'
  }
});

st('customers', ['A%'], function(err, rows) {
  if (err) { console.log(err); }
  console.log(rows); 
});
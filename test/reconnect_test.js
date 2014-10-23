var sqlTemplar = require('../index');
var dbParse = require('parse-db-url');

var config = {
  db: dbParse('mysql://root:@127.0.0.1/mysql'),
  templates: {
    dir: __dirname + '/sql',
    ext: 'sql'
  }
}
var st = sqlTemplar(config);

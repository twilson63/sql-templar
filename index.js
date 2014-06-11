var mysql = require('mysql');
var fs = require('fs');
var _ = require('underscore');

var templates = {};

module.exports = function(config) {
  if (!config.db) { throw new Error('database configuration info is required!'); }
  var dir = './sql';
  var ext = 'sql';

  if (config.templates && config.templates.dir) { dir =  config.templates.dir }
  if (config.templates && config.templates.ext) { ext =  config.templates.ext }

  // load templates
  var files = _(fs.readdirSync(dir)).filter(function (file) {
    return (new RegExp('.' + ext + '$')).test(file);
  });

  _(files).each(function(file) {
    templates[file.split('.').shift()] = fs.readFileSync(dir + '/' + file).toString();
  });
  // connect to mysql
  conn = mysql.createConnection(config.db);
  conn.connect();

  // perform query
  return function(name, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = null;
    }
    // check if template exists
    if (!templates[name]) { return cb(new Error('sql-templar: Template not found!')); }

    if (params) {
      conn.query(templates[name], params, cb);
    } else {
      conn.query(templates[name], cb);
    }
  }
}

// close connection on exit()
process.on('exit', function() {
  if (conn) {
    conn.end();
  }
});

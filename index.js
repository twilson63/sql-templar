var mysql = require('mysql');
var fs = require('fs');
var _ = require('underscore');

var templates = {};

module.exports = function(config) {
  if (!config.db) { throw new Error('database configuration info is required!'); }
  var dir = './sql';
  var ext 'sql';

  if (config.templates && config.templates.dir) { dir =  config.templates.dir }
  if (config.templates && config.templates.ext) { ext =  config.templates.ext }

  // load templates
  var files = _(fs.readdirSync(dir)).filter(function (file) { 
    return (new RegEx('/*\.' + ext + '$/').test(file);
  });

  _(files).each(function(file) {
    templates[file] = fs.readFileSync(dir + '/' + file);
  });
  console.log(templates);
  // connect to mysql
  conn = mysql.createConnection(config.db);
  conn.connect();

  // perform query
  return function(name, params, cb) {
    conn.query(templates[name], params, cb);
  }
}

// close connection on exit()
process.on('exit', function() {
  conn.end();
});
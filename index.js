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
  var conn = mysql.createConnection(config.db);
  conn.connect();

  // perform query
  var exec = function(name, params, cb) {

    if (typeof params === 'function') {
      cb = params;
      params = null;
    }

    // if (_(params).isObject()) {
    //   // if object build where clause
    //   params = [_(params).map(function(v, k) {
    //     return k + "= '" + v.toString() + "'";
    //   }).join(' AND ')];
    // }
    //
    // if (params && !_(params).isArray()) {
    //   return cb(new Error('sql-templar: params must be an array or object'));
    // }
    // check if template exists
    if (!templates[name]) { return cb(new Error('sql-templar: Template not found!')); }

    if (params && _(params).isObject() && !_(params).isArray()) {
      // assume ? in sql string
      // build where and replace ? with where
      params = [_(params).map(function(v, k) {
        return k + " = '" + v.toString() + "'";
      }).join(' AND ')];
      sql = templates[name].replace('?', params);
      conn.query(sql, cb);
    } else if (params && _(params).isArray()) {
      conn.query(templates[name], params, cb);
    } else {
      conn.query(templates[name], cb);
    }

  };

  // close connection on exit()
  process.on('exit', function() {
    if (conn) {
      conn.end();
    }
  });

  return Object.freeze({
    exec: exec
  });
}

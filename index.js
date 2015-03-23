var mysql = require('mysql');
var fs = require('fs');
var _ = require('underscore');
var log = console.log;
var ONE_MINUTE = 60000;

var templates = {};

module.exports = function(config) {
  if (!config.db) { throw new Error('database configuration info is required!'); }
  var dir = './sql';
  var ext = 'sql';
  var timeout = ONE_MINUTE;
  if (config.templates && config.templates.dir) { 
    dir =  config.templates.dir; 
  }
  if (config.templates && config.templates.ext) { 
    ext =  config.templates.ext; 
  }
  if (config.timeout) { timeout = config.timeout; }

  // load templates
  var files = _(fs.readdirSync(dir)).filter(function (file) {
    return (new RegExp('.' + ext + '$')).test(file);
  });

  _(files).each(function(file) {
    templates[file.split('.').shift()] = fs.readFileSync(dir + '/' + file).toString();
  });

  var pool = mysql.createPool(config.db);

  // perform query
  var exec = function(name, params, cb) {
    pool.getConnection(function(err, conn) {
      if(err) { return cb(err); }
      if (typeof params === 'function') {
        cb = params;
        params = null;
      }

      if (!templates[name]) { return cb(new Error('sql-templar: Template not found!')); }

      if (params && _(params).isObject() && !_(params).isArray()) {
        // assume ? in sql string
        // build where and replace ? with where

        params = [_(params).map(function(v, k) {

          if(_.isObject(v)) {
            var key = _.chain(v).keys().first().value();
            var value = _.chain(v).values().first().value();
            if (key === '$gt') {
              return k + " > '" + value.toString() + "'";
            }
            else if (key === '$gte') {
              return k + " >= '" + value.toString() + "'";
            }
            else if (key === '$lt') {
              return k + " < '" + value.toString() + "'";
            }
            else if (key === '$lte') {
              return k + " <= '" + value.toString() + "'";
            }
            else if (key === '$ne') {
              return k + " != '" + value.toString() + "'";
            }
          }
          else {
            return k + " = '" + v.toString() + "'"; 
          } 
        }).join(' AND ')];

        sql = templates[name].replace('?', params);
        conn.query(sql, handleResponse);
      } else if (params && _(params).isArray()) {
        conn.query(templates[name], params, handleResponse);
      } else {
        conn.query(templates[name], handleResponse);
      }
      function handleResponse(err, rows) {
        conn.release();
        cb(err,rows);
      }
    });
   
  };  

  process.setMaxListeners(100);  

  // close connection on exit()
  process.once('exit', function() {
    if (pool) {
      pool.end();
    }
  });

  return Object.freeze({
    exec: exec
  });
};


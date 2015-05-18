var mysql = require('mysql');
var fs = require('fs');
var _ = require('underscore');
var log = console.log;
var ONE_MINUTE = 60000;
var where2 = require('where2');
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

  var pool;
  if(config.pool) {
    pool = config.pool;
  } else {
    pool = mysql.createPool(config.db);
  }

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
        params = where2(params);
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


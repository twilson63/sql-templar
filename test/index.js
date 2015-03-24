// Happy Path Testing...
var test = require('tap').test;
var rewire = require('rewire');
var sqlTemplar = rewire('../');

test('sql-templar build where clause', function(t) {
  sqlTemplar.__set__('mysql', {
    createPool: function () {
      return {
        getConnection: function(fn) {
          fn(null, {
            release: function() {},
            query:  function(sql, cb) {
              t.equals(sql, 
               'select * from customers where patient_id = \'1\' AND priority = \'Beep\';',
               'should build sql where clause'
              );
              cb(null, []);
            }
          });
        },
        on: function() {}, 
        end: function() {}
      };
    }
  });

  var st = sqlTemplar({
      templates: {
        dir: __dirname + '/sql',
        ext: 'sql'
      },
      db: {
        host: 'localhost',
        database: 'test',
      }
  });

  st.exec('customers-where', {patient_id: 1, priority: 'Beep'}, function(err, rows) {
    t.deepEquals(rows, [], 'successfully return rows');
    t.end();
  });
});

test('sql-templar should build where clause correctly if value passed is an object', function(t) {
  sqlTemplar.__set__('mysql', {
    createPool: function () {
      return {
        getConnection: function(fn) {
          fn(null, {
            release: function() {},
            query:  function(sql, cb) {
              t.equals(sql, 
               'select * from customers where patient_id = \'1\' AND created_at < \'2015-02-27 18:37:57\';',
               'should build sql where clause'
              );
              cb(null, []);
            }
          });
        },
        on: function() {}, 
        end: function() {}
      };
    }
  });

  var st = sqlTemplar({
      templates: {
        dir: __dirname + '/sql',
        ext: 'sql'
      },
      db: {
        host: 'localhost',
        database: 'test',
      }
  });

  st.exec('customers-where', {patient_id: 1, created_at: {'$lt': '2015-02-27 18:37:57'}}, function(err, rows) {
    t.deepEquals(rows, [], 'successfully return rows');
    t.end();
  });
});

test('sql-templar should read sql file and execute query', function (t) {
   sqlTemplar.__set__('mysql', {
    createPool: function () {
      return {
        getConnection: function(fn) {
          fn(null, {
            release: function() {},
            query:  function(sql, criteria, cb) {
              console.log(cb);
              cb(null, [{foo: 'bar'}]);
            }
          });
        },
        on: function() {}, 
        end: function() {}
      };
    }
  });

  var st = sqlTemplar({
      templates: {
        dir: __dirname + '/sql',
        ext: 'sql'
      },
      db: {
        host: 'localhost',
        database: 'test',
      }
  });

  st.exec('customers', ['A%'], function(err, rows) {
    t.deepEquals(rows, [{foo: 'bar'}], 'successfully return rows');
    t.end();
  });
});

test('sql-templar should error when trying to on getConnection error', function (t) {
   sqlTemplar.__set__('mysql', {
    createPool: function () {
      return {
        getConnection: function(fn) {
          fn({ msg: 'foo error' });
        },
        on: function() {}, 
        end: function() {}
      };
    }
  });

  var st = sqlTemplar({
      templates: {
        dir: __dirname + '/sql',
        ext: 'sql'
      },
      db: {
        host: 'localhost',
        database: 'test',
      }
  });

  st.exec('customers', ['A%'], function(err, rows) {
    t.equals(err.msg, 'foo error', 'should pass out error');
    t.end();
  });
});


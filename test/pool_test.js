// This test will test the option pool option in config.
var rewire = require('rewire');
var test = require('tap').test;
var sqlTemplar = rewire('../index');
var sinon = require('sinon');

test('config without pool option set', function(t) {
  var getConnectionStub = sinon.stub();
  sqlTemplar.__set__('mysql', {
    createPool: function() {
      return {
        getConnection: getConnectionStub,
        end: function() {}
      };
    }
  });

  var st = sqlTemplar({ 
    db: {}, 
    templates: {
      dir: __dirname + '/sql',
      ext: 'sql'
    } 
  });

  st.exec('foo', [], function() {});
  t.ok(getConnectionStub.called, 'getConnnection should have been called');
  t.end();
});

test('config with pool', function(t) {
  var getConnectionStub = sinon.stub();  
  var pool = {
    getConnection: getConnectionStub,
    end: function() {}
  };  
  var st = sqlTemplar({ 
    templates: {
      dir: __dirname + '/sql',
      ext: 'sql'
    },
    pool: pool 
  });
  
  st.exec('foo', [], function() {});
  t.ok(getConnectionStub.called, 'getConnnection should have been called');
  t.end(); 
});

test('should throw an error with no db or pool passed into the config', function(t) {
  //throws(fn, [expectedError], message, extra)
  var callSt = function() {
    sqlTemplar({ 
      templates: {
        dir: __dirname + '/sql',
        ext: 'sql'
      }
    });   
  };
  t.throws(callSt, new Error('database configuration info is required!'), 'should throw error'); 
    
  t.end();
});

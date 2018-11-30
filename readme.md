# Sql Templar

[![build status](https://secure.travis-ci.org/twilson63/sql-templar.png)](http://travis-ci.org/twilson63/sql-templar)

An alternative crusade to the knights of ORM Land.

Sql-Templar is a small abstraction over node-mysql that provides a similar api to that of rendering html templates, but for sql files.  This gets the sql files out of concatenated strings and allows you to place them in a directory much like you place you jade or ejs templates for html.  Here is some sample usage code:

# Requirements
- node 4.* > 
# Usage

/sql/customers.sql

``` sql
select * from customers where name like ?
```

/index.js

``` javascript
var st = require('sql-templar')({
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

st.exec('customers', ['A%'], function(err, rows) {
  if (err) { console.log(err); }
  console.log(rows);
});
```

``` sh
node index.js
```

Just like you use jade or ejs templates with sql-templar you can manage your sql in template files and utilize all of the conventions and sugar provided by node-mysql to perform proper escaping, etc.  See the node-mysql readme for more details on the pattern matching.

### Example with to build where clause with sql templar

/sql/customers-where.sql
``` sql
select * from customers where ?;
```
Then call st.exec like this:

``` javascript
st.exec('customers-where', {patient_id: 1, priority: 'Beep'}, function(err, rows) {
  if (err) { console.log(err); }
  console.log(rows);
});
```
This will make the customer-where.sql query look like this:

```
select * from customers where patient_id = '1' AND priority = 'Beep';
```

### Example of how to build a more complex where clause

#### For a list of which where attributes are currently available, visit [Where2](http://github.com/twilson63/where2)

/sql/customers-where.sql
``` sql
select * from customers where ?;
```
Then call st.exec like this:

``` javascript

st.exec('customers-where', {patient_id: 1, created_at: {'$gt': '2015-02-27 18:37:57'}}, function(err, rows) {
  if (err) { console.log(err); }
  console.log(rows);
});
```
This will make the customer-where.sql query look like this:

```
select * from customers where patient_id = '1' AND created_at > '2015-02-27 18:37:57';
```
## Optional Config

This module leverages connection pooling from the [node-mysql library](https://github.com/felixge/node-mysql). You can pass in the pool through the config object 
so that you are free to set any of the options associated with the pool and also have many sql templar instances and just pass in one connection pool.

Ex
```
var mysql = require('mysql');
var sqlTemplar = require('sqlTemplar')
var pool = mysql.createPool({
  host: 'localhost',
  port: 4406,
  database: 'test',
  user: 'root',
  ssl: {
    ca: '..',
    pem: '..',
    key:'..',
  },
  acquireTimeout: 20000
});

var st = sqlTemplar({
  templates: {
    dir: __dirname + '/sql',
    ext: 'sql'
  }, pool: pool 
});

```

## Install

```
npm install sql-templar
```

## Contributing

Contributions are welcome, the goal of the project is to simply provide a template like engine on top of node-mysql, any contributions that keep within the context of this goal will be merged.

## LICENSE

MIT

## ROADMAP

* Would like to offer support for other SQL Drivers, SQLLite, Postgres, etc.

## Thanks

Thanks to Felixge and all the node-mysql contributors
Thanks to Ryan Dahl, Issacs and all the NodeJS Contributors and Community!

## Collaborators

* Tom Wilson [twilson63](https://github.com/twilson63)
* Joel Villahermosa [joelv](https://github.com/joelv)
* Kevin Collins [kevincol54](https://github.com/kevincol54)



Enjoy!

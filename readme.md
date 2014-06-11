# Sql Templar

[![build status](https://secure.travis-ci.org/twilson63/sql-templar.png)](http://travis-ci.org/twilson63/sql-templar)

An alternative crusade to the knights of ORM Land.

Sql-Templar is a small abstraction over node-mysql that provides a similar api to that of rendering html templates, but for sql files.  This gets the sql files out of concatenated strings and allows you to place them in a directory much like you place you jade or ejs templates for html.  Here is some sample usage code:

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

st('customers', ['A%'], function(err, rows) {
  if (err) { console.log(err); }
  console.log(rows);
});
```

``` sh
node index.js
```

Just like you use jade or ejs templates with sql-templar you can manage your sql in template files and utilize all of the conventions and sugar provided by node-mysql to perform proper escaping, etc.  See the node-mysql readme for more details on the pattern matching.

## Install

```
npm install sql-templar
```

## Contributing

Contributions are welcome, the goal of the project is to simply provide a template like engine on top of node-mysql, any contributions that keep within the context of this goal will be merged.

## LICENSE

MIT

## Thanks

Thanks to Felixge and all the node-mysql contributors
Thanks to Ryan Dahl, Issacs and all the NodeJS Contributors and Community!

Enjoy!

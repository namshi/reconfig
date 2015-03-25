# Reconfig

[![Build Status](https://travis-ci.org/namshi/reconfig.svg?branch=travis)](https://travis-ci.org/namshi/reconfig)

JavaScript configurations as they're meant to be. Kinda.

Reconfig helps you by keeping your configuration clean,
decoupled and smart. Don't believe us? Read on.

## The problem

How do write declarative configuration in JavaScript?

Easy, simply create a JS object:

``` javascript
var config = {
    protocol:   'https',
    domain:     'example.org',
};

var url = config.protocol + '://' + config.domain; // https://example.org
```

Easy and **ugly as hell**. How can we make the config more elegant?

## The Solution

**Enter Reconfig**.

``` javascript

var reconfig = require('reconfig');

var config =  new reconfig({
    protocol:   'https',
    domain:     'example.org',
});

var url = config.get('protocol') + '://' + config.get('domain'); // https://example.org
```

Blah, this is just some more code...but reconfig is more than that.

With this library you can self-reference config values:

``` javascript

var reconfig = require('reconfig');

var config =  new reconfig({
    protocol:   'https',
    domain:     'example.org',
    url:        '{{ protocol }}://{{ domain }}',
});

var url = config.get('url'); // https://example.org
```

Pretty nice right? Even better, reconfig is smart enough to be
able to reference parameters at any level of the config:

``` javascript

var reconfig = require('reconfig');

var config =  new reconfig({
    credentials: {
        admin: {
            read:   true,
            write:  true
        },
        reader: {
            read:   true,
            write:  false
        }
    },
    users: {
        someImportantDude: {
            username:       'him',
            password:       '...',
            credentials:    '{{ credentials.admin }}'
        }
    }
});

var canTheImportantDudeWrite = config.get('users.someImportantDude.credentials').write; // true
```

Nice, as you saw we self-referenced a nested value in the config (`credentials.admin`)
and we used the same dot-notation to retrieve the credentials of a specific user
(`users.someImportantDude.credentials`).

It's not over: you can also pass parameters to your configurations!

``` javascript

var reconfig = require('reconfig');

var config =  new reconfig({
    greet: 'Hello :who!'
});

var greetJohn = config.get('greet', {who: 'John'}); // Hello, John!
```

Last but not least, reconfig lets you specify a default value to
return if a config valu you're trying to access doesnt exist:

``` javascript
var reconfig = require('reconfig');

var config =  new reconfig({
    a: 1
});

config.get('b', {}, 2); // 2
```

### Nodejs specifics

**ENV overriders**

So you're using reconfig in your node.js app and you'd like your sys admins to change
values without touching too much JSON? How about the always familiar ENV vars?

Here's how you do it:

just tell reconfig your env vars prefix:

```javascript
var reconfig = require('reconfig');

var configValues = {
    a: 1,
    b: [2]
};

var config =  new reconfig(configValues, 'MYPREFIX');
```

and you'll be able to modify or add new values directly from your shell!

export or add your vars before runnig your node app:
```bash
MYPREFIX_a=3 MYPREFIX_b_0=4 MYPREFIX_c=5 node app.js
```

and here's what you'll get:

```javascript
config.get('a')     // 3
config.get('b')[0]  // 4  <-- Pay attention!! It works with arrays too! :D
config.get('c')     // 5
```

The default properties separator is: `_` (1 underscore).
You can use your custom separator passing it to the constructor as 3rd parameter:

```javascript
var config =  new reconfig(configValues, 'MYPREFIX', '__');
```

## Installation

Install this library via [NPM](https://www.npmjs.org/package/reconfig):

``` bash
npm install reconfig
```

If you need it on the client side we highly recommend
[browserify](http://browserify.org/).

## Tests

This library is tested through mocha, simply run either

```
mocha
```

or

```
./node_modules/mocha/bin/mocha
```

if you don't have mocha installed globally.

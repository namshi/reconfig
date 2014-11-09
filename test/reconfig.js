'use strict';

var assert = require('assert');
var reconfig = require('./../reconfig');

describe('Reconfig', function() {
  describe('new', function() {
    var config = new reconfig();

    it('should be instantiatable without any parameter', function() {
      assert.strictEqual(typeof config, 'object');
    });
  });

  describe('get', function() {
    it('should return NULL if there is no config injected', function() {
      var config = new reconfig();

      assert.strictEqual(config.get(), null);
    });

    it('should return the whole config object if called without arguments', function() {
      var values = [1, 2, 3];
      var config = new reconfig(values);

      assert.strictEqual(config.get(), values);
    });

    it('should return a specific root config value if called without dots', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('a'), 1);
    });

    it('should return NULL if called with a non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('c'), null);
    });

    it('should return NULL if called with deep non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('c.a'), null);
    });

    it('should return NULL if called with simple non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('c.a'), null);
    });

    it('should return NULL if called with deep non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('c.a.b.c.d.e'), null);
    });

    it('should return a default value if the default parameter is provided', function() {
      var values = {
        a: 1
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('b', {}, 2), 2);
    });

    it('should be able to handle parameters', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('a.b', {
        what: 'world'
      }), 'hello world!');
    });

    it('should be able to handle self-referencing configs', function() {
      var values = {
        a: {
          b: 'hello :what!'
        },
        c: '{{ a.b }}'
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('c', {
        what: 'world'
      }), 'hello world!');
    });

    it('shouldnt go bonkers if you pass a parameter that doesnt exist', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('a.b', {
        hello: 'world'
      }), 'hello :what!');
    });

    it('should return NULL if self-referencing a parameter that doesnt exist', function() {
      var values = {
        a: {
          b: '{{ c }}'
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('a.b'), null);
    });

    it('should be able to handle multiple links', function() {
      var values = {
        a: {
          b: 'Hey, {{ c.hello }}'
        },
        c: {
          hello: '{{ c.salut }}',
          salut: 'HOLA'
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('a.b'), 'Hey, HOLA');
    });

    it('should be able to handle sibling-level relative references', function() {
      var values = {
        user: {
          firstname: 'John',
          lastname: 'Doe',
          suffixes: {
            title: 'M.D.'
          },
          fullname: '{{ ./firstname }} {{ ./lastname }}, {{ ./suffixes.title }}'
        }
      };
      var config = new reconfig(values);
      assert.strictEqual(config.get('user.fullname'), 'John Doe, M.D.');
    });

    it('should be able to handle ancestor-level relative reference', function() {
      var values = {
        a: {
          b: 'hello',
          c: '{{ ../i }}',
          d: {
            e: '{{ ../../i }}',
            f: {
              g: '{{ ../e }}',
              h: '{{ ../../d.e }}'
            }
          }
        },
        i: 'goodbye'
      };
      var config = new reconfig(values);
      assert.strictEqual(config.get('a.c'), config.get('i'));
      assert.strictEqual(config.get('a.d.e'), config.get('i'));
      assert.strictEqual(config.get('a.d.f.g'), config.get('i'));
      assert.strictEqual(config.get('a.d.f.h'), config.get('i'));
    });

    it('should be able to handle complex stuff', function() {
      var values = {
        credentials: {
          admin: {
            read: true,
            write: true
          },
          reader: {
            read: true,
            write: false
          }
        },
        users: {
          someImportantDude: {
            username: 'him',
            password: '...',
            credentials: '{{ credentials.admin }}',
            reader: '{{ credentials.reader }}',
            author: false
          }
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('users.someImportantDude.credentials').write, true);
      assert.strictEqual(config.get('users.someImportantDude.reader').write, false);
      assert.strictEqual(config.get('users.someImportantDude.author'), false);
    });

    it('should be able to resolve recursively an object on get', function() {
      var values = {
        routes: {
          index: '/index.html'
        },
        menu: {
          index: '{{ routes.index }}'
        }
      };
      var config = new reconfig(values);

      assert.strictEqual(config.get('menu').index, '/index.html');
    });

    it('should be able to pick up stuff form the environment', function() {
      var values = {};
      var config = new reconfig(values, 'RECONFIG');

      assert.strictEqual(config.get('envKey'), 'value');
    });

    it('should be able to pick up stuff form the environment and override conf values', function() {
      var values = {
        confKey: 'value'
      };
      var config = new reconfig(values, 'RECONFIG');

      assert.strictEqual(config.get('confKey'), 'newValue');
    });

    it('env overriders should be able to modify arrays as well', function() {
      var values = {
        list: [
          {key: 'value', key2: 'value2'},
          {key: 'value', key2: 'value2'}
        ]
      };

      var config = new reconfig(values, 'RECONFIG');

      assert.strictEqual(config.get('list')[1].key, 'newValue');
    });

  });
});

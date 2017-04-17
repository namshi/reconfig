'use strict';

var assert = require('assert');
var Reconfig = require('./../');
var _isEqual = require('lodash/isEqual');

describe('Reconfig', function() {
  describe('new', function() {
    var config = new Reconfig();

    it('should be instantiatable without any parameter', function() {
      assert('Reconfig', typeof config);
    });
  });

  describe('get', function() {
    it('should return NULL if there is no config injected', function() {
      var config = new Reconfig();

      assert(null === config.get());
    });

    it('should return the whole config object if called without arguments', function() {
      var values = [1, 2, 3];
      var config = new Reconfig(values);

      assert(_isEqual(values, config.get()));
    });

    it('should return a specific root config value if called without dots', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new Reconfig(values);

      assert(1 === config.get('a'));
    });

    it('should return NULL if called with a non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new Reconfig(values);

      assert(null === config.get('c'));
    });

    it('should return NULL if called with deep non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new Reconfig(values);

      assert(null === config.get('c.a'));
    });

    it('should return NULL if called with simple non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new Reconfig(values);

      assert(null === config.get('c.a'));
    });

    it('should return NULL if called with deep non existing path', function() {
      var values = {
        a: 1,
        b: 2
      };
      var config = new Reconfig(values);

      assert(null === config.get('c.a.b.c.d.e'));
    });

    it('should return a default value if the default parameter is provided', function() {
      var values = {
        a: 1
      };
      var config = new Reconfig(values);

      assert(2 === config.get('b', {}, 2));
    });

    it('should be able to handle parameters', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new Reconfig(values);

      assert('hello world!' === config.get('a.b', {
        what: 'world'
      }));
    });

    it('should be able to render undefined parameters values as empty string', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new Reconfig(values);

      assert('hello !' === config.get('a.b', {
        what: undefined
      }));
    });

    it('should be able to render undefined parameters values as empty string', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new Reconfig(values);

      assert('hello !' === config.get('a.b', {
        what: null
      }));
    });

    it('should be able to render parmas in composite values', function() {
      var values = {
        a: {
          b: 'hello :what!'
        },
        c: '{{ a.b }}, :what'
      };
      var config = new Reconfig(values);

      assert('hello world!, world' === config.get('c', {
        what: 'world'
      }));
    });

    it('should be able to handle self-referencing configs', function() {
      var values = {
        a: {
          b: 'hello :what!'
        },
        c: '{{ a.b }}'
      };
      var config = new Reconfig(values);

      assert('hello world!' === config.get('c', {
        what: 'world'
      }));
    });

    it('should not go nuts with numeric value for self-referencing configs', function() {
      var values = {
        a: {
          b: 3000
        },
        c: 'Hello Fry, this is the year {{ a.b }}'
      };
      var config = new Reconfig(values);

      assert('Hello Fry, this is the year 3000' === config.get('c'));
    });

    it('shouldnt go bonkers if you pass a parameter that doesnt exist', function() {
      var values = {
        a: {
          b: 'hello :what!'
        }
      };
      var config = new Reconfig(values);

      assert('hello :what!' === config.get('a.b', {
        hello: 'world'
      }));
    });

    it('should return NULL if self-referencing a parameter that doesnt exist', function() {
      var values = {
        a: {
          b: '{{ c }}'
        }
      };
      var config = new Reconfig(values);

      assert(null === config.get('a.b'));
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
      var config = new Reconfig(values);

      assert('Hey, HOLA' === config.get('a.b'));
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
      var config = new Reconfig(values);

      assert(true === config.get('users.someImportantDude.credentials').write);
      assert(false === config.get('users.someImportantDude.reader').write);
      assert(false === config.get('users.someImportantDude.author'));
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
      var config = new Reconfig(values);

      assert('/index.html', config.get('menu').index);
    });

    it('should be able to pick up stuff form the environment', function() {
      var values = {};
      var config = new Reconfig(values, {envPrefix: 'RECONFIG'});

      assert(config.get('envKey') === 'value');
    });

    it('should be able to pick up stuff form the environment and override conf values', function() {
      var values = {
        confKey: 'value'
      };

      var config = new Reconfig(values, {envPrefix: 'RECONFIG'});

      assert(config.get('confKey') === 'newValue');
    });

    it('env overriders should be able to modify arrays as well', function() {
      var values = {
        list: [
          {key: 'value', key2: 'value2'},
          {key: 'value', key2: 'value2'}
        ]
      };

      var config = new Reconfig(values, {envPrefix: 'RECONFIG'});

      assert(config.get('list')[1].key === 'newValue');
    });

    it('should be able to pick up stuff form the environment and override conf values (using custom separator)', function() {
      process.env['RECONFIG__confKey'] = 'newValue';
      process.env['RECONFIG__conf_Key'] = 'newValue';
      var values = {
        confKey: 'value',
        'conf_Key': 'value'
      };

      var config = new Reconfig(values, {envPrefix: 'RECONFIG', separator: '__'});

      assert(config.get('confKey') === 'newValue');
      assert(config.get('conf_Key') === 'newValue');
    });

  });

  describe('set', function() {
    it('should be able to set the config object on an existing instance', function() {
      var config =  new Reconfig({});
      var conf = {
        a: 1,
        b: 2,
        c: '{{a}}_{{b}}'
      };

      config.set(conf);
      assert(config.get('c') === '1_2');
    });

    it('should be able to update the config object on an existing instance', function() {
      var config =  new Reconfig({
          a: 1,
          b: 2,
          c: '{{a}}_{{b}}'
      });

      config.set({b: 3});
      assert(config.get('c') === '1_3');
    });

    it('should be able to update a complex config object on an existing instance', function() {
      var config =  new Reconfig({
          a: {
            a1: 1
          },
          b: 2,
          c: {
            d: 3
          },
          res: '{{a.a1}}_{{c.d}}_{{b}}'
      });

      config.set({b: 3, c:{d: 4}});
      assert(config.get('res') === '1_4_3');
    });

    it('should be able to custom interpolation for parameters', function() {
      var config =  new Reconfig({
        a: 1,
        b: 2,
        c: '{{a}}_{{b}}__{customParam}'
      }, {
        paramsInterpolation: ['{','}']
      });

      assert(config.get('c', {customParam: 'hi'}) === '1_2__hi');
    });

  });
});

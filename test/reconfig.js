var assert      = require("assert");
var reconfig    = require("./../reconfig");

describe('Reconfig', function(){
    describe('new', function(){
        var config = new reconfig();

        it('should be instantiatable without any parameter', function(){
            assert('reconfig', typeof config);
        })
    })

    describe('get', function(){
        it('should return NULL if there is no config injected', function(){
            var config = new reconfig();

            assert(null === config.get());
        })

        it('should return the whole config object if called without arguments', function(){
            var values = [1,2,3];
            var config = new reconfig(values);

            assert(values === config.get());
        })

        it('should return a specific root config value if called without dots', function(){
            var values = {a: 1, b: 2};
            var config = new reconfig(values);

            assert(1 === config.get('a'));
        })

        it('should return NULL if called with a non existing path', function(){
            var values = {a: 1, b: 2};
            var config = new reconfig(values);

            assert(null === config.get('c'));
        })

        it('should return NULL if called with deep non existing path', function(){
            var values = {a: 1, b: 2};
            var config = new reconfig(values);

            assert(null === config.get('c.a'));
        })

        it('should return a deep property if called with the dot notation', function(){
            var values = {a: {c: 1}, b: 2};
            var config = new reconfig(values);

            assert(1 === config.get('a.c'));
        })

        it('should return a default value if the default parameter is provided', function(){
            var values = {a: 1};
            var config = new reconfig(values);

            assert(2 === config.get('b', {}, 2));
        })

        it('should be able to handle parameters', function(){
            var values = {a: {b: 'hello :what!'}};
            var config = new reconfig(values);

            assert('hello world!' === config.get('a.b', {what: 'world'}));
        })

        it('should be able to handle self-referencing configs', function(){
            var values = {a: {b: 'hello :what!'}, c: "{{ a.b }}"};
            var config = new reconfig(values);

            assert('hello world!' === config.get('c', {what: 'world'}));
        })

        it('shouldnt go bonkers if you pass a parameter that doesnt exist', function(){
            var values = {a: {b: 'hello :what!'}};
            var config = new reconfig(values);

            assert('hello :what!' === config.get('a.b', {hello: 'world'}));
        })

        it('should return NULL if self-referencing a parameter that doesnt exist', function(){
            var values = {a: {b: '{{ c }}'}};
            var config = new reconfig(values);

            assert(null == config.get('a.b'));
        })

        it('should be able to handle complex stuff', function(){
            var values = {
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
            };
            var config = new reconfig(values);

            assert(true == config.get('users.someImportantDude.credentials').write);
        })
    })
})

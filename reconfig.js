/**
 * Constructor.
 *
 * @param config
 * @constructor
 */
function Reconfig (config) {
    this.config = config || null;
}

/**
 * Utility function to get the value
 * of an object property by path.
 *
 * ie. getValueByPath({a: {b: 2}}, 'a.b')
 * 
 * @param object
 * @param path
 * @returns {*}
 */
function getValueByPath(object, path) {
    var nextPath    = '';
    var splitPath   = path.split('.');

    if (splitPath.length > 1) {
        nextPath = path.replace(splitPath[0]+'.', '');
        return getValueByPath(object[splitPath[0]], nextPath);
    } else {
        return object[splitPath[0]];
    }
}

/**
 * Replaces overlays in a value of the config.
 * Overlays are usually references to other config
 * values such as:
 *
 *  helloworld: '{{ hello }} world!'
 *
 * so what this function does is basically
 * resolving the value in the overlay.
 *
 * @param {string} value
 * @param {Config} config
 * @return {string}
 */
Reconfig.prototype.resolveReferences = function(value) {
    var rcf = this;

    return value.replace(/{{\s*[\w\.]+\s*}}/g, function(parameter){
        return rcf.get(parameter.replace(/[^\w.]/g, ''));
    });
};

/*
 * Resolves all the parameters of the Config's
 * value.
 *
 * A parameter is a string preceded by a colon,
 * for example:
 *
 *  'This is my config :value'
 *
 * This function will be responsible of iterating
 * through the parameters provided and trying to
 * replace them in the value. If a parameter is
 * not found, it will be ignored.
 *
 * @param value
 * @param parameters
 * @return {*}
 */
Reconfig.prototype.resolveParameters = function(value, parameters) {
    for (var property in parameters) {
        value = value.replace(':' + property, parameters[property]);
    }

    return value;
};

Reconfig.prototype.set =  function (config) {
    this.config = config;
}

/**
 * Returns a configuration value, by path.
 *
 * If the configuration contains an object
 * 'greet' with a property 'formal' of value
 * 'Hello sir.', you can access it with a
 * convenient dot notation.
 *
 *  Config.get('greet.formal') // Hello sir.
 *
 * Values can reference other values, for
 * example:
 *
 * greet: {
 *   base: 'Hello',
 *   formal: '{{ greet.base }} sir.'
 * }
 *
 * Values can also contain parameters:
 *
 * greet: {
 *   base: 'Hello',
 *   formal: '{{ greet.base }} :name.'
 * }
 *
 * which can then be resolved with:
 *
 *  Config.get('greet.formal', {name: 'John'})
 *
 * which will return "Hello John".
 *
 * Please note that this function uses
 * the 'eval' function, so it should not
 * be used with not-sanitized user-input.
 * If you need to retrieve a config value
 * based on user-input, please sanitize the
 * value before retrieving it from the
 * Config object.
 *
 * @param path
 * @param parameters
 * @return {*}
 */
Reconfig.prototype.get = function (path, parameters) {
    if (!path) {
        return this.config;
    }

    try{
        var value = getValueByPath(this.config, path);

        if (typeof value === 'string') {
            value = this.resolveReferences(value);

            if (parameters) {
                value = this.resolveParameters(value, parameters);
            }
        }

        if (value === 'null') {
            return null;
        }

        return value || null;
    } catch(err) {
        return null;
    }
}

module.exports = Reconfig;
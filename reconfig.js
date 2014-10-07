'use strict';

var _ = require('lodash');

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
 * @param {Object} object
 * @param {String} path
 * @param {*} fallbackValue
 * @returns {*}
 */
function getValueByPath(object, path, fallbackValue) {
    var nextPath    = '';
    var splitPath   = path.split('.');

    if (splitPath.length > 1) {
        nextPath = path.replace(splitPath[0] + '.', '');

        return getValueByPath(object[splitPath[0]], nextPath);
    } else {
        if (object !== undefined) {
            var value = object[splitPath[0]];
        }

        if (value === undefined && fallbackValue) {
            return fallbackValue;
        }

        return value;
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
    var references = value.match(/{{\s*[\w\.]+\s*}}/g);

    if (references && references.length === 1) {
        var reference = rcf.get(references[0].replace(/[^\w.]/g, ''));

        if (typeof reference != 'string') {
            return reference;
        }
    }

    return value.replace(/{{\s*[\w\.]+\s*}}/g, function(reference){
        return rcf.get(reference.replace(/[^\w.]/g, ''));
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

/**
 * Resolves overlays in a required object
 *
 * @param object
 * @param parameters
 * @returns {*}
 */
Reconfig.prototype.resolveObject = function (object, parameters) {
  var self = this;
  var clonedObject = _.cloneDeep(object);

  _.map(clonedObject, function(value, key) {
    clonedObject[key] = self.resolve(value, parameters);
  });

  return clonedObject;
};

/**
 * Resolve the obtained value,
 * if value is an object it will recursively resolve the overlays
 *
 * @param value
 * @param parameters
 * @returns {*}
 */
Reconfig.prototype.resolve = function (value, parameters) {
  if (typeof value === 'string') {
    value = this.resolveReferences(value);

    if (parameters) {
      value = this.resolveParameters(value, parameters);
    }
  }

  if (typeof value === 'object') {
    value = this.resolveObject(value, parameters);
  }

  return value;
};

Reconfig.prototype.set =  function (config) {
    this.config = config;
};

/**
 * Returns a configuration value, by path.
 *
 * If the configuration contains an object
 * 'greet' with a property 'formal' of value
 * 'Hello sir.', you can access it with a
 * convenient dot notation.
 *
 * Config.get('greet.formal') // Hello sir.
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
 * @param {String} path
 * @param {Object} parameters
 * @param {*} fallbackValue
 * @return {*}
 */
Reconfig.prototype.get = function (path, parameters, fallbackValue) {
    if (!path) {
        return this.config;
    }

    var value = getValueByPath(this.config, path, fallbackValue);
    value = this.resolve(value, parameters);

    return value || null;
};

if (typeof module !== 'undefined' && module !== null) {
    module.exports = Reconfig;
}
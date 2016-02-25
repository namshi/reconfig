'use strict';

var _ = _ || null;
var vpo = vpo || null;

if (typeof require !== 'undefined') {
  _ = require('lodash');
  vpo = require('vpo');
}

if (!_ || !vpo) {
  throw new Error('Reconfig needs lodash (bower install --save lodash || https://lodash.com/) and VPO (bower install --save vpo || https://github.com/unlucio/vpo)');
}

function getConfigFromEnv(prefix, separator) {
  separator = separator || '_';
  var envConfig = {};

  _.forEach(process.env, function(value, key) {
    if (_.includes(key, prefix)) {
      var path = key.replace(prefix + separator, '').replace(new RegExp(separator, 'g'), '.');
      vpo.set(envConfig, path, value);
    }
  });

  return envConfig;
}

/**
 * Constructor.
 *
 * @param config
 * @param envPrefix
 * @param separator
 * @constructor
 */
function Reconfig(config, envPrefix, separator) {
  this._config = null;
  this._rawConfig = null;
  this._envPrefix = envPrefix;
  this._separator = separator;

  this.set(config);
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
  var reference = null;
  var references = value.match(/{{\s*[\w\.]+\s*}}/g);

  if (references && references.length === 1) {
    reference = rcf.resolve(rcf.get(references[0].replace(/[^\w.]/g, '')));

    if (typeof reference === 'object') {
      return reference;
    }
  }

  return value.replace(/{{\s*[\w\.]+\s*}}/g, function(reference) {
    return rcf.resolve(rcf.get(reference.replace(/[^\w.]/g, '')));
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
    value = (value) ? value.replace(':' + property, (parameters[property] || '')) : value;
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
Reconfig.prototype.resolveObject = function(object, parameters) {
  var self = this;
  var clonedObject = _.cloneDeep(object);

  _.forEach(clonedObject, function(value, key) {
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
Reconfig.prototype.resolve = function(value, parameters) {
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

Reconfig.prototype.set = function(config) {
    if (!config) {
    return;
  }

  if (this._envPrefix) {
    if (process && process.env && typeof process.env !== String) {
      _.merge(config, getConfigFromEnv(this._envPrefix, this._separator));
    } else {
      console.warn('HEY HEY HEY, this feature is supposed to be used in node only :)');
    }
  }

  this._config = this._rawConfig = (_.isObject(this._rawConfig) || _.isArray(this._rawConfig)) ? _.merge(this._rawConfig, config) : config;
  this._config = this.resolve(this._config);
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
Reconfig.prototype.get = function(path, parameters, fallbackValue) {
  if (!path) {
    return this._config;
  }

  var value = vpo.get(this._config, path, fallbackValue);
  value = (parameters) ? this.resolve(value, parameters): value;

  return (_.isUndefined(value) || _.isNull(value)) ? null : value;
};

if (typeof module !== 'undefined' && module !== null) {
  module.exports = Reconfig;
}

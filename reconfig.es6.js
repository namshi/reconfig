'use strict';
import _ from 'lodash';
import vpo from 'vpo';

let getConfigFromEnv = (prefix, separator = '_') => {
    let envConfig = {};

    _.forEach(process.env,  (value, key) => {
        if (_.includes(key, prefix)) {
            let path = key.replace(prefix + separator, '').replace(new RegExp(separator, 'g'), '.');
            vpo.set(envConfig, path, value);
        }
    });

    return envConfig;
}

export default class Reconfig {
    _config = null;
    _rawConfig = null;

    /**
     * Constructor
     * @param config {object}
     * @param envPrefix
     * @param separator
     */
    constructor(config, envPrefix, separator) {
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
    resolveReferences(value = '') {
        let reference = null;
        let references = value.match(/{{\s*[\w\.]+\s*}}/g);

        if (references && references.length === 1) {
            reference = this.resolve(this.get(references[0].replace(/[^\w.]/g, '')));

            if (typeof reference === 'object') {
                return reference;
            }
        }

        return value.replace(/{{\s*[\w\.]+\s*}}/g, ref => {
            return this.resolve(this.get(ref.replace(/[^\w.]/g, '')));
        });
    }

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
    resolveParameters(value, parameters) {
        for (let property in parameters) {
            if (value) {
                value = value.replace(RegExp(':' + property, 'g'), (parameters[property] || ''));
            }
        }

        return value;
    }

    /**
     * Resolves overlays in a required object
     *
     * @param object
     * @param parameters
     * @returns {*}
     */
    resolveObject(object, parameters) {
        let clonedObject = _.cloneDeep(object);

        _.forEach(clonedObject, (value, key) => {
            clonedObject[key] = this.resolve(value, parameters);
        });

        return clonedObject;
    }

    /**
     * Resolve the obtained value,
     * if value is an object it will recursively resolve the overlays
     *
     * @param value
     * @param parameters
     * @returns {*}
     */
    resolve(value, parameters) {
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
    }

    set(config) {
        if (!config) {
            return;
        }

        if (this._envPrefix) {
            if (process && process.env && typeof process.env !== 'string') {
                _.merge(config, getConfigFromEnv(this._envPrefix, this._separator));
            } else {
                console.warn('HEY HEY HEY, this feature is supposed to be used in node only :)');
            }
        }

        this._config = this._rawConfig = (_.isObject(this._rawConfig) || _.isArray(this._rawConfig)) ? _.merge(this._rawConfig, config) : config;
        this._config = this.resolve(this._config);
    }

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
    get(path, parameters, fallbackValue) {
        if (!path) {
            return this._config;
        }

        let value = vpo.get(this._config, path, fallbackValue);
        value = (parameters) ? this.resolve(value, parameters) : value;

        return (_.isUndefined(value) || _.isNull(value)) ? null : value;
    }
}

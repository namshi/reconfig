(function(global,factory){if(typeof define==="function"&&define.amd){define("Reconfig",["module","exports","lodash","vpo"],factory)}else if(typeof exports!=="undefined"){factory(module,exports,require("lodash"),require("vpo"))}else{var mod={exports:{}};factory(mod,mod.exports,global.lodash,global.vpo);global.Reconfig=mod.exports}})(this,function(module,exports,_lodash,_vpo){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _lodash2=_interopRequireDefault(_lodash);var _vpo2=_interopRequireDefault(_vpo);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var getConfigFromEnv=function getConfigFromEnv(prefix){var separator=arguments.length<=1||arguments[1]===undefined?"_":arguments[1];var envConfig={};_lodash2.default.forEach(process.env,function(value,key){if(_lodash2.default.includes(key,prefix)){var path=key.replace(prefix+separator,"").replace(new RegExp(separator,"g"),".");_vpo2.default.set(envConfig,path,value)}});return envConfig};var Reconfig=function(){function Reconfig(config,envPrefix,separator){_classCallCheck(this,Reconfig);this._config=null;this._rawConfig=null;this._envPrefix=envPrefix;this._separator=separator;this.set(config)}_createClass(Reconfig,[{key:"resolveReferences",value:function resolveReferences(){var _this=this;var value=arguments.length<=0||arguments[0]===undefined?"":arguments[0];var reference=null;var references=value.match(/{{\s*[\w\.]+\s*}}/g);if(references&&references.length===1){reference=this.resolve(this.get(references[0].replace(/[^\w.]/g,"")));if((typeof reference==="undefined"?"undefined":_typeof(reference))==="object"){return reference}}return value.replace(/{{\s*[\w\.]+\s*}}/g,function(ref){return _this.resolve(_this.get(ref.replace(/[^\w.]/g,"")))})}},{key:"resolveParameters",value:function resolveParameters(value,parameters){for(var property in parameters){if(value){value=value.replace(RegExp(":"+property,"g"),parameters[property]||"")}}return value}},{key:"resolveObject",value:function resolveObject(object,parameters){var _this2=this;var clonedObject=_lodash2.default.cloneDeep(object);_lodash2.default.forEach(clonedObject,function(value,key){clonedObject[key]=_this2.resolve(value,parameters)});return clonedObject}},{key:"resolve",value:function resolve(value,parameters){if(typeof value==="string"){value=this.resolveReferences(value);if(parameters){value=this.resolveParameters(value,parameters)}}if((typeof value==="undefined"?"undefined":_typeof(value))==="object"){value=this.resolveObject(value,parameters)}return value}},{key:"set",value:function set(config){if(!config){return}if(this._envPrefix){if(process&&process.env&&typeof process.env!=="string"){_lodash2.default.merge(config,getConfigFromEnv(this._envPrefix,this._separator))}else{console.warn("HEY HEY HEY, this feature is supposed to be used in node only :)")}}this._config=this._rawConfig=_lodash2.default.isObject(this._rawConfig)||_lodash2.default.isArray(this._rawConfig)?_lodash2.default.merge(this._rawConfig,config):config;this._config=this.resolve(this._config)}},{key:"get",value:function get(path,parameters,fallbackValue){if(!path){return this._config}var value=_vpo2.default.get(this._config,path,fallbackValue);value=parameters?this.resolve(value,parameters):value;return _lodash2.default.isUndefined(value)||_lodash2.default.isNull(value)?null:value}}]);return Reconfig}();exports.default=Reconfig;module.exports=exports["default"]});
//# sourceMappingURL=build/reconfig.min.js.map
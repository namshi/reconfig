var rec = require('./reconfig.js');
var c = {
  root: {
    a: 'valA',
    b: {
      c: '{{ root.a }}',
      d: 'valD:paramD'
    },
    e: 'valE:paramE',
    f: 'valeF {{root.b.d}}'
  }
};

var conf = new rec(c);

console.log('conf: ', conf);
console.log('conf paramD: ', conf.get('root', {paramD: 'ddddddddddd'}));
console.log('conf app params: ', conf.get('root', {paramD: 'ddddddddddd', paramE: 'eeeeeeeeeeeeeeee'}));

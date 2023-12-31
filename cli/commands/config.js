var khulnasoft = require('../../lib');
var Promise = require('es6-promise').Promise; // jshint ignore:line

module.exports = function config(method) {
  var args = [].slice.call(arguments, 1);
  var key = args[0];

  return new Promise(function (resolve) {
    var res = '';
    if (method === 'set') {
      args.map(function (item) {
        return item.split('=');
      }).forEach(function (pair) {
        res += pair[0] + ' updated\n';
        khulnasoft.config.set.apply(khulnasoft.config, pair);

        // ensure we update the live library
        if (pair[0] === 'api') {
          khulnasoft.api = pair[1];
        }
      });
      res = res.trim(); // for clean response
    } else if (method === 'get') {
      if (!key) {
        throw new Error('config:get requires an argument');
      }
      res = khulnasoft.config.get(key);
    } else if (method === 'unset') {
      if (!key) {
        throw new Error('config:unset requires an argument');
      }
      khulnasoft.config.del(key);
      res = key + ' deleted';
      if (key === 'api') {
        // ensure we update the live library
        khulnasoft.api = null;
      }
    } else if (!method) {
      res = Object.keys(khulnasoft.config.all).sort(function (a, b) {
        return a.toLowerCase() < b.toLowerCase();
      }).reduce(function (acc, curr) {
        acc += curr + ': ' + khulnasoft.config.all[curr] + '\n';
        return acc;
      }, '').trim();
    } else {
      throw new Error('Unknown config command "' + method + '"');
    }

    resolve(res);
  });
};
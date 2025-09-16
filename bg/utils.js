/**
 * Utils
 */
(function(exports) {

  'use strict';

  var module = {
    noop: function() {},
    parseURL: function(url) {
      //log('parseUrl', url);
      try {
        var urlObj = new URL(url);
        return {
            source: url,
            href: urlObj.href.replace(/(^https?\:\/\/)(www\.)/, '$1'),
            protocol: urlObj.protocol.replace(':', ''),
            host: urlObj.hostname.replace(/^www\./, ''),
            port: urlObj.port,
            query: urlObj.search,
            params: (function(){
                var ret = {},
                    seg = urlObj.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (urlObj.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
            hash: urlObj.hash.replace('#',''),
            path: urlObj.pathname.replace(/^([^\/])/,'/$1'),
            relative: (urlObj.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
            segments: urlObj.pathname.replace(/^\//,'').split('/')
        };
      } catch (e) {
        // 如果URL格式不正确，返回一个默认对象
        return {
            source: url,
            href: url,
            protocol: '',
            host: '',
            port: '',
            query: '',
            params: {},
            file: '',
            hash: '',
            path: '',
            relative: '',
            segments: []
        };
      }
    },
    removeDublicates: function(arr, equalFn) {
      equalFn = equalFn || function(a, b) {
        return a === b;
      };
      return arr.reduce(function(res, item) {
        var exists = res.some(function(r) {
          return equalFn(item, r);
        });
        if (!exists) {
          res.push(item);
        }
        return res;
      }, []);
    },
    getLocale: function() {
      var locale = chrome.i18n.getMessage('@@ui_locale').split('_')[0];
      return locale !== 'ru' ? 'en' : 'ru';
    }
  };

  exports.utils = module;

  // nasty log functions
  var prodIDs = ['pdfljehjkbbacjbgnocamgcllobmfocc', 'hpnnhabkliinlljmhjalfmccfcdokena'];
  exports.DEBUG = prodIDs.indexOf(chrome.runtime.id) === -1;
  exports.log = function() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  };

  exports.logj = function() {
    if (DEBUG) {
      var args = [].map.call(arguments, function(a) {
        return typeof a === 'object' ? JSON.stringify(a, false, 2) : a;
      });
      console.log.apply(console, args);
    }
  };

}(typeof window !== 'undefined' ? window : this));

/**!
 * Copyright(c) ali-sdk and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com>
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

const co = require('co');
const defer = require('co-defer');
const Base = require('sdk-base');
const util = require('util');
const ready = require('get-ready');
const copy = require('copy-to');
const currentIP = require('address').ip();

const RR = 'roundRobin';
const MS = 'masterSlave';
module.exports = function (oss) {
  function Client(options) {
    if (!(this instanceof Client)) {
      return new Client(options);
    }

    if (!options || !Array.isArray(options.cluster)) {
      throw new Error('require options.cluster to be an array');
    }

    Base.call(this);

    this.clients = [];
    this.availables = {};

    for (let i = 0; i < options.cluster.length; i++) {
      let opt = options.cluster[i];
      copy(options).pick('timeout', 'agent', 'urllib').to(opt);
      this.clients.push(oss(opt));
      this.availables[i] = true;
    }

    this.schedule = options.schedule || RR;
    this.index = 0;

    const heartbeatInterval = options.heartbeatInterval || 10000;
    this._checkAvailableLock = false;
    this._timerId = defer.setInterval(this._checkAvailable.bind(this), heartbeatInterval);
    this._init();
  }

  util.inherits(Client, Base);
  const proto = Client.prototype;
  ready.mixin(proto);

  const GET_METHODS = [
    'head',
    'get',
    'getStream',
    'list',
  ];

  const PUT_METHODS = [
    'put',
    'putStream',
    'delete',
    'deleteMulti',
    'copy',
    'putMeta',
  ];

  GET_METHODS.forEach(function (method) {
    proto[method] = function* () {
      const args = Array.prototype.slice.call(arguments);
      let client = this.chooseAvailable();
      let lastError;
      try {
        return yield client[method].apply(client, args);
      } catch (err) {
        if (err.status && err.status >= 200 && err.status < 500) {
          // 200 ~ 499 belong to normal response, don't try again
          throw err;
        }
        // < 200 || >= 500 need to retry from other cluser node
        lastError = err;
      }

      for (let i = 0; i < this.clients.length; i++) {
        let c = this.clients[i];
        if (c === client) {
          continue;
        }
        try {
          return yield c[method].apply(client, args);
        } catch (err){
          if (err.status && err.status >= 200 && err.status < 500) {
            // 200 ~ 499 belong to normal response, don't try again
            throw err;
          }
          // < 200 || >= 500 need to retry from other cluser node
          lastError = err;
        }
      }

      lastError.message += ' (all clients are down)';
      throw lastError;
    };
  });

  // must cluster node write success
  PUT_METHODS.forEach(function (method) {
    proto[method] = function* () {
      let args = Array.prototype.slice.call(arguments);
      let res = yield this.clients.map(function (client) {
        return client[method].apply(client, args);
      });
      return res[0];
    };
  });

  proto.signatureUrl = function (/* name */) {
    const args = Array.prototype.slice.call(arguments);
    let client = this.chooseAvailable();
    return client.signatureUrl.apply(client, args);
  };

  proto._init = function() {
    const that = this;
    co(function*() {
      yield that._checkAvailable(true);
      that.ready(true);
    }).catch(function(err) {
      that.emit('error', err);
    });
  };

  proto._checkAvailable = function*(first) {
    const name = '._ali-oss/check.status.' + currentIP + '.txt';
    if (first) {
      // only start will try to write the file
      yield this.put(name, new Buffer('check available started at ' + Date()));
    }

    if (this._checkAvailableLock) {
      return;
    }
    this._checkAvailableLock = true;
    let downStatusFiles = [];
    for (let i = 0; i < this.clients.length; i++) {
      let client = this.clients[i];
      // check 3 times
      let available = yield this._checkStatus(client, name);
      if (!available) {
        // check again
        available = yield this._checkStatus(client, name);
      }
      if (!available) {
        // check again
        available = yield this._checkStatus(client, name);
        if (!available) {
          downStatusFiles.push(client._objectUrl(name));
        }
      }
      this.availables[i] = available;
    }
    this._checkAvailableLock = false;

    if (downStatusFiles.length > 0) {
      const err = new Error(downStatusFiles.length + ' data node down, please check status file: ' + downStatusFiles.join(', '));
      err.name = 'CheckAvailableError';
      this.emit('error', err);
    }
  };

  proto._checkStatus = function*(client, name) {
    let available = true;
    try {
      yield client.head(name);
    } catch (err) {
      // 404 will be available too
      if (!err.status || err.status >= 500 || err.status < 200) {
        available = false;
      }
    }
    return available;
  };

  proto.chooseAvailable = function() {
    if (this.schedule === MS) {
      for (let i = 0; i < this.clients.length; i++) {
        if (this.availables[i]) {
          return this.clients[i];
        }
      }
      // all down, try to use this first one
      return this.clients[0];
    }

    // RR
    let n = this.clients.length;
    while (n > 0) {
      let i = this._nextRRIndex();
      if (this.availables[i]) {
        return this.clients[i];
      }
      n--;
    }
    // all down, try to use this first one
    return this.clients[0];
  };

  proto._nextRRIndex = function() {
    let index = this.index++;
    if (this.index >= this.clients.length) {
      this.index = 0;
    }
    return index;
  };

  proto.close = function() {
    clearInterval(this._timerId);
    this._timerId = null;
  };

  return Client;
};

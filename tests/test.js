/**
 * Created by zander on 28.10.2015.
 */
var test = require('tape');
var promisify = require('./../index');

var promiseApi = {};

promiseApi.reject1 = function (arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            reject("reject1");
        }, 1000);
    });
};

promiseApi.reject2 = function (arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            reject("reject2");
        }, 1000);
    });
};

promiseApi.dataChain = function (arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            resolve(arg+1);
        }, 1000);
    });
};

promiseApi.data = function (arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            resolve(arg);
        }, 1000);
    });
};

promiseApi.dataChainWithAck = function (ackCallback) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            ackCallback();
            resolve("ok");
        }, 1000);
    });
};

promiseApi.staticData = function (arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            resolve("staticData");
        }, 1000);
    });
};

test('chain resolve test', function (t) {
    t.plan(1);
    var promiseFabricChain = [promiseApi.dataChain.bind(promiseApi, 0), promiseApi.dataChain, promiseApi.dataChain, promiseApi.dataChain];
    var finalPromise = promisify.chain(promiseFabricChain);
    finalPromise.then(function (data) {
        t.equal(4, data);
    }).catch(function(){
        t.fail("No rejection allowed for this test.");
    });
});

test('chain resolve-reject test', function (t) {
    t.plan(1);
    var promise = promisify.chain([promiseApi.dataChain.bind(promiseApi, 0), promiseApi.dataChain, promiseApi.reject1, promiseApi.dataChain]);
    promise.then(function (data) {
        t.fail("No resolve allowed for this test.");
    }).catch(function(err){
        t.equal("reject1", err);
    });
});

test('force chain test', function (t) {
    t.plan(5);
    var promiseFabricChain = [
        promiseApi.dataChainWithAck.bind(promiseApi, t.ok.bind(t, true, "resolve 1")),
        promiseApi.dataChainWithAck.bind(promiseApi, t.ok.bind(t, true, "resolve 2")),
        promiseApi.dataChainWithAck.bind(promiseApi, t.ok.bind(t, true, "resolve 3")),
        promiseApi.dataChainWithAck.bind(promiseApi, t.ok.bind(t, true, "resolve 4"))
    ];
    var finalPromise = promisify.chainForce(promiseFabricChain);
    finalPromise.then(function (data) {
        t.ok(true, "final resolve");
    }).catch(function(){
        t.fail("No rejection allowed for this test.");
    });
});

test('first in chain test 1', function (t) {
    t.plan(1);
    var promiseFabricChain = [
        promiseApi.reject1,
        promiseApi.data.bind(promiseApi, "resolved"),
        promiseApi.reject1
    ];
    var finalPromise = promisify.firstInChain(promiseFabricChain);
    finalPromise.then(function (data) {
        t.equal("resolved", data);
    }).catch(function(){
        t.fail("No rejection allowed for this test.");
    });
});

test('first in chain test 2', function (t) {
    t.plan(1);
    var promiseFabricChain = [
        promiseApi.reject1,
        promiseApi.reject1,
        promiseApi.reject1
    ];
    var finalPromise = promisify.firstInChain(promiseFabricChain);
    finalPromise.then(function (data) {
        t.fail("No resolve allowed for this test.");
    }).catch(function(){
        t.pass("All promises rejected, OK!");
    });
});
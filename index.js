"use strict";

var Promisify = {};

/**
 * Promise chain.
 * Stops when some promise resolve.
 * EXAMPLE:
 * var promises = [promiseAPIMethod1, promiseAPIMethod2, promiseAPIMethod3];
 * Promisify.firstInChain(promises).then(function(finalResult){
 *      //do some with result
 * }).catch(function(finalError){
 *      //handle error
 * });
 * @param {(function(...)Promise)[]} promiseMethods
 * @param {function|undefined} errHandler
 * @returns Promise
 */
Promisify.firstInChain = function (promiseMethods, errHandler) {
    return promiseMethods.reduce(function(current, next){
        return current.catch(function(err){
            (typeof errHandler === "function") && errHandler(err);
            return next();
        }).then(function(data){
            return data;
        });
    }, Promise.reject("Initial error"));
};

/**
 * Promise chain
 * @param promiseMethods
 * @returns Promise
 */
Promisify.chain = function (promiseMethods) {
    return promiseMethods.reduce(function (current, next) {
        return current.then(next);
    }, Promise.resolve());
};

/**
 * Promise chain, TURN DOWN FOR WHAT
 * @param promiseMethods
 * @returns Promise
 */
Promisify.chainForce = function (promiseMethods) {
    return promiseMethods.reduce(function (current, next) {
        return current.catch(function (err) {
            return next(err);
        }).then(function () {
            return next.apply(next, arguments);
        });
    }, Promise.resolve());
};

module.exports = Promisify;
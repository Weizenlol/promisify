"use strict";

module.exports = {
    /**
     * EXAMPLE:
        generatorify.doSync(function*(callback){
            let dirFiles, firstFile;
            try{
                dirFiles = yield fs.readdir('wowowoow', callback);
                firstFile = dirFiles[1][0];
            } catch (e){
                firstFile = null;
            }
            console.log(firstFile);
        });
     * @param generator
     */
    doSync: function(generator){
        var iterator = generator(step);
        function step(err, result){
            if(arguments[0] instanceof Error){
                iterator.throw(arguments[0]);
                return;
            }
            iterator.next(arguments);
        }
        step();
    },
    /**
     * EXAMPLE:
     generatorify.doSyncPromise(function*(){
            let p1 = yield asyncPromise('p1');
            console.log("p1", p1);
     });
     * @param generator
     */
    doSyncPromise: function(generator){
        var iterator = generator();

        function step(result) {
            if (result.done) return result.value;
            return result.value.then(function (value) {
                return step(iterator.next(value));
            }, function (error) {
                return step(iterator.throw(error));
            });
        }
        step(iterator.next());
    }
};
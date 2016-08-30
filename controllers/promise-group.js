
/**
 * A better way to handle groups of promises.
 *
 * Promise.all takes a list of promises and returns one promise that will
 * resolve with a list containing the results of each promise
 * or reject if any one of its promises fails.
 *
 * When rendering a page, we often pull in data from a variety of sources.
 * If any one of those fails, we want to continue rendering as much of the
 * page as we can.
 *
 * new PromiseGroup({
 *      peers: getPeers(),
 *      siblings: getSiblings(),
 *      children: getChildren()
 * }).then(result => {
 *
 * }, error => {
 *
 * });
 *
 */

class NamedPromise {
    constructor(name, promise) {
        this.name = name;
        this.promise = promise;
    }

    static fromObject(object) {
        if (!object.name || !object.promise)
            throw Error('object missing required fields: name, promise');
        return new NamedPromise(object.name, object.promise);
    }
}

class PromiseGroup {
    constructor(namedPromises) {
        this.promises = namedPromises;

        this.resolved = 0;
        this.results = {};
    }

    then(resolve, reject) {
        this.promises.forEach((namedPromise, index) => {
            namedPromise.promise.then(result => {
                this.results[name] = result;


            }, error => {

            });
        });
    }

    static fromObject(promises) {
        const namedPromises = _.keys(promises).map(name => {
            return new NamedPromise(name, promises[name]);
        });

        return new PromiseGroup(namedPromises);
    }

    static timeout(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(fn) {
    this._status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.FULFILLED_CALLBACK_LIST = [];
    this.REJECTED_CALLBACK_LIST = [];

    Object.defineProperty(this, 'status', {
        configurable: true,
        enumerable: true,
        get: function() {
            return this._status;
        },
        set: function(status) {
            this._status = status;
            switch(status) {
                case FULFILLED: {
                    this.FULFILLED_CALLBACK_LIST.forEach(callback => {
                        callback(this.value);
                    });
                    break;
                }
                case REJECTED: {
                    this.REJECTED_CALLBACK_LIST.forEach(callback => {
                        callback(this.reason);
                    });
                    break;
                }
            }
        }
    });

    try{
        fn(this.resolve.bind(this), this.reject.bind(this));
    } catch(e) {
        this.reject(e);
    }

}

// MyPromise.prototype

MyPromise.prototype.resolve = function(value) {
    if(this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
    }
}

MyPromise.prototype.reject = function(reason) {
    if(this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const realOnFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value;
    const realOnRejected = isFunction(onRejected) ? onRejected : reason => {
        throw reason;
    };
    // const realOnRejected = isFunction(onRejected) ? onRejected : reason => reason;

    const promise2 = new MyPromise((resolve, reject) => {
        const queueFulfilledMicrotask = () => {
            queueMicrotask(() => {
                try{
                    let x = realOnFulfilled(this.value);
                    this.resolvePromise(promise2, x, resolve, reject);
                } catch(e) {
                    reject(e);
                }
            });
        }

        const queueRejectedMicrotask = () => {
            queueMicrotask(() => {
                try{
                    let x = realOnRejected(this.reason);
                    this.resolvePromise(promise2, x, resolve, reject);
                } catch(e) {
                    reject(e);
                }
            });
        }

        switch(this.status) {
            case FULFILLED:
                queueFulfilledMicrotask();
                break;
            case REJECTED:
                queueRejectedMicrotask();
                break;
            case PENDING:
            default:
                this.FULFILLED_CALLBACK_LIST.push(queueFulfilledMicrotask);
                this.REJECTED_CALLBACK_LIST.push(queueRejectedMicrotask);
        }
    });

    return promise2;
}

MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}

/**
 * The Promise Resolution Procedure 
 * [[Resolve]](promise, x)
 **/
MyPromise.prototype.resolvePromise = function(promise2, x, resolve, reject) {
    // If promise and x refer to the same object, reject promise with a TypeError as the reason.
    if(promise2 === x) {
        reject(new TypeError('The promise and the return value are the same'));
    }

    
    if(x instanceof MyPromise) { // If x is a promise, adopt its state
        x.then((y) => {
            this.resolvePromise(promise2, y, resolve, reject);
        }, reject);
    } else if(typeof x === 'object' || isFunction(x)) { // Otherwise, if x is an object or function
        if(x === null) {
            resolve(x); 
        }

        // Let then be x.then
        let then = null;
        try{
            then = x.then;
        } catch(e) { // If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
            reject(e);
        }

        // If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
        if(isFunction(then)) {
            // If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            let called = false;
            try{
                then.called(x,
                    y => {
                        if(called) return;
                        called = true;
                        // If/when resolvePromise is called with a value y, run [[Resolve]](promise, y)
                        this.resolvePromise(promise2, y, resolve, reject);
                    },
                    r => {
                        if (called) return;
                        called = true;
                        // If/when rejectPromise is called with a reason r, reject promise with r.
                        reject(r);
                    });
            } catch(e) { // If calling then throws an exception e
                // If resolvePromise or rejectPromise have been called, ignore it.
                if(called) return;
                // Otherwise, reject promise with e as the reason.
                reject(e);
            }
        }
    } else { // If x is not an object or function, fulfill promise with x
        resolve(x);
    }
}

function isFunction(fn) {
    return typeof fn === 'function';
}

// 测试
const test = new MyPromise((resolve, reject) => {
    console.log(1);
    reject(111);
}).then((value) => {
    console.log(value);
}).catch((reason) => {
    console.log(reason);
}).catch((reason) => {
    console.log(reason);
})

// const test2 = new Promise((resolve, reject) => {
//     console.log(1);
//     reject(111);
// }).then((value) => {
//     console.log(value);
// }).catch((reason) => {
//     console.log(reason);
// })
// console.log(2);
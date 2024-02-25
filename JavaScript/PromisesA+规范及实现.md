## 1. 术语
- `promise`是一个有`then`方法的对象或函数，它的行为遵循本规范
- `thenable`是一个定义了`then`方法的对象或函数
- `value`是任意一个合法的JavaScript值，是promise状态为成功时的值
- `exception`是一个使用throw关键字抛出的异常值
- `reason`是promise状态为失败时的值，表示promise失败的原因


## 2. 规范
### 2.1 Promise States
一个promise必须处于三种状态之一：pending, fulfilled, rejected.  
1. pending    
   - 初始状态，可改变（改变方式只有以下两种）    
   - 可由pending变为fulfilled    
   - 可由pending变为rejected    
2. fulfilled    
   - 最终状态，不可变    
   - 必须拥有一个value，且不可变（===不可变）    
3. rejected    
   - 最终状态，不可变    
   - 必须拥有一个reason，且不可变（===不可变）    

### 2.2 then方法
一个promise必须提供`then`方法来访问其当前或最终value或reason     
一个promise的`then`方法接收两个参数：    
```javascript
promise.then(onFulfilled, onRejected)
```

1. `onFulfilled`和`onRejected`都是可选参数    
   - 如果`onFulfilled`不是函数，则必须忽略它    
   - 如果`onRejected`不是函数，则必须忽略它    
2. 如果`onFulfilled`是函数    
   - 必须在promise变成`fulfilled`后调用`onFulfilled`, 并把`value`作为第一个参数    
   - 在promise变成`fulfilled`之前, 不应该被调用    
   - 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数)   
3. 如果`onRejected`是函数    
   - 必须在promise变成`rejected`后调用`onRejected`, 并把`reason`作为第一个参数    
   - 在promise变成`rejected`之前, 不应该被调用    
   - 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数)    

4. 在执行上下文堆栈仅包含平台代码之前，不得调用 onFulfilled 或 onRejected。（即应该使用任务的方式来执行这两个回调函数，本次实现使用微任务方式）    

5. onFulfilled 和 onRejected 必须作为函数调用    

6. then方法在同一个promise上可以多次调用    
   - 当promise的状态变为fulfilled后，所有的 onFulfilled 回调都需要按照then的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onFulfilled的回调)    
   - 当promise状态变成 rejected 后，所有的 onRejected 回调都需要按照then的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onRejected的回调)    

7. then方法必须返回一个promise    
   - 如果 onFulfilled 或 onRejected 返回值 x，则需要调用Promise Resolution Procedure: `[[Resolve]](promise2, x)`    
   - 如果 onFulfilled 或者 onRejected 执行时抛出异常e，promise2必须被reject，且把reason作为参数    
   - 如果 onFulfilled 不是一个函数, promise2 以promise1的value 触发fulfilled    
   - 如果 onRejected 不是一个函数, promise2 以promise1的reason 触发rejected    

## 2.3 The Promise Resolution Procedure
```js
[[Resolve]](promise, x)
```
1. 如果 promise2 和 x 相等，那么 reject TypeError    
2. 如果 x 是一个 promsie    
   - 如果x是pending态，那么promise必须要在pending,直到 x 变成 fulfilled or rejected.
   - 如果 x 被 fulfilled, fulfill promise with the same value.
   - 如果 x 被 rejected, reject promise with the same reason.
3. 如果 x 是一个 object 或者 是一个 function    
   - let then = x.then.    
   - 如果 x.then 这步出错，那么 reject promise with e as the reason.    
   - 如果 then 是一个函数，then.call(x, resolvePromiseFn, rejectPromise)
     其中resolvePromiseFn的入参是y, 执行 resolvePromise(promise2, y, resolve, reject);
     rejectPromise的入参是r, reject promise with r
     如果 resolvePromise 和 rejectPromise 都调用了，那么第一个调用优先，后面的调用忽略。
     如果调用then抛出异常e，如果resolvePromise或rejectPromise已经被调用，那么忽略；否则，reject promise with e as the reason
   - 如果 then 不是一个function. fulfill promise with x.

## 实现Promise

```javascript
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
})
console.log(2);
```

## 划重点
> Promise实例化时传入的函数会立即执行，`then(...)`中的回调函数`onFulfilled`和`onRejected`需要异步延迟调用。    

> 要确保`onFulfilled`和`onRejected`方法异步执行，且应该在`then`方法被调用的那一轮事件循环之后的新执行栈中执行。这个事件队列可采用**宏任务macro-task**机制或**微任务micro-task**机制来实现。    


参考文档：

- [Promises/A+规范](https://promisesaplus.com/)
- [Promise Polyfill github仓库](https://github.com/stefanpenner/es6-promise)

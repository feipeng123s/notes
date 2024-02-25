const PENDING   = void 0;
const FULFILLED = 1;
const REJECTED  = 2;

function MyPromise (resolver) {
	this._state = 0;

	initializePromise(this, resolver);
}

function initializePromise (promise, resolver) {
	try {
		resolver (
			function resolvePromise (value) {
				resolve(promise, value);
			},
			function resolvePromise (reason) {
				reject(promise, reason);
			}
		);
	}	catch (e) {
		reject(promise, e);
	}
}

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function resolve (promise, value) {
	if (promise === value) {
		reject(promise, selfFulfillment());
	} else if (typeof value === 'object' || typeof value === 'function'){ // thenable判断
		let then;
		try {
			then = value.then;
		} catch (e) {
			reject(promise, error);
			return;
		}
		handleMaybeThenable(promise, value, then);
	} else { // 返回值为同步值（除了object和function）
		fulfill(promise, value);
	}
}

function reject (promise, reason) {
	if (promise._state !== PENDING) { return; }
  promise._state = REJECTED;
  promise._result = reason;
}

function fulfill (promise, value) {
	if (promise._state !== PENDING) { return; }
  promise._result = value;
  promise._state = FULFILLED;
}

function handleMaybeThenable(promise, maybeThenable, then) {
	if (maybeThenable.constructor === promise.constructor &&
		then === originalThen &&
		maybeThenable.constructor.resolve === originalResolve) { // 返回值为promise对象
	  handleOwnThenable(promise, maybeThenable);
	} else {
	  if (then === undefined) { // 返回值为同步值（对象）
			fulfill(promise, maybeThenable);
	  } else if (isFunction(then)) { // 返回值为thenable的函数
			handleForeignThenable(promise, maybeThenable, then);
	  } else { // 返回值为同步值（对象）
			fulfill(promise, maybeThenable);
	  }
	}
}
  
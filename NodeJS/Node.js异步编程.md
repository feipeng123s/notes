## 异步I/O与非阻塞I/O
从实际效果而言，异步和非阻塞都达到了我们并行I/O的目的。但是从计算机内核I/O而言，异步/同步和阻塞/非阻塞实际上是两回事。

操作系统内核对于I/O只有两种方式：阻塞与非阻塞。在调用阻塞I/O时，应用程序需要等待I/O完成才返回结果。

阻塞I/O造成CPU等待I/O，浪费等待时间，CPU的处理能力不能得到充分利用。为了提高性能，内核提供了非阻塞I/O。

非阻塞I/O跟阻塞I/O的差别为调用之后会立即返回。非阻塞I/O返回之后，CPU的时间片可以用来处理其他事务，此时的性能提升是明显的。

由于完整的I/O并没有完成，立即返回的并不是业务层期望的数据，而仅仅是当前调用的状态。为了获取完整的数据，应用程序需要重复调用I/O操作来确认是否完成。这种重复调用判断操作是否完成的技术叫做轮询：
- read：它是最原始、性能最低的一种，通过重复调用来检查I/O的状态来完成完整数据的读取。在得到最终数据前，CPU一直耗用在等待上。
- select：它是在read的基础上改进的一种方案，通过对文件描述符上的事件状态来进行判断。（最多可以同时检查1024个文件描述符）
- poll：该方案较select有所改进，采用链表的方式避免数组长度的限制，其次它能避免不需要的检查。但是当文件描述符较多的时候，它的性能还是十分低下的。
- epoll：该方案是Linux下效率最高的I/O事件通知机制，在进入轮询的时候如果没有检查到I/O事件，将会进行休眠，直到事件发生将它唤醒。它是真实利用了事件通知、执行回调的方式，而不是遍历查询，所以不会浪费CPU，执行效率较高。

轮询技术满足了非阻塞I/O确保获取完整数据的需求，但是对于应用程序而言，它仍然只能算是一种同步，因为应用程序仍然需要等待I/O完全返回，依旧花费了很多时间来等待。等待期间，CPU要么用于遍历文件描述符的状态，要么用于休眠等待事件发生。

## 事件循环
在进程启动时，Node便会创建一个类似于while(true)的循环，每执行一次循环体的过程我们称为Tick。每个Tick的过程就是查看是否有事件待处理，如果有，就取出事件及其相关的回调函数。如果存在关联的回调函数，就执行它们。然后进入下个循环，如果不再有事件处理，就退出进程。

在Windows下，这个循环基于IOCP创建，而在*nix下则基于多线程创建。

## 非I/O的异步API
- setTimeout()
- setInterval()
- setImmediate()
- process.nextTick()

process.nextTick()中的回调函数执行的优先级要高于setImmediate()。这里的原因在于事件循环对观察者的检查是有先后顺序的，process.nextTick()属于idle观察者，setImmediate()属于check观察者。在每一个轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者

## 异步编程的难点
### 异常处理  
尝试对异步方法进行try/catch操作只能捕获当次事件循环内的异常，对callback执行时抛出的异常将无能为力。  
Node在处理异常上形成了一种约定，将异常作为回调函数的第一个实参传回，如果为空值，则表明异步调用没有异常抛出：
```js
async(function (err, results) {
    // TODO
});
```

### 函数嵌套过深
如果多个异步操作之间存在依赖关系，会在回调函数中形成嵌套关系。
```js
fs.readdir(path.join(__dirname, '..'), function (err, files) {
    files.forEach(function (filename, index) {
        fs.readFile(filename, 'utf8', function (err, file) {
            // TODO
        });
    });
});
```

### 多线程编程
我们在谈论JavaScript的时候，通常谈的是单一线程上执行的代码，这在浏览器中指的是JavaScript执行线程与UI渲染共用的一个线程；在Node中，只是没有UI渲染的部分，模型基本相同。

浏览器提出了Web Workers，它通过将JavaScript执行与UI渲染分离，可以很好地利用多核CPU为大量计算服务。同时前端Web Workers也是一个利用消息机制合理使用多核CPU的理想模型。Node借鉴了这个模式，child_process是其基础API, cluster模块是更深层次的应用。

### 异步转同步
Node提供了绝大部分的异步API和少量的同步API，偶尔出现的同步需求将会因为没有同步API让开发者突然无所适从。

## 异步编程的解决方案
### 1. 事件发布/订阅模式
事件监听器模式是一种广泛用于异步编程的模式，是回调函数的事件化，又称发布/订阅模式。

Node自身提供的[events模块](ttp://nodejs.org/docs/latest/api/events.html)是发布/订阅模式的一个简单实现，Node中部分模块都继承自它，这个模块比前端浏览器中的大量DOM事件简单，不存在事件冒泡，也不存在preventDefault()、stopPropagation()和stopImmediatePropagation()等控制事件传递的方法。
```js
// 订阅
emitter.on("event1", function (message) {
    console.log(message);
});
// 发布
emitter.emit('event1', "I am message! ");
```
从另一个角度来看，事件侦听器模式也是一种钩子（hook）机制，利用钩子导出内部数据或状态给外部的调用者。这种通过事件钩子的方式，可以使编程者不用关注组件是如何启动和执行的，只需关注在需要的事件点上即可。

值得一提的是，Node对事件发布/订阅的机制做了一些额外的处理，这大多是基于健壮性而考虑的:
- 如果对一个事件添加了超过10个侦听器，将会得到一条警告。这一处设计与Node自身单线程运行有关，设计者认为侦听器太多可能导致内存泄漏，所以存在这样一条警告。调用`emitter.setMaxListeners(0)；`可以将这个限制去掉。
- 为了处理异常，EventEmitter对象对error事件进行了特殊对待。如果运行期间的错误触发了error事件，EventEmitter会检查是否有对error事件添加过侦听器。如果添加了，这个错误将会交由该侦听器处理，否则这个错误将会作为异常抛出。如果外部没有捕获这个异常，将会引起线程退出。

#### 继承events模块
以下代码是Node中Stream对象继承EventEmitter的例子：
```js
var events = require('events');

function Stream() {
    events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
```
在Node提供的核心模块中，有近半数都继承自EventEmitter。

#### 利用事件队列解决雪崩问题
所谓雪崩问题，就是在高访问量、大并发量的情况下缓存失效的情景，此时大量的请求同时涌入数据库中，数据库无法同时承受如此大的查询请求，进而往前影响到网站整体的响应速度。
```js
var select = function (callback) {
    db.select("SQL", function (results) {
        callback(results);
    });
};
```
一种改进方案是添加一个状态锁：
```js
var status = "ready";
var select = function (callback) {
    if (status === "ready") {
    status = "pending";
    db.select("SQL", function (results) {
        status = "ready";
        callback(results);
    });
    }
};
```
但是在这种情景下，连续地多次调用select()时，只有第一次调用是生效的，后续的select()是没有数据服务的，这个时候可以引入事件队列：
```js
var proxy = new events.EventEmitter();
var status = "ready";
var select = function (callback) {
    proxy.once("selected", callback);
    if (status === "ready") {
    status = "pending";
    db.select("SQL", function (results) {
        proxy.emit("selected", results);
        status = "ready";
    });
    }
};
```
这里我们利用了once()方法，将所有请求的回调都压入事件队列中，利用其执行一次就会将监视器移除的特点，保证每一个回调只会被执行一次。

#### 多异步之间的协作方案
一般而言，事件与侦听器的关系是一对多，但在异步编程中，也会出现事件与侦听器的关系是多对一的情况，也就是说一个业务逻辑可能依赖两个通过回调或事件传递的结果。

由于多个异步场景中回调函数的执行并不能保证顺序，且回调函数之间互相没有任何交集，所以需要借助一个第三方函数和第三方变量来处理异步协作的结果。通常，我们把这个用于检测次数的变量叫做哨兵变量。
```js
var count = 0;
var results = {};
var done = function (key, value) {
    results[key] = value;
    count++;
    if (count === 3) {
    // 渲染页面
    render(results);
    }
};

fs.readFile(template_path, "utf8", function (err, template) {
    done("template", template);
});
db.query(sql, function (err, data) {
    done("data", data);
});
l10n.get(function (err, resources) {
    done("resources", resources);
});
```

### 2. Promise/Deferred
使用事件的方式时，执行流程需要被预先设定。即便是分支，也需要预先设定，这是由发布/订阅模式的运行机制所决定的。

那么是否有一种先执行异步调用，延迟传递处理的方式呢？答案是Promise/Deferred模式。

#### Promises/A
在API的定义上，Promises/A提议是比较简单的。一个Promise对象只要具备then()方法即可。但是对于then()方法，有以下简单的要求。
- 接受完成态、错误态的回调方法。在操作完成或出现错误时，将会调用对应方法。- 可选地支持progress事件回调作为第三个方法。
- then()方法只接受function对象，其余对象将被忽略。
- then()方法继续返回Promise对象，以实现链式调用。

then()方法的定义如下：
```js
then(fulfilledHandler, errorHandler, progressHandler)
```

Deferred主要是用于内部，用于维护异步模型的状态；Promise则作用于外部，通过then()方法暴露给外部以添加自定义逻辑。
```js
var Promise = function () {
    EventEmitter.call(this);
};
util.inherits(Promise, EventEmitter);

Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
    if (typeof fulfilledHandler === 'function') {
    // 利用once()方法，保证成功回调只执行一次
    this.once('success', fulfilledHandler);
    }
    if (typeof errorHandler === 'function') {
    // 利用once()方法，保证异常回调只执行一次
    this.once('error', errorHandler);
    }
    if (typeof progressHandler === 'function') {
    this.on('progress', progressHandler);
    }
    return this;
};
```
```js
var Deferred = function () {
    this.state = 'unfulfilled';
    this.promise = new Promise();
};

Deferred.prototype.resolve = function (obj) {
    this.state = 'fulfilled';
    this.promise.emit('success', obj);
};

Deferred.prototype.reject = function (err) {
    this.state = 'failed';
    this.promise.emit('error', err);
};

Deferred.prototype.progress = function (data) {
    this.promise.emit('progress', data);
};
```
对一个典型的响应对象进行封装：
```js
var promisify = function (res) {
    var deferred = new Deferred();
    var result = '';
    res.on('data', function (chunk) {
        result += chunk;
        deferred.progress(chunk);
    });
    res.on('end', function () {
        deferred.resolve(result);
    });
    res.on('error', function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
};
```

Promise是高级接口，事件是低级接口。低级接口可以构成更多更复杂的场景，高级接口一旦定义，不太容易变化，不再有低级接口的灵活性，但对于解决典型问题非常有效。

#### Promise中的多异步协作
```js
Deferred.prototype.all = function (promises) {
    var count = promises.length;
    var that = this;
    var results = [];
    promises.forEach(function (promise, i) {
        promise.then(function (data) {
            count--;
            results[i] = data;
            if (count === 0) {
                that.resolve(results);
            }
        }, function (err) {
            that.reject(err);
        });
    });
    return this.promise;
};
```

#### 支持序列执行的Promise
理想的编程体验应当是前一个的调用结果作为下一个调用的开始，是传说中的链式调用，相关代码如下：
```js
promise()
    .then(obj.api1)
    .then(obj.api2)
    .then(obj.api3)
    .then(obj.api4)
    .then(function (value4) {
    // Do something with value4
    }, function (error) {
    // Handle any error from step1 through step4
    })
    .done();
```
要让Promise支持链式执行，主要通过以下两个步骤。
1. 将所有的回调都存到队列中。
2. Promise完成时，逐个执行回调，一旦检测到返回了新的Promise对象，停止执行，然后将当前Deferred对象的promise引用改变为新的Promise对象，并将队列中余下的回调转交给它。

#### 将API Promise化
```js
// smooth(fs.readFile);
var smooth = function (method) {
    return function () {
    var deferred = new Deferred();
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(deferred.callback());
    method.apply(null, args);
    return deferred.promise;
    };
};
```

### 3. 流程控制库
除了事件和Promise外，还有一类方法是需要手工调用才能持续执行后续调用的，我们将此类方法叫做尾触发，常见的关键词是next。事实上，尾触发目前应用最多的地方是Connect的中间件。

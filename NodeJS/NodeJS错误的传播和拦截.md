## 前言

最近在公司的Koa.js项目中遇到一个问题，使用`thrift`库创建一个connection，在接口中使用该连接的client来发送请求，结果抛错连接失败且中断了程序的执行，用`try/catch`无法捕获到该错误。遂查看创建连接的源码，发现Connection构造函数中有如下代码：

```js
var Connection = exports.Connection = function(stream, options) {
  var self = this;
  EventEmitter.call(this);
  
  this.connection = stream;
  
  // ...其他代码
  
  this.connection.addListener("error", function(err) {
    // Only emit the error if no-one else is listening on the connection
    // or if someone is listening on us, because Node turns unhandled
    // 'error' events into exceptions.
    if (self.connection.listeners('error').length === 1 ||
        self.listeners('error').length > 0) {
      self.emit("error", err);
    }
  });
  
  // ...其他代码
}
```

注释翻译：只有在没有人监听连接或有人监听我们（this）时才发出错误，因为 Node 会将未处理的“错误”事件变成异常。

## Node错误处理

### 同步API

除了少数例外，同步的 API（任何不接受 `callback` 函数的阻塞方法，例如 `fs.readFileSync`）都使用 `throw` 来报告错误。任何使用 JavaScript `throw` 机制都会引发异常，必须使用 `try…catch` 处理，否则 Node.js 进程将立即退出。

```js
try {
  throw new Error('something error');
} catch(e) {
  // 处理error
}
```

### 异步API

当你使用`try/catch`尝试捕获异步操作中的错误时，会发现无法捕获到

```js
try {
  setTimeout(() => {
    throw new Error('something error');
  }, 1000);
} catch(e) {
  console.log(e);
}
// 执行结果
// Uncaught Error: something error
//     at <anonymous>:3:11
```

异步的 API 中发生的错误可以以多种方式报告：

- 大多数接受 `callback` 函数的异步方法将接受作为第一个参数传给该函数的 `Error` 对象。 如果第一个参数不是 `null` 并且是 `Error` 的实例，则发生了应该处理的错误。

  ```js
  const fs = require('node:fs');
  fs.readFile('a file that does not exist', (err, data) => {
    if (err) {
      console.error('There was an error reading the file!', err);
      return;
    }
    // 否则处理数据
  });
  ```

- 当在 `EventEmitter` 对象上调用异步方法时，错误可以路由到该对象的 `'error'` 事件。

  ```js
  const net = require('node:net');
  const connection = net.connect('localhost');
  
  // 向流中添加 'error' 事件句柄：
  connection.on('error', (err) => {
    // 如果连接被服务器重置，
    // 或者根本无法连接，或者连接遇到任何类型的错误，
    // 则错误将发送到这里。
    console.error(err);
  });
  
  connection.pipe(process.stdout);
  ```

- Node.js API 中的一些典型的异步方法可能仍然使用 `throw` 机制来引发必须使用 `try…catch` 处理的异常。

**注意**：使用`async/await`处理异步函数时，应使用同步函数的`try/catch`来处理。

对于所有的 `EventEmitter` 对象，如果未提供 `'error'` 事件句柄，则将抛出错误，导致 Node.js 进程报告未捕获的异常并崩溃，除非：`domain` 模块使用得当或已为 `'uncaughtException'`事件注册句柄。

## EventEmitter

EventEmitter是Node.js的内置模块events提供的一个类，它的核心就是事件触发与事件监听器功能的封装。通过`require("events");`来访问该模块：

```js
const { EventEmitter } = require('event');
let eventEmitter = new EventEmitter();
```

提供了以下方法：

- **addListener(event, listener)** 为指定事件添加一个监听器到监听器数组的尾部。
- **on(event, listener)** 为指定事件注册一个监听器，接受一个字符串 event 和一个回调函数。
- **once(event, listener)** 为指定事件注册一个单次监听器，即 监听器最多只会触发一次，触发后立刻解除该监听器。
- **removeListener(event, listener)** 移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。它接受两个参数，第一个是事件名称，第二个是回调函数名称。
- **removeAllListeners([event])** 移除所有事件的所有监听器， 如果指定事件，则移除指定事件的所有监听器。
- **setMaxListeners(n)** 默认情况下， EventEmitters 如果你添加的监听器超过 10 个就会输出警告信息。 setMaxListeners 函数用于改变监听器的默认限制的数量。
- **listeners(event)** 返回指定事件的监听器数组。
- **emit(event, [arg1], [arg2], [...])** 按监听器的顺序执行执行每个监听器，如果事件有注册监听返回 true，否则返回 false。

## 问题原因及解决方案

由于没有在connection上添加额外的error监听，所以`self.emit("error", err);`会执行，但是没有对应的listener，就导致了未捕获的异常，导致node中断执行。故只需要在createConnection创建的对象上监听error事件即可。

参考：

[错误的传播和拦截](http://nodejs.cn/api/errors/error_propagation_and_interception.html)

[浅谈前端中的错误处理](https://segmentfault.com/a/1190000015567273)


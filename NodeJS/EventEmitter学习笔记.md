## EventEmitter介绍
事件监听器模式是一种广泛用于异步编程的模式，是回调函数的事件化，又称发布/订阅模式。

Node自身提供的[events模块](ttp://nodejs.org/docs/latest/api/events.html)是发布/订阅模式的一个简单实现，Node中部分模块都继承自它，这个模块比前端浏览器中的大量DOM事件简单，不存在事件冒泡，也不存在preventDefault()、stopPropagation()和stopImmediatePropagation()等控制事件传递的方法。

events 模块只提供了一个对象： events.EventEmitter。EventEmitter 的核心就是事件触发与事件监听器功能的封装。

你可以通过require("events");来访问该模块。
```js
// 引入 events 模块
var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();
```

EventEmitter对外暴露了`on`和`emit`方法：
- emit用来触发一个事件
- on用来为指定事件添加一个回调函数
```js
eventEmitter.on('start', () => {
  console.log('started');
});

eventEmitter.emit('start');

// 带参数
eventEmitter.on('start', number => {
  console.log(`started ${number}`);
});

eventEmitter.emit('start', 23);

// 带多个参数
eventEmitter.on('start', (start, end) => {
  console.log(`started from ${start} to ${end}`);
});

eventEmitter.emit('start', 1, 100);
```

EventEmitter还对外暴露了一些方法如下：
- once用来为指定事件添加一个只执行一次的回调
- removeListener/off用来移除指定事件监听
- removeAllListeners用来移除所有事件监听
```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// removeListener/off
server.removeListener('connection', callback);
```

## EventEmitter简易实现
### on方法
事件绑定的回调存储方式：
```js
{
    eventName1: [callback1, callback2],
    eventName2: [callback]
}
```
具体代码实现：
```js
class MyEventEmitter {
    constructor() {
        this.events = {}
    }

    on(eventName, callback) {
        if(this.events[eventName] === undefined) {
            this.events[eventName] = []
        }

        this.events[eventName].push(callback)
    }

    emit(eventName, ...args) {
        let callbacks = this.events[eventName]
        if(callbacks) {
            callbacks.forEach(fn => fn.apply(this, args))
        }
    }

    off(eventName, callback) {
        let callbacks = this.events[eventName]
        if(callbacks) {
            if (!callback) {
                this.events[eventName] = null
            }

            const index = this.events[eventName].indexOf(callback)
            this.events[eventName].splice(index, 1)
        }
    }

    once(eventName, callback) {
        const oneFunc = (...args) => {
            callback.apply(this, args)
            this.off(eventName, oneFunc)
        }

        this.on(eventName, oneFunc)
    }
}

let eventEmitter = new MyEventEmitter();

eventEmitter.on('start', (start, end) => {
  console.log(`started from ${start} to ${end}`);
});
eventEmitter.once('stop', (time) => {
    console.log(`stop at ${time}`);
  });

eventEmitter.emit('start', 1, 100);
eventEmitter.emit('stop', 10);

eventEmitter.off('start', (start, end) => {
  console.log(`started from ${start} to ${end}`);
})

eventEmitter.emit('start', 1, 100);
eventEmitter.emit('stop', 10);
```
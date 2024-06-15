# 运行时概念
## JavaScript运行时
> 在执行 JavaScript 代码的时候，JavaScript 运行时实际上维护了一组用于执行 JavaScript 代码的代理。每个代理由一组执行上下文的集合、执行上下文栈、主线程、一组可能创建用于执行 worker 的额外的线程集合、一个任务队列以及一个微任务队列构成。除了主线程（某些浏览器在多个代理之间共享的主线程）之外，其他组成部分对该代理都是唯一的。


## 可视化描述
![](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop/the_javascript_runtime_environment_example.svg)
## 栈
函数调用形成了一个由若干帧组成的栈（先进后出）。

## 堆
对象被分配在堆中，堆是一个用来表示一大块（通常是非结构化的）内存区域的计算机术语。

## 队列
一个JavaScript运行时包含了一个待处理消息的消息队列。每一个消息都关联着一个用以处理该消息的回调函数。


在事件循环期间的某个时刻，运行时会从最先进入队列的消息开始处理。被处理的消息会被移出队列，并作为输入参数来调用与之关联的函数。

函数的处理会一直进行到执行栈再次为空为止；然后事件循环将会处理队列中的下一个消息（如果还有的话）。

# 事件循环
每个代理都是由事件循环（Event loop）驱动的，事件循环负责收集事件（包括用户事件以及其他非用户事件等）、对任务进行排队以便在合适的时候执行回调。然后它执行所有处于等待中的 JavaScript 任务，然后是微任务，然后在开始下一次循环之前执行一些必要的渲染和绘制操作。

有如下三种事件循环：
- Window事件循环
- Worker事件循环
- Worklet事件循环

Event Loops中，每一次循环称为tick，每次tick的流程如下：
- 执行主线程中的同步代码（可以看做一个宏任务），直到执行完成
- 检查微任务队列，若不为空，则执行微任务队列中的所有微任务，直到队列为空
- 检查宏任务队列中在当前tick之前加入到队列中的宏任务，依次执行
- 没执行完一个宏任务，重复依次第二个步骤
- 当微任务队列已清空且宏任务队列中当前tick之前加入的宏任务都已执行完成，执行一些别要的渲染和绘制工作（宿主环境为浏览器时）
- 结束当前tick，进入下一个tick


# 任务 vs 微任务
一个任务（宏任务）就是指计划由标准机制来执行的任何 JavaScript，如程序的初始化、事件触发的回调等。 除了使用事件，你还可以使用 setTimeout() 或者 setInterval() 来添加任务。 起初微任务和任务之间的差异看起来不大。它们很相似；都由位于某个队列的 JavaScript 代码组成并在合适的时候运行。

## 任务
一个任务就是由执行诸如从头执行一段程序、执行一个事件回调或一个 interval/timeout 被触发之类的标准机制而被调度的任意 JavaScript 代码。这些都在任务队列（task queue）上被调度。

在以下时机，任务会被添加到任务队列：
- 一段新程序或子程序被直接执行时（比如从一个控制台，或在一个 `<script>` 元素中运行代码）。
- 触发了一个事件，将其回调函数添加到任务队列时。
- 执行到一个由 setTimeout() 或 setInterval() 创建的 timeout 或 interval，以致相应的回调函数被添加到任务队列时。

事件循环驱动你的代码按照这些任务排队的顺序，一个接一个地处理它们。在事件循环的单次迭代中，将执行任务队列中最旧的可运行任务。之后，微任务将被执行，直到微任务队列为空，然后浏览器可以选择更新渲染。然后浏览器继续进行事件循环的下一次迭代。

## 微任务
起初微任务和任务之间的差异看起来不大。它们很相似；都由位于某个队列的 JavaScript 代码组成并在合适的时候运行。但是，只有在迭代开始时队列中存在的任务才会被事件循环一个接一个地运行，这和处理微任务队列是殊为不同的。

有两点关键的区别。

首先，每当一个任务存在，事件循环都会检查该任务是否正把控制权交给其他 JavaScript 代码。如若不然，事件循环就会运行微任务队列中的所有微任务。接下来微任务循环会在事件循环的每次迭代中被处理多次，包括处理完事件和其他回调之后。

其次，如果一个微任务通过调用 queueMicrotask(), 向队列中加入了更多的微任务，则那些新加入的微任务 会早于下一个任务运行。这是因为事件循环会持续调用微任务直至队列中没有留存的，即使是在有更多微任务持续被加入的情况下。

## 任务和微任务的区别
- 当执行来自任务队列中的任务时，在每一次新的事件循环开始迭代的时候运行时都会执行队列中的每个任务。在每次迭代开始之后加入到队列中的任务需要在下一次迭代开始之后才会被执行.
- 每次当一个任务退出且执行上下文为空的时候，微任务队列中的每一个微任务会依次被执行。不同的是它会等到微任务队列为空才会停止执行——即使中途有微任务加入。换句话说，微任务可以添加新的微任务到队列中，并在下一个任务开始执行之前且当前事件循环结束之前执行完所有的微任务。

## 创建途径
宏任务：
- 程序的初始化
- 事件触发的回调
- setTimeout()/setInterval()
- postMessage, MessageChannel
- setImmediate() node环境

微任务：
- Promise
- MutaionObserver
- Object.observe（已废弃，被Proxy对象替代）
- process.nextTick() node环境
- queueMicrotask()

## Node环境下的事件循环
Node.js是运行在服务端的js，虽然用到也是V8引擎，但由于服务目的和环境不同，导致了它的API与原生JS有些区别，其Event Loop还要处理一些I/O，比如新的网络连接等，所以与浏览器Event Loop不太一样。

> 在进程启动时，Node便会创建一个类似于while(true)的循环，每执行一次循环体的过程我们称为Tick。每个Tick的过程就是查看是否有事件待处理，如果有，就取出事件及其相关的回调函数。如果存在关联的回调函数，就执行它们。然后进入下个循环，如果不再有事件处理，就退出进程。

### 6个阶段
执行顺序如下：
1. timers: 执行setTimeout和setInterval的回调
2. pending callbacks: 执行延迟到下一个循环迭代的 I/O 回调
3. idle, prepare: 仅系统内部使用
4. poll: 检索新的 I/O 事件;执行与 I/O 相关的回调。事实上除了其他几个阶段处理的事情，其他几乎所有的异步都在这个阶段处理。
5. check: setImmediate在这里执行
6. close callbacks: 一些关闭的回调函数，如：socket.on('close', ...)

个人理解：这6个阶段都是针对宏任务来说的，如果在执行宏任务回调函数的过程中加入了微任务，则会在当前宏任务执行完后立即执行微任务。

### `setImmediate()` vs `setTimeout()`
setImmediate() 和 setTimeout() 类似，但根据调用时间的不同，其行为方式也不同。
- setImmediate()被定义为在poll阶段完成后执行脚本。
- setTimeout()安排脚本在经过最小阈值（以毫秒为单位）后运行。

计时器的执行顺序将根据调用它们的上下文而有所不同。如果两者都是从主模块内部调用的，则计时将受到进程性能的约束（这可能会受到机器上运行的其他应用程序的影响）。
```js
// timeout_vs_immediate.js
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

// 以上代码在主模块内部调用时，有时timeout在前，有时immediate在前，调用顺序无法提前确定
```

如果将它们放到setTimeout()回调函数中执行，则可以确定immediate在前执行：
```js
setTimeout(() => {
    // 这里新增的任务会在下个事件循环中调用
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    // 在setTimeout回调中执行的代码，可以确定当前是timer阶段，check在timer阶段之后执行，所以setImmediate的回调在当前事件循环中执行
    setImmediate(() => {
        console.log('immediate');
    });
})
```

### process.nextTick()
~~`process.nextTick()`不固定在Event Loop的任何阶段执行，它属于微任务，在各个宏任务之间穿插执行。~~
process.nextTick()中的回调函数执行的优先级要高于setImmediate()。这里的原因在于事件循环对观察者的检查是有先后顺序的，**process.nextTick()属于idle观察者**，setImmediate()属于check观察者。在每一个轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者。

### Promise，process.nextTick谁先执行？
nextTick和Promise同时出现时，肯定是nextTick先执行，原因是nextTick的队列比Promise队列优先级更高。
```js
setTimeout(() => {
    console.log(1)

    new Promise(resolve => {
        resolve()
    }).then(() => {
        console.log(3)
    })

    process.nextTick(() => {
        console.log(2)
    })
    
    setTimeout(() => console.log(4))
})
/**
 * 输出顺序为：1 2 3 4
 */
```


参考文档：
- [并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
- [深入：微任务与 Javascript 运行时环境](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)
- [在 JavaScript 中通过 queueMicrotask() 使用微任务
](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [宏任务和微任务到底是什么？](https://cloud.tencent.com/developer/article/1701427)
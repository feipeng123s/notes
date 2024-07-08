## 问题
说出以下代码的输出结果：
```js
// 以下代码的输出
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function foo() {
    const now = performance.now()
    let arr = [100, 200, 300]
    arr.forEach(async (ele) => {
        await delay(ele)
        console.log('foo', performance.now() - now)
    })
}

foo()

async function bar() {
    const now = performance.now()
    for(ele of [100, 200, 300]) {
        await delay(ele)
        console.log('bar', performance.now() - now)
    }
}

bar()
```
结果：  
100 200 300  
100 300 600  

## 原因
JavaScript中的forEach()方法是一个同步方法，它不支持处理异步函数。如果你在forEach中执行了异步函数，forEach()无法等待异步函数完成，它会继续执行下一项。这意味着如果在forEach()中使用异步函数，无法保证异步任务的执行顺序。

## 建议使用使用for循环（for、for...of...）来处理异步 
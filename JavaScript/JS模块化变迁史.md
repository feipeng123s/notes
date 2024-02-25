## 1. 幼年期——无模块化
按功能将js代码放到不同的JS文件，在模板中通过`script`标签按需引用
```html
<script src="a.js"></script>
<script src="b.js"></script>
```
文件分离是模块化的第一步    
存在的问题：
* 污染全局作用域 => 不利于大型项目的开发及多人团队的共建

## 2. 成长期——命名空间模式
### 单一全局变量
> JavaScript中一个流行的命名空间模式是选择一个全局变量作为主要的引用对象。比如`jQuery`库就是使用这种方式。
```js
var myApplication = (function () {
    function(){
        //...
    },
    return{
        //...
    }
})();
```

### 命名空间前缀
> 命名空间前缀模式其思路非常清晰，就是选择一个独特的命名空间，然后在其后面声明声明变量、方法和对象。
```js
var myApplication_propertyA = {};
var myApplication_propertyB = {};

function myApplication_myMethod() {}
```

### 对象字面量表示法
> 对象字面量模式可以认为是包含一组键值对的对象，每一对键和值由冒号分隔，键也可以是代码新的命名空间。
```js
var myApplication = {
    // 可以很容易的为对象字面量定义功能
    getInfo:function() {
        // ***
    },
    
    // 可以进一步支撑对象命名空间
    models:{},
    views:{
        pages:{}
    },
    collections:{}
};
```

### 嵌套命名空间
> 嵌套命名空间模式可以说是对象字面量模式的升级版，它也是一种有效的避免冲突模式，因为即使一个命名空间存在，它也不太可能拥有同样的嵌套子对象。
```js
var myApplication = myApplication || {};
 
 // 定义嵌套子对象
 myApplication.routers = myApplication.routers || {};
 myApplication.routers.test = myApplication.routers.test || {};
```

### IIFE(Immediately Invoked Function Expression，立即调用函数表达式)
> IIFE实际上就是立即执行匿名函数。在JavaScript中，由于变量和函数都是在这样一个只能在内部进行访问的上下文中被显式地定义，函数调用提供了一种实现私有变量和方法的便捷方式。IIFE是用于封装应用程序逻辑的常用方法，以保护它免受全局名称空间的影响，其在命名空间方面也可以发挥其特殊的作用。
```js
var namespace = namespace || {};

(function( o ){   
    o.foo = "foo";
    o.bar = function(){
        return "bar";   
    };
})(namespace);

console.log(namespace);

// 定义一个简单的模块
const iifeModule = (() => {
  let count = 0;
  return {
    increase: () => ++count,
    reset: () => {
      count = 0;
    }
  }
})();

iifeModule.increase();
iifeModule.reset();

// 依赖其他模块的IIFE
const iifeModule = ((dependencyModule1, dependencyModule2) => {
  let count = 0;
  return {
    increase: () => ++count,
    reset: () => {
      count = 0;
    }
  }
})(dependencyModule1, dependencyModule2);
iifeModule.increase();
iifeModule.reset();

// Revealing Module(揭示模块)模式
const iifeModule = (() => {
  let count = 0;
  function increaseCount() {
      ++count;
  }
  function resetCount() {
      count = 0;
  }

  return {
    increase: increaseCount,
    reset: resetCount
  }
})();

iifeModule.increase();
iifeModule.reset();
/**
 * 揭示模块模式定义：
 * 在模块模式的基础上，在返回的私有范围内，重新定义所有的函数和变量。并返回一个匿名的对象。他拥有所有指向私有函数的指针。
 * Module模式最初被定义为一种在传统软件工程中为类提供私有和共有封装的方法。JS这里最初使用IIEF封装
 **/
```


### 命名空间注入
> 命名空间注入是IIFE的另一个变体，从函数包装器内部为一个特定的命名空间“注入”方法和属性，使用this作为命名空间代理。这种模式的优点是可以将功能行为应用到多个对象或命名空间。
```js
var myApplication = myApplication || {};
myApplication.utils = {};

(function () {
    var value = 5;
    
    this.getValue = function () {
        return value;
    }

    // 定义新的子命名空间
    this.tools = {};
}).apply(myApplication.utils);

(function () {
    this.diagnose = function () {
        return "diagnose";
    }
}).apply(myApplication.utils.tools);
```

> 命名空间注入是用于为多个模块或命名空间指定一个类似的功能基本集，但最好是在声明私有变量或者方法时再使用它，其他时候使用嵌套命名空间已经足以满足需要了。

### 自动嵌套的命名空间
```js
function extend(ns, nsStr) {
    var parts = nsStr.split("."),
        parent = ns,
        pl;

    pl = parts.length;

    for (var i = 0; i < pl; i++) {
        // 属性如果不存在，则创建它
        if (typeof parent[parts[i]] === "undefined") {
            parent[prats[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
}

// 用法
var myApplication = myApplication || {};
var mod = extend(myApplication, "module.module2");
```

## 3. 成熟期
### CJS——CommonJS
- 每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。如果想在多个文件分享变量，必须定义为global对象的属性。
- CommonJS规范规定，每个模块内部，module变量代表当前模块。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。加载某个模块，其实是加载该模块的module.exports属性。
- require方法用于加载模块。
- 为了方便，Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。
  ```js
  var exports = module.exports;
  ```
  造成的结果是，在对外输出模块接口时，可以向exports对象添加方法。
  ```js
  exports.area = function (r) {
    return Math.PI * r * r;
  };
  ```
  注意，不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。
  ```js
  // 无效写法
  exports = function(x) {console.log(x)};
  ```

#### 使用方式
```js
// main.js
// 引入部分
const dependencyModule1 = require(./dependencyModule1);
const dependencyModule2 = require(./dependencyModule2);

// 处理部分
let count = 0;
const increase = () => ++count;
const reset = () => {
  count = 0;
}
// 做一些跟引入依赖相关事宜……

// 暴露接口部分
// 方式1
exports.increase = increase;
exports.reset = reset;
// 方式2
module.exports = {
  increase,
  reset
}


// index.js
// 使用模块
const { increase, reset } = require('./main.js');

increase();
reset();
```
#### 优缺点
* 优点：
CommonJS率先在服务端实现了，从框架层面解决依赖、全局变量污染的问题
* 缺点：
主要针对了服务端的解决方案。对于异步拉取依赖的处理整合不是那么的友好。


### AMD规范
> AMD是"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

> 异步模块定义 (AMD) API 指定了一种定义模块的机制，以便可以异步加载模块及其依赖项。 这特别适用于模块的同步加载会产生性能、可用性、调试和跨域访问问题的浏览器环境。

#### 定义模块：define函数
```js
define(id?: String, dependencies?: String[], factory: Function|Object);
```
- id是模块名称，可选
- dependencies 指定了所要依赖的模块列表，它是一个数组，也是可选的参数，每个依赖的模块的输出将作为参数一次传入 factory 中。如果没有指定 dependencies，那么它的默认值是 ["require", "exports", "module"]。
  ```js
  define(function(require, exports, module) {})
  ```
- factory 是最后一个参数，它包裹了模块的具体实现，它是一个函数或者对象。如果是函数，那么它的返回值就是模块的输出接口或值。

#### 调用模块：require函数
```js
require(dependencies?: String[], callback: Function);
```
- 示例
  ```js
  require(['foo', 'bar'], function ( foo, bar ) {
    foo.doSomething();
  });
  ```
- 在define方法内部使用require
  ```js
  define(function (require) {
    var otherModule = require('otherModule');
    // do something with otherModule
  });
  ```

#### 优缺点
* 优点: 适合在浏览器中加载异步模块，可以并行加载多个模块
* 缺点：会有引入成本，不能按需加载

### UMD（兼容AMD和CommonJS）
UMD (Universal Module Definition), 希望提供一个前后端跨平台的解决方案(支持AMD与CommonJS模块方式)
```js
(function(global, factory) {
    if(typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else if(typeof define === 'function' && define.amd){
        define([], factory);
    } else {
        global.returnExports = factory();
    }
})(this, function() {
    // 定义模块代码

    // 返回模块内容
    return {};
});
```

#### CMD规范
> 按需加载
主要应用的框架 sea.js

```js
  define('module', (require, exports, module) => {
    let $ = require('jquery');
    // jquery相关逻辑

    let dependencyModule1 = require('./dependecyModule1');
    // dependencyModule1相关逻辑
  })
```
> * 优点：按需加载，依赖就近
* 依赖于打包，加载逻辑存在于每个模块中，扩大模块体积

#### ES6模块化
> 走向新时代

新增定义：  
引入关键字 —— import  
导出关键字 —— export

模块引入、导出和定义的地方：
```js
  // 引入区域
  import dependencyModule1 from './dependencyModule1.js';
  import dependencyModule2 from './dependencyModule2.js';

  // 实现代码逻辑
  let count = 0;
  export const increase = () => ++count;
  export const reset = () => {
    count = 0;
  }

  // 导出区域
  export default {
    increase, reset
  }
```
模板引入的地方
```js
  <script type="module" src="esModule.js"></script>
```
node中：
```js
  import { increase, reset } from './esModule.mjs';
  increase();
  reset();

  import esModule from './esModule.mjs';
  esModule.increase();
  esModule.reset();
```

**面试题6：动态模块**
考察：export promise

ES11原生解决方案：
```js
  import('./esModule.js').then(dynamicEsModule => {
    dynamicEsModule.increase();
  })
```

> * 优点（重要性）：通过一种最统一的形态整合了js的模块化
* 缺点（局限性）：本质上还是运行时的依赖分析

### 解决模块化的新思路——前端工程化
#### 背景
> 为了解决前面那些模块化方案依赖于运行时分析的问题

#### 解决方案
前端工程化采用线下执行的方式来解决这个问题（grunt gulp webpack）

```js
  <!doctype html>
    <script src="main.js"></script>
    <script>
      // 给构建工具一个标识位
      require.config(__FRAME_CONFIG__);
    </script>
    <script>
      require(['a', 'e'], () => {
        // 业务处理
      })
    </script>
  </html>
```
```js
  define('a', () => {
    let b = require('b');
    let c = require('c');

    export.run = () {
      // run
    }
  })
```

##### 工程化实现
step1: 扫描依赖关系表：
```js
  {
    a: ['b', 'c'],
    b: ['d'],
    e: []
  }
```

step2: 重新生成依赖数据模板
```js
  <!doctype html>
    <script src="main.js"></script>
    <script>
      // 构建工具生成数据
      require.config({
        "deps": {
          a: ['b', 'c'],
          b: ['d'],
          e: []
        }
      })
    </script>
    <script>
      require(['a', 'e'], () => {
        // 业务处理
      })
    </script>
  </html>
```

step3: 执行工具，采用模块化方案解决模块化处理依赖
```js
  define('a', ['b', 'c'], () => {
    // 执行代码
    export.run = () => {}
  })
```
> 优点：
1. 构建时生成配置，运行时执行
2. 最终转化成执行处理依赖
3. 可以拓展

#### 完全体 webpack为核心的工程化 + mvvm框架组件化 + 设计模式  
    
    
参考文档：

- [JS进阶篇--命名空间模式解析](https://segmentfault.com/a/1190000011478335)
- [CommonJS规范](https://javascript.ruanyifeng.com/nodejs/module.html)
- [AMD规范](https://zhaoda.net/webpack-handbook/amd.html)
- [RequireJS和AMD规范](https://wohugb.gitbooks.io/javascript/content/tool/requirejs.html)
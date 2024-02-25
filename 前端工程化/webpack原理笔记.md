## 前端工程化
- 技术选型
- 统一规范——eslint、husky
- 测试、部署、监控——ut、e2e、mock
- 性能优化
- 模块化重构

## webpack流程
webpack的构建流程可以分为以下三大阶段：
- 初始化：启动构建，读取与合并配置参数，加载`Plugin`，实例化`Compiler`。
- 编译：从Entry出发，针对每个Module串行调用对应Loader去翻译文件的内容，再找到该Module依赖的Module，递归地进行编译处理。
- 输出：将编译后的Module组合成Chunk，将Chunk转换成文件，输出到文件系统中。


## Loader
> Loader就像一个翻译员，能将源文件经过转化后输出新的结果，并且一个文件还可以链式地经过多个翻译员翻译。  

在开发一个Loader时，请确保其职责的单一性，我们只需要关心输入和输出。  

### 基础
Webpack是运行在Node.js上的，一个Loader其实就是一个Node.js模块，这个模块需要导出一个函数。这个导出的函数的工作就是获得处理前的原内容，对原内容执行处理后，返回处理后的内容。  
一个最简的的Loader的源码如下：
```js
// source为compiler传递给Loader的一个文件的原内容
module.exports = function(source) {
    // TODO: 对文件内容进行处理
    return source;
}
```

由于Loader运行在Node.js中，所以我们可以调用任意Node.js自带的API，或者安装第三方模块进行调用：
```js
const sass = require('node-sass');
module.exports = function(source) {
    return sass(source);
}
```

### 进阶
#### 获得Loader的options
```js
const loaderUtils = require('loader-utils'); // getOptions方法要求loader-utils版本为2.x
module.exports = function(source) {
    // 获取用户为当前Loader传入的options
    const options = loaderUtils.getOptions(this);
    return source;
}
```

#### 返回其他结果
上面的Loader都只是返回了原内容转换后的内容，但是在某些场景下还需要返回除了内容之外的东西。  
以用babel-loader转换ES6为例，它还需要输出转换后的ES5代码对应的Source Map，以方便调试源码。
```js
module.exports = function(source) {
    this.callback(null, source, sourceMaps);
    return;
}
```
其中的`this.callback`是Webpack向Loader注入的API（[The Loader Context](https://webpack.docschina.org/api/loaders/#the-loader-context)），以方便Loader和Webpack之间通信。  

**this.callback**
可以同步或者异步调用的并返回多个结果的函数。预期的参数是：
```ts
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
);
```
如果这个函数被调用的话，你应该返回 undefined 从而避免含糊的 loader 结果。

#### 异步
```js
module.exports = function(source) {
    let callback = this.async();
    someAsyncOperation(source, function(err, result, sourceMaps, meta) {
        callback(err, result, sourceMaps, meta);
    });
}
```
**this.async**
告诉loader-runner这个loader将会异步地回调。返回`this.callback`。

#### 处理二进制数据
在默认情况下，Webpack传给Loader的原内容都是UTF-8格式编码的字符串。但在某些场景下Loader不会处理文本文件，而会处理二进制文件如file-loader，这时就需要Webpack为Loader传入二进制格式的数据。
```js
module.exports = function(source) {
    if(source instanceof Buffer === true) {
        // TODO: 处理二进制内容
    }

    // Loader返回的类型也可以是Buffer类型
    return source;
}
// 通过exports.raw属性告诉webpack该Loader是否需要二进制数据
module.exports.raw = true;
```

#### 缓存加速
Webpack会默认缓存所有Loader的处理结果，以避免每次构建都重新执行重复的转换操作，从而加快构建速度。  
关闭缓存功能：
```js
module.exports = function(source) {
    this.cacheable(false);
    return source;
}
```

#### 其他Loader API
详见[Loader Interface](https://webpack.docschina.org/api/loaders/)

### 加载本地Loader
#### Npm link
Npm link专门用于开发和调试本地的Npm模块，能做到在不发布模块的情况下，将本地的一个正在开发的模块的源码链接到项目的`node_modules`目录下，这让项目可以直接使用本地的Npm模块。
步骤如下：
- 确保正在开发的本地Npm模块的`package.json`已配置好；
- 在本地的Npm根目录下执行npm link，将本地模块注册到全局；
- 在项目根目录下执行npm link loader-name，将第二步注册到全局的本地Npm模块链接到项目的`node_modules`下，其中loader-name是指在第一步的`package.json`中配置的模块名称。

#### ResolveLoader
[ResolveLoader](https://webpack.docschina.org/configuration/resolve#resolveloader)用于配置Webpack如何寻找Loader，它在默认情况下只会去`node_modules`目录下寻找。
```js
module.exports = {
  //...
  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    mainFields: ['loader', 'main'],
  },
};
```
## Plugin
Webpack通过Plugin机制让其更灵活，以适应各种场景。在Webpack运行的生命周期中会广播许多事件，Plugin可以监听这些事件，在合适的时机通过Webpack提供的API改变输出结果。
一个最基础的Plugin的代码是这样的：
```js
// webpack3
class BasicPlugin {
    constructor(options) {}

    apply(compiler) {
        compiler.plugin('compilation', function(compilation) {});
    }
}

module.exports = BasicPlugin;
```

**在webpack5的官方文档中对plugin的解释如下**
plugin的目的在于解决loader无法实现的其他事，是对于webpack功能的扩展。
webpack plugin是一个具有`apply`方法的JavaScript对象。`apply`方法会被webpack compiler调用，并且在整个编译生命周期都可以访问compiler对象。
```js
// webpack4,webpack5
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
    constructor(options) {}

    apply(compiler) {
        compiler.hooks.run.tap(pluginName, (compilation) => {
            console.log('webpack 构建正在启动！');
        });
    }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
```
### Compiler和Compilation
- Compiler对象包含了Webpack环境的所有配置信息，包含options、loaders、plugins等信息。这个对象在Webpack启动时被实例化，它是全局唯一的，可以简单地将它理解为Webpack实例。
- Compilation对象包含了当前的模块资源、编译生成资源、变化的文件等。当Webpack以开发模式运行时，每当检测到一个文件发生变化，便有一次新的Compilation被创建。Compilation对象也提供了很多事件回调供插件进行扩展。通过Compilation也能读取到Compiler对象。

Compiler和Compilation的区别在于：Compiler代表了整个Webpack从启动到关闭的生命周期，而Compilation只代表一次新的编译。

[Compiler钩子](https://webpack.docschina.org/api/compiler-hooks/)
> `Compiler`模块是webpack的主要引擎，它通过CLI或者Node API传递的所有选项创建出一个compilation实例。它扩展（extends）自`Tapable`类，用来注册和调用插件。 大多数面向用户的插件会首先在`Compiler`上注册。
```js
// 钩子函数调用方式
compiler.hooks.someHook.tap('MyPlugin', (params) => {
  /* ... */
});

// 示例
compiler.hooks.entryOption.tap('MyPlugin', (context, entry) => {
  /* ... */
});
```

[Compilation钩子](https://webpack.docschina.org/api/compilation-hooks/)
> `Compilation`模块会被`Compiler`用来创建新的compilation对象（或新的 build 对象）。 compilation 实例能够访问所有的模块和它们的依赖（大部分是循环依赖）。 它会对应用程序的依赖图中所有模块， 进行字面上的编译(literal compilation)。 在编译阶段，模块会被加载(load)、封存(seal)、优化(optimize)、 分块(chunk)、哈希(hash)和重新创建(restore)。
```js
// 钩子函数调用方式
compilation.hooks.someHook.tap(/* ... */);

// 示例
compilation.hooks.buildModule.tap(
  'SourceMapDevToolModuleOptionsPlugin',
  (module) => {
    module.useSourceMap = true;
  }
);
```

### 事件流
Webpack就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。Webpack通过`Tabable`来组织这条复杂的生产线。Webpack在运行的过程中会广播事件，插件只需要监听它关心的事件，就能加入这条生产线中，去改变生产线的运作。

```js
// webpack3
// 广播事件，注意不要和现有事件重名
compiler.apply('event-name', params);
compilation.apply('event-name', params);

// 监听事件
compiler.plugin('event-name', function(params) {});
compilation.plugin('event-name', function(params) {});
```

#### [Tabable](https://webpack.docschina.org/api/plugins/#tapable)
> 这个小型库是webpack的一个核心工具，但也可用于其他地方，以提供类似的插件接口。 在webpack中的许多对象都扩展自`Tapable`类。 它对外暴露了`tap`，`tapAsync`和`tapPromise`等方法， 插件可以使用这些方法向webpack中注入自定义构建的步骤，这些步骤将在构建过程中触发。

> 根据使用不同的钩子(hooks)和 tap 方法， 插件可以以多种不同的方式运行。 这个工作方式与 Tapable 提供的钩子(hooks)密切相关。 compiler hooks 分别记录了 Tapable 内在的钩子， 并指出哪些 tap 方法可用。

#### 自定义钩子
```js
// 需要简单的从`tapable`中require所需的hook类，并创建
const SyncHook = require('tapable').SyncHook;

if (compiler.hooks.myCustomHook) throw new Error('已存在该钩子');
compiler.hooks.myCustomHook = new SyncHook(['a', 'b', 'c']);

// 在你想要触发钩子的位置/时机下调用……
compiler.hooks.myCustomHook.call(a, b, c);
```

> All Hook constructors take one optional argument, which is a list of argument names as strings.
```js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```

#### 常用的钩子
1. 读取Webpack的处理结果/修改输出资源：`emit`钩子，输出asset到output目录之前执行
    ```js
    compiler.hooks.emit.tap('MyPlugin', (compilation, callback) => {
        // do something
        callback();
    });
    ```
2. 监听文件的变化：`afterCompile`钩子，compilation 结束和封印之后执行
    ```js
    compiler.hooks.afterCompile.tap('MyPlugin', (compilation, callback) => {
        // 将指定文件添加到文件依赖列表中
        commpilation.fileDependencies.push(filePath);
        callback();
    });
    ```


[Compiler钩子](https://webpack.docschina.org/api/compiler-hooks/)
[Compilation钩子](https://webpack.docschina.org/api/compilation-hooks/)


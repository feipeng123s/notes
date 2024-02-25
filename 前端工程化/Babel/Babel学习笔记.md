## Babel是什么？

### Babel是一个JavaScript编译器

Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。下面列出的是 Babel 能为你做的事情：

- 语法转换
- 通过 Polyfill 方式在目标环境中添加缺失的特性 （通过引入第三方 polyfill 模块，例如 [core-js](https://github.com/zloirock/core-js)）
- 源码转换（codemods）
- 更多......

### 类型注释（Flow和TypeScript）

Babel 可以删除类型注释！查看 [Flow preset](https://www.babeljs.cn/docs/babel-preset-flow) 或 [TypeScript preset](https://www.babeljs.cn/docs/babel-preset-typescript) 了解如何使用。务必牢记 **Babel 不做类型检查**，你仍然需要安装 Flow 或 TypeScript 来执行类型检查的工作。

### 插件化

Babel 构建在插件之上。使用现有的或者自己编写的插件可以组成一个转换管道。通过使用或创建一个`preset`即可轻松使用一组插件。

### 可调式

由于 Babel 支持 **Source map**，因此你可以轻松调试编译后的代码。

## 使用指南

### 概览

配置Babel运行环境：

1. 安装需要的npm包

   ```shell
   npm install --save-dev @babel/core @babel/cli @babel/preset-env
   ```

2. 在项目的根目录下创建一个命名为 `babel.config.json` 的配置文件（需要 `v7.8.0` 或更高版本），并将以下内容复制到此文件中：

   ```json
   {
     "presets": [
       [
         "@babel/preset-env",
         {
           "targets": {
             "edge": "17",
             "firefox": "60",
             "chrome": "67",
             "safari": "11.1"
           },
           "useBuiltIns": "usage",
           "corejs": "3.6.5"
         }
       ]
     ]
   }
   ```

3. 运行此命令将 `src` 目录下的所有代码编译到 `lib` 目录：

   ```shell
   ./node_modules/.bin/babel src --out-dir lib
   ```

### CLI命令的基本用法

你所需要的所有的 Babel 模块都是作为独立的 npm 包发布的，并且（从版本 7 开始）都是以 `@babel` 作为冠名的。这种模块化的设计能够让每种工具都针对特定使用情况进行设计。

#### 核心库（@babel/core）

Babel 的核心功能包含在`@babel/core`模块中。

```shell
npm install --save-dev @babel/core
```

你可以在 JavaScript 程序中直接 `require` 并使用它：

```javascript
const babel = require("@babel/core");

babel.transformSync("code", optionsObject);
```

#### CLI命令行工具（@babel/cli）

`@babel/cli`是一个能够从终端（命令行）使用的工具。

```shell
npm install --save-dev @babel/core @babel/cli

./node_modules/.bin/babel src --out-dir lib
```

上面的示例中我们使用了 `--out-dir` 参数。你可以通过 `--help` 参数来查看命令行工具所能接受的所有参数列表。

### 插件和预设（preset）

代码转换功能以**插件**的形式出现，插件是小型的 JavaScript 程序，用于指导 Babel 如何对代码进行转换。你甚至可以编写自己的插件将你所需要的任何代码转换功能应用到你的代码上。

```shell
npm install --save-dev @babel/plugin-transform-arrow-functions

./node_modules/.bin/babel src --out-dir lib --plugins=@babel/plugin-transform-arrow-functions
```

现在，我们代码中的所有箭头函数（arrow functions）都将被转换为 ES5 兼容的函数表达式了：

```javascript
const fn = () => 1;

// converted to

var fn = function fn() {
  return 1;
};
```

我们不需要一个接一个地添加所有需要的插件，我们可以使用一个 **"preset"** （即一组预先设定的插件）。

```javascript
npm install --save-dev @babel/preset-env

./node_modules/.bin/babel src --out-dir lib --presets=@babel/env
```

如果不进行任何配置，上述 preset 所包含的插件将支持所有最新的 JavaScript （ES2015、ES2016 等）特性。但是 preset 也是支持参数的。

### 配置

根据你的需要，可以通过几种不同的方式来使用配置文件。

现在，我们首先创建一个名为 `babel.config.json` 的文件（需要 `v7.8.0` 或更高版本），并包含如下内容：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        }
      }
    ]
  ]
}
```

现在，名为 `env` 的 preset 只会为目标浏览器中没有的功能加载转换插件。

### Polyfill

`@babel/polyfill`模块包括 [core-js](https://github.com/zloirock/core-js) 和一个自定义 [regenerator runtime](https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js)，用于模拟完整的 ES2015+ 环境。

这意味着你可以使用目标浏览器中不支持的一些新版本ES中的功能，比如`Promise`,`WeakMap`等。为了添加这些功能，polyfill将添加到全局作用域和类似String这样的原生原型中去。

如果你不需要类似 `Array.prototype.includes` 的实例方法，可以使用 [transform runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime) 插件而不是对全局范围（global scope）造成污染的 `@babel/polyfill`。

更进一步，如果你确切地知道你所需要的polyfill功能，你可以直接从core-js获取它们。



```shell
npm install --save @babel/polyfill
```

> 注意，使用 `--save` 参数而不是 `--save-dev`，因为这是一个需要在你的源码之前运行的 polyfill。

我们所使用的 `env` preset 提供了一个 `"useBuiltIns"` 参数，当此参数设置为 `"usage"` 时，就会加载上面所提到的最后一个优化措施，也就是只包含你所需要的 polyfill。使用此新参数后，修改配置如下：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        },
        "useBuiltIns": "usage"
      }
    ]
  ]
}
```

Babel 将检查你的所有代码，以便查找目标环境中缺失的功能，然后只把必须的 polyfill 包含进来。示例代码如下：

```javascript
Promise.resolve().finally();
```

将被转换为（由于 Edge 17 没有 `Promise.prototype.finally`）：

```javascript
require("core-js/modules/es.promise.finally");

Promise.resolve().finally();
```

如果我们不使用将 `"useBuiltIns"` 参数设置为 `"usage"` （默认值是 "false"）的 `env` 预设的话，那么我们必须在所有代码之前利用 require 加载 *一次* 完整的 polyfill。

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        },
        "useBuiltIns": "entry"
      }
    ]
  ]
}
```

```java
// 在入口文件的最前面加上这一行代码
import "core-js/stable";
```


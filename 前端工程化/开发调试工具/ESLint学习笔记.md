# ESLint
## 什么是ESLint？
> ESLint 是一个可配置的 JavaScript 检查器。它可以帮助你发现并修复 JavaScript 代码中的问题。问题可以指潜在的运行时漏洞、未使用最佳实践、风格问题等。

## Rules（规则）
> Rules是ESLint的核心构建模块。Rules会验证你的代码是否符合预期，并且规定了在不符合预期时应该怎么做。规则还可以包含针对该规则的额外配置项。

### 配置Rules
#### 规则严重性
要改变规则的设置，你必须把规则 ID 设置为这些值之一：
- "off" 或 0 - 关闭规则
- "warn" 或 1 - 启用并视作警告（不影响退出）
- "error" 或 2 - 启用并视作错误（触发时退出代码为 1）
通常会将规则设置为 "error" 以便在持续集成测试、pre- commit 检查和拉取请求合并中强制遵守规则，而 ESLint 则以非零代码退出。

示例：
```js
// .eslintrc.js
module.exports = {
    // ...
    rules: {
        curly: "error",
        // 配置分号的规则，第一个为规则严重性，后面的是规则的选项
        semi: ["error", "always"]
    }
}

```


#### 配置注释
- 在文件的一部分中禁用规则警告
  ```js
  // 禁用所有
  /* eslint-disable */

  alert('foo');

  /* eslint-enable */

  // 禁用特定规则
  /* eslint-disable no-alert */

  alert('foo');

  /* eslint-enable no-alert */
  ```

- 禁用整个文件中的规则警告
  ```js
  // 禁用所有
  /* eslint-disable */
  alert('foo');
  ```

  ```js
  // 禁用特定规则
  /* eslint no-alert: "off" */
  console.log('foo')
  ```

## 配置文件
ESLint支持多种格式的配置文件（JS, JS Module, YAML, JSON），如果在同一目录下存在多个配置文件，ESLint 将按照以下优先顺序以此使用其一：
- .eslintrc.js
- .eslintrc.cjs
- .eslintrc.yaml
- .eslintrc.yml
- .eslintrc.json
- package.json

### 扩展配置文件
一个配置文件一旦扩展，就可以继承另一个配置文件的所有特征（包括规则、插件和语言选项）并修改所有选项。
通过`extends`属性来设置配置文件的扩展，它的值可以是：
- 一个指定配置的字符串（要么是配置文件的路径，要么是可共享配置的名称，要么是 eslint:recommended，要么是 eslint:all）
- 一个字符串数组，每个额外的配置都会扩展前面的配置
```js
// .eslintrc.js
module.exports = {
    // ...
    extends: [
        'standard',
        'plugin:vue/vue3-essential'
    ]
}
```

### 使用可共享配置包
> 可共享配置 是导出配置对象的一个 npm 包。当你在项目根目录下安装了这个包后，ESLint 就可以使用它了。

`extends` 属性值可以省略包名的 `eslint-config-`前缀。

`npm init @eslint/config` 命令可以创建一个配置，这样你就可以扩展一个流行的风格指南（如 `eslint-config-standard`）。

### 使用插件配置
> 插件是一个可以为 ESLint 添加各种扩展功能的 npm 包。一个插件可以执行许多功能，包括但不限于添加新的规则和导出可共享的配置。

`plugins`属性值可以省略包名中的`eslint-plugin-`前缀。

extends 属性值由以下内容组成：
- plugin:
- 包名（可以省略其前缀，如`vue`是`eslint-plugin-vue`的缩写）
- `/`
- 配置名称
```js
// .eslintrc.js
module.exports = {
    // ...
    plugins: [
        'vue'
    ],
    extends: [
        'standard',
        'plugin:vue/vue3-essential'
    ]
}
```

### 使用现有配置文件
extends属性值可以是基于配置文件的绝对或相对路径。
```js
// .eslintrc.js
module.exports = {
    // ...
    extends: [
        "./node_modules/coding-standard/eslintDefaults.js",
        "./node_modules/coding-standard/.eslintrc-es6",
        "./node_modules/coding-standard/.eslintrc-jsx"
    ]
}
```

### 覆盖配置
有时，更精细的配置是必要的，比如同一目录下的文件的配置不同。因此，你可以在 `overrides` 键下提供配置，这些配置只会用于符合特定 glob 模式的文件
```js
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:vue/vue3-essential'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      // 指定需要覆盖配置的文件
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
  }
}

```


## 插件
ESLint 插件是一个包含 ESLint 规则、配置、处理器和环境变量的集合的 npm 模块。

### 配置插件
```js
// .eslintrc.js
module.exports = {
    // ...
    plugins: [
        'vue'
    ]
}
```

### 指定处理器
插件可以提供处理器。处理器可以从其他类型的文件中提取 JavaScript 代码，然后让 ESLint 对 JavaScript 代码进行提示，或者处理器可以在预处理中转换 JavaScript 代码以达到某些目的。
```js
// .eslintrc.js
module.exports = {
    // ...
    plugins: [
        'a-plugin'
    ],
    processor: 'a-plugin/a-processor'
}
```

> 自定义处理器：你也可以在用 ESLint 配置的处理器解析 JavaScript 代码之前使用处理器先对其进行处理。



## 命令行 & Node.js API
ESLint 命令行是一个命令行界面，让你可以在终端进行检查。命令行有各种可以传递给命令的选项。

ESLint 的 Node.js API 让你可以在 Node.js 代码中以编程的方式使用 ESLint。该 API 在开发插件、集成和其他与 ESLint 相关的工具时非常有用。

`eslint-webpack-plugin`这个插件就是基于ESLint的Node.js API开发，在使用`new ESLintPlugin(options)`时，传递的options就可以参考[Node.js API Reference](https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions)
```js
// webpack.config.js
module.exports = {
    // ...
    plugins: [
        new ESLintPlugin({
            // 自动修复
            fix: true,
            // 处理哪些格式的文件
            extensions: [
                '.js',
                '.vue'
            ]
        })
    ]
}
```
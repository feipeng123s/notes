## Prettier是什么？
> Prettier 是一个固执己见的代码格式化程序。

它删除了所有原始样式*并确保所有输出的代码符合一致的样式。    
Prettier 获取您的代码并考虑行长度，从头开始重新打印它。

## Prettier和Linters的区别
Linters有两套规则：
- 代码格式，比如`max-len`, `no-mixed-spaces-and-tabs`
- 代码质量，比如`no-unused-vars`, `no-extra-bind`

Prettier更专注于代码格式，对提升代码质量起不到任何作用。

## 为什么要使用Prettier
既然Linters提供了代码格式化的功能，为什么还要使用Prettier呢？
1. Prettier在代码格式化方面更专业。比如继承了`standard`配置的eslint不能处理`max-len`的问题，需要再额外配置。
2. 统一风格，不必为了选择那种代码风格而争论。因为 Prettier 是唯一全自动的“风格指南”。

## 无冲突设置ESLint和Prettier
安装配置`eslint-config-prettier`和`eslint-plugin-prettier`
```shell
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
npm install --save-dev --save-exact prettier
```
```js
// .eslintrc.js
module.exports = {
  // ...
  extends: [
    "some-other-config-you-use",
    "prettier",
    "plugin:prettier/recommended"
  ]
}
```

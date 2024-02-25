# React实战进阶笔记

出现的历史背景：传统的DOM API关注太多细节

React很简单
* 一个新概念
* 4个必须API
* 单向数据流
* 完善的错误提示

## Flux 单向数据流
Flux架构
Flux架构衍生项目
* Redux
* Mobx


## React组件

- React组件一般不提供方法，而是某种状态机
- React组件可以理解为一个纯函数 props + state => view
- 单向数据绑定

### 创建一个组件

1. 创建静态UI
2. 考虑组件的状态组成
3. 考虑组件的交互方式

### 受控组件 vs 非受控组件
- 受控组件：状态由组件外部维护
- 非受控组件：状态由组件内部维护

### 何时创建组件：单一职责原则
- 每个组件只做一件事
- 如果组件变得复杂，那么应该拆分成小组件

### 数据状态管理：DRY原则（Don't Repeat Youself）

- 能计算得到的状态就不要单独存储
- 组件尽量无状态，所需数据通过props获取

## JSX

本质：动态创建组件的JavaScript语法糖

### 约定：自定义组件以大写字母开头

1. React 认为小写的tag是原生DOM节点
2. 大写字母开头为自定义组件
3. JSX标记可以直接使用属性语法，例如<menu.item/>



## 生命周期

### constructor

- 用于初始化内部状态，很少使用

- 唯一可以直接修改state的地方

### getDerivedStateFromProps

- 当state需要从props初始化时使用
- 尽量不要使用：维护两者状态一致性会增加复杂度
- 每次render都会调用
- 典型场景：表单空间获取默认值

### componentDidMount

- UI渲染完成后调用
- 只执行一次
- 典型场景：获取外部资源

### componentWillUnmount

- 组件移除时被调用
- 典型场景：资源释放

### getSnapshotBeforeUpdate

- 在页面render之前调用，state已更新
- 典型场景：获取render之前的DOM状态

### componentDidUpdate

- 每次UI更新时被调用
- 典型场景：页面需要根据props变化重新获取数据

### shouldComponentUpdate

- 决定Virtual DOM是否需要重绘
- 一般可以由PureComponent自动实现
- 典型场景：性能优化

## Diffing 算法

采用逐层对比的方式，算法复杂度为O(n)

> https://zh-hans.reactjs.org/docs/reconciliation.html

## 组件设计模式
组件的重用不一定能满足所有的应用场景。这时候就诞生了组件复用的另外两种形式：
### 高阶组件（HOC）
> 高阶组件是参数为组件，返回值为新组件的函数。
```js
const EnhancedComponent = higherOrderComponent(WrappedComponent);
``` 
组件是将 props 转换为 UI，而高阶组件是将组件转换为另一个组件。

注意：
1. HOC 不应该修改传入组件，而应该使用组合的方式，通过将组件包装在容器组件中实现功能
2. HOC 应该透传与自身无关的 props。
```javascript
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('Current props: ', this.props);
      console.log('Previous props: ', prevProps);
    }
    render() {
      // 将 input 组件包装在容器中，而不对其进行修改。Good!
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

HOC相比mixin的优势：
1. 在HOC中，组件与功能是解耦的，不会收到任何入侵。HOC可以应用到任何组件，组件也可以被任何HOC包裹，非常灵活
2. mixin应用了面向对象的概念，而HOC是声明式的，体现了函数式编程的思想。

[React组件复用的发展史](https://www.cnblogs.com/xiatianweidao/p/16962728.html)
[React系列 --- 从Mixin到HOC再到HOOKS(四)](https://segmentfault.com/a/1190000019997397)
 
### 函数作为子元素
通常，JSX 中的 JavaScript 表达式将会被计算为字符串、React 元素或者是列表。不过，props.children 和其他 prop 一样，它可以传递任意类型的数据，而不仅仅是 React 已知的可渲染类型。例如，如果你有一个自定义组件，你可以把回调函数作为 props.children 进行传递：
```javascript
import React from "react";

class MyComponent extends React.Component {
    render() {
        return (
            <div>
                {this.props.children('xiaoming')}
            </div>
        );
    }
}

export default function FuncAsSub() {
    return (
        <MyComponent>
            {(name) => <div>{name}</div>}
        </MyComponent>
    )
}
```


### HOOKS


## Context API
Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。


Context 主要应用场景在于很多不同层级的组件需要访问同样一些的数据。请谨慎使用，因为这会使得组件的复用性变差。

如果你只是想避免层层传递一些属性，组件组合（component composition）有时候是一个比 context 更好的解决方案。


## 创建React应用的脚手架工具
### Create React App
集成了Babel、Webpack Config、Testing、ESlint等工具
```shell
npx create-react-app my-app
cd my-app
npm start
```

### Rekit
基于Create React App提供了更多的功能
```shell
npm install -g rekit

rekit create my-app
cd my-app
npm install

npm start
```

### Codesandbox
用来搭建线上开发环境codesandbox.io


## 打包
### 为什么需要打包？
1. 编译ES6语法特性，编译JSX
2. 整合资源（图片、Less/Sass等）
3. 优化代码体积


## Redux
让组件通信更加容易

### 三大原则
- 单一数据源（Single Source of Truth，整个应用的全局状态都放在唯一一个store中）
- State是只读的（唯一改变state的方法就是触发action，state + action = new state）
- 使用纯函数（reducer）来执行修改

### 相关概念
#### State
在Redux API中，通常是指一个唯一的state值，由store管理且由`getState()`方法获得。
约定俗成，顶层state可以是一个对象，可以是像Map那样的键值对集合，也可以是任意的数据类型。

#### Action
Action 是一个简单对象（纯对象），用来表示即将要改变 state 的倾向。它是将数据存入 store 的唯一途径。
Action 必须有一个 type 字段代表需要被执行的 action 类别。
除了 type 字段，其他 action 对象的数据结构完全取决于你自己。

#### Reducer
```typescript
type Reducer<S, A> = (state: S, action: A) => S
```
接收之前的state和action，然后 返回更新后state的函数。
Reducer必须是纯函数——即相同的输入只会返回相同的结果的函数。

#### dispatch function
```typescript
type BaseDispatch = (a: Action) => Action
type Dispatch = (a: Action | AsyncAction) => any
```
dispatch function是一个接收action或者异步action作为参数的函数，该函数可以向store中dispatch若干个action，既可以不dispatch，也可以dispatch一个或多个action。

#### Action Creator
Action Creator很简单，就是一个创建 action 的函数。调用 action creator 只会生成 action，不会 dispatch。

#### 异步Action
异步 action 是一个传递给 dispatching 函数的值，但是这个值还不能被 reducer 消费。在传递给 base dispatch() function 之前，middleware 会把异步 action 转换成一个或一组 action。
异步action不是特殊action，而是多个同步action的组合使用。

#### Middleware
Middleware 是一个高阶函数，它用来组合dispatch function并返回一个新的 dispatch function，通常将异步 action 转换成 action。
Redux中间件在dispatcher中截获action做特殊处理：
1. 截获Action
2. 发出Action

#### Store
> Store就是存储着应用的state tree的对象。
1. getState()
2. dispath(action)
3. subscribe(listener)
4. replaceReducer(nextReducer)用于热重载和代码分割。



### Redux核心包
- `createStore`实际创建一个 Redux 存储实例
- `combineReducers`将多个reducer函数合并成为一个更大的reducer
- `applyMiddleware`将多个中间件组合成一个 store 增强器
- `bindActionCreators` 将多个action creator与store中的dispatch绑定到一起，生成新的函数，这样在调用时会触发dispath修改state
- `compose`将多个 store 增强器合并成一个单一的 store 增强器

### React Redux
React Redux 是 Redux 的官方 React UI 绑定库。它使得你的 React 组件能够从 Redux store 中读取到数据，并且你可以通过dispatch actions去更新 store 中的 state。

#### connect API
如今我们使用 React-Redux hooks API 作为我们的默认推荐。但是，connect API 仍然可以正常工作。


### 如何组织Action和Reducer
#### “标准”形式Redux Action的问题
1. 所有Action放一个文件，会无限扩展
2. Action和Reducer分开，实现业务逻辑时需要来回切换
3. 系统中有哪些Action不够直观

#### 新的方式：单个Action和Reducer放在同一个文件
```javascript
import { PLUS_ONE } from './contants';

export function plusOne() {
    return { type: PLUS_ONE };
}

export function reducer(state, action) => {
    switch (action.type) {
        case PLUS_ONE:
            return {
              ...state,
              count: state.count + 1 
            };
        default:
            return state;
    }
    
}
```

### Immutable不可变更新模式
#### 实现方式
1. Array.concat, Object.assign, 扩展运算符(...)
```javascript
const state = { filter: 'completed', todos: [
  'Learn React'
]};
const newState = { ...state, todos: [
  ...state.todos,
  'Learn Redux'
]};
```
2. immutability-heper
3. immer（项目规模较大时会有性能问题）

## React Router
### API
1. <Link> 不会触发浏览器刷新
2. <NavLink> 类似Link，但是会添加当前选中状态
3. <Prompt>
4. <Redirect>
5. <Route>
6. <Switch> 只显示第一个匹配的路由

## 使用React同构应用
Next.js

什么是同构应用？
- 「后端渲染 SSR」指传统的Java 、 PHP 的渲染机制，前端一般只负责出UI样式界面模板和js交互代码。
- 「前端渲染」指使用 JS 来渲染页面大部分内容，代表是现在流行的 SPA 单页面应用，后端只用负责出数据接口，前后端几乎全部使用异步数据请求（如ajax、fetch等）交互。
- 「同构渲染」加入一个中间层的概念，node中间层从后端接过渲染的逻辑，首次渲染时使用 Node.js 来直出 HTML，后续客户端交互包括当前页路由切换直接在客户端完成。一般来说同构渲染是介于前后端中的共有部分。
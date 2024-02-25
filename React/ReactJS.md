# React

## what is

> A JavaScript **library** for building user interfaces

## where use

用在数据操作比较频繁（视图更新频繁-->DOM操作-->浏览器性能瓶颈）的场景

## why use

- 虚拟DOM，最大限度减少DOM操作
- 单向数据流

## how use

- cli方式[create-react-app](https://github.com/facebook/create-react-app)
- 直接引入相关js文件`react.js`、`react-dom.js`、`babel.js`

## 核心概念

### JSX(Javascrpit + xml)

使用jsx编写组件时，可以直接在js代码中写html标签，如下：

```jsx
ReactDOM.render(
    <h1>Hello, world!</h1>,
    document.getElementById('root')
);
```

但是浏览器不能处理jsx，所以需要依赖于`babel`将jsx转换为浏览器能处理的js代码。

### Render

> React元素是不可变的。创建元素后，无法再更改其子元素或属性。元素就像电影中的单个帧：它代表特定时间点的UI。
>
> 根据我们迄今为止的知识，更新UI的唯一方法是创建一个新元素，并将其传递给`ReactDOM.render()`。

### Component and Props

> 可反复使用的，带有特定功能的视图

#### 创建组件类

> 组件名称必须用全驼峰法（所有首字母大写）

The simplest way to define a component is to write a JavaScript function:

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

```jsx
var MyComponent = React.createClass({
    // 必须有这个函数
    render(){
        return <h1>Hello!</h1>;
    }
});
```

ES6 class写法：

> Class components should always call the base constructor with `props`.

```jsx
class MyComponent extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){
        return <h1>Hello!</h1>;
    }
}
```

#### 复合组件(Composing Components)

> 在组件中调用其他组件

```jsx
var MyHeader = React.createClass({
    render(){
        return <h1>这是头部标题组件</h1>;
    }
});
var MyList = React.createClass({
    render(){
        return <MyHeader></MyHeader>
        <ul>
            <li>item1</li>
            <li>item2</li>
            <li>item3</li>
        </ul>
    } 
});
```

####  Props

> 从概念上讲，组件就像JavaScript函数。它们接收任意输入（我们称之为“Props”）并返回描述屏幕上应显示什么内容的React元素。

### State and Lifecycle

#### state

> State is similar to props, but it is private and fully controlled by the component.

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```

#### update state

- 使用`this.setState()`来更新state

    ```jsx
    this.setState({
        date: new Date()
    });
    ```

- 更新state可能是异步的
- 多个状态更新会被合并

#### The Data Flows Down

> Any state is always owned by some specific component, and any data or UI derived from that state can only affect components “below” them in the tree.

#### lifecycle

参考：[图解ES6中的React生命周期](https://juejin.im/post/5a062fb551882535cd4a4ce3)

> 在包含许多组件的应用程序中，在组件销毁时释放所占用的资源是非常重要的。这时就需要用到生命周期

1. 初始化阶段

   - 设置组件默认属性
   - constructor
   - componentWillMount
   - render
   - componentDidMount
2. 运行中阶段
   - componentWillReceiveProps：组件接收到属性时触发
   - shouldComponentUpdate：当props或state改变是触发，首次渲染不会触发
   - componentWillUpdate
   - componentDidUpdate
3. 销毁阶段
   - componentWillUnmount



### Ref

> 在默写情况下，我们需要在数据流之外强制修改子项（child）。要修改的子项可能是React组件示例，也可能是DOM元素。对于这两种情况，React提供了**escape hatch**（逃生舱口）——`Refs`

**避免使用refs来做任何可以声明性地完成的事情（即能使用数据流解决的事情）。**

## Redux

### Action

> **Action** 是把数据从应用传到 store 的有效载荷。它是 store 数据的**唯一**来源。一般来说你会通过 [`store.dispatch()`](https://cn.redux.js.org/docs/api/Store.html#dispatch) 将 action 传到 store。

### Reducer

> **Reducers** 指定了应用状态的变化如何响应actions并发送到 store 的。reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。之所以将这样的函数称之为reducer，是因为这种函数与被传入 `Array.prototype.reduce(reducer, ?initialValue) `里的回调函数属于相同的类型。

**永远不要**在 reducer 里做这些操作：

- 修改传入参数；
- 执行有副作用的操作，如 API 请求和路由跳转；
- 调用非纯函数，如 `Date.now()` 或 `Math.random()`。



> 如果你不喜欢 switch，完全可以自定义一个 `createReducer `函数来接收一个事件处理函数列表

#### Reducer合成

`combineReducers`

**每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据**



### Store

Store就是将Action和Reducer联系到一起的对象，Store有一下职责：

- 维持应用的 state；
- 提供 [`getState()`](https://cn.redux.js.org/docs/api/Store.html#getState) 方法获取 state；
- 提供 [`dispatch(action)`](https://cn.redux.js.org/docs/api/Store.html#dispatch) 方法更新 state；
- 通过 [`subscribe(listener)`](https://cn.redux.js.org/docs/api/Store.html#subscribe) 注册监听器;
- 通过 [`subscribe(listener)`](https://cn.redux.js.org/docs/api/Store.html#subscribe) 返回的函数注销监听器。

#### 根据Reducer来创建Store

```jsx
import { createStore } from 'redux'
import todoApp from './reducers'
let store = createStore(todoApp) //createStore() 的第二个参数是可选的, 用于设置 state 初始状态
```

### 数据的生命周期

1. 调用`store.dispatch(action)`
2. Redux store 调用传入的 reducer 函数
3. 根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树
4. Redux store 保存了根 reducer 返回的完整 state 树

## Redux-Saga

### 概念

>`redux-saga` 是一个用于管理应用程序 Side Effect（副作用，例如异步获取数据，访问浏览器缓存等）的 library，它的目标是让副作用管理更容易，执行更高效，测试更简单，在处理故障时更容易。
>`redux-saga` 是一个 redux 中间件，意味着这个线程可以通过正常的 redux action 从主应用程序启动，暂停和取消，它能访问完整的 redux state，也可以 dispatch redux action。
>redux-saga 使用了 ES6 的 Generator 功能，让异步的流程更易于读取，写入和测试。

### Saga辅助函数

- `takeEvery`，响应没一个action，允许多个副作用实例同时启动
- `takeLatest`，只响应最新的那个action

### Effects

> Effect 是一个简单的对象，这个对象包含了一些给 middleware 解释执行的信息。 你可以把 Effect 看作是发送给 middleware 的指令以执行某些操作（调用某些异步函数，发起一个 action 到 store，等等）

## Redux中间件Reselect



## React Router

### 用法

- JSX写法

    ```jsx
    // router 允许你使用 IndexRoute ，以使 Home 作为最高层级的路由出现
    import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
    React.render((
      <Router>
        <Route path="/" component={App}>
          <IndexRoute component={Dashboard} />
          <Route path="about" component={About} />
          <Route path="inbox" component={Inbox}>
            <Route path="/messages/:id" component={Message} />
    
            {/* 跳转 /inbox/messages/:id 到 /messages/:id */}
            <Redirect from="messages/:id" to="/messages/:id" />
          </Route>
        </Route>
      </Router>
    ), document.body)
    ```

- json对象形式写法

  ```jsx
  const routeConfig = [
    { path: '/',
      component: App,
      indexRoute: { component: Dashboard },
      childRoutes: [
        { path: 'about', component: About },
        { path: 'inbox',
          component: Inbox,
          childRoutes: [
            { path: '/messages/:id', component: Message },
            { path: 'messages/:id',
              onEnter: function (nextState, replaceState) {
                replaceState(null, '/messages/' + nextState.params.id)
              }
            }
          ]
        }
      ]
    }
  ]
  
  React.render(<Router routes={routeConfig} />, document.body)
  ```

  

### 钩子函数

- `routerWillLeave`

- `onEnter`
- `onLeave`

> 这些hook会在页面跳转确认时触发一次。这些 hook 对于一些情况非常的有用，例如权限验证或者在路由跳转前将一些数据持久化保存起来。

### 路由匹配

> React Router 会**深度优先遍历**整个路由配置来寻找一个与给定的 URL 相匹配的路由。

### 路由实现方式

#### browserHistory

需要服务器配置的支持

#### hashHistory

> Hash history 使用 URL 中的 hash（`#`）部分去创建形如 `example.com/#/some/path`的路由。

#### createMemoryHistory

> Memory history 不会在地址栏被操作或读取。这就解释了我们是如何实现服务器渲染的。同时它也非常适合测试和其他的渲染环境（像 React Native ）。

### React Router V4——动态路由

### Redux集成

## Context

> Context提供了一种在组件之间共享某一类通用数据的方式，而不必显式地通过组件树逐层传递props。

### 使用方式

```jsx
const ThemeContext = React.createContext('light');
render(){
    return (
    	<ThemeContext.Provider value="dark">
        	<ThemeButton/>
        </ThemeContext.Provider>
    )
}
```

### API

- `React.createContext(defaultValue)`
- `Context.Provider`
- `Class.contextType`
- `Context.Consumer`




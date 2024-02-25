## History路由
在H5之前，浏览器的history对象只支持页面之间的跳转、前进和后退功能
```js
history.length
history.go(integer)
history.back(integer)
history.forward(integer)
```
在H5中新增了以下API：
```js
history.pushState()
history.replaceState()
history.state
```

### pushState和replaceState方法
调用pushState方法会向历史记录中添加一条新的记录，在改变页面URL的同时不会触发页面重新加载新，这个特性非常适用于前端路由。replaceState方法类似，只不过是替换记录，而不是新增。

### popstate事件
每当同一个文档的浏览历史（即history对象）出现变化时，就会触发popstate事件。但是调用history.pushState()和history.replaceState()方法不会触发该事件。

### 创建路由类
```js
class HistoryRouter{
    constructor() {
        this.routes = {};
        document.addEventListener('popstate', e => {
            const path = e.state && e.state.path;
            this.routes[path] && this.routes[path]();
        })
    }

    initPath(path) {
        window.history.replaceState({path}, null, path);
        this.routes[path] && this.routes[path]();
    }

    route(path, callback) {
        this.routes[path] = callback || function() {};
    }

    go(path) {
        history.pushState({path}, null, path);
        this.routes[path] && this.routes[path]();
    }
}

window.Router = new HistoryRouter();
```

### 注册路由
```js
function changeBgColor(color){
    content.style.background = color;
}

Router.route(location.pathname, () => {
    changeBgColor('yellow');
});
Router.route('/red', () => {
    changeBgColor('red');
});
Router.route('/green', () => {
    changeBgColor('green');
});
Router.route('/blue', () => {
    changeBgColor('blue');
});

const content = document.querySelector('body');
Router.init(location.pathname);
```

### 监听路由变化
在hash路由中，我们通过`hashchange`事件来监听路由变化，且hash变化不会触发页面加载。但是history路由就不太一样：
- 点击`<a>`标签跳转时，不只是hash改变，所以我们需要拦截它的默认行为，防止页面重新加载
- 点击浏览器前进后退按钮时，会触发`popstate`事件，我们需要监听该事件来跳转路由（见HistoryRouter类构造函数中的监听）
```js
// a标签处理
const ul = document.querySelector('ul');

ul.addEventListener('click', e => {
  if(e.target.tagName === 'A'){
    e.preventDefault();
    Router.go(e.target.getAttribute('href'));
  }
})
```

## Hash路由
hash路由通过监听`hashchange`事件来感知路由变化，其他逻辑与history基本相似，这里不再详细介绍
```js
class Routers{
  constructor(){
    // 保存路由信息
    this.routes = {};
    this.currentUrl = '';
    window.addEventListener('load', this.refresh, false);
    window.addEventListener('hashchange', this.refresh, false);
  }

  // 用于注册路由的函数
  route = (path, callback) => {
    this.routes[path] = callback || function(){};
  }

  // 监听事件的回调，负责当页面hash改变时执行对应hash值的回调函数
  refresh = () => {
    this.currentUrl = location.hash.slice(1) || '/';
    this.routes[this.currentUrl]();
  }
}

window.Router = new Routers();
```

参考文档：
[前端路由的实现原理](https://danielxuuuuu.github.io/2020/02/23/%E5%89%8D%E7%AB%AF%E8%B7%AF%E7%94%B1%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86/)
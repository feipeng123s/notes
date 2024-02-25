## JavaScript概念
- ECMAScript
- DOM
- BOM

## 什么是BOM？
> BOM ：Browser Object Model（浏览器对象模型），BOM提供了独立于内容的、可以与浏览器窗口进行滑动的对象结构，就是浏览器提供的API。

其主要对象有：
1. window对象：BOM的核心，是js访问浏览器的接口，也是ES规定的Global对象。
2. location对象：提供读取和操作URL信息的属性和方法。即是window对象的属性，也是document对象的属性。
   ```js
   document.location === window.location; // returns true
   ```
3. navigation对象：提供有关浏览器的系统信息。
4. history对象：用于保存浏览器历史信息。
5. screen对象：用于获取浏览器窗口及屏幕的宽高等信息。

## window对象
> window对象是整个浏览器对象模型的核心，其扮演着既是接口又是全局对象的角色。
 
window对象提供对以下内容的访问：
- 全局属性
  ```js
  // 位置信息
  window.screenLeft
  window.screenTop
  window.screenX	
  window.screenY	
  // 宽高
  const outerHeight = window.outerHeight;
  const outerWidth = window.outerWidth;
  const innerHeight = window.innerHeight;
  const innerWidth = window.innerWidth;
  ```
- 全局方法
  ```js
  // 位置信息
  moveBy(x,y)
  moveTo(x,y)
  // 宽高
  resizeTo(width, height)
  resizeBy(width, height)
  // 弹窗
  alert()	
  confirm()
  prompt()
  // 定时器
  const timeout = setTimeout(callback, delay); // delay in ms
  const interval = setInterval(callback, delay); // delay in ms
  clearTimeout(timeout);
  clearInterval(interval);
  // 其他
  open()	
  onerror()
  ```

## location对象
- `location.hash` 返回URL中`#`之后的字符串，不包含`#`
- `location.host`
- `location.hostname` host包含端口，hostname不包含端口
- `location.href` 返回当前页面的完整URL。 我们也可以写入这个属性，从而重定向到新页面。
- `location.pathname` 返回hostname之后的任何内容
- `location.port`
- `location.protocol`
- `location.search` 返回URL中`?`之后的字符串，包含`?`
- `location.assign(url)` 导航到作为参数传入的 url
- `location.replace(url)` 与`assign`方法类似，但被替换的站点会从会话历史记录中删除
- `location.reload()` 这与单击浏览器上的重新加载按钮具有相同的效果

## navigator对象
- `navigator.userAgent`
- `navigator.language` 浏览器首选语言
- `navigator.languages` 返回用户已知语言的数组，按偏好排序：["en-GB", "en-US", "en"]
- `navigator.geolocation` 返回设备的地理位置信息，对象类型
- `navigator.appName` 返回浏览器名称
- `navigator.appVersion` 返回浏览器版本
- `navigator.platform` 返回浏览器平台名称

## history对象
- `history.length` 返回一个整数，表示会话历史记录中的元素数量，包括当前加载的页面，只读。有大小限制，比如在chrome下测试length的最大值为50。
- `history.go(integer)` 
- `history.back(integer)`
- `history.forward(integer)`
- `history.state` 返回在history栈顶的任意值的拷贝。通过这种方式可以查看state值，不必等待popstate事件发生后再查看
- `history.pushState(object, title, url)` object为随着状态保存的一个对象，title为新页面的标题，url为新的网址
- `replaceState(object, title, url)` 与pushState的唯一区别在于该方法是替换掉history栈顶元素

### popstate事件
当活动历史记录条目更改时，将触发popstate事件。

注意：
- 调用history.pushState()和history.replaceState()方法不会触发。
- 用户点击浏览器的前进/后退按钮时会触发。
- 调用history对象的back()、forward()、go()方法时会触发。
- popstate事件的回调函数的参数为event对象，该对象的state属性为随状态保存的那个对象。
- `location.href`是刷新式的跳转，在刷新的时候这个事件的监听函数就已经失效了，所以不会触发popstate事件；同样`history.go(0)`也不会触发，因为`history.go(0)`也会直接刷新页面

### pushState方法介绍
从某种程度来说, 调用`pushState()`和`window.location = "#foo"`基本上一样, 他们都会在当前的document中创建和激活一个新的历史记录。但是`pushState()`有以下优势：
- 新的URL可以是任何和当前URL**同源**的URL。而window.location只有在仅修改hash时才能使您保持在同一个文档中。
- 如果您不想更改 URL，则不必更改（pushState可以设置URL与原先值一样）。相比之下，设置 window.location = "#foo"; 仅当当前哈希不是#foo这种hash形式时才创建新的历史记录条目。
- 可以在新的历史记录中关联任何数据。window.location = "#foo"形式的操作，你只可以将所需数据写入锚的字符串中。

> 直接向location赋值时等同于向location.href赋值

注意：
1. `pushState()`不会触发`hashchange`事件，即使新的URL和之前的URL只有hash值不同
2. 浏览器不会在调用`pushState()`之后尝试加载此URL（即不会触发`reload`），但可能会稍后尝试加载URL，例如在用户重新启动浏览器之后。设置`window.location = '?page=1'`就会立即触发页面刷新，但是设置pushState的url参数为`'?page=1'`时不会立即触发页面刷新。
3. `pushState()`不能在不同源的URL之间跳转






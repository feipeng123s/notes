## 为什么要学习Selenium？
Selenium已经是Web自动化领域的事实标准，且开源免费，支持主流的浏览器，支持多种语言

## 什么是Selenium？
Selenium是一个用于Web应用程序自动化测试的工具。
主要功能：
- 测试与浏览器的兼容性
- 测试系统功能

## Selenium三剑客
### Selenium WebDriver
WebDriver是客户端API接口，测试人员通过调用这些接口来访问浏览器驱动，浏览器驱动在访问操作浏览器。  
另外，与浏览器的通信也可以是通过Selenium Server或RemoteWebDriver的远程通信。  
还可以使用Selenium Server或Selenium Grid进行分布式测试。

### Selenium IDE
Selenium IDE是一个浏览器插件，支持Chrome和Firefox，可以将手动测试过程记录下来，并产生自动化脚本。

### Selenium Grid
用来实现分布式测试

## 安装Selenium开发环境
1. 安装Python，并添加到path
2. pip install selenium
3. 安装PyCharm编辑器

## 安装浏览器驱动
1. 查看浏览器版本
2. 搜索chromedriver，根据浏览器版本下载对应的driver
3. 将chromedriver.exe添加到环境变量（我这里的做法是将它与放到python.exe所在目录，因为python已经被添加到环境变量PATH中）

## WebDriver的定位策略
### 8种传统定位器
| 定位器 | 描述
|:--|:--
| class name | 定位class属性与搜索值匹配的元素（不允许使用复合类名）
| css selector | 定位 CSS 选择器匹配的元素 
| id | 定位 id 属性与搜索值匹配的元素 
| name | 定位 name 属性与搜索值匹配的元素
| link text | 定位link text可视文本与搜索值完全匹配的锚元素 
| partial link text | 定位link text可视文本部分与搜索值部分匹配的锚点元素。如果匹配多个元素，则只选择第一个元素。
| tag name | 定位标签名称与搜索值匹配的元素
| xpath	| 定位与 XPath 表达式匹配的元素

```python
# 示例代码
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.find_element(By.CLASS_NAME, "information")
driver.find_element(By.CSS_SELECTOR, "#fname")
driver.find_element(By.ID, "lname")
driver.find_element(By.NAME, "newsletter")
driver.find_element(By.LINK_TEXT, "Selenium Official Page")
driver.find_element(By.PARTIAL_LINK_TEXT, "Official Page")
driver.find_element(By.TAG_NAME, "a")
driver.find_element(By.XPATH, "//input[@value='f']")
```

### 相对定位器（Selenium 4 引入）
> Selenium uses the JavaScript function `getBoundingClientRect()` to determine the size and position of elements on the page, and can use this information to locate neighboring elements.

| 定位器 | 描述
|:--|:--
| above | 上方
| below | 下方
| to_left_of | 左边
| to_right_of | 右边
| near | 查找距离最多50px的元素（常用来查找input label）

```python
from selenium.webdriver.support.relative_locator import locate_with

# 查找在id="password"的元素上方的tag_name="input"的元素
email_locator = locate_with(By.TAG_NAME, "input").above({By.ID: "password"})

password_locator = locate_with(By.TAG_NAME, "input").below({By.ID: "email"})

cancel_locator = locate_with(By.TAG_NAME, "button").to_left_of({By.ID: "submit"})

submit_locator = locate_with(By.TAG_NAME, "button").to_right_of({By.ID: "cancel"})

email_locator = locate_with(By.TAG_NAME, "input").near({By.ID: "lbl-email"})

# 链式调用
submit_locator = locate_with(By.TAG_NAME, "button").below({By.ID: "email"}).to_right_of({By.ID: "cancel"})
```

## WebDriver原理
API和浏览器驱动属于C/S架构，他们之间基于HTTP协议通信（浏览器驱动中包含了一个HTTP Server，用来接收API发送的http请求）

实际上WebDriver使用的协议是`JSON Wire protocol`（基于HTTP封装的），通信的数据格式是JSON，这样它就能支持多种语言

## 使用选择列表元素Select
| # | 方法/属性 | 描述 |
| :---- | :---- | :---- |
| 1 | select_by_value | 根据值选择 |
| 2 | select_by_index | 根据索引选择 |
| 3 | select_by_visible_text | 根据文本选择 |
| 4 | deselect_by_value | 根据值反选 |
| 5 | deselect_by_index | 根据索引反选 |
| 6 | deselect_by_visible_text | 根据文本反选 |
| 7 | deselect_all | 反选所有 |
| 8 | options | 所有选项 |
| 9 | all_selected_options | 所有选中项 |
| 10 | first_selected_options | 第一个选择项 |

```python
# 不完整示例
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select

se = self.driver.find_element(By.ID, 'myselect')
select = Select(se)
select.select_by_value('value1')
```
[Python详细示例](https://github.com/SeleniumHQ/seleniumhq.github.io/blob/trunk//examples/python/tests/support/test_select_list.py#L9-L10)


## 弹框处理：alert、confirm、prompt
详见[官方文档](https://www.selenium.dev/zh-cn/documentation/webdriver/interactions/alerts/)

## Selenium三种等待方式
### time.sleep（固定等待）
项目中不建议使用

### implicitly_wait（隐式等待）
设置了一个最长等待时间，如果在规定时间内网页加载完成，则执行下一步，否则一直等待到设置的最长时间，然后执行下一步。

现实情况中，我们会把script放在body最后，这时会存在页面元素加载完了，js文件还未加载完的情况，需要多等一段时间到script加载完成。

注意：隐式等待对整个driver周期都起作用，在最开始设置一次就可以了。不要当做固定等待使用，到哪都来一下隐式等待。
```python
def test_implicit(driver):
    driver.implicitly_wait(2)
    driver.get('https://www.selenium.dev/selenium/web/dynamic.html')
    driver.find_element(By.ID, "adder").click()

    added = driver.find_element(By.ID, "box0")

    assert added.get_dom_attribute('class') == "redbox"
```

### WebDriverWait（显式等待）
最常用
需要引入以下包
```python
from selenium.webdriver.support.wait import WebDriverWait
```

参数定义如下：
```python
class WebDriverWait(Generic[D]):
    def __init__(
        self,
        driver: D, # webdriver实例
        timeout: float, # 超时时间
        poll_frequency: float = POLL_FREQUENCY, # 调用until或until_not中的方法的间隔时间，默认0.5s
        ignored_exceptions: typing.Optional[WaitExcTypes] = None, # 忽略的异常
    ):
    # ...
```

在WebDriverWait类中的两个方法：until和until_not
```python
# 参数含义
# method：在等待期间，每隔一段时间调用传入的方法，直到返回值不是False
# message：如果超时，抛出TimeoutException，将message传入异常
def until(self, method: Callable[[D], Union[Literal[False], T]], message: str = "") -> T:

def until_not(self, method: Callable[[D], T], message: str = "") -> Union[T, Literal[True]]:
```
示例：
```python
def test_explicit(driver):
    driver.get('https://www.selenium.dev/selenium/web/dynamic.html')
    revealed = driver.find_element(By.ID, "revealed")
    driver.find_element(By.ID, "reveal").click()

    wait = WebDriverWait(driver, timeout=2)
    wait.until(lambda d : revealed.is_displayed())

    revealed.send_keys("Displayed")
    assert revealed.get_property("value") == "Displayed"
```
[Python详细示例](https://github.com/SeleniumHQ/seleniumhq.github.io/blob/trunk/examples/python/tests/waits/test_waits.py#L41-L42)

### Waiting with Expected Conditions
等待条件，与显式等待搭配使用
| 方法 | 描述
| :-- | :--
| title_is | 当前页面title是否为给定字符串
| title_contains | 当前页面title是否包含给定字符串
| presence_of_element_located | 判断某个元素是否被添加到了DOM树里，并不代表该元素一定可见
| url_contains | URL包含给定字符串
| url_matches | URL匹配给定正则
| url_to_be | URL是否为给定字符串（完全相同）
| url_changes | 与url_to_be判断逻辑相反
| visibility_of_element_located | 判断某个元素是否被添加到了DOM树里，并且该元素可见，宽高都大于0
| visibility_of | 判断给定元素是否可见，如果可见就返回该元素
| presence_of_all_elements_located | 至少有一个presence
| visibility_of_any_elements_located | 至少有一个visibility
| visibility_of_all_elements_located | 是否所有都visibility
| text_to_be_present_in_element | 给定文本是否在指定元素中
| text_to_be_present_in_element_value | 给定文本是否在指定元素value中
| text_to_be_present_in_element_attribute | 给定文本是否在指定元素attribute中
| frame_to_be_available_and_switch_to_it | 是否可以切换到指定frame，可以就切换过去
| invisibility_of_element_located | 判断某个元素不可见或不存在与DOM上
| invisibility_of_element | 判断给定元素不可见或不存在与DOM上
| element_to_be_clickable | 判断某个元素可见并且可点击
| staleness_of | 等待某个元素从DOM中移除
| element_to_be_selected | 判断给定元是否被选择
| element_located_to_be_selected | 判断某个元素是否被选中
| element_selection_state_to_be | 判断给定元素选中状态
| element_located_selection_state_to_be | 判断某个元素选中状态
| number_of_windows_to_be | 判断窗口数量
| new_window_is_opened |
| alert_is_present |
| element_attribute_to_include |
| any_of | 多个条件中的任意一个为true
| all_of | 给定的多个条件中所有条件都为true
| none_of | 给定的多个条件中所有条件都为false
```python
from selenium.webdriver.support import expected_conditions as EC
```

## 鼠标和键盘事件（Actions API）
> 用于向Web浏览器提供虚拟设备输入操作的低级接口。

- Keyboard actions
- Mouse actions
- Pen actions
- Scroll wheel actions

使用示例：
```python
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get('http://www.baidu.com')
clickable = driver.find_element(By.ID, "clickable")
ActionChains(driver)\
    .move_to_element(clickable)\
    .pause(1)\
    .click_and_hold()\
    .pause(1)\
    .send_keys("abc")\
    .perform()
```

## 执行JS脚本
```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get('http://www.baidu.com')

# 返回js中的信息
title = driver.execute_script('return document.title')
print(title)

# 滚动
driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')

# 异步执行
driver.execute_async_script("window.setTimeout(function(){ alert('haha') }, 1000);")
```
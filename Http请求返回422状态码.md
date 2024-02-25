## 422 Unprocessable Entity

> 请求格式正确，但由于含有语义错误，无法响应

出现这个状态码的原因一般是http headers有问题，经过一段时间的排查，发现时`Content-Type`有问题。`Content-Type`设置为`application/json; charset=utf-8;`，但是这里末尾多了个分号，导致了服务端不能正确解析传递过去的json字符串。去掉分号之后解决问题。

## MIME消息

MIME 消息由数据和元数据组成。MIME 元数据由 HTTP headers和 MIME 边界分隔符组成。

- 每个header都是一个以冒号分隔的名称-值对，在它自己的一行上，以 ASCII 序列`<CR><LF>`结束（CR表示回车符，LF表示换行符）

- 分号用于分隔参数

  ```http
  Content-Type: Multipart/Related; boundary=MIME_boundary; type=text/xml

所以Content-Type的value不能以分号结尾。

## 为啥Content-Type设置成multipart/form-data;带分号却没问题呢？

对于Content-Type为`multipart/*`的请求，需要在Content-Type中指定`boundary`参数，该参数是用来作为封装消息数据的多个部分的边界，可以自行设置，也可以由浏览器自动生成，示例如下：

```http
POST /foo HTTP/1.1
Content-Length: 68137
Content-Type: multipart/form-data; boundary=---------------------------974767299852498929531610575

---------------------------974767299852498929531610575
Content-Disposition: form-data; name="description"

some text
---------------------------974767299852498929531610575
Content-Disposition: form-data; name="myFile"; filename="foo.txt"
Content-Type: text/plain

(content of the uploaded file foo.txt)
---------------------------974767299852498929531610575
```

我设置了Content-Type的值为`multipart/form-data;`，虽然带了分号，但是浏览器会自动在后面补充`boundary`参数（不带分号），所以不会出现http 422的问题。



参考：

[MIME消息](https://www.cnblogs.com/cbcye/p/14863760.html)

[MDN Content-Type](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Type)




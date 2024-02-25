## 通过FormData的方式上传文件

### 简单实现

前端代码

```js
<div>
  <input id="file" type="file" />
  <input type="button" value="文件上传" onclick="uploadFile()" />
</div>
<script>
function uploadFile() {
  const file = document.getElementById('file').files[0];
  const xhr = new XMLHttpRequest();
  const fd = new FormData();
  fd.append('file', file);
  xhr.open('POST', 'http://127.0.0.1:8000/upload', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      alert(xhr.responseText);
    }
  };
  xhr.send(fd);
}
</script>
```

Node接收端代码

```js
if(url ==='/upload' && method === 'POST') {
    //文件类型
    const arr = []
    req.on('data', (buffer) => {
      arr.push(buffer);
    })
    req.on('end', () => {
      const buffer = Buffer.concat(arr);
      const content = buffer.toString();
      const result = decodeContent(content);
      const fileName = content.match(/(?<=filename=").*?(?=")/)[0];
      fileStream(fileName).write(result);
      res.writeHead(200, {  'Content-Type': 'text/html; charset=utf-8' });
      res.end('上传完成')
    })
  }

/**
 * @step1 过滤第一行
 * @step2 过滤最后一行
 * @step3 过滤最先出现Content-Disposition的一行
 * @step4 过滤最先出现Content-Type:的一行
 */
const decodeContent = content => {
  let lines = content.split('\n');
  const findFlagNo = (arr, flag) => arr.findIndex(o => o.includes(flag));
  // 查找 ----- Content-Disposition Content-Type 位置并且删除
  const startNo = findFlagNo(lines, '------');
  lines.splice(startNo, 1);
  const ContentDispositionNo = findFlagNo(lines, 'Content-Disposition');
  lines.splice(ContentDispositionNo, 1);
  const ContentTypeNo = findFlagNo(lines, 'Content-Type');
  lines.splice(ContentTypeNo, 1);
  // 最后的 ----- 要在数组末往前找
  const endNo = lines.length - findFlagNo(lines.reverse(), '------') - 1;
  // 先反转回来
  lines.reverse().splice(endNo, 1);
  return Buffer.from(lines.join('\n'));
}
```



### 基于`formidable`库的文件上传

#### Node.js

```js
// server.js 
// 以下代码在mac环境中运行成功
const http = require('http')
const formidable = require('formidable')
const fs = require('fs')

http.createServer(function(req, res) {
    if(req.url === '/uploadform') {
        const formStr = `
            <form action="fileupload" method="post" enctype="multipart/form-data">
                <input type="file" name="filetoupload">
                <input type="submit" value="Upload">
            </form>
            `

        res.writeHead(200, { 'Content-Type': "text/html; charset=UTF-8"})
        res.write(formStr)
        return res.end()
    } else if(req.url === '/fileupload') {
        const form = new formidable.IncomingForm()

        form.parse(req, (err, fields, files) => {
            const file = files.filetoupload
            const uploadPath = process.cwd() + '/upload'
            if(!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath)
            }

            fs.rename(file.filepath, uploadPath + '/' + file.originalFilename, function(err) {
                if(err) throw err

                res.write('File uploaded and moved!')
                res.end()
            })
        })
    }
}).listen(8086)
```

安装对应依赖包，执行`node server.js`命令，然后访问`localhost:8086/uploadform`即可访问文件上传界面

#### Koa.js

```js
const koa = require('koa')
const formidable = require('formidable')

const app = new koa()

app.on('error', err => {
    console.error('server error', err)
})

app.use(async (ctx, next) => {
    if (ctx.url === '/uploadform') {
        const formStr = `
            <form action="fileupload" method="post" enctype="multipart/form-data">
                <input type="file" name="filetoupload">
                <input type="submit" value="Upload">
            </form>
            `

        ctx.status = 200
        ctx.body = formStr
        ctx.set('Content-Type', 'text/html; charset=UTF-8')
    } else if (ctx.url === '/fileupload') {
        const form = formidable({});

        await new Promise((resolve, reject) => {
            form.parse(ctx.req, (err, fields, files) => {
                if (err) {
                    reject(err);
                    return;
                }

                ctx.set('Content-Type', 'application/json');
                ctx.status = 200;
                ctx.state = { fields, files };
                ctx.body = JSON.stringify(ctx.state, null, 2);
                resolve();
            });
        });

        await next();
    }
})

app.use((ctx) => {
    console.log('The next middleware is called');
    console.log('Results:', ctx.state);
});

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});
```

### 上传文件时对文件进行操作

有时候我们在上传文件时，需要对文件进行一些操作，等待这些操作执行成功后，才能返回结果。比如上传一个包含多个UTF-8文本文件的zip压缩包，在上传后对文件进行解压，然后读取解压后文件的内容。

```js
const fs = require('fs')
const util = require('util')
const stream = require('stream')
const pipeline = util.promisify(stream.pipeline)
const compressing = require('compressing')
const fsExtra = require('fs-extra')

// 基于koa.js
app.use(async (ctx) {
  if(ctx.url === '/fileupload') {
  	const file = ctx.request.files.uploadFile
    const reader = fs.createReadStream(file.filepath, { encoding: 'binary'})        

    // 写入二进制文件(zip)
    const filePath = process.cwd() + '/public/upload'
    if(!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath)
    }

    const fileName = decodeURIComponent(file.originalFilename)
    const writer = fs.createWriteStream(filePath + '/' + fileName, { encoding: 'binary'})
    await pipeline(reader, writer)

    // 解压zip文件
    const unzipPath = filePath + '/' + fileName.substring(0, fileName.length - 4)
    if(!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath)
    }

    await compressing.zip.uncompress(filePath + '/' + fileName, unzipPath)


    // 读取解压后的文件的文本内容
    const files = fs.readdirSync(unzipPath)
    for(let i = 0; i < files.length; i++) {
      const unzipFile = files[i]
      const fileStat = fs.statSync(unzipPath + '/' + unzipFile)
      if(fileStat.isFile()) {
        const content = fs.readFileSync(unzipPath + '/' + unzipFile, { encoding: 'utf-8' })
        console.log(content)
      }
    }

    // 删除zip文件和解压后的文件
    fs.unlink(filePath + '/' + fileName, (err) => {
      if(err) {
        console.log(err)
      }
    })

    fsExtra.remove(unzipPath, (err) => {
      if(err) {
        console.log(err)
      }
    })

    ctx.status = 200
	}
})
```



## 不使用FormData的方式来上传文件

### 直接上传File实例

From表单是一种规范，我就不遵守规范可以吗？当然可以，不遵守规范即代表你用了新的规范，或者说不叫规范，而是一种前后端都认可的方式，只要你的后端支持就好。

**文件上传的实质是上传文件的内容以及文件的格式，当我们使用HTML提供的Input上传文件的时候，它将文件的内容读进内存里，那我们直接将内存里的数据当成普通的数据提交到服务端可以么？看下面的例子。**

```js
<!-- 前端代码：-->
<div>
  <input id="file" type="file" />
  <input type="button" value="文件上传" onclick="uploadFile()" />
</div>
<script>
  function uploadFile() {
    const file = document.getElementById('file').files[0];
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://127.0.0.1:8000/upload?name=${file.name}`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        alert(xhr.responseText);
      }
      }
    xhr.send(file);
  }
</script>

// Nodejs服务端代码
...
if(reqUrl.pathname ==='/upload' && method === 'POST') {
  const fileName = qs.parse(reqUrl.query).name;
  req.pipe(fileStream(fileName));
  req.on('end', () => {
    res.writeHead(200, {  'Content-Type': 'text/html; charset=utf-8' });
    res.end('上传完成');
  })
}
...
```

### File

赋值给`file`变量的是一个`File`对象构造的实例，`File`对象继承自`Blob`，并扩展了与文件系统相关的功能

### FileReader

FileReader 是一个对象，其唯一目的是从 Blob（因此也从 File）对象中读取数据。

读取数据的方法有以下四种：

1. [`readAsArrayBuffer()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer)
2. [`readAsBinaryString()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsBinaryString)
3. [`readAsDataURL()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsDataURL)
4. [`readAsText()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsText)

读取文件示例：

```html
<input type="file" onchange="readFile(this)">

<script>
function readFile(input) {
  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    console.log(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };

}
</script>
```

### 使用FileReader的readAsDataURL方法读取文件内容转换为Base64字符串后上传



参考：

[Node.js 文件上传](https://www.cainiaojc.com/nodejs/node-js-upload-file-to-server.html)

[揭秘前端文件上传原理（一）](https://cloud.tencent.com/developer/article/1500791)

[揭秘前端文件上传原理（二）](https://cloud.tencent.com/developer/article/1500598?from=article.detail.1500791)

[File 和 FileReader](https://zh.javascript.info/file)

[通过异步迭代简化 Node.js 流](https://tie.pub/2019/11/nodejs-streams-async-iteration/)

[Node.js stream](https://nodejs.org/api/stream.html)
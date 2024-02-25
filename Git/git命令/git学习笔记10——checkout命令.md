## 含义

> Switch branches or restore working tree files.
>
> 切换分支或还原工作树文件。



## 用法

我们先看看checkout的本质：签出到指定的commit，就是把HEAD指向指定的commit。所以checkout的目标既可以是branch，也可以是其它commit。

```bash
git checkout HEAD^^

git checkout master
```

### git checkout -- \<file>

> 撤销对文件的修改

```bash
git checkout -- readme.md
```

命令`git checkout -- readme.txt`意思就是，把`readme.txt`文件在工作区的修改全部撤销，这里有两种情况：

一种是`readme.txt`自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态；

一种是`readme.txt`已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。

总之，就是让这个文件回到最近一次`git commit`或`git add`时的状态。



> 如何撤销git add命令添加到暂存区的文件呢？
>
> 使用前面的reset命令`git reset HEAD <file>`

参见[Git 基础 - 撤消操作](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E6%92%A4%E6%B6%88%E6%93%8D%E4%BD%9C)



### git checkout --detach

> 执行这行代码，Git 就会把 `HEAD` 和 `branch` 脱离，直接指向当前 `commit`。


## 含义

> Revert some existing commits.
>
> 撤销已存在的commit（通过参数指定）

## 用法

一般用于撤销已经提交到远端且合并到其他分支的commit（比如：需要撤销的commit已经从dev合并到master）。如果只是推送到当前分支的远端且不会影响到其他人，可以通过在本地丢弃需要撤销的commit，然后使用`git push -f`就好了。

### 例子

```bash
git revert HEAD^
```


### 应用场景

> 我们经常会遇到这样一种情况，正在某个分支上开发新功能，但这时候有一个紧急bug需要我们呢马上修改，但是新功能只做了一半又不想提交，这时候就可以使用`git stash`命令先把当前进度保存起来，然后切换到另一个分支上去修改bug，修改完bug并提交后，再切回原来的分支，使用`git stash pop`来恢复之前的进度继续开发新功能。

### git stash

> git stash不带任何参数时就等同于git stash push。最新的stash存储在`.git/refs/stash`文件中，其它较旧的stash在该文件的引用的引用日志中可以找到。

### git stash push

> 暂存当前所有未提交的修改。

- -m参数，对本次stash的描述信息
- -a参数，在.gitignore中的文件和untracked（未跟踪）的文件也会被暂存
- -u参数，untracked的文件也会被暂存

### git stash apply [\<stash name>]

> 将指定的stash应用到当前工作目录，未指定stash时，默认为最新的stash。apply在出现conflict时会失败。

### git stash drop [\<stash name>]

> 从stash列表中删除指定的stash

### git stash pop [\<stash name>]

> 相当于先执行apply，再执行drop

### git stash clear

> 清空当前存在的所有stash

### git stash list

> 列出当前存在的所有stash

### git stash show [\<stash name>]

> 显示stash中暂存的更改内容（与创建stash时所在的commit比较）

### git stash branch \<branchname> [\<stash name>]

> 从创建stash时所在的commit创建新的分支，并把stash中存储的更改应用到该分支。
>
> 经常应用于当某个stash存在conflict而apply失败的场景。




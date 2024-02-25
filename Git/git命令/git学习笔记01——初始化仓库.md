## 初始化一个git仓库，并推送到github

先在github创建一个仓库，这里是`Git-Command-Study`，然后在本地创建一个文件夹后，在目录中执行如下命令：

```shell
# 初始化当前目录为git仓库，执行完后，会在当前目录生成一个.git目录
$ git init
Initialized empty Git repository in D:/Code/Git-Command-Study/.git/

# 将当前仓库链接到github的远程仓库
$ git remote add origin https://github.com/gitUsername/Git-Command-Study.git

# 新建一个文件，然后继续

# 查看working tree状态，可以看到我这边新建了一个.gitingnore文件
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .gitignore

nothing added to commit but untracked files present (use "git add" to track)

# 将.gitignore文件添加到索引，再查看状态
$ git add .gitignore
$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)

        new file:   .gitignore

# 提交.gitignore文件
$ git commit -m 添加gitignore文件
[master (root-commit) 548bb26] 添加gitignore文件
 1 file changed, 1 insertion(+)
 create mode 100644 .gitignore

# 配置当前仓库的用户名密码

# 查看config配置
$ git config --local --list
core.repositoryformatversion=0
core.filemode=false
core.bare=false
core.logallrefupdates=true
core.symlinks=false
core.ignorecase=true
remote.origin.url=https://github.com/gitUsername/Git-Command-Study.git
remote.origin.fetch=+refs/heads/*:refs/remotes/origin/*

# 设置用户名&邮箱
$ git config --local user.name "username"
$ git config --local user.email "email"

# 设置保存密码
$ git config --local credential.helper store

# 提交代码
$ git push origin master

# 第一次提交代码需要输入用户名密码，由于配置了保存密码，后面就不用输入了
```

### git add

> 用于将文件内容添加到索引

- -**\<pathspec>**

  指定具体的文件或路径

- -f

  用于添加在.gitignore中的文件

### 撤销创建仓库后第一次提交的 commit

```bash
git update-ref -d HEAD
```






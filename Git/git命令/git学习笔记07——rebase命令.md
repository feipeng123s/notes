## 含义

> Reapply commits on top of another base tip.
>
> 以指定的目标commit为基础，将当前所在commit所在的commit串（从分叉位置起）重新提交一次。并且当前分支的指针也会移到重新提交后的commit所在位置。

## 用法

### 示例

使用rebase命令将，feature分支上的commit合到develop分支上：

```shell
# 从develop分支切到feature分支
git checkout feature

# 将feature分支上的commit以develop所在commit为基础再提交一次
git rebase develop

# 切记需要切回develop分支merge一次
git checkout develop
git merge feature
```



### rebase黄金定律

**永远不要rebase一个已经在中央仓库中存在的分支，只能rebase你自己使用的私有分支。**



### git rebase -i/--interactive

**交互式rebase**

列出将要进行rebase的commit，让用户在rebase之前先编辑这些commit。此模式还可用于拆分commit。

#### 用于修改commit

如果我们要修改最新的一次commit，使用git commit --amend即可完成，如果不是最新的commit要修改，我们就需要使用git rebase -i

假设是倒数第二个commit需要修改：

1. 开启交互式过程

   ```shell
   git rebase -i HEAD^^
   ```

   > 说明：在 Git 中，有两个「偏移符号」： `^` 和 `~`。
   >
   > `^` 的用法：在 `commit` 的后面加一个或多个 `^` 号，可以把 `commit` 往回偏移，偏移的数量是 `^` 的数量。例如：`master^` 表示 `master` 指向的 `commit` 之前的那个 `commit`； `HEAD^^` 表示 `HEAD` 所指向的 `commit` 往前数两个 `commit`。
   >
   > `~` 的用法：在 `commit` 的后面加上 `~` 号和一个数，可以把 `commit` 往回偏移，偏移的数量是 `~` 号后面的数。例如：`HEAD~5` 表示 `HEAD` 指向的 `commit`往前数 5 个 `commit`。

   

   执行上面这行命令之后，会弹出git editor展示如下script供我们处理：

   ```shell
   pick dbb7f53 倒数第二个修改
   pick c591fd7 倒数第一个修改
   # Rebase 34ae1ae..dbb7f53 onto 34ae1ae
   #
   # Commands:
   # p, pick = use commit
   # r, reword = use commit, but edit the commit message
   # e, edit = use commit, but stop for amending
   # s, squash = use commit, but meld into previous commit
   # f, fixup = like "squash", but discard this commit's log message
   # x, exec = run command (the rest of the line) using shell
   #
   # These lines can be re-ordered; they are executed from top to bottom.
   #
   # If you remove a line here THAT COMMIT WILL BE LOST.
   #
   # However, if you remove everything, the rebase will be aborted. #
   # Note that empty commits are commented out
   ```

   需要注意的是这个列表是按时间顺序排的，刚好与git log的顺序相反。

   如果把某一行的commit信息删掉，那就相当于在 `rebase` 的过程中跳过了这个 `commit`，从而也就把这个 `commit` 撤销掉了。

2. 在git editor界面中选择commit和对应的操作

   我们的目标是修改倒数第二个commit，对应的SHA-1值为`dbb7f53`，将它前面的pick改成edit，然后保存退出。这时会提示rebase已经停在了倒数第二个commit的位置，等待你去修改。

3. 修改commit

   在修改完成之后，使用`git commit --amend`命令来把修改应用在当前停留的commit上

4. 继续rebase过程

   在更改完成之后，使用`git rebase --continue`来继续rebase过程，把后面的commit直接应用上去。

   

### git rebase --onto

用于指定rebase的起点。

`--onto`后面有三个附加参数：目标commit，起点commit（注意：rebase时不包含起点），终点commit。

在不使用--onto选项时，rebase的起点时自动判定的：选取当前commit和目标commit在历史上的交叉点作为起点。

```shell
git rebase --onto master dev~3 dev
```

#### 用于撤销commit

由上可知，git rebase -i可以撤销commit。而使用--onto也可以撤销提交：

```shell
git rebase --onto HEAD^^ HEAD^^ dev
```




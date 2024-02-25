## 含义

> Apply the changes introduced by some existing commits
>
> 应用一些现有的提交引入的更改。
>
> 通俗点讲，就是将指定的（一个或多个）commit中引入的更改作为新的commit应用到当前分支，指定的commit的有几个，新创建的commit就有几个

举例来说，代码仓库有`master`和`feature`两个分支：

```
a - b - c - d   Master
         \
           e - f - g Feature
```

现在将提交f引用到master分支

```bash
git checkout master

git cherry-pick f
```

上面的操作完成以后，代码库就变成了下面的样子：

```
a - b - c - d - h   Master
         \
           e - f - g Feature
```

可以看到Mater分支多了一个新的提交h，提交h和提交f更改的内容一致，但是他们的hash值是不同的

## 用法

### git cherry-pick -e(--edit)

用于在提交之前编辑commit信息

### git cherry-pick -n(--no-commit)

不创建新的提交，只将制定commit中的更改应用到当前工作区和暂存区

## 代码冲突用法

> 如果操作过程中发生代码冲突，Cherry pick 会停下来，让用户决定如何继续操作。

### --continue

用户解决代码冲突后，第一步将修改的文件重新加入暂存区（`git add .`），第二步使用下面的命令，让 Cherry pick 过程继续执行

### --abort

发生代码冲突后，放弃合并，回到操作前的样子

### --quit

发生代码冲突后，退出 Cherry pick，但是不回到操作前的样子



## 转移多个提交

- 一次转移A、B两个提交

  ```bash
   git cherry-pick <HashA> <HashB>
  ```

- 一次转移AB之间连续的多个提交（不包含A，且A提交早于B）

  ```bash
  git cherry-pick A..B 
  ```

- 一次转移AB之间连续的多个提交（包含A，且A提交早于B）

  ```bash
  git cherry-pick A^..B 
  ```

  


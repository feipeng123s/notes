### git log

> 查看commit历史记录，显示commit id及一些概要信息

- -p参数，显示每个commit的详细信息
- --stat参数，显示简要统计信息

### git show

> 用在commit时，显示指定commit的详细信息

- git show \<commit id> filename：查看指定commit中的指定文件

### git diff

- --cached

  比较暂存区和最近的commit之间的不同

- 不接参数

  比较working tree和暂存区之间的不同

- git diff HEAD

  比较working tree和最近的commit之间的不同，HEAD也可以换成其他commit

- git diff commit commit

  比较两个commit之间的不同
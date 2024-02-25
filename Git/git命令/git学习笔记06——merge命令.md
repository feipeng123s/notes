## 含义

> Join two or more development histories together.
>
> 从目标commit和当前commit（即HEAD所指向的commit）分叉的位置起，把目标commit的路径上所有commit的内容一并应用到当前commit，然后自动生成一个新的commit。

- pull的内部操作其实是把远程仓库取到（fetch）本地后，再用一次merge来把远端仓库的新commit合并到本地。<==>1.git fetch; 2.git merge origin/branchName
- git merge应该只用于为了保留一个有用的，语义化的准确的历史信息，而希望将一个分支的整个变更集成到另外一个branch时使用。这样形成的清晰版本变更图有着重要的价值。

## 特殊情况

### HEAD领先于目标commit

> 当目标commit和HEAD所在commit并不存在分叉，而是HEAD领先于目标commit，此时merge不会创建一个新的commit来进行合并操作，因为并没有什么需要合并的。在这种情况下，git什么也不会做，merge是一个空操作。

### HEAD落后于目标commit

> 如果HEAD和目标commit依然不存在分叉，但HEAD落后于目标commit，那么git会直接把HEAD（以及他所指向的branch）移动到commit，此时也不会创建新的commit。这种操作有一个专有称谓，叫做**fast-forward**（快速前移）。

## 用法

- `git merge --abort`

  用于取消merge，执行这行命令，git仓库就会回到merge前的状态

- `git merge --ff`

  --ff也就是fast-forward，当指定合并的历史记录是当前历史记录的后代时（HEAD落后于目标commit的情况），默认为--ff。除非合并为存储在refs/tags/层次结构中起自然位置的带注释的标签，在这种情况下，则假定为--no-ff。

  使用--ff时，在可能的情况下将合并解析为fast-forward，仅移动指针，不创建合并commit；如果不可能（当合并的历史记录不是当前历史记录的后代时），则创建一个合并commit。

- `git merge --no-ff`

  使用--no-ff时，在所有的情况下都会创建一个合并commit，即使合并情况可以改为fast-forward。

- `git merge --ff-only`

  使用--ff-only时，在可能的情况下将合并解析为fast-forward。如果不可能，则拒绝合并并以非零状态退出。



> 在多数情况下，我们为了追踪分支的合并情况，都推荐使用--no-ff。




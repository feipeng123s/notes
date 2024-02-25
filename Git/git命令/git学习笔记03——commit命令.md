> git commit命令主要是讲暂存区里的改动提交到本地的版本库。每次使用git commit命令时，都会在本地版本库生成一个40位的哈希值（commit id）。

### git commit -m "message"

- -m参数表示后面的输入“message”为本次提交的描述信息（不能有空格）；

- 若不加-m参数，则会调用一个编辑器（一般是vim）来让你输入这段描述（可以有空格）。

- 使用多个-m参数时，后面的message会独立为一个段落

- -m后面的message如果很长，可以使用如下格式，它会按照你的输入分段

  ```bash
  $ git commit -m '
  > 描述1
  > 描述2'
  [master 0923cc6] 描述1 描述2
   1 file changed, 0 insertions(+), 0 deletions(-)
   create mode 100644 b.txt
   
  $ git log
  commit 0923cc6f7171cbdcd07776015ce8d012142d97c4 (HEAD -> master)
  Author: ** <**@qq.com>
  Date:   Mon Apr 13 00:27:06 2020 +0800
  
      描述1
      描述2
  ```



### git commit --amend

> 追加提交，在不增加新commit的情况下，将新修改追加到前一次的commit中。

注意：前一次的commit必须没有push到远端，否则，再次push时回报冲突，还需要先把提交的远端的commit拉取merge到本地，才能提交。




## 含义

> Reset current HEAD to the specified state.
>
> 将当前HEAD重置到指定位置。
>
> reset的本质：移动HEAD以及它所指向的branch

## 用法

### 示例

```bash
git reset --hard HEAD^
```

### reset --hard：重置工作目录

> `reset --hard` 会在重置 `HEAD` 和 `branch` 的同时，重置工作目录里的内容。当你在 `reset` 后面加了 `--hard` 参数时，你的工作目录里的内容会被完全重置为和 `HEAD` 的新位置相同的内容。换句话说，就是你的未提交的修改会被全部擦掉。

### reset --soft：保留工作目录

> `reset --soft` 会在重置 `HEAD` 和 `branch` 时，保留工作目录和暂存区中的内容，并把重置 `HEAD` 所带来的新的差异放进暂存区。

### reset --mixed（默认）：保留工作目录，并清空暂存区

> `reset` 如果不加参数，那么默认使用 `--mixed` 参数。它的行为是：保留工作目录，并且清空暂存区。也就是说，工作目录的修改、暂存区的内容以及由 `reset` 所导致的新的文件差异，都会被放进工作目录。简而言之，就是「把所有差异都混合（mixed）放在工作目录中」。

### git reset HEAD \<file>

> 撤销使用git add命令添加到暂存区中的文件。

```bash
git reset HEAD readme.md
```


## 含义

> Manage reflog information.
>
> 管理引用日志信息

## 用法

 ### git reflog [show]

- git reflog

  不指定引用时，默认显示HEAD的移动历史

- git reflog master

  查看master的移动历史

### 找回被删除的branch

```bash
# 找到删除branch时所在的位置
git reflog

# 使用checkout回到该位置，然后重新创建branch
git checkout c08de9a
git checkout -b branchname
```


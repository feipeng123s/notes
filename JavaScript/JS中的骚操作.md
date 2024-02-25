`null + "" = "null"`

`null + [] = "null"`

`null + null = 0`

原理：加性操作副的运算规则

1. 两个操作数都为数值，执行常规加法计算
   - Infinity + Infinity = Infinity
   - -Infinity + (-Infinity) = -Infinity
   - Infinity + (-Infinity) = NaN
   - NaN + * =NaN
2. 操作数中含有字符串
   - 都是字符串，按字符串拼接
   - 有一个字符串，将另一个转换为字符串之后按字符串拼接
3. 有一个操作数是对象，数值或布尔值，调用它们的toString方法取得相应的字符串值，然后再应用前面的字符串规则。对于null和undefined，则分别调用String()函数取并取得字符串"null"和"undefined"。
4. 如果两者都不是字符串，则两者都被强制转换为数字并完成添加。

> `[]`调用toString方法得到`""`，故null + [] = "null"

> 所以null被强制转换为一个数字，即Number(null)=0，所以你得到的是0 + 0，当然是0。同理，`undefined + undefined = NaN`





参考：

1. [Why is null+null = 0 in javascript](https://stackoverflow.com/questions/39315250/why-is-nullnull-0-in-javascript)
2. [Ecma-262](<https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf>)


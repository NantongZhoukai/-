# 自己学习时写的一些js插件
---------
> codeCreator
#####   [codeCreator.html](https://github.com/NantongZhoukai/-/blob/master/js/codeCreate.html) 这是一个vscode上 的表达式生成代码的js实现
##### 列如  `div>select.sss>(option[name='>dwa$^&*().']>li)*4`
##### 最后将 生成 `<div  ><select  class='sss'  ><option  name=">dwa$^&*()."><li  ></li></option><option  name=">dwa$^&*()."><li  ></li></option><option  name=">dwa$^&*()."><li  ></li></option><option  name=">dwa$^&*()."><li  ></li></option></select></div>`
```
剩余问题：
1.对引号中转移字符的处理效率低下
2.对换行符未做处理
3.有些多余的空格
```

> template
##### [template.html](https://github.com/NantongZhoukai/-/blob/master/js/template-test.html)这个是页面模板生成引擎 暂时写了[上下文操作部分](https://github.com/NantongZhoukai/-/blob/master/js/template-contextHandler%E6%A8%A1%E5%9D%97%E6%B5%8B%E8%AF%95.html) 和将文本解析成treeObject的[一部分](https://github.com/NantongZhoukai/-/blob/master/js/template-treeCreator%E6%A8%A1%E5%9D%97%E6%B5%8B%E8%AF%95.html)


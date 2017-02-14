1.IIFE immediately-invoked function expression
    (function(){})()
    (function(global, factory){}(this, function(){})

2. 检测对象类型
    `toString` 方法检测对象类型  
    在` Object`类型中, `toString` 定义为检测对象类型
    在其他引用类型中, 则重新定义为将对象转变为字符串  
    
    在` underscore`中使用了如下方法

        var toString = Object.prototype.toString;
        toString.call(param);

    在` zepto`中使用如下方法

        var obj = {},
            toString = obj.toString;


3. window.getComputedStyle(elem[, pseudoEle]).property  
    获取元素计算后的样式

    `getComputedStyle` 是`window`的属性, 使用时可以` window.getComputedStyle(ele, '')`或者 `getComputedStyle(ele, '')`

4. element.matches(selectorString)
    当前元素被 css 选择器查找到, 返回布尔值  
    `selectorString` 是 css 选择器, 如 `.foo`, `#bar`, `div .bar`等
    `mozMatchesSelector`, `webkitMatchesSelector`, `oMatchesSelector`, `matchesSelector`

5. element.querySelector(selectorString), element.querySelectorAll(selectorString)
    `selectorString`是 css 选择器
    返回 `element` 下具有该选择器的第一个对象, 或者是具有该选择器的对象集合

15. document.documentElement 获取根元素, 如 html文档中获取 html 元素
      
16. getAttribute(name) 获取属性, 若不存在返回 `null`, setAttribute(name, value) 添加属性/修改属性 和 removeAttribute(name)移除属性

17. node.className

18. ele.parentNode

19. ele.childNodes
    获得子级元素, 包括空格/换行符, 标签, 注释

6. match = ~zepto.qsa(parent, selector).indexOf(element);
    使用了按位非  
    ~-1 => 0, ~0 => -1, ~1 => -2, ~2 => -3
    Boolean(0) => false; Boolean(-1) => true

7. 除了 NaN 以及 0 以外, 布尔值都为 true

8. `split(' ')` 将字符串转为数组, `join('|')`将数组转为字符串

9. js 中的方法属性规律
    关键字:typeof obj, o instanceof Obj
    方法:indexOf(), getPrototypeOf(), 

10. var str = 'abcdef'  
    str[0] => a; str[1] => b;

11. filter 返回满足 function条件的值的集合

12. map 返回 function返回值的集合

13. 深复制和浅复制
    浅复制, 只复制一层对象的属性, 若属性值为数组或对象, 只复制指向数组或对象的指针, 若复制者或被复制者任一方改变, 另一方也会发生相应变化
    深复制, 递归复制所有层级属性, 复制者和被复制者后面没任何联系

        var target = {}, source = { a: 1, arr: [1, 2, 4], obj: {a: 2, b: 2} }
        浅复制: target.arr 的指针指向 source.arr
        target.arr[0] = 5;
        source.arr[0] //5

14. 运算优先级

    a || b ? c : d
    先运算 a || b 然后在执行 ? :

    var test = a ? b : c
    先进行a ? b : c 后进行 = 运算


## $如何实现获取对象, 并给 dom 对象添加属性和方法
```javascript
var Zepto = (function(){
        function Z(dom, selector) {
            var i, length = dom.length ? dom.length : 0;
            for(i = 0; i < length; i++) {
                this[i] = dom[i];
                this.selector = selector || '';
                this.length = length;
            }
        }
        Z.prototype = $.fn;
        zepto.Z = function(dom, selector) {
            return new Z(dom, selector);
        }
        zepto.init = function(selector, context) {
            //创建新的 dom 元素, 添加属性以及值
            //获取 dom 对象
            //返回 dom 对象
            
            //返回对象
            //dom 加载完毕后, 执行函数
            //

            //返回一个构造函数 Z 的实例
            return zepto.Z(dom, selector);
        }
        $ = function(selector, context) {
            return zepto.init(selector, context);
        }
    })()

//设置全局变量Zepto
window.Zepto = Zepto;
//添加全局变量$
window.$ === undefined && (window.$ = Zepto);
```

//IIFE
(function(global, factory){
  ...
}(this, function(window){
  //this, function(window){}, 为两个参数

  //core
  var Zepto = (function(){})();//8-939

  window.Zepto = Zepto//941
  window.$ === undefined && (window.$ = Zepto)//942

  //event
  ;(function($){})(Zepto)//944-1214

  //ajax
  ;(function($){})(Zepto)//1216-1594

  //form
  ;(function($){})(Zepto)//1596-1631

  ;(function(){})()//1633-1648

  return Zepto;//1649
}));

(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() { return factory(global) });
  } else {
    factory(global);
  }
}(this, function(window) {
  var Zepto = (function(){
    var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
      document = window.document,
      elementDisplay = {}, classCache = {},
      cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'zoom': 1 },
      //<tag> <!>
      fragmentRE = /^\s*<(\w+|!)[^>]*>/,//由x >= 0个不可见字符(空格, 回车, 换行符等)开始, 然后<然后>=1个字母数字或者!以>开始>=0个然后>
      //<tag /> <tag></tag>
      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      //类似的非如下标签 <tag: />???
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      //匹配以 body 或 html 开头且结尾, 区分大小写
      rootNodeRE = /^(?:body|html)$/i,
      //大写
      capitalRE = /([A-Z])/g,

      methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

      adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
      table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      containers = {
        'tr': document.createElement('tbody'),
        'tbody': table, 'thead': table, 'tfoot': table,
        'td': tableRow, 'th': tableRow,
        '*': document.createElement('div')
      },
      readyRE = /complete|loaded|interactive/,
      simpleSelectorRE = /^[\w-]*$/,//simple-selector
      class2type = {},
      toString = class2type.toString,//引用类型对象的类型
      zepto = {},
      camelize, uniq,
      tempParent = document.createElement('div'),
      propMap = {
        'tabindex': 'tabIndex',
        'readonly': 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        'maxlength': 'maxLength',
        'cellspacing': 'cellSpacing',
        'cellpadding': 'cellPadding',
        'rowspan': 'rowSpan',
        'colspan': 'colSpan',
        'usemap': 'useMap',
        'fragmeborder': 'frameBorder',
        'contenteditable': 'contentEditable'
      },
      isArray = Array.isArray ||
          function(object) { return object instanceof Array };

    //检测当前元素是否能被 css 选择器查找到`selector`
    zepto.matches = function(element, selector) {
      if (!selector || !element || element.nodeType !== 1) {
        return false;
      }
      //调用浏览器自带的检测属性
      var matchesSelector = element.matches || element.webkitMatchesSelector ||
                            element.mozMatchesSelector || element.pMatchesSelector ||
                            element.matchesSelector;
      if (matchesSelector) {
        return matchesSelector.call(element, selector);
      }

      var match, parent = element.parentNode, temp = !parent;
      if (temp) {
        (parent = tempParent).appendChild(element);
      }
      //zepto.qsa(), querySelectorAll(), 优化了`#id`
      //indexOf, 若不存在, 返回-1, 若存在返回位置数值, 其中包括 0
      //~-1 => 0; ~0 =>-1, ~1 => -2
      //除了0以外其他数值的布尔值为 true
      match = ~zepto.qsa(parent, selector).indexOf(element);
      temp && tempParent.removeChild(element);
      return match;
  }


    //判断 obj 的类型 "array", "function"等
    function type(obj) {
      return obj == null ? String(obj) :
      //`toString.call(obj)` 返回 obj 类型,
      // 而class2type[object class] 的值通过下面的函数, 进行了修改
      class2type[toString.call(obj)] || "object";
      //$.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
      //class2type[ "[object " + name + "]" ] = name.toLowerCase()
      //})
    }

    function isFunction(value) {
      return type(value) == "function";
    }

    function isWindow(obj) {
      return obj != null && obj == obj.window;
    }

    function isDocument(obj) {
      return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }

    function isObject(obj) {
      return type(obj) == "object";
    }


    //对象中的 `object`属性
    //引用类型中的`object`类型
    function isPlainObject(obj) {
      return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    //类数组
    //var obj {
    //1: 'a',
    //2: 'v',
    //length: 2 || 3
    //}
    function likeArray(obj) {
      //property in obj 属性在 obj 中遍历
      var length = !!obj && 'length' in obj && obj.length,
        type = $.type(obj);

      return 'function' != type && !isWindow(obj) && (
        'array' == type || length === 0 ||
          (typeof length == 'number' && length > 0 && (length - 1) in obj)
      );
    }

    //返回一个数组, 该数组空元素被过滤掉
    function compact(array) {
      return filter.call(array, function(item) {
        return item != null;
      });
    }

    //???
    //应该是复制数组?
    function flatten(array) {
      return array.length > 0 ? $.fn.concat.apply([],array) : array;
    }
    /*
     *    concat: function(){
     *      var i, value, args = []
     *      for (i = 0; i < arguments.length; i++) {
     *        value = arguments[i]
     *        args[i] = zepto.isZ(value) ? value.toArray() : value
     *      }
     *      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
     *    },
     */

    //hello-world =>. helloWorld
    //helloWorld => helloWorld
    camelize = function(str) {
      // /-+(.)?/g  -+ 匹配 - {1,}  (.)?匹配非换行符以外的任意字符{0,1}
      return str.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    }

    //AASAa => AASA_a => aasa-a
    //a1A => a1_A => a1-a
    function dasherize(str) {
      return str.replace(/::/g, '/')
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                .replace(/_/g, '-')
                .toLowerCase();
    }

    //检测数组元素值是否是唯一的
    uniq = function(array) {
      return filter.call(array, function(item, idx) {
        return array.indexOf(item) == idx;
      });
    };

    //
    function classRE(name) {
      return name in classCache ?

        //new RegExp('(^|\\s)' + name + '(\\s|$)')
        ///(^|\s) (\s|$)
        //| name |
        classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    //
    function maybeAddPx(name, value) {
      return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
    }

    //nodeName 原本的 display 值
    function defaultDisplay(nodeName) {
      var element, display;
      if (!elementDisplay[nodeName]) {
        //通过往 body 中添加元素, 然后获取浏览器计算的 display 的值,
        //也就是元素一般都有默认的 display 的值
        //获取值后, 再移除添加到 body 的标签
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = getComputedStyle(element, '').getPropertyValue("display");
        element.parentNode.removeChild(element);
        display == "none" && (display = "block");
        elementDisplay[nodeName] = display;
      }
      return elementDisplay[nodeName];
    }


    //返回一个子级的数组
    function children(element) {
      //?此行不是特别懂
      return 'children' in element ?
        slice.call(element.children) :
        //$.map() 返回一个数组
        $.map(element.childrenNodes, function(node) {
          if (node.nodeType == 1) {
            return node;
          }
        });
    }

    //
    function Z(dom, selector) {
      var i, len = dom ? dom.length : 0;
      for (var i = 0; i < len; i++) {
        this[i] = dom[i];
        this.length = len;
        this.selector = selector || '';
      }
    }

    //返回 html中第一个标签对象, 并添加 properties 属性
    //如 html 值为 '<div><a>)' 返回值为 div 的 nodeList
    zepto.fragment = function(html, name, properties) {
      var dom, nodes, container;

      //如果是个标签<input />, <a></a>
      if (singleTagRE.test(html)) {
        //创建标签, 并获得这个对象
        dom = $(document.createElement(RegExp.$1));
      }

      //如果不是单纯的标签
      if (!dom) {
        //???? <app+/> => <app></app+>
        if (html.replace) {
          html = html.replace(tagExpanderRE, "<$1></$2>");
        }

        if (name === undefined) {
          //html: <  aaa *#!>
          //name = aaa
          name = fragmentRE.test(html) && RegExp.$1;
        }

        if (!(name in containers)) {
          name = '*';
        }

        container = containers[name];
        //添加 html 为 container 的子级
        container.innerHTML = '' + html;

        //each 返回第一个参数, dom 的值为 container的子级的 nodeList
        dom = $.each(slice.call(container.childNodes), function(){
          container.removeChild(this);
        });
      }

      if (isPlainObject(properties)) {
        nodes = $(dom);
        $.each(properties, function(key, value) {
          if (methodAttributes.indexOf(key) > -1) {
            //如果是 methodAttributes 中的值, 通过 node[key](value) 的方式赋值, 这些是封装好的方法
            //$(dom).val(value)
            nodes[key](value);
          } else {
            nodes.attr(key, value);
          }
        });
      }

      return dom;
    }

    //将给定的 `dom` 数组拥有 `$.fn` 的原型
    //给数组提供 Zepto 的所有方法
    //这个方法可以在插件中被覆盖
    zepto.Z = function(dom, selector) {
      return new Z(dom, selector);
    }

    //如果给定 object 是 Zepto 的集合返回 `true`
    //判断 object 是否是 zepto.Z 的实例
    zepto.isZ = function(object) {
      return object instanceof zepto.Z;
    }

    //类似 jQuery 的`$.fn.init`
    //接受 selector 和一个可选参数 context
    //selector: <div> 获取 div 对象
    //selector: 'div', 获取 content / document 下的 div 对象
    //selector: array, 返回该数组
    //selector: object,返回 object
    //selector: function, dom 加载结束后执行该函数
    //
    zepto.init = function(selector, context) {
      var dom;

      //如果没有传递 selector, 返回一个空的 Zepto 集合
      if (!selector) {
        return zepto.Z();

      //如果 selector 是` string`

      } else if (typeof selector == 'string') {
        selector = selector.trim();

        //如果选择器是一个html 片段, 以该标签创建对象
        //selector: '<div>'
        if (selector[0] == '<' && fragmentRE.test(selector)) {
          dom = zepto.fragment(selector, RegExp.$1, context);

          //selector: 'div', content: 标签, className, id 等
          //获取 content 下的 selector 元素
        } else if (context !== undefined) {
            return $(context).find(selector);

          //selector: 'div', content 为undefined
          //dom 为所有的 div对象
        } else {
            dom = zepto.qsa(document, selector);
        }

      //如果 selector 是一个函数, 在 DOM 加载完成后, 执行该函数
      } else if (isFunction(selector)) {
        return $(document).ready(selector);

      //如果是 Zepto 的集合, 返回该 selector
      } else if (zepto.isZ(selector)) {
         return selector;

      } else {

        //如果 selector 是一个数组, 返回一个不包含空元素的数组
        if (isArray(selector)) {
          dom = compact(selector);

        //如果 selector 是一个对象,
        } else if (isObject(selector)) {
          dom = [selector], selector = null;

        //如果是一个 html片段, 以该片段创建一个 nodes
        } else if (fragmentRE.test(selector)) {
          dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;

        //如果 context 存在, 返回该 context 下的 selector 对象
        } else if (context !== undefined) {
          return $(context).find(selector);

        //如果是 css 选择器, 用它来查找 nodes
        } else {
          dom = zepto.qsa(document, selector);
        }

      }

      //创建一个新的 Zepto 集合
      return zepto.Z(dom, selector);

    }

    $ = function(selector, context) {
      return zepto.init(selector, context);
    };

    //将 source 中属性值不等于` undefined`的属性及值复制到 target 对象中
    //深复制与浅复制
    //deep 为布尔值
    function extend(target, source, deep) {
      for (var key in source) {
        //深复制
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
          if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
            target[key] = {};
          }
          if (isArray(source[key]) && !isArray(target[key])) {
            target[key] = [];
          }
          extend(target[key],source[key], deep);

        //浅复制
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }

    //复制 source 中属性值不为` undefined`的值到 target 中, 并返回 target
    //深复制与浅复制
    //复制一个或多个对象的属性值非` undefined` 的值到 target 对象中
    $.extend = function(target) {
      var deep, args = slice.call(arguments, 1);
      if (typeof target == 'boolean') {
        deep = target;
        target = args.shift();//将参数中第一个值赋值给 target
      }
      args.forEach(function(arg) {
        extend(target, arg, deep)
      });
      return target;
    }

    //like querySelectorAll()
    zepto.qsa = function(element, selector) {
      var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        isSimple = simpleSelectorRE.test(nameOnly);
      return (element.getElementById && isSimple && maybeID) ?
        ( (found = element.getELementById(nameOnly)) ? [found] : [] ) :
        (element.nodeName !== 1 && element.nodeType !== 9 && element.nodeType !== 1) ? [] :
        slice.call(
          isSimple && !maybeID && element.getElementsByClassName ?
            (maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector)) :
            element.querySelectorAll(selector)
        )

    }

    function filtered(nodes, selector) {
      return selector == null ? $(nodes) : $(nodes).filter(selector);
    }

    //parent 包含 node, 且 parent !== node 返回 true
    //document.docuemntElement 获取 `html`元素
    //node.contains( otherNode ) node 是否包含 otherNode 或 node 是否等于 otherNode
    $.contains = document.documentElement.contains ?
      function(parent, node) {
        return parent !== node && parent.contains(node)
      } :
      function(parent, node) {
        while (node && (node = node.parentNode)) {
          if (node === parent) {
            return true;
          }
          return false;
        }
      }

    function funcArg(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    //添加或移除属性
    function setAttribute(node, name, value) {
      value == null ? node.removeAttribute(name) : node.setArrtibute(name, value);
    }

    //给 node 添加 className, 或者获得 node 的 className
    //或给 svg node 添加 baseVla 属性
    function className(node, value) {
      var klass = node.className || '',
        //baseVal是 svg 元素自身属性
        svg = klass && klass.baseVal !== undefined;//判断是否是 svg 元素

      if (value === undefined) {
        return svg ? klass.baseVal : klass;//
      }
      svg ? (klass.baseVal = value) : (node.className = value);
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    //deserialize: 串并转换,解串,并行化
    // 把字符串转换
    function deserializeVlaue(value) {
      try {
        return value ?
          value == 'true' ||
          ( value == 'false' ? false :
            value == 'null' ? null :
            +value + '' == value ? +value :
            /^[\[\{]/.test(value) ? $.parseJSON(value) :
            value
          )
        : value
      } catch (e) {
        return value;

      }
    }


    $.type = type;
    $.isFunction = isFunction;
    $.isWindow = isWindow;
    $.isArray = isArray;
    $.isPlainObject = isPlainObject;

    //是否是数字且为有限数
    $.isNumeric = function(val) {
      var num = Number(val), type = typeof val;
      return val != null && type != 'boolean' &&
        (type != 'string' || val.length) &&
        !isNaN(num) && isFinite(num) || false
    };

    //返回元素在数组中的索引值
    $.inArray = function(elm, array, i) {
      return emptyArray.indexOf.call(array, elem, i);
    }

    $.camelCase = camelize;
    $.trim = function(str) {
      return str == null ? '' : String.prototype.trim.call(str);
    }

    $.uuid = 0;
    $.support = {};
    $.expr = {};
    $.noop = function() {};

    //遍历元素执行 callback 函数, 返回每个元素执行函数结果的集合
    $.map = function(elements, callback) {
      var value, values = [], i, key;
      if (likeArray(elements)) {
        for (var i = 0; i < elements.length; ++i) {
          value = callback(elements[i], i);
          if (value != null) {
            values.push(value);
          }
        }
      } else {
        for (var key in elements) {
          value = callback(elements[key], key);
          if (value != null) {
            values.push(value);
          }
        }
      }
      //返回一个数组, 去除空元素
      return flatten(values);
    }

    //每个元素执行 callback 函数, 有一个 callback 函数返回 false 值时,
    //退出循环, 返回 elements 的值
    $.each = function(elements, callback) {
      var i, key;
      if (likeArray(elements)) {
        for (var i = 0; i < elements.length; ++i) {
          if (callback.call(elements[i], i, elements[i]) === false) {
            return elements;
          }
        }
      } else {
        for (var key in elements) {
          if (callback.call(elements[key], key, elements[i]) === false) {
            return elements;
          }
        }
      }

      return elements;
    }


    //获得满足 callback 返回 true 的elements 元素的集合
    $.grep = function(elements, callback) {
      return filter.call(elements, callback);
    }

    //将一个符合 JSON语法的字符串解析成对应类型的值或对象
    if (window.JSON) {
      $.parseJSON = JSON.parse;
    }

    //给 class2type 添加以引用类型为属性名称的属性值
    $.each("Bollean Number String Function Array DateRegExp Object Error".split(' '), function(i, name) {
        class2type[ '[object ' + name + ']' ] = name.toLowerCase();
    })


    //定义一些方法应用于所有 Zepto 集合
    $.fn = {
      constructor: zepto.Z,
      length: 0,

      forEach: emptyArray.forEach,
      reduce: emptyArray.reduce,
      push: emptyArray.push,
      sort: emptyArray.sort,
      splice: emptyArray.splice,
      indexOf: emptyArray.indexOf,
      concat: function() {
        var i, value, args = [];
        for (var i = 0; i < arguments.length; ++i) {
          value = arguments[i];
          args[i] = zepto.isZ(value) ? value.toArray() : value;
        }
        return concat.apply(zepto.isZ(this) ? this.toArray() : this, args);
      },

      map: function(fn) {
        return $($.map(this, function(el, i) {
          return fn.call(el, i, el);
        }))
      },
      slice: function() {
        return $(slice.apply(this, arguments));
      },

      ready: function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
          callback($);
        } else {
          document.addEventListener('DOMContentLoad', function() {
            callback($)
          }, false);
        }
        return this;
      },

      //获得 idx 对象
      get: function(idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
      },

      //转化为数组
      toArray: function() {
        return this.get();
      },
      //获得长度
      size: function() {
        return this.length;
      },

      //删除子集
      remove: function() {
        return this.each(function() {
          if (this.parentNode != null) {
            this.parentNode.removeChild(this);
          }
        });
      },

      //为集合执行 callback 函数
      //如果callback 返回 false, 停止遍历
      each: function(callback) {
        emptyArray.every.call(this, function(el, idx) {
          return callback.call(el, idx, el) !== false;
        });
        return this;
      },

      //返回匹配 css 选择器的元素的集合
      filter: function(selector) {
        if (isFunction(selector)) {
          return this.not(this.not(selector));
        }
        return $(filter.call(this, function(element) {
          return zepto.matches(element, selector);
        }));
      },

      //$('li').add('p')
      //li 加上 p 均
      add: function(selector, context) {
        return $(uniq(this.concat($(selector, context))));
      },

      //判断集合中第一个元素, 是否符合 selector
      is: function(selector) {
        return this.length > 0 && zepto.matches(this[0], selector);
      },

      //???
      not: function(selector) {
        var nodes = [];
        if (isFunction(selector) && selector.call !== undefined) {
          this.each(function(idx) {
            if (!selector.call(this, idx)) {
              nodes.push(this);
            }
          });
        } else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector);
          this.forEach(function(el) {
            if (excludes.indexOf(el) < 0) {
              nodes.push(el);
            }
          });
        }
        return $(nodes);
      },

      //返回包含 selector 的对象的集合
      has: function(selector) {
        return this.filter(function() {
          return isObject(selector) ?
            $.contains(this, selector) :
            $(this).find(selector).size();
        })
      },

      //获取对象集合索引值为 idx 的对象
      eq: function(idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, + idx +1);
      },

      //获得对象集合第一个对象
      first: function() {
        var el = this[0];
        return el && !isObject(el) ? el : $(el);
      },

      //获得对象集合中的最后一个对象
      last: function() {
        var el = this[this.length - 1];
        return el && !isObject(el) ? el : $(el);
      },

      find: function(selector) {
        var result, $this = this;
        if (!selector) {
          result = $();

        //如果 selector 是个对象, 需要进行遍历
        } else if(typeof selector == 'object') {
          result = $(selector).filter(function() {
            var node = this;

            return emptyArray.some.call($this, function(parent) {
              return $.contains(parent, node);
            });
          });
        } else if (this.length == 1) {
          result = $(zepto.qsa(this[0], selector))
        } else {
          result = this.map(function() {
            return zepto.qsa(this, selector);
          });
        }
        return result;
      },

      //?从元素本身向上匹配, 获得最先匹配 selector 的元素
      closest: function(selector, context) {
        var nodes = [], collection = typeof selector == 'object' && $(selector);
        this.each(function(_, node) {
          while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))) {
            node = node !== context && !isDocument(node) && node.parentNode;
          }
          if (node && nodes.indexOf(node) < 0) {
            nodes.push(node);
          }
        });
        return $(nodes);
      },
      //获取所有的父集 / 获取所有满足 selector 的父集
      parents: function(selector) {
        var ancestors = [], nodes = this;
        //当 nodes 长度大于0 执行
        //对 nodes 进行遍历, 返回满足函数元素的父集的集合
        //再次遍历, 再次返回上一级父集一直至 html 元素
        while (nodes.length > 0) {
          nodes = $.map(nodes, function(node) {
            if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
              ancestor.push(node);
              return node;
            }
          });
        }
        //返回满足选择器的 ancestors
        return filtered(ancestors, selector);
      },

      //返回[满足 selector 的]父集元素集合
      parent: function(selector) {
        return filtered(uniq(this.pluck('parentNode')), selector);
      },

      //获取满足[ selector ] 的 children
      children: function(selector) {
        return filtered(this.map(function() {
          return children(this);
        }), selector);
      },

      //获得每个匹配元素的所有 nodes, 包括空格, 子级元素, 注释
      contents: function() {
        return this.map(function() {
          return this.contentDocument || slice.call(this.childNodes);
        })
      },

      siblings: function(selector) {
        return filtered(this.map(function(i, el) {
          return filter.call(children(el.parentNode), function(child) {
            return child !== el;
          });
        }), selector);
      },

      //移除子级元素
      empty: function() {
        return this.each(function() {
          this.innerHTML = '';
        });
      },

      //获取 property 属性及值, 返回所有对象该属性的集合
      pluck: function(property) {
        return $.map(this, function(el) {
          el[property];
        });
      },

      //
      show: function() {
        return this.each(function() {
          //??此行的用意
          this.style.display == 'none' && (this.style.display = '');
          if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
            this.style.display = defaultDisplay(this.nodeName);
          }
        })
      },

      //替换
      replaceWith: function(newContent) {
        //给指定元素前面添加 newContent 元素, 然后再把 该指定元素删除
        return this.before(newContent).remove();
      },

      // 给每个匹配的元素添加 structure父集
      wrap: function(structure) {
        var func = isFunction(structure);
        if (this[0] && !func) {
          var dom = $(structure).get(0),
            clone = dom.parentNode || this.length > 1;
        }
        return this.each(function(index) {
          $(this).wrapAll(
            func ? structure.call(this, index) :
              clone ? dom.cloneNode(true) : dom
          )
        })
      },

      //在第一个匹配元素前添加 structure 元素,
      //并把把所有的匹配元素移到 structure 中, 成并列关系
      wrapAll: function(structure) {
        if (this[0]) {
          $(this[0]).before(structure = $(structure));
          var children;
          //获取 structure 中最深层级对象
          while ((children = structure.children()).length) {
            structure = children.first();
          }
          //append 方法, 把匹配的元素从原来的节点中移除, 添加到目标节点中
          $(structure).append(this);
        }
        return this;
      },

      //匹配元素内添加 structure
      wrapInner: function(structure) {
        var func = isFunction(structure);
        return this.each(function(index) {
          var self = $(this), contents = self.contents(),
            dom = func ? structure.call(this, index) : structure;
          contents.length ? contents.wrappAll(dom) : self.append(dom);
        })
      },

      //去除直接父级
      unwrap: function() {
        this.parent().each(funtion() {
          $(this).replaceWith($(this).children());
        });
      },

      //深复制
      clone: function() {
        return this.map(function() {
          return this.cloneNode(true);
        });
      },

      hide: function() {
        return this.css("display", "nonde");
      },

      show: function() {
        return this.css("display", "none");
      },

      //setting 为 true 时, 显示; 为 false 时,隐藏
      toggle: function(setting) {
        return this.each(function() {
          var el = $(this);
          (setting === undefined ? el.css("display") === "none" : setting) ? el.show() :el.hide();
        });
      },

      //获取拥有 selector 的上一元素
      prev: function(selector) {
        // ele.previousElementSibling 获取上一个元素
        return $(this.pluck('previousElementSibling')).filter(selector || '*');
      },

      next: function(selector) {
        return $(this.pluck('nextElementSibling')).filter(selecotr || '*');
      },

      //未传参数, 返回第一个元素的 html 内容
      html: function(html) {
        return 0 in arguments ? //arguments 为空
          this.each(function(idx) {
            var originHtml = this.innerHTML;
            $(this).empty().append( funcArg(this, html, idx, originHtml) );
          }) :
          (0 in this ? this[0].innerHTML : null);
      },

      // 未传参数, 返回第一个匹配元素的 textContent 内容, 即该元素以及其所有子孙辈元素的 text 值
      // 传入参数, 将匹配元素子级替换为参数
      text: function(text) {
        return 0 in arguments ?
          this.each(function(idx) {
            var newText = funcArg(this, text, idx, this.textContent);
            this.textContent = newText == null ? '' : '' + newText;
          }) :
          (0 in this ? this[0] : null);
      },

      //获取 attr 值, 或者设置 attr 值
      attr: function(name, value) {
        var result;
        return (typeof name == 'string' && !(1 in arguments)) ?
          //获取 name 对应的属性值
          (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
          this.each(function(idx) {
            if (this.nodeType !== 1) {
              return
            }
            if (isObject(name)) {
              for (var key in name) {
                setArrtibute(this, key, name[key]);
              }
            } else {
              setArrtibute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
            }
          });
      },

























    }//842



  })();//936



}))

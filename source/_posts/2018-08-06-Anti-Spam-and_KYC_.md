---
layout: post
title: 反垃圾（注册/登录/KYC)
categories: 安全工程师
kerywords: 反垃圾 反爬 内容安全
tags: 安全研发
---

# 前言
如上一篇所言，采用BanIP的方式，以及限速的方式。当然还可以采用API网关进行限制。不过这些都不是要讨论的，这篇要讨论的是，怎么通过代码层，实现常规，但是又不是那么容易被破解的方式。去达到防刷防作弊的效果。让我们再思考一下其他的方式，如何更好的做到。

# 从JavaScript AntiDebug 开始
一般来讲是有以下几种技术:
* 异常环境检测（我们只想自己的代码运行在浏览器中）
* 调试工具检测
* 代码完整性检测
* 数据流完整性检测
* 反模拟

正好前两天研究反调试技术，顺便翻译了一篇，详情点击[此处](http://telegra.ph/Javascirpt-Anti-Debugging-08-02)


# 设计及验证

![image](https://img.iami.xyz/images/43710367-056d7a10-99a2-11e8-8171-7772585ec438.png)

POC验证,（请无视字段。。。。），当然前提是前端也要做好反调试和加密。

![image](https://img.iami.xyz/images/43710903-9e83148e-99a3-11e8-9713-9dc6ce5ae0c6.png)


![image](https://img.iami.xyz/images/43710859-74e025ea-99a3-11e8-9e71-6878a439735c.png)

前后端接入之后，但依旧不能完全的阻止攻击，在攻击者花费一定时间之后还是有可能被攻破的。那么如何在后面的阶段检测到脚本作弊，则需要对用户行为进行分析。

# 用户行为分析

简单的鼠标行为记录，加上事件记录，单击，输入focus input，等等，将其序列化，做分类即可。这个方法目前正在测试环境收集用户行为日志，将其导入到s3,然后后期分析。
字段记录:
* 鼠标轨迹
* 单击事件
* 输入事件:时长
* 登录后行为

一下为简单的记录坐标轨迹：
```javascript

document.onmousemove = function(e){
  var pageCoords = "( " + e.pageX + ", " + e.pageY + " )";
  console.log(pageCoords);
};

```

更骚的操作是:
```javascript

monitorEvents(document.body); // logs all events on the body

monitorEvents(document.body, 'mouse'); // logs mouse events on the body

monitorEvents(document.body.querySelectorAll('input')); // lo
```


# 其他

- [ ] 行为日志收集之后用于分析
- [ ] Javascript 加密混淆深入了解

# References
* [Js AntiDebug 译文](http://telegra.ph/Javascirpt-Anti-Debugging-08-02)
* [Log all events fired by an element in jquery](https://stackoverflow.com/questions/7439570/how-do-you-log-all-events-fired-by-an-element-in-jquery)
ele面试时key提供了一个很不错的方法，`记录击键的时间戳`.我本来是记录的数据量有点大了

<!-- ![image](https://img.iami.xyz/images/54924594-b2a5e680-4f47-11e9-8827-ba8245245ca2.png) -->


---
layout: post
title: 爬虫学习一
categories: 一个小学生
kerywords: Spider Web Crawler
tags: 爬虫与反爬虫 旧文迁移
---

## 前言
&emsp;&emsp;闲来无事，总结一下自己对爬虫和搜索引擎的认识。作为一个知识回顾，顺便再理一理思路。最开始的时候之所以想使用爬虫，是因为下载东西不方便，后来呢又想自己写一个小型的搜索引擎作为尝试。开始去接触相关的知识，学习python，也逐渐认识到一些库。
## 我的零开始

### 基础知识

访问一个网址，经由DNS服务器解析之后得到相应的ip地址，额，好像没什么关系。但是搜索引擎其实就是将整个互联网上的URL集合进行存储，建立索引。本质也就是一个大的爬虫而已。采取分布式的抓取，定期的更新索引，应该还是多线程的。

 在访问URL的过程中，你需要先知道 一些HTTP状态码，这些状态码告诉你这些URL代表的页面是否存在，或者已被迁移。常见的有404,200等，当你抓取到不存在的页面时，你需要判断将这个URL放入到哪个序列，未抓取，已抓取，已抓取但未找到（或者是失效的队列），当然往常只有两个队列就是已抓取和未抓取两个队列。

### 设计一个容器
 或者说有一个设计好的代码框架，有入口有出口。入口可以是单个的URL，也可以是一堆的URL，然后分别去下载这些URL对应的页面。当然在你下载了这个页面之后，这才仅仅只是开始了一小步，因为你要做的是获取其中的数据。而不仅仅是下载下来。这时候你需要设计一个解析器，说白了也就是一个函数。想好它将会接收那些参数，又需要返回什么样的结果。我记得之前有次和老师聊天，老师说要学会面向接口编程，上网上查了半天资料也没有找到有用的，当时也没有明白。之后逐渐明白了接口的重要性，你需要设计好一个别人拿来就能用的函数。解析器就应该是这样的。
但不仅仅是至进行解析的处理，还应该将异常情况考虑好，怎么抛出怎么处理。

解析的时候，可以从文件里面进行解析，也可以直接读取保存的字符串变量。解析的时候可以使用正则表达式匹配，这样就很高级了。当然也可以用相应的库来完成这个工作。

反正我是认为设计模式这个是十分重要的，无论写什么代码，只有将条理理得清清楚楚，知道怎么写，流程往哪里走才行。这样写出来的代码会很少bug。

### 数据的存储和索引
这时候你已经解析好了文件，应该将所需的结果存储起来。其实这里再一步体现了设计的重要性。如果你将这些数据放到文本里就先不说了，但是如果放到数据库中，数据库中的表的设计不也需要仔细想想。假如你爬到的是一些财经的数据，你就按照XX指标，XX点，XX涨幅等等等建个表，那么你的数据库是不是也要考虑一下写上新的事务。

到了全部存储好了，你需要快速的去查找到这些数据，难道每次都要`SELECT * FROM x_TABLE WHERE X_NAME = '$_INPUT'`,这样的效率要慢的多，之前没事的时候浅浅的用过solr，虽然只是按着doc玩了一会，但是可以明显的看出来，人家支持各种格式的导入，什么csv,yml,xml,json的，都能直接导进去建立索引，搜索的时候也是很快（当然也可能因为是示例数据少吧，大的数据没试过，好伤心）。期间还学到了其他的好玩的，例如awk,grep，不过sed还是不会用。又蛮开心的。

写到这的时候突然想，像我这种渣渣，算法菜得一逼，真待补补了。越发觉得算法的重要性，真的是十分重要。算法是魂，绝对是。当然我写的小爬虫可能没有用到，但是但是，TMD算法是真的重要啊。
### 爬虫和反爬虫技术
有人玩爬虫，就有人反爬虫。你一个爬虫请求的速度那么快，假如好多爬虫都去访问人家的网址，那不是坑比了。不过我这种菜菜还领悟不到这种深奥，只说一下知道的最浅薄的吧。
>常见的反邮件爬虫的方法就是将邮件地址写成 someaddress AT gmail.com 将@写成AT即可。

>禁止一定时间段内的IP访问次数

>听说还有的是进行大数据建模，分析出是否是人类行为，感觉是十分高大上的。不知道新浪的清理死粉是不是这样做的

至于登陆的时候千奇百怪的验证码技术，也是一个十分好的防爬虫技术。就拿12306的登陆验证码，我相信现在的图片识别技术应该难识别的。
---
layout: post
title: Crawl From QiChaCha
categories: HowTo
tags:  
- 实习笔记 
- 抓取数据
---
### 企查查相关

来这里的第一份小任务是获取自动登录企查查后的cookie,本来是打算

```bash
wget --save-cookies cookies.txt \
     --keep-session-cookies \
     --post-data 'user=username&password=password' \
     --delete-after \
     http://server.com/auth.php

```

但是企查查的三方登录根本行不通，那些账号都是异常的，还需要验证码。后来去抓企查查公众号的包，得到了想要的。走了一条新的获取数据方式的道路。

* step1 : get token
* step2 : get company name, In teh same time , you can get the keyno
* step3 : get company details

其实这里面是有个漏洞的，就是正常情况下请求一次网页，会生成一个code,然后拿着这个code才能去请求查询服务。但是你把code置空也能获取token.....

```javascript

var request = require("request");

var options = { method: 'GET',
  url: 'http://wxapi.qichacha.com/wechat/v1/base/advancedSearch',
  qs: 
   { cityCode: '',
     industryCode: '',
     isSortAsc: '',
     pageIndex: '1',
     pageSize: '200',
     province: '',
     registCapiBegin: '',
     registCapiEnd: '',
     searchIndex: '',
     searchKey: 'al',
     sortField: '',
     startDateBegin: '',
     startDateEnd: '',
     subIndustryCode: '',
     token: '9ae78b92b16d04173d8caffbd7cf3c30' },
  headers: 
   { 'cache-control': 'no-cache',
     'x-requested-with': 'com.tencent.mm',
     'accept-language': 'zh-CN,en-US;q=0.8',
     'accept-encoding': 'gzip, deflate',
     referer: 'http://mob.qichacha.com/weixin-app/?code=&state=123',
     'user-agent': 'Mozilla/5.0 (Linux; Android 5.1; MX5 Build/LMY47I) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile MQQBrowser/6.8 TBS/036872 Safari/537.36 MicroMessenger/6.3.31.940 NetType/WIFI Language/zh_CN',
     origin: 'http://mob.qichacha.com',
     accept: 'application/json, text/plain, */*',
     connection: 'keep-alive',
     host: 'wxapi.qichacha.com' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});
```

不过可以从这里面看出来一个东西，就是模拟微信只需要在`user-Agent`里面加上`MicroMessenger` 

![User-agent](/images//user-Agent.jpg)

其实呢，你可以看到，里面之所以加了不同的浏览器版本，其实就是为了兼容(图片来自第一次在这里的技术分享%>_<%)。

Other:


后来，在尝试在hadoop上跑爬虫，又想到了一种的途径去获得连接并且去重，类似这样。

```shell

	lynx --dump -listonly http://qichahca.com | grep "[http|https]://" | awk '!a[$2]++'
```

也可以grep的时候，只匹配特定域名下的东西。

后记:

突然发现自己写的爬虫，可能算不上爬虫，我是习惯性的找到数据接口，API也好，找到规律也好，然后获取所有数据。这样的缺点是需要前面投入一些时间去分析。然后就简单了。 而我通过近期对公司分布式爬虫代码的阅读来看，或者说平常的代码来看，一旦页面变化，就需要修改对应的代码，一直都需要人来维护。但是API的就不会。同时，同样的请求，不需要请求其他无用的html内容。

虽然自己也能写正常的爬虫，但是对于分布式爬虫还是有点不行。最近在看本司分布式爬虫的代码。设计什么的还好理解，架构也好理解。但是吧，代码没文档，真是丑。决定试试分布式爬虫框架以及大型爬虫在hadoop上怎么搞的。

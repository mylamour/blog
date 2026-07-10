---
layout: post
title: 关于内容安全的思考和一次反垃圾注册应急
categories: 安全工程师
kerywords: 内容安全 反爬 业务安全
tags: 爬虫与反爬虫
translated: true
---

这是之前为即刻Anti-Spam，针对内容安全画的思维导图：

![anti-spam risk management](https://img.iami.xyz/images/42406784-1b72ad54-81e1-11e8-898d-dcf520f8dbfd.png)

所有的阻挡应该是威胁的一层层缓解手段，直到屏障的方式无法穿透。


# 反垃圾注册
最近公司接收到了不少的垃圾账号注册，估计都是因为积分来薅羊毛的。这些账号会自动的进行其他api交互。完整的流程应将注册邮箱与黑产邮箱数据库进行比对，以及维护一份临时邮箱注册列表，不允许临时邮箱账号进行注册。同时对注册接口进行限速以及禁止机制。这样才能比较有效的完成反垃圾注册。

* splunk， nginx access log
* web服务架构:  Front ->cdn->  waf1 -> waf2 -> nginx reverse proxy -> WebServer

禁ip的坑： 第一次禁了ip就不能访问，发现是禁了waf2的，然后把waf2的地址配置为回源ip之后，发现过来的ip有一个将其禁掉之后，发现是来自cdn的ip，也就是说cdn的配置(携带真实ip入waf1)并未生效. 直接设置地洞进行动态ip访问限制，1分钟访问注册6次之上的禁用30分钟。

获取源ip:
```nginx
set_real_ip_from 47.89.7.0/24;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

首先这些把日志导入splunk进行分析，(以下ip均为阿里wafip),然后可以看出对分析来说没有什么帮助

![lalpbbcc1ge1nf3nbfrncfw_2556_1114](https://img.iami.xyz/images/42406795-816fb7e6-81e1-11e8-9dd1-f7c034fca9c6.png)

禁用之后来自该Ip的访问几乎瞬间降为0：

![lalpbbcc1ge2svtnblfnczg_2456_1207](https://img.iami.xyz/images/42406799-89b5632e-81e1-11e8-809e-8a5c11dd63a9.png)

构建字段，查询当天注册的哪些邮箱用户。然后提交给后台从管理员系统将这些用户标记。注意不是删除。或者禁用账号。

![lalpbbcc1gifcibnamxnbdc_1079_613](https://img.iami.xyz/images/42406809-e035d2a6-81e1-11e8-8258-3c1b63d82004.png)
![lalpbbcc1gikpvnna53nckk_2217_925](https://img.iami.xyz/images/42406811-e18e5ed4-81e1-11e8-84f2-565fb9d8c3aa.png)

# Note
Splunk很好用，比以前用ELK更舒服，尤其是强大的自动生成正则去匹配的功能，当然还是需要自己定义下正则的。
SDL的推动十分有必要，在这次应急过程中，发现有的日志收集器里居然打了用户密码进去。实在荒谬，然而现在给我的感觉是技术好管，人难管。真是让人一言难尽。还应该学习一些管理学的知识才行。

本次应急大概30分钟。解决问题重要的是思路正确。就容易发现问题根本，然后进行解决。

# 后续

cdn节点的访问控制，由于网宿是基于进程内的拦截，单个节点的统计达不到阈值的话还是会放行。所以呢，基本上是6的阈值可以访问60次以上，误差太大，联系了之后也无法解决。故采用nginx层限速。

首先 nginx.conf下http字段设置limit_req_zone，由于我是通过api限速，所以其他方式暂时不讲了。

```nginx
http {
   ...
   limit_req_zone "$binary_remote_addr$request_uri" zone=api_email:30m rate=6r/m;
   ...
}
```
注意: ` limit_req_zone $request_uri" zone=api_email:30m rate=6r/m;`是依据url过来限制，但是会限制所有的，所以必须确保对每一个请求的唯一限制。



* Note: 出现一个问题，在nginx.conf里写反而没有用，直接写在对应的文件里可以用。



具体的配置文件
``` nginx
  location /api/v1/xxxx/yyyy/email/ {
     limit_req zone=api_email;
     set_real_ip_from 0.0.0.0/0;
     real_ip_header    X-Forwarded-For;
     real_ip_recursive on;
```

然后发现不会跳转到填写验证码页面，然后配置跨域

```nginx
set $cors '';
if ($http_origin ~ '^https?://(localhost|www\.btcc\.com|m\.btcc\.com)') {
  set $cors 'true';
}

if ($cors = 'true') {
  add_header 'Access-Control-Allow-Origin' "$http_origin" always;
  add_header 'Access-Control-Allow-Credentials' 'true' always;
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
  add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
  add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
}

```

完整配置文件为:

![image](https://img.iami.xyz/images/42438569-f2301b6c-8392-11e8-872f-7c4c80d58809.png)


测试之后即可发现，配置生效，每6次就会禁止了。当然应该配置自定义返回的状态码，默认是503。需要提供一个友好的状态码给前端用于交互。

具有解决问题的能力，为什么配置之后不起作用，双重请求头会报错，如何发现，如何解决。👀
![lalpauor5jryy-7nbnbnchq_2580_1654](https://img.iami.xyz/images/47093786-7c5b9100-d25c-11e8-88fa-f97c50b980a2.png)

---
layout: post
title: locatunnel的使用回顾 
categories: 一个实习生
keywords: Localtunnel Reverse
tags: Linux 工具
---

#### 前言：
很久没有更新技术了，主要是因为一直在学习新的知识吧。这边刚结束，那边又开始去搞毕业设计了。而出于个人感情原因，自己又从原公司离职了。虽然拿了一家研究院的安全offer，但是老妈觉得长沙太远。然后呢，问了10个朋友，8：2是不让去的，只有两个说让我去。没办法，先找找工作吧， 一边找工作，一边更新下这大半年的积累。边想边更，不一定是按照时间序列的。

#### 正文：穿越内网的http服务
当你在内网的时候想把内网的一个web展示，或者说临时展示出去的时候，又不想那么麻烦的搭建一个web服务器之类的，而是希望直接在本机上展示出去，那么这个时候，就可以使用localtunnel了。(ps:前提是你已经安装了nodejs)

只需要采用 `npm install -g localtunnel`进行安装，然后使用`lt --port 80`即可进行转发，运行命令后`localtunnel`服务器会返回一个网址的。可谓十分方便，当然我们不能只介绍这么一点玩法，下面看其他有趣的玩法(强行凑博客感)。

* 搭建自己的`localtunnel`服务器，以便提升访问速度。
```bash
$ git clone git://github.com/defunctzombie/localtunnel-server.git
$ cd localtunnel-server
$ npm install

$ bin/server --port 1234
```

* lt命令的其他用法
```bash
$ lt --host http://yourserver:1234 --port 5000 -s prefix
#这个就以为着转发本机5000端口到服务器yourserver上，然后获取域名为prefix.youserver:1234，可以通过该域名进行访问。
```


#### Resources

* [localtunnel](https://github.com/localtunnel/localtunnel)
* [localtunnel-server](https://github.com/localtunnel/server)
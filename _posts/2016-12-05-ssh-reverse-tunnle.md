---
layout: post
title: SSH 内网穿透
categories: HowTo
tags: 小手段
---

买的vps配置不好，远不如实验室的服务器。So,拿我的vps做下端口转发，即可。


* step1: 建立target对server的免密登录 (操作在target上，即实验室的服务器上)

* step2: 建立server对host的端口转发	  (操作在target上，依旧是实验室的服务器上)

* step3: 从host连接到转发的端口即可登录target


盗图一张
![原理图](../image/reverese-ssh3.png)

step2:

`ssh -p 22 -qngfNTR 6766:127.0.0.1:22 userVPS@IP`

或者

`autossh -M 6777 -NR newport:127.0.0.1:22 -i ~/.ssh/id_rsa userVPS@IP -p vpssshport >> /var/log/ssh_nat.log 2>&1 &`



other:

* ssh周边之: `sshpass`,`autossh`
*  我没有使用autossh配置文件

Reference:

* [reverse-ssh-port-forwarding](https://toic.org/blog/2009/reverse-ssh-port-forwarding/)
* [ssh-and-reverse-tunnel](http://www.freeoa.net/osuport/netmanage/ssh-and-reverse-tunnel_1896.html)
* [使用SSH反向隧道进行内网穿透](https://www.zhukun.net/archives/8130)

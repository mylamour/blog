---
layout: post
title: SSH的免密码登陆
categories: 一个实习生
kerywords: SSH 
tags: Linux SSH 工具
---

### SSH 介绍

SSH协议中主要为三个部分：
- 传输层
- 用户认证协议
- 连接协议

验证主要为两种安全验证
- 基于密码的安全验证(顾名思义，知道账户名和密码进行登录)
- 基于密钥的安全验证(通过验证密钥进行登录)

OpenSSH是提供ssh相关服务的经典工具
* 远程操作 ssh, scp, and sftp.
* 密钥管理  ssh-add, ssh-keysign, ssh-keyscan,  ssh-keygen.
* 服务端 sshd, sftp-server,  ssh-agent.

### SSH 基础使用

* `$ ssh remotehost`
* `$ ssh username@remotehost`
* `$ ssh username@remotehost -p 23456`
* `$ ssh -p 23456 username@remotehost`


### 安装SSH Server
ubuntu
`$ sudo apt-get install openssh-server  ` # ssh服务
`$ service ssh start`  #一般安装之后，服务就自动开启了，如果没有的话可以手动开启下。

windows
ssh服务可以安装cygwin,具体参考下相关资源里的openssh-rsa-authentication-for-windows-and-linux，客户端的话可以安装Xshell, putty,MobaXterm.

android
ssh服务用SSHDroid，客户端用connect-ssh,Juice-ssh,super terminal去连接远程服务器。

### 传输数据(基本上是单个文件传输)
* `$　scp user@destip:/path/to/your/dest`
* `$　scp -P yourPort user@destip:/path/ /local/path/`
* `$　scp -P yourPort sourceip:/path/ user@destip:/path/ `

* <font color="red">rsync(服务器之间同步数据，极好的，适用于文件夹之类的都可以,apt-get install rsync(ubuntu) yum install rsync(Centos),当然这些服务器之间的备份最好配合crontab定时使用),
* sz(windwos下xshell配合sz极好的，这个要源码安装，google下就行了)</font>

### 免密码登录远程服务器
> 就是你把你的公钥放到远程服务器上。登录的时候，服务器会向用户发送一段随机字符串，用户用自己的私钥加密后，再发回来。服务器用事先储存的公钥进行解密，如果成功，就允许登录shell。记得之前看过一个案例，有一个把私钥放到了服务器，被人家攻克之后，盗了密钥又把其他服务器给干了。

>>
* `$ ssh-keygen`
* `$ ssh-copy-id -i ~/.ssh/id_rsa.pub remoteip`
* `$ service ssh restart`
* `$ chmod 700 ~/.ssh`
* `$ chmod 600 ~/.ssh/authorized_keys `
* `$ ssh user@host 'mkdir -p .ssh && cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub`

> <font color="red">不知道大家有没有发现权限设置有个很好玩的东西，就是父目录假如是只有roto可访问，但你给下面的子目录设置成了777之类的，那么只可以直接访问者个字目录下的东西，是不是又想到了什么邪恶的东西，哈哈</font>

### 不相关的周末
以前想写个ssh防爆破脚本，当时是想grep下log,然后触发相应的iptables规则，后来发现了防爆破工具fail2ban，原理应该也差不多。
突然看到很多少在网上说markdown转pdf怎么转，什么什么收费软件怎么怎么样，卧槽，难道不能chrom上ctrl+p打印吗？？


扎着冰糖杨梅，边吃边写markdown，想起来的都写一写。查着写着，吐槽着。昨天的书展真是不咋滴啊。还有前天被一巴基斯坦王八蛋放了鸽子，艹，明明9pm跑步，没见到人。艹艹。
还有别忘了，不如用mosh

#### 相关资源
* [SSH 维基百科](https://zh.wikipedia.org/wiki/Secure_Shell)
* [OpenSSH](http://www.openssh.org/) 
* [openssh-rsa-authentication-for-windows-and-linux](http://cects.com/openssh-rsa-authentication-for-windows-and-linux/)
* [rsync example](https://rsync.samba.org/examples.html)
* [corntab](http://www.cnblogs.com/peida/archive/2013/01/08/2850483.html)

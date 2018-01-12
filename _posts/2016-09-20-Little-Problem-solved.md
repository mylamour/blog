---
layout: post
title: 不算问题的问题
categories: 全栈工程师
tags: 学习笔记
---

#### Enviroment Configure

* add-apt-repository: command not found:

> 
`sudo apt-get install software-properties-common`

* JAVA_HOME

> 
`export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")`

* ShadowSocks

> 
创建或修改默认config.json,只需要增加"port":"pwd"，即可完成多用户配置，当然还有多用户管理系统:
[Moess](https://github.com/wzxjohn/moeSS), [ss-panel](https://github.com/orvice/ss-panel)
> 然后ssserver -c config/file/to/your/path,也许你还需要nohup屏蔽阻断信号，或者加入开机启动, rc.local

* IRC密码忘了

> 

		/msg nickserv help sendpass       查看怎么找回密码
		/msg NickServ SENDPASS Nickname  	找回密码，然后你的邮箱就会收到重置的一个条件密码			
		/msg NickServ SETPASS mour <关联邮箱的条件码> <你的新密码>
		/msg NickServ identify yourpassword       密码登入服务器


* IRC里面有人问个问题，我是用awk来做的，但是后来那人说要判断每次划分后的前缀。最后有人用下面方式这种先做出来了

> 
```bash
echo -e '/abc:def:g\nhi:/jk:l' | while IFS=: read -a parts; 
					do 
						for part in "${parts[@]}"; 
							do
								[[ $part = /* ]] && echo "$part"; 
							done;
					done 
```     
> 
当时用了cat filename | awk -F '/' '{}' 被人建议读读下面的资源，意思就是使用 < 代替使用　cat 得到，以及不要用kill -9 之类的提议，以及一些理由。
不过对于一些初学者，我只能说，可以暂时不要这么考虑。

#### Other
1. nutch 释放了新的版本
2. h5ai　html5的文件下载管理

#### Resources

* [Something About Linux](http://porkmail.org/era/unix/award.html)

---
layout: post
title: Ansible与Redis集群的搭建
categories: HowTo
tags: 学习笔记
---

#### 前言 : 就是废话啦

之前为了给vultr写一篇文档`how to build a redis cluster in vulter `，后来由于语法问题没有通过，就搁置了。也没有翻译回来贴在自己的博客上。所以还是收拾一下吧。其实只是为了搭建`pyspider`分布式的。

#### 正文 : 什么是什么东西

用`ansible`，是latern哥推荐的，我呢是从`vagrant`过度过来的。他们都是基于`ssh`的。安装很简单`pip install ansible`就行了。
`redis` 用过吧，缓存队列是最常用的功能。

1. 创建一个单独的`ansible`用户，但是记住，要在创建用户的同时创建主目录，负责就很蛋疼了。当时试了很久不行，权限拒绝，后来才发现我添加用户的时候没有创建主目录，因此导致了不能用。主机这一块暂时不讲了，使用`ssh`秘钥去创建批量机器，或者以一个为模板机器去创建。

2.当你去连接slave节点时，由于需要ansible的密码，在第一次的时候，会要求验证ssh 指纹，方便起见，可以来一个`playbook`

```ansible
		#!/usr/bin/env ansible-playbook
		---
		- name: accept ssh fingerprint automatically for the first time
		  hosts: all
		  connection: local
		  gather_facts: False

		  tasks:
		    - name: "check if known_hosts contains server's fingerprint"
		      command: ssh-keygen -F {{ inventory_hostname }}
		      register: keygen
		      failed_when: keygen.stderr != ''
		      changed_when: False

		    - name: fetch remote ssh key
		      command: ssh-keyscan -T5 {{ inventory_hostname }}
		      register: keyscan
		      failed_when: keyscan.rc != 0 or keyscan.stdout == ''
		      changed_when: False
		      when: keygen.rc == 1

		    - name: add ssh-key to local known_hosts
		      lineinfile:
		        name: ~/.ssh/known_hosts
		        create: yes
		        line: "{{ item }}"
		      when: keygen.rc == 1
		      with_items: '{{ keyscan.stdout_lines|default([]) }}'
```
你可以看到，头是这样写的`#!/usr/bin/env ansible-playbook`，这意味着，上面一段可以保存着`shell`脚本，然后执行即可。当然你也可以保存成纯粹的文本文件，然后用`ansible-playbook`去执行。

执行过之后本机会添加所有指纹，主机配置在`/etc/ansible/hosts`,接着就可以执行相应的控制了。

```bash
root@master:~# ansible -i /etc/ansible/hosts slave -m ping --ask-pass -u ansible
SSH password: 
45.76.222.2xx | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
45.76.197.1xx | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
root@master:~# ansible -i /etc/ansible/hosts slave -m shell -a 'date' --ask-pass -u ansible
SSH password: 
45.76.197.1xx | SUCCESS | rc=0 >>
Fri Aug 11 07:12:43 UTC 2017

45.76.222.2xx | SUCCESS | rc=0 >>
Fri Aug 11 07:12:43 UTC 2017

```
如果你在host里面写了用户名密码配置，就不再需要在命令行输入,配置文件里面这么写。

```
[defaults]
host_key_checking=false

[all:vars]
ansible_connection=ssh
ansible_ssh_user=ansible
ansible_ssh_pass=test

#hosts
[slave]
45.76.197.1xx
45.76.222.2xx
```
至于通过`ansible`命令行执行，可以参考附属链接。网上的一些`ansible`教程都忽略了一些东西。自己实践的时候就知道了。

`ansible -i inventory/production web -m shell -a 'date' --ask-pass -uuser`

#### 后记 : 其他

以我说对找房子没有要求，其实是要求的，要求一个正常的环境。干干净净，安安静静。室内空气正常，不是甲醛超标到刺鼻，声音吵到带耳塞睡觉。厕所和厨房脏到自己打理，然后还是会变脏。仅此而已。这是有多么正常的事情。原来那些看起来很正常的事情背后有着这么多的努力。技术分享会也一样。
以前说对找工作没有要求，其实还是有要求的，希望有所成长。哎，很多事情变得不可预料了。


#### Resources:

* [Ansible Simple Tutorial](https://blog.goquxiao.com/posts/2015/09/01/ansible-simple-tutorial/)
* [pyspider集群部署](https://imlonghao.com/10.html)



原文扯淡如下:
> 如果要搭建mongo集群也差不多，注意下写法就行了。例如mongo中的`bind = [127.0.0.1, 10.99.0.11]`

We use three machices, Two of them was be setting as slave. 

### Step 1: Install Redis In Ubuntu 16.04 
It can be easily  install by `apt-get`, And In vultr , You can setting it into StartupScripts, Just add this line

        #!bin/bash
        apt install -y redis-server

Just directly deploy 3 instance , when server  was running , also redis-server was running. If you don't know how to edit startup scripts,  you can just login into your instace , type `apt install -y redis-serve` , when installed was finished,
You would get  a redis server  instance.

Note:

 * For Security , You need enable the private network ,and shouldn't expose it to public network.

### Step 2 :  Configure your private network 
When enable private network and deploy the instance, You would find the private network address from Instance  settings in the control  panel .But  private network  was not working before your configure. So we need edit the network interface, in ubuntu, you can do something like this:
       `vim /etc/network/interface`

Then add this line, In this example, my private network  address is `10.99.0.11`, you need chang it to your private  ip address . And same to another instance.

        auto ens7
        iface ens7 inet static
               address 10.99.0.11
               netmask 255.255.0.0
               mtu 1450
 
After change the `/etc/network/interface` , we need  restart the network services. 
`ifup ens7 `

Note :

* Use `service  ssh start`, and You can use ssh and private network address to connect  your slave machine.

### Step3 :  Configure  Redis Cluster 

After step 1 and step2 , we already have a private network and three redis server, Now we need to connect it as a distributed  cluster.
Now , we begin to configure our redis server.  conf file was placed in `/etc/redis/redis.conf `,  First,  we need change the  `redis bind`, So, You need  change them use the private network address  as their binds.   You need bind it in each 
instance `bind 10.99.0.10` or `bind 10.99.0.11` or  `bind 10.99.0.12`.  In this example , `10.99.0.10` was be consider as master , `10.99.0.11` and `10.99.0.12` was setting as slave . Next step was important tell the slave redis the master  redis  address and port. So , we need edit the conf file:

* In 10.99.0.11 /etc/redis/redis.conf :

        slaveof 10.99.0.10 6379

* In 10.99.0.12 /etc/redis/redis.conf:

        slaveof 10.99.0.10 6379

Barring accidents, when you finished this type, the redis server was configure finished . And  you  can get a simple redis cluster. When you restart  your service ,`service redis-server restart`, It would be working  correctly .

And  In the slave machine , Use `redis-cli -h 10.99.0.10 -p 6379`， You would connect the master redis,  To get 
 more  info , just type `INFO`, And redis would tell you something more.

Note :

* For Security, You need edit redis conf and enable  password authorization.  `requirepass yourpass` , Therefore  you need edit slave conf with `masterauth <master-password>`

> * In 10.99.0.10 /etc/redis/redis.conf :
         `requirepass wohaha`
* In 10.99.0.11 /etc/redis/redis.conf : 
         `masterauth wohaha`
* In 10.99.0.12 /etc/redis/redis.conf:
         `masterauth wohaha`
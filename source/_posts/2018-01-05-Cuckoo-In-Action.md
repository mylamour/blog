---
layout: post
title: Cuckoo需要注意的坑
categories: 安全工程师
kerywords: Cuckoo 沙箱 Webshell检测 动态检测
tags: 入侵检测与反入侵 工具
---
### 安装
> 坑挺多的,安装和使用都不好搞,把踩的坑暂记于此.

`pip install -U cuckoo`
> 截图装`pillow`,抓包装`tcpdump`,内存装`volatility`

### 常规使用

```
cuckoo community                            #先获取数据库回来
cuckoo submit --url http://malware.com
cuckoo web runserver                        #要配置mongodb,在reporting.conf里
```
webui用起来很简单,没有什么说的.


* 配置文件正常情况在 `~/.cuckoo/conf`,`cuckoo`目录是你的工作空间,也就是你的`$CWD`

> * cuckoo.conf                         主配置,全局配置
> * virtualbox.conf                       虚拟机配置文件,让cuckoo采用哪个虚拟机,设置回连ip,端口等.你要是用的virtualbox就配置这个文件,vmware就配置vmware.conf,其他的配置其他的.
> * auxiliary.conf
> * reporting.conf                        配置下报告产生的文件,对了,cuckoo还可以和misp连到一起,这个功能很实用

* 路径介绍:
> .cuckoo/storage/analyses 存储分析后的文件,按task id 存储,
![2018-01-05 16-43-36](https://img.iami.xyz/images/34602426-a60bf966-f23a-11e7-9137-aabc50b4058f.png)


`report.json`是以json形式存储的报告内容,丢给Yara匹配即可,有cuckoo模块最好吧,个人感觉对webshell的检测,这种方式并不好,即便是针对其他检测,也是依靠自己带的一部分规则,不过沙箱本身就是靠自己来分析.

* $CWD 是最新提出来的概念,意在设置独立的工作区
* $ROOT 这个也是,但是还没用.提供一些命令的root权限给cuckoo用,也就是说,应该先新建个cuckoo用户,再用这个.


### 坑和需要注意的地方

* 不要太相信报错,报错不一定对,毕竟报错信息写的也只是possible,cuckoo自身都不确定(建新说的,很对)

* Error 99 创建网卡
> 
```
VBoxManage hostonlyif create
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0
```

* 创建虚拟机,启动Agent.py 测试是否能宿主机和客户机互相访问.此时建立镜像.测试能否通过curl url创建目录,如果不行报错不会提示具体,只提示`AnalysisManager.run`,只要对目录设置正常权限,或者`sudo python agent.py`

* 记得在你的客户机上安装许多软件,打开pdf, office文档,运行什么都需要什么的环境 

* 采用2.7不要采用py3的,即便修改了不报错,也不能用.(可能还是哪里有错,没有暴露出来)

* libcurl.so.4 问题,找到库的位置,然后重新链接过去.ln -s 

*  Virtualbox Kernel driver not installed
>
```
sudo dpkg-reconfigure virtualbox-dkms
sudo dpkg-reconfigure virtualbox
sudo modprobe vboxdrv
```
* 不要自己安装python的mongo,可能bson不兼容,最好的方式,直接创建一个环境即可.

* 测试是虚拟机的问题还是配置问题

* 测试能不能通过命令行对镜像进行恢复
> 
```bash
VBoxManage snapshot cuckoo1 restorecurrent
VBoxManage controlvm cuckoo1 poweroff
VBoxManage snapshot cuckoo1 take test1 --pause
```

* 开启路由转发时ufw有没有开着,关掉再设置,还要允许2042通过

* virustotal 给cuckoo提供了一个APIKEY,很好.

### Reference

* [Cuckoo基本部署流程](https://blog.pandashare.com/2017/09/01/cuckoo-sandbox.html)
* [Cuckoo Doc](http://docs.cuckoosandbox.org)
* [Cuckoo FAQ](http://docs.cuckoosandbox.org/en/latest/faq/)
* [Virtualbox Kernel driver not installed](https://askubuntu.com/questions/41118/virtualbox-kernel-driver-not-installed)
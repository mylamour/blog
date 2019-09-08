---
layout: post
title: 新开始:webshell的检测
categories: 安全工程师
keywords: Webshell 检测 机器学习
tags: 机器学习 Webshell检测
---

#### 前言 : 新的开始

6.25号开始新的工作，生活慢慢回到主旋律。Not bad,Not Good. 公司给配置了一台新的电脑，从抹上CPU的硅脂，到装上每一颗螺丝，再到
刻盘和点亮操作系统。我想像着像一台新的机器一样，开始全速运转。填充自己。

#### 正文 : 如何开始

目前要做的软件包含一个模块，叫做webshell的检测。webshell的话就不用介绍了，日站的东西我的博客好像也从来没有介绍过。不跑题了。
webshell就暂且理解成恶意代码吧。实质上也就是恶意代码的检测。
针对不同的目标，出现了以下类别为代表的检测方法。

* 基于日志的检测方法
* 基于流量的检测方法
* 基于行为的检测方法

其实，我到网上看了看，真正有的并不多。一些少之又少的博客也只是大谈方法论和架构。而无论从方法还是架构上，都没有看到有较好的实现。当然，针对asp,jsp,php的可检测做的还是有一些做的蛮不错的。而从方法上划分上，我热为可以分为以下几种(记住，方法可以用在不同的目标上，流量监测可以用到这些方法，日志也可以用到这些方法。当然，理论上是看自己的设计了)

1. 基于文件相似度的(模糊hash计算)
2. 基于代码特征值(yara规则匹配)
3. 基于机器学习的方法(准确说是统计学的机器学习，不少人用朴素贝叶斯和SVM做恶意代码的分类，SVM作为工业级的算法产品，自然毋庸置疑，但是出于考虑到样本问题，还可能出现一些其他问题，例如特征选取，分词提取上的问题。)


##### 正文二 : 如何检测

下面就三种方法做一个简单

* 基于文件相似度,采用`ssdeep`

基于文件相似度，实际即是考虑到[模糊hash算法](http://blog.csdn.net/cwqbuptcwqbupt/article/details/7591818)

> 一个弱哈希算法，以及一个分片值，用于分片。一个强哈希算法，用于计算每片的哈希。一个压缩映射算法，将每片的哈希值映射为一个更短的值
一个比较算法，用于对两个模糊哈希值计算相似程度

简单的讲，就是分片求哈希，然后连接重新计算哈希值。给出的链接里已经比较详细的介绍了该算法的问题。具体可以参考。下面介绍下`ssdeep`的使用。想使用ssdeep检验文件的相似性，必须首先把已有文件的特征值导出来。

```bash

$ find ./php -type f -exec ssdeep -t 80 -bm php.ssdeep {} \; 
$ ssdeep -bsm  php.ssdeep  -r ./php -t 80 -c
#这两种写法是一致的，都是对一个文件夹内的所有文件进行校验。

$ ssdeep -r *  					
# 或者直接ssdeep * 即可将该文件夹下的所有特征值输出，如需保存，记得重定向到文件。


```
常用的就是这几个选项，其他的用法比较简单。


* 基于代码特征值，采用`yara`

代码特征，主要是指恶意代码和正常代码由于目的性不同，可以通过文件内的代码类型来进行判断。例如，正常的php代码内是不会有大块的base64加密，也不会有大量的`eval`和`prg_replace`。因此，可以通过采用对已知危险的关键字进行匹配，语句进行匹配。从而来检测webshell，但是由于规则的通用性层面来讲，必然会出现不小的误报情况。Yara是谷歌开源的一款模式匹配引擎，可以对文本内容进行匹配，从而进行检测。当然，不止可以对于文本内容，还可以对二进制文件进行模式匹配，甚至还可以匹配内存中的某段值，来以此进行检验。是目前很屌的一款开源引擎。命令行使用的话，最简单的可以是 `yara -r ./xxx/rule/xxx.yar /target/directory`下面我们可以通过一段简单的针对php的yara规则进行分析。

```
rule DangerousPhp
{
    strings:
        $system = "system" fullword nocase  // localroot bruteforcers have a lot of this

        $ = "array_filter" fullword nocase
        $ = "assert" fullword nocase
        $ = "backticks" fullword nocase
        $ = "call_user_func" fullword nocase
        $ = "eval" fullword nocase
        $ = "exec" fullword nocase
        $ = "fpassthru" fullword nocase
        $ = "fsockopen" fullword nocase
        $ = "function_exists" fullword nocase
        $ = "getmygid" fullword nocase
        $ = "shmop_open" fullword nocase
        $ = "mb_ereg_replace_callback" fullword nocase
        $ = "passthru" fullword nocase
}

```
从上面的规则(摘自[php-malware-finder](https://github.com/nbs-system/php-malware-finder/blob/master/php-malware-finder/php.yar))中可以看出，是对`eval`,`exec`,`assert`等关键词进行无大小命中，即可判断为危险PHP文件，同样，这种方法会导致误判率较高，因此需要采用白名单过滤的方法。通过对文件的md5或者sha1进行校验，存在白名单中，即可进行一定的过滤。例如，wordpress,joomla，discuz等等。规则的编写方式要[参考文档](http://yara.readthedocs.io/en/v3.6.0/writingrules.html)，类C写法，还是比较简单易懂的。同时，我们可以利用已经公开的webshell的yara特征数据库进行检测，去提高正确率。yara还是需要详细的学习的。



* 基于机器学习的方法

当然，到最后。必不可少的要讲下机器学习的方法。目前主流是基于统计学的机器学习方法。此处，退一步讲，在文本分类上，采用朴素贝叶斯的较多，SVM也不乏有人在做。朴素贝叶斯是基于贝叶斯定理，计算先验概率和后验概率的。假设在事件A发生的情况下，事件B发生的概率。当然，算法理解后，工程实现一点也不难，因为有现成的库可以使用。但是此处，我们并没有采用朴素贝叶斯的方法。而是采用了一个[基于CNN的文本二分类模型](https://github.com/dennybritz/cnn-text-classification-tf)。具体的网络设计可以查看论文。该模型是将已标记的文本按行输入，预处理之后读入第一层网络，网络的大小是以该行最长单词长度作为宽度，以单词个数作为长度，将其映射为一个二维向量，然后再进行单行的特征提取，然后对每一行进行选取特征。这个其实是基于word2vec实现的。最开始的时候，我也是打算采用word2vec，进行处理。在学习了TF-IDF和n-gram之后，也是突发奇想搜索了一下有没有基于文本直接进行分类的。恰好发现了这个项目，感谢作者。中间其实还有一些问题，比如文本文件无法读取等。不过还好，最后采用这个输出了一个比较好的结果。但是由于这个二维向量作为一个大的输入，如果你的文本稍长一些，就会导致非常之吃内存。然后崩掉。我是拿到服务器上，把样本读进去之后大概用了40G的内存。在本机时候是崩溃掉了。

相对来讲ssdeep，yara来讲，这个是精确度最高的，并且针对ssdeep无法检测的小文件，也可以用其进行正确的判断。

#### 后记

这三种方法可以被应用到不同的检测目标上去，采用基于流量拦截的话，就去采集一批恶意请求的样本，之后是进行相似度校验，还是规则命中，或者采用机器学习。都是可以的。如果需要实时检测的话，可以通过对web服务提供一个中间件，把上传文件的请求经过该webshell检测中间件即可。可以部署成单独的微服务。从垂直方向拆分业务，并且将可维护成本降到最低。
总体来讲，效果还是不错。但是Yara和ssdeep对平台有一定的依赖性，所以分离到windows下使用有一定的麻烦。

#### 遇到以及需要的问题

* ssdeep针对较小的文件不能生成有效的特征值
* yara可以针对单个文件的多条规则进行命中
* 机器学习过程中样本较少
* 白名单和规则应该由专人维护
* 是否可以通过GAN网络，自动学习到并生成攻击性代码？


#### Resources
* [php malware finder](https://github.com/nbs-system/php-malware-finder)
* [yara](https://github.com/VirusTotal/yara)
* [yarGen rule](https://github.com/Neo23x0/yarGen)
* [Shell-Detector](https://github.com/emposha/Shell-Detector)
* [CNN Text Classification](https://github.com/dennybritz/cnn-text-classification-tf)
* [CNN Text Classification论文](https://arxiv.org/abs/1408.5882v2)
* [ssdeep](http://ssdeep.sourceforge.net/)
* [模糊hash算法](http://blog.csdn.net/cwqbuptcwqbupt/article/details/7591818)
* [webshell](https://github.com/tennc/webshell)
* [webshell-sample](https://github.com/ysrc/webshell-sample)
* [fuzzdb](https://github.com/fuzzdb-project/fuzzdb)
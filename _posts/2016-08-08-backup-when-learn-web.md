---
layout: post
title: 成为全栈工程师过程中的踩过的坑 
categories: 全栈工程师
tags: 实习笔记
---
###一些踩过的坑
 
1.不要jade中同时用Space和Tab，一不留神就使用了，全他妈是错误呀

2.我记得之前有个E: Sub-process /usr/bin/dpkg returned an error code (1)

> 之前我的解决办法是按照网上来的，大概是大一的时候，
现在想想，当时完全没有动脑筋思考。

>>  
```bash
sudo mv /var/lib/dpkg/info /var/lib/dpkg/info.bak 
sudo mkdir /var/lib/dpkg/info
```
其实这种写法完全不如`killall aptd`,而且不需要去考虑是不是错杀其他进程，因为apt-get install 都是独占的。只允许一个存在。

3.网站优化压缩代码时使用的是YUICompressor，之后会另写一篇单独记录网站的性能提升与优化的问题。

```bash
for i in ` find $PWD | grep -oE "(.)*\.css_$"` 
do 

	echo $i
	yuicompressor.jar --type css -o $i"_" $i
	mv $i `echo $i | tr -d "_"`
done
```

` find ./ -name "*.jpg" -print0 | xargs -0 jpegtran -copy none -optimize {} > {}.jpg`

> 对mp4文件压缩的时候依旧使用的是ffmpeg,又转了一份文件为webm格式的。
>> ffmpeg转换的时候，后来发现其实是有三种方法的。可以直接指定大小，可以指定优化帧率，还可以优化图像质量来减小体积。


>>> `ffmpeg -i index_1.mp4 -acodec mp2 --psnr 1 output1.mp4`

4.添加白名单更安全

5.cat {file1,file2} > file3
>不要手残在file1,file2之间用了空格,其实是想说不要在shell里面手残乱敲空格，我完全是习惯性的敲空格，坑死了。

6.谷歌浏览器命令行开窗口

>shell
>>* `chromium-browser --new-window "url"`


>windows(应该也有其他方法)
>>* `start your/path/of/chrome "urllist1","urllist2"`

7.<font color ="green">NodeJS debuging and Profiling </font>

* Know the api docs 
* Use strict mode
* Name your inline function
* Don't forget callbacks are error first

> 埋个关于调试的坑，还会单补一篇。 

8.不要在属性值和单位之前留空格，否则不在IE6中有效。其实我是一点也不在乎IE6，。



9.MVC只是手段，不是目的。不要把目的和手段搞反了。最终目的是模块分离和代码复用。

10.不要使用grenn 和 red类的字符来设置颜色，使用#ffffff之类的进行设置。(其实这一点我有点不理解)


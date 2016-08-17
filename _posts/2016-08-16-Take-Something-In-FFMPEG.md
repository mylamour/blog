---
layout: post
title: Use ffmpeg to capture video frames
categories: 全栈工程师
tags: 实习笔记 
---


###<font color="green">上午还在写单元测试，下午就干这件事：抽取一批视频抽取前面3秒，中间3秒，后面3秒的图片。一秒大概25帧</font>

``` shell
#!/bin/bash

#set -e	
#去掉后脚本可跳过错误继续运行
#ls *.mp4 > filelist.txt

#du -h *.mp4 | grep -v "4.0K" | awk '{print $2}' > filelist.txt
#由于后期发现有的监控视频很小，所以要改。还有不能先awk print需要先grep再进行print

mkdir imageCut
#cat filelist.txt | while read filename
#此处属于莫名奇妙不能用while 
for filename in `cat filelist.txt`
do
	pathname=$(echo $filename | cut -d "." -f1 )
	echo $pathname
	mkdir $PWD/imageCut/$pathname
	echo "Process in $filename, and it will be set in $pathname"
	sleep 1
	time=`ffprobe -v error -show_entries stream=width,height,bit_rate,duration -of default=noprint_wrappers=1 $filename  | grep "duration" | cut -d "=" -f2 | cut -d "." -f1` #获取总的视频时长

	middletime=`expr $time / 2 - 3`
	endtime=`expr $time - 3`
	echo $middletime
	m_time=$middletime-3
	ffmpeg -ss 00:00 -t 3 -i $filename -q:v 2 -f image2 $PWD/imageCut/$pathname/imagehead-%d.jpg　2>>log.err		#get the first 3 second image frames to des and log the err in current folder
	ffmpeg -ss $middletime -t 3 -i $filename -q:v 2 -f image2 $PWD/imageCut/$pathname/imagmiddle-%d.jpg 2>>log.err	#get the middle 3 second image frames
	ffmpeg -ss $endtime -t 3 -i $filename -q:v 2 -f image2 $PWD/imageCut/$pathname/simageend-%d.jpg 2>>log.err	#get the last 3 second image frames

	#mv $(ls *.jpg) $PWD/imageCut/$pathname
	#这样的写法不严谨，脚本通用率就低了，你也不知道该目录下有没有其他img文件。直接在输出时定位过去。
	

done

rm -f filelist.txt

```


###　
后来又分析了下errlog，发现中间有一些视频是不能抽取的，但是呢，总的抽取过程中，所有视频基本上都是226张左右，也就是说是正常的，但是6万多张图片中，大概800张抽取错误。现在分析是视频不完整导致的。

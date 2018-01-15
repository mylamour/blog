---
layout: post
title: ffmpeg Simpley Useage 
categories: 全栈工程师
tags: 实习笔记 
---

###前几天公司的人去北京参加一个视频搜索的比赛，然后发回来组委对数据处理的要求

![imageParser](/images//imageParser.jpg)

* 画中画

> 
```shell
ffmpeg -y -i o_oC.mp4 -i y1.MP4 \
-strict experimental \
-filter_complex \
"[1:a] atrim=15:30,adelay=5000|5000 [a1]; \
[0:a][a1] amix [outa]; \
[1:v] scale=120:-1,setpts=PTS-(10/TB) [1v]; \
[0:v][1v] overlay=x=250:y=250:enable='between(t,5,200)'[outv]" \
-map "[outv]" -map "[outa]" \
-c:a aac -c:v libx264 \
-b:v 1000k \
-r 24 \
output.mp4
```

* 视频增加中图片

> ```shell
ffmpeg -i y1.MP4 -i image.jpg \
-filter_complex "[0:v][1:v] overlay=25:25:enable='between(t,0,2)'" \
-pix_fmt yuv420p -c:a copy \
addImage.mp4
```

> 可以通过修改between达到插入一段时间或者1秒,scale可以用来控制插入前后的比例。overlay的x,y分别是距离左上角的偏移量。-strict experimental和-strict -2的效果相同，但必须紧跟在-i选项之后，否则报错。

* 视频压缩

> `ffmpeg -i y2.MP4 -acodec mp2 --psnr 1 compress.mp4`
之前对官网做性能优化的时候，把mp4转webm也能降低视频大小，但是视频压缩并不一定降低视频大小。

* Gamma变换

> `ffmpeg -i y1.MP4 -strict -2 -vf "eq=gamma=0.5" gammaChange.mp4`

* 增加白噪音

> `ffmpeg -i y7.MP4 -strict -2 -filter_complex "aevalsrc=-2+random(0)" noise.mp4`

* 丢帧

> `avconv -r 24 -i src.mov -an -vf fps=fps=12 output.mov`

* 增加字幕

> `ffmpeg -i y1.MP4 -f srt -i a.srt -c:v copy -c:a copy -c:s mov_text addSrt.mp4`

* Reference Cut picture in Video

> `ffmpeg -ss [start] -i in.mp4 -t [duration] -c copy out.mp4`

<font color="green"> Update:2017.06.16  </font>

* 取3,5秒的视屏转化为gif图片

> `ffmpeg -v warning -ss 3 -t 5 -i input.wmv -vf scale=3000:-1 -gifflags +transdiff -y sample.gif`



###Other

下面链接所附，只做参考，部分命令不能使用。以上所有列出代码，均自己使用过的。PS:总是说有时间有时间，其实，我不知道啊。。啊，我的毕设毕设。还有我给你定的拖拉那么多的事情。

###Resources

* [ffmpeg-compress-video](http://stackoverflow.com/questions/4010832/ffmpeg-compress-video)
* [use-ffmpeg-to-add-text-subtitles](http://stackoverflow.com/questions/8672809/use-ffmpeg-to-add-text-subtitles)
* [cut-part-from-video-file](http://superuser.com/questions/377343/cut-part-from-video-file-from-start-position-to-end-position-with-ffmpeg)
* [simulating-tv-noise](http://stackoverflow.com/questions/15792105/simulating-tv-noise)
* [encode-video-in-reverse](http://stackoverflow.com/questions/2553448/encode-video-in-reverse)
* [reduce-frame](http://superuser.com/questions/849739/how-do-i-reduce-frame-rate-without-increasing-duration)
* [image_sequence](https://en.wikibooks.org/wiki/FFMPEG_An_Intermediate_Guide/image_sequence)
* [video_convert_image](http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html)



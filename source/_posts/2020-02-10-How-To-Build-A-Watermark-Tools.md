---
layout: post
title: 关于水印这件“小事“
categories: 安全工程师
kerywords: 水印工具
tags: 安全研发 水印
---

# 已经做的

下面谈一谈水印，因为具体工作没有涉及过，恰好离职在家，就简单的做了一下[Wwmark](https://github.com/mylamour/Wwmark)(What Watermark), 或许有些浅显。水印（Watermark），顾名思义，给某些东西加上如同water一样的mark，但并不影响源文件的使用。水印分类的话，简单来分的可以有图片水印，视频水印，文件水印，网页水印。添加的水印可以是有图片也可以有文字。从可见与否来分，又可以分为明水印和盲水印。盲水印在CTF中常见的隐写术有一些，但不完全一样。关于图像本身的RGBA和RGB此时暂时不讲（因为PIL和OpenCV在处理文件时存储的格式不一样），只是简单的讲一讲我是怎么做的。鉴于输入源定义为视频和文件，很容易的就选型了FFMPEG和OpenCV。 采用ffmpeg进行图像和视频的明水印处理。当然使用命令行可能更加快捷，但不利于复用。

```bash
ffmpeg -i input.mp4 -i image.png -filter_complex "[0:v][1:v] overlay=x=10:y=10" -c:a copy output.mp4
```

针对文字水印和图片水印ffmpeg提供了`drawtext`和`overlay`两种方式。

此处[wwmark.py](https://github.com/mylamour/Wwmark/blob/master/wwmark.py)做了简要的封装（基于ffmpeg-python），使其能够支持不同文件的明暗水印加密。针对pdf时采用的方法是pdf2image，然后image加上水印再合成为pdf。
此处有三个小问题需要注意：
一是文件路径，建议采用`tempfile.TemporaryDirectory()`。
二是针对生成的文件名，需要进行排序，默认是使用的`uuid.uuid1()`做的文件名生成，再随后的合成和排序中会出现问题，此处简单更改为`lambda x: x+1`自增加一。
三是图片合成为pdf的时候会多一个首页。因为是` ims[0].save(self.o_file, "PDF", resolution=100.0, save_all=True, append_images=ims[1:])` 所以需要把`append_images`改为从第二张图片开始。
至于写水印时，在对图片的处理时建议采用统一的格式，比如把输入全部转成png格式再输出为png。因为不同文件的图像通道不一样。。。

```ptyhon
        with tempfile.TemporaryDirectory() as temp:
            # Original uuid generator is not sortable
            convert_from_path(self.i_file, output_folder=temp,
                              thread_count=1, output_file=lambda x: x+1)
            for item in sorted(os.listdir(temp)):
                self.i_file = os.path.join(temp, item)
                it = os.path.join(temp, "{}.png".format(item))

                if mark == "text":
                    self.text(path=it)

                if mark == "image":
                    self.image(path=it)

                with open(it, 'rb') as f:
                    im = Image.open(f)
                    im.load()
                    ims.append(im.convert('RGB'))

        ims[0].save(self.o_file, "PDF", resolution=100.0,
                    save_all=True, append_images=ims[1:])
```

同时针对其他的一些小bug，比如ffmpeg默认是overwrite为false的，作为ffmpeg-python的library，当你output为quiet时，此时就会导致程序报错而不知道怎么回事，需要强制设置为true.

一些测试效果图：
原图： ![guest](https://user-images.githubusercontent.com/12653147/74144461-b9108000-4c37-11ea-964f-0dd80ebc2761.jpg)
水印图：
![wm](https://user-images.githubusercontent.com/12653147/74144472-bf9ef780-4c37-11ea-9d67-2ab74e1ee7c7.png)
盲水印图：
![wi_guest_blind](https://user-images.githubusercontent.com/12653147/74144454-b4e46280-4c37-11ea-8eef-6c86a1af9b46.png)
解压后的水印：
![wm_show](https://user-images.githubusercontent.com/12653147/74144503-ce85aa00-4c37-11ea-875f-d3a2106fa9c5.png)

至于明水印，由于是采用ffmpeg overlay去做的，所以位置的控制完全在于Overlay的写法，`overlay`本身基础的有`x`,`y`，即坐标。其后还有`enable=between(t, xxxx,yyy)`，可以针对视频repeat fream.
而对于图像本身的透明效果，不像`drawtext`可以直接设置`alpha=0.4` 这种格式， 0.4代表了百分之40，而是需要采用`colorchannelmixer`,去控制`aa`的值。
这是40%透明度的效果
![jjjjjjjjj](https://user-images.githubusercontent.com/12653147/74206390-27942300-4cb6-11ea-91a5-0c98b22ae27a.png)

# 理想中的

拥有多格式多水印选项，具备完善的数据分级和权限控制，以及日志和追踪的功能。特性来说，需要有自动植入和一键追溯更优。

![image](https://user-images.githubusercontent.com/12653147/74119770-d7588a80-4bfb-11ea-88ec-ced701034f37.png)


# 实际上的
一些听到的吐槽
* 业务方接入姿势不一，即接入结果不对
* 接入后数据采集姿势不对，即接入结果不对
* 追溯时数据不对，即接入姿势不对
* 追溯时权限和环境难以触达，即接入姿势不对
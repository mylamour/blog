---
layout: post
title: 使用fasttext进行DGA检测
categories: 学习数据挖掘的路上
kerywords: 机器学习 DGA检测
tags: 学习笔记 机器学习
---

# 正文

最初接触到fasttext做文本分类是在去年7月份做webshell检测时，后来还是选择了CNN Text Classification。当时关于fasttext的介绍已经有一部分了。关于原理什么的在这就不讲了，之前的文章里应该有。

由于没有GPU，所以在做完自动化威胁列表之后，决定尝试下使用fasttext对文本进行分类。

具体项目参见[这里](https://github.com/mylamour/DGADomain),包含了使用说明。
采用了360netlab提供的公开数据集，以及一份alexa top 100millon。
![img](https://user-images.githubusercontent.com/12653147/47637980-3d043d00-db98-11e8-9bf3-537a4ecf90ee.png)

经过250个epoch之后可以达到很好的准确度。为1， 但是模型太大，可以采用quantize进行训练，压缩。但是会导致精度下降，cutoff值越大，精度越低，模型越小。

# 其他

上周发现了集团内部的一个平台存在着较为严重的数据泄露，随机直接联系了那个项目的负责人，告诉他，大量敏感数据集泄露(分别是来自不同平台推送的训练数据集)。然后这个人，这个技术专家就直接在前端改了下，完了...今天，再去测，还是存在路径遍历，可以越权读到所有数据。本身情况下非该应用用户是不能下载的，而且该应用用户间也不能随便下别人的数据集。后来谈着没两句，居然给我说到了月饼事件，说起了价值观。这尼玛的专家，真是呵呵呵。

就算大部分人知道正确的价值观，也不代表他们会做价值观正确的事情。更何况其他心怀不轨的呢。而且事事上升到价值观并不是个好事。

# 资源
[DGADomain](https://github.com/mylamour/DGADomain)
[fasttext text classification](https://fasttext.cc/docs/en/supervised-tutorial.html)
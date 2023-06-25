---
layout: post
title: Web安全检测中机器学习的经验之谈
categories: 安全工程师
kerywords: Webshell检测，机器学习，比较
tags: AI与机器学习 学习数据挖掘 入侵检测与反入侵
---


# 前言

常见的Web攻击中注入，XSS以及DGA等方面的检测，传统套路不必多言，自然是以黑白明单，正则规则为主。而在机器学习中，无论是SQL注入检测，XSS检测，Webshell检测都可被视作为对文本。那么针对这些web安全中常见的威胁攻击进行通用性的检测就可以看做为对文本进行分类的过程。本篇从文本分类的视角简要记录下机器学习在这些通用检测中的注意事项

# 文本分类的流程

分类是有监督学习，一般来讲流程应该是: 数据预处理->特征提取->训练分类器->保存模型->预测

在这个过程中数据预处理和特征提取可以说是最重要的。有效的特征，比套路算法有用的多。

注意点:

* 文本转向量，词向量，句向量，还是文档向量，不一而定，完全依靠需求来看。
* 构建的词向量时，词向量长度可能有时不完全一样。
* 确保最终转换后的向量长度要一致，如果不同当以最长向量为基准进行填充。当然这和网络层的设计有关，如果涉及的是可变长输入，则不需要转换一致。
* 在尝试神经网络前，应该在传统机器学习方法上进行尝试，不仅易于比较,耗时也短。
* 如果文本很短，且有词向量空间很小，短文本分类(一句话木马)的情况下即便可以达到1的精度，但是测试集效果会很差,DGA的话集成方法的训练的检测大概89%的精度。LSTM的看别人的可以达到1，但是自己没有训练过。
* 需要注意正负样本的样本分布，增加其多样性。例如单独以wordpress为正例训练的webshell检测在Discuzx和Phpmyadmin的表现效果不好。
* 有的文件并不能读取进来，可以通过编写类似strings命令去读取。
* 黑样本数据量不足可以通过数据增强的方式进行处理，最简单的可以通过复制粘贴。
* 内存不足尽量采用fit generator方式训练，但是会很慢。


# 通用检测方法论

所以，很明显的，对于这些文本形式的检测，无论是webshell,xss,sql注入,dga等都可以看做是文本分类的方式。但如何有效在某种检测上实现时还要依赖更多维度的特征才能达到更好的效果

## 与传统方法相比

* 传统方式，写不完的规则，添加不完的黑白名单，对变种的检测能力不是很强。但是速度快。
* 机器学习的方式，缺乏足够的打标的样本。无法有效的获取训练集。训练速度慢，预测速度也远不及正则匹配。但是针对变种的检测能力较强，例如对回调型函数的检测,较于传统方式，效果更好。
* 一个效果依赖于规则集，一个比较依赖于训练数据集
* 以异常检测的方式去检测这些文本的话，可以解决样本的问题，但是效果依旧不是很完美。

## 神经网络构建的Tricks

采用机器学习的方式时，首先要明确的是输入，输出，什么形式的输入输出，连续不连续，分类还是聚类等等。一般来讲网络的层数构建并没有什么好的方法，只有试。先随便来个两层或者三层，然后给个100-200个神经元。进行尝试，效果不好就加层，加神经元，达到过拟合后，再去减少隐层和神经元。不过还可以根据以往阅读的论文中看看别人给的参数都是什么样子的，例如一般交叉验证的选10折交叉，webshell中的分词选5-ngram等。初始化参数的选择十分重要。


## 更好的检测方式

* 训练时采用传统方法先过滤一部分，不是很确定的再采用机器学习进行次检测
* 可以借助正则规则对已知webshell打标签，然后分类细分成webshell类别这样就变成多分类的问题了
* 尽量聚合不同维度的特征,虽然单纯的文本向量已经拥有不错的效果
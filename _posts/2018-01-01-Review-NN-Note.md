---
layout: post
title: CNN笔记整理
categories: 学习数据挖掘的路上
tags: 学习笔记 机器学习
---

# FAQ

* [Maxpooling 的作用](https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks)
> 1. 不变性，更关注是否存在某些特征而不是特征具体的位置。可以看作加了一个很强的先验，让学到的特征要能容忍一些的变化。
> 2. 减小下一层输入大小(减少冗余)，减小计算量和参数个数。
> 3. 获得定长输出。（文本分类的时候输入是不定长的，可以通过池化获得定长输出）
> 4. 防止过拟合或有可能会带来欠拟合。
>> 作者：[知乎用户](https://www.zhihu.com/question/36686900/answer/91714601)

怎么设计一个好的神经网络
> 还不知道, 不过参数初始化的可以直接采用`tensorflow`给的,例如:
```python
W1 = tf.Variable(tf.random_normal([784,256]))
b1 = tf.Variable(tf.random_normal([256]))

W1 = tf.get_variable("W1", shape=[784, 256],
                     initializer=tf.contrib.layers.xavier_initializer())
b1 = tf.Variable(tf.random_normal([256]))
```
这样得到的精度要高很多.得益初始参数选的好.

如何设置隐层的个数
> 试错

激活函数有哪些,有什么作用,怎么选择
> 激活函数可以引入非线性因素,以便解决非线性可分任务.
> [26种激活函数可视化](https://dashee87.github.io/data%20science/deep%20learning/visualising-activation-functions-in-neural-networks/)([中文版](https://www.jiqizhixin.com/articles/2017-10-10-3))
> [神经网络激励函数的作用是什么-知乎](https://www.zhihu.com/question/22334626)

池化方式有哪些
> * maxpooling(以某个窗口大小进行滑动扫描并对邻域内特征点取最大) 
> * meanpooling(求平均)

滤波器的作用
> 神经网络的本质就相当于一层一层的滤波器堆叠起来,过滤底层特征.筛选高层特征

如何缓解BP网络过拟合
> * 早停 ,训练集误差降低验证集升高时停止训练
> * 正则化,在误差目标函数中增加一个用于描述网络复杂度的部分
>> [机器学习中的正则化到底是什么? --知乎](https://www.zhihu.com/question/20924039)

标准BP算法和累积BP算法之间的区别
> 标准梯度下降和随机梯度下降之间的区别


跳出局部最小的方式有哪些

> * 以多组不同参数值初始化多个神经网络,按标准方法训练后,取其中误差最小的解作为最终参数
> * 模拟退火,每一步退火都以一定的概率接受比当前解更差的结果
> * 使用随机梯度下降

[Epoch,Batch的概念区分](https://stackoverflow.com/questions/4752626/epoch-vs-iteration-when-training-neural-networks)
> 在一次全部数据迭代(Epoch)上将其划分成若干个小的数据(batch)进行迭代

卷积神经网络什么时候输入的图像大小是固定的,什么时候是不固定的.
> 有全连接层就是要固定输入大小,因为全连接层要把所有输入的像素点连接到一起,当参数个数固定之后不能更改了.所以输入要统一.只有卷积和池化则不必考虑图像大小,filter自然不关心有多大.只要扫描就行了

如果图像的大小不固定怎么办,现在需要固定
> * 强制resize,但是要细分到图像内的物体就不适用了.会导致变形.
> * 人工标注, 推荐用[lableimage](https://github.com/tzutalin/labelImg)





# Resources

* [如何理解反向传播](https://www.zhihu.com/question/27239198?rf=24827633)
* [CNN怎么调参数](https://www.zhihu.com/question/27962483)
* [禅与奶罩识别技术](https://zhuanlan.zhihu.com/p/25774111)
* [神经网络知乎话题精华](https://www.zhihu.com/topic/20043586/top-answers)
* [卷积神经网络直观解释](https://www.zhihu.com/question/39022858/answer/81026163)


* [Dropout的作用](https://yq.aliyun.com/articles/68901) 
* [机器学习的数学基础](https://zhuanlan.zhihu.com/p/25197792)
* [有没有必要把机器学习算法自己实现一遍？](https://www.zhihu.com/question/36768514/answer/81937823)
> 有，并且试着提速。搞懂原理，并实验

* [深度学习面试经典题目](https://zhuanlan.zhihu.com/p/25005808)
* [Tensorflow的55个经典案例](https://zhuanlan.zhihu.com/p/27577246)

* [有哪些LSTM/RNN的教程](https://www.zhihu.com/question/29411132/answer/51515231)
* [变形卷积核、可分离卷积？卷积神经网络中十大拍案叫绝的操作](https://zhuanlan.zhihu.com/p/28749411)


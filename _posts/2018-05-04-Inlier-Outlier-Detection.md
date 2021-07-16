---
layout: post
title: 异常检测初尝试
categories: 学习数据挖掘的路上
kerywords: 学习笔记 机器学习 异常检测
tags: 学习笔记 机器学习 异常检测
---

# 常见异常检测算法

接触到异常检测，要从接触到one class svm来说，其实是和刘翔宇聊到webshell检测到尾声的时候突然提起的，又顺便聊到了异常检测，然后又告诉了我PCA也可以做这个。当时对One Class SVM也不熟，至于PCA，我一直是以为做降维的，也没有想到可以用来做异常检测。

下面先介绍下常用的异常检测算法有哪几种。

* Robust covariance 适用于符合高斯分布时，效果较好
* One Class SVM 适用于非高斯分布时，效果较好，得到尽量小的维度和特征空间，远离离群点
* Isolation Forest 
* Local Out lierFactor 基于密度，效果很好。
* PCA 典型的降维算法，通过降维后的数据和原数据比较，从而发现异常点

作为一个实战派，肯定是先从实战出发。在測試的效果上來看，LOF的效果最好。當然，下面开始介绍不同的算法(Robust Covariance暂不介绍)。 异常检测上，都是黑样本少，标签少。

## One Class SVM

很好理解，顾名思义，根据正常样本进行训练，Detects the soft boundary of the set of samples X.读了下源码，但是没发现什么特殊的实现，`OneClassSVM`重写了基类`BaseLibSVM`的`fit`方法, 对应x的y直接有x的length然后自动生成一个全为一的数组作为对应标签。

```python

import pandas as pd
import numpy as np
import itertools

from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

from sklearn.svm import OneClassSVM

from sklearn.externals import joblib

import matplotlib.pyplot as plt

DROPCOLUMS = ["id","label","date"]

model = joblib.load('./saved/.pkl/five.pkl')
a_weight = model.feature_importances_
s_weight = list(a_weight[a_weight!=0.0])

dropcolumns =  [ "f{}".format(i+1) for i in np.where(a_weight==0.0)[0]]
s_weight_columns = [ "f{}".format(i+1) for i in np.where(a_weight!=0.0)[0]]

train_data = pd.read_csv('./data/atec_anti_fraud_train.csv')
train_data = train_data.fillna(0)

known = train_data[train_data['label'] != -1]
known = known.drop(dropcolumns, axis=1)
 
train, test = train_test_split(known, test_size=0.2, random_state=42)

cols = [c for c in DROPCOLUMS if c in train.columns]
x_train = train.drop(cols,axis=1)

cols = [c for c in DROPCOLUMS if c in test.columns]
x_test = test.drop(cols,axis=1)

y_train = train['label']
y_test = test['label']

clf = OneClassSVM()
clf.fit(x_train,y_train)        # 可以使用y_train, 也可以不用

joblib.dump(clf, 'oneclass.pkl')

```
但是这个太慢了，太慢了，我的笔记本根本跑了俩小时，不舍得电脑哗哗的转了，就给关掉了。

## Isolation Forest 

IsolationForest 是周志华老师提出来的，简称iTree吧，是一种集成学习法方法，相对于LOF， oneclassSVM ,占用的内存更小，速度也快。原理就是构建树，但是因为不像决策树是有监督学习，根据label构建，这个构建过程是完全随机的。

构建过程: 从n中随机取出m条数据，作为训练样本，在样本中随机选一个特征，并在特征值范围内，随机选择一个值，然后划分。小于该值在左，其余在右。然后继续重复选择特征，划分到不能划分为止。或者树的高度达到一定高度。高度可以自己限制。构建完成之后就可以进行预测了。

预测过程是，把测试数据根据特征条件沿树到最后，记录该路径长度，以及走过边的数量。最后进行计算。然后分数越接近1，就越可能是异常点，低于0.5就是正常，0.5左右都是不明显的异常。

实际用例[在此](https://github.com/mylamour/blog/issues/27)

## Local Out lierFactor

虽然LOF是效果最好的，但是在这次的ATEC[风险支付](https://dc.cloud.alipay.com/index#/topic/intro?id=4)比赛中，表现并不好，而`Robust Convariance`(肯定是效果最好，因为正常的交易和不正常的交易，恰恰应该是符合高斯分布的)的效果虽好，但是在本机一下就内存溢出了。而且跑出来的模型太大了，存了个模型，4个G大. 

LOF是基于数据密度的算法，所以我们可以想到有k-distance，rechability distance. LOF 算法的优点是考虑到数据集的局部和全局属性：即使在异常样本具有不同潜在密度的数据集中，它也能够表现得很好。 问题不在于样本是如何被分离的，而是样本与周围近邻的分离程度有多大。

# PCA

PCA做异常检测一种是将数据映射到低维特征空间，然后在特征空间不同维度上查看每个数据点跟其它数据的偏差；另外一种是将数据映射到低维特征空间，然后由低维特征空间重新映射回原空间，尝试用低维特征重构原始数据，看重构误差的大小。两种思路看似不太一样，其实本质上是差不多的。(该句摘自知乎用户)

# References

* [机器学习-异常检测算法（二）：Local Outlier Factor](https://zhuanlan.zhihu.com/p/28178476)
* [机器学习-异常检测算法（三）：Local Outlier Factor](https://zhuanlan.zhihu.com/p/29091645)
* [异常检测算法之IsolationForest](https://github.com/mylamour/blog/issues/27)
* [IsolationFOrest Paper](http://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/tkdd11.pdf)
* [什么是一类支持向量机（one class SVM）](https://www.zhihu.com/question/22365729)
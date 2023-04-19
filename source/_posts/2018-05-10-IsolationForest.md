---
layout: post
title: 异常检测算法之IsolationForest
categories: 安全工程师
kerywords: 异常检测 IsolationForest
tags: AI与机器学习 学习数据挖掘
---

离职第一天，在家撸代码写博客，读读Write Up。

# 正文 

IsolationForest 是周志华老师提出来的，简称iTree吧，是一种集成学习法方法，相对于LOF， oneclassSVM ,占用的内存更小，速度也快。原理就是构建树，但是因为不像决策树是有监督学习，根据label构建，这个构建过程是完全随机的。
构建过程: 从n中随机取出m条数据，作为训练样本，在样本中随机选一个特征，并在特征值范围内，随机选择一个值，然后划分。小于该值在左，其余在右。然后继续重复选择特征，划分到不能划分为止。或者树的高度达到一定高度。高度可以自己限制。构建完成之后就可以进行预测了。
预测过程是，把测试数据根据特征条件沿树到最后，记录该路径长度，以及走过边的数量。最后进行计算。然后分数越接近1，就越可能是异常点，低于0.5就是正常，0.5左右都是不明显的异常。

虽然上面说了这么多，具体也好理解，但是这篇论文还没有读。于是尝试此次atec的数据进行训练，代码如下:

```python

import pandas as pd
import numpy as np
import itertools

from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

from sklearn.ensemble import IsolationForest

from sklearn.externals import joblib

import matplotlib.pyplot as plt


def plot_confusion_matrix(cm, classes,
                           normalize=False,
                           title='Confusion matrix',
                           cmap=plt.cm.Blues):
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    print(cm)

    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                horizontalalignment="center",
                color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')

# model = joblib.load('../saved/.pkl/five.pkl')

DROPCOLUMS = ["id","label","date"]

train_data = pd.read_csv('../data/atec_anti_fraud_train.csv')

train_data = train_data.fillna(0)

known = train_data[train_data['label'] != -1]

knownlabel = known['label']
 
train, test = train_test_split(known, test_size=0.2, random_state=42)

cols = [c for c in DROPCOLUMS if c in train.columns]
x_train = train.drop(cols,axis=1)

cols = [c for c in DROPCOLUMS if c in test.columns]
x_test = test.drop(cols,axis=1)

y_train = train['label']
y_test = test['label']

clf = IsolationForest()

clf.fit(x_train)

y_pre = clf.predict(x_test)

ny_pre = np.asarray(y_pre)
ny_pre[ny_pre==1] = 0
ny_pre[ny_pre==-1] = 1

ny_test = np.asarray(y_test)

class_names = ['normal','dangours']
cnf_matrix = confusion_matrix(ny_test, ny_pre) 

np.set_printoptions(precision=2)                                        
                                       
# Plot non-normalized confusion matrix                            
plt.figure()                                                        
plot_confusion_matrix(cnf_matrix, classes=class_names,                  
                      title='Confusion matrix, without normalization')  
                                                                        
# Plot normalized confusion matrix
plt.figure()                                
plot_confusion_matrix(cnf_matrix, classes=class_names, normalize=True,  
                      title='Normalized confusion matrix')              
                                     
plt.show()

```



![figure_2](https://img.iami.xyz/images/39852800-1a293516-5451-11e8-8263-b9d25296e619.png)
![figure_1](https://img.iami.xyz/images/39852802-1cdf3648-5451-11e8-98de-a5ec017eeb44.png)


对于这种标签明确的，显然效果并不是那么好,只有90%的正确率，xgb的表现都已经99%以上了，但是在测试集上的效果也不是很理想。虽然有人说是和测试集的时间分布有关，但是我认为订单的每笔都应该是独立特征，和时间分布无关。前几天VSRC上来自京东的寿大佬分享的反刷单实践中也是这么操作的。我们先load进来的之前的xgb模型进行预测并可视化的可以看到。


![figure_1-1](https://img.iami.xyz/images/39853097-be2446a0-5452-11e8-9fad-6b1ebe81e512.png)
![figure_2-1](https://img.iami.xyz/images/39853098-bfeb1798-5452-11e8-82eb-3ae70795cc2d.png)

这里可以看到的是normal被检测的比较准，但是对danger的预测效果够差的。怪不得排名掉到了`40/201`了。如何调优才是关键,How, How???

# Reference
* [IsolationForest](http://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/tkdd11.pdf)
* [0x14 异常挖掘，Isolation Forest](https://www.jianshu.com/p/1b020e2605e2)
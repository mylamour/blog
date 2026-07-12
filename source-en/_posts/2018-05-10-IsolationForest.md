---
layout: post
title: IsolationForest for Anomaly Detection
categories: Security Engineer
kerywords: anomaly detection IsolationForest
tags: AI and Machine Learning Learning Data Mining
translated: true
---

On my first day after leaving the job, I was coding at home, writing blog posts, and reading write-ups.

# Main Content

IsolationForest was proposed by Professor Zhou Zhihua. Let's call it iTree. It's an ensemble learning method that uses less memory and runs faster compared to LOF and OneClassSVM. The principle is to build trees, but unlike decision trees which are supervised learning methods built based on labels, this construction process is completely random.

Construction process: Randomly sample m records from n data points as training samples. In the samples, randomly select a feature, and within the feature value range, randomly choose a value for splitting. Values less than this go left, the rest go right. Then continue to repeatedly select features and split until no further splitting is possible, or until the tree height reaches a certain limit. You can set the height limit yourself. After construction is complete, you can start making predictions.

The prediction process is: test data flows down the tree based on feature conditions until it reaches the end. Record the path length and the number of edges traveled. Then calculate the score. The closer the score is to 1, the more likely it's an anomaly. Below 0.5 is normal, around 0.5 indicates non-obvious anomalies.

Although I've explained all this and the concept is easy to understand, I haven't actually read the paper yet. So I tried training on the ATEC competition data. Code is as follows:

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


For this kind of clearly labeled data, the results were not very strong: accuracy was only 90%. XGBoost already achieved more than 99%, although its test-set performance was not ideal either. Some people attribute this to the test set's time distribution, but I expected each order to have independent features unrelated to time. A recent anti-fraud presentation from JD.com used the same approach. I then loaded the earlier XGBoost model for prediction and visualization.


![figure_1-1](https://img.iami.xyz/images/39853097-be2446a0-5452-11e8-9fad-6b1ebe81e512.png)
![figure_2-1](https://img.iami.xyz/images/39853098-bfeb1798-5452-11e8-82eb-3ae70795cc2d.png)

Normal cases were detected fairly accurately, but performance on malicious cases was poor. That explains the drop to `40/201`. The key question is how to tune the model effectively.

# Reference
* [IsolationForest](http://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/tkdd11.pdf)
* [0x14 Anomaly Detection, Isolation Forest](https://www.jianshu.com/p/1b020e2605e2)

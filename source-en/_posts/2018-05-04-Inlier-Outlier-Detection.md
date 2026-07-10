---
layout: post
title: First Attempt at Anomaly Detection
categories: Security Engineer
kerywords: Study Notes Machine Learning Anomaly Detection
tags: AI and Machine Learning Learning Data Mining
translated: true
---

# Common Anomaly Detection Algorithms

My first encounter with anomaly detection came from learning about one-class SVM. It happened when I was chatting with Liu Xiangyu about webshell detection - near the end of our conversation, he suddenly brought it up. We then talked about anomaly detection, and he mentioned that PCA could also be used for this. At that time, I wasn't familiar with One Class SVM. As for PCA, I always thought it was just for dimensionality reduction, never imagined it could be used for anomaly detection.

Let me introduce some commonly used anomaly detection algorithms.

* Robust covariance - works well when data follows Gaussian distribution
* One Class SVM - works well for non-Gaussian distributions, aims to find the smallest possible dimension and feature space, staying away from outliers
* Isolation Forest 
* Local Outlier Factor - density-based, works really well
* PCA - classic dimensionality reduction algorithm, detects anomalies by comparing reduced-dimension data with original data

As someone who's all about practical work, I obviously started with hands-on testing. From my tests, LOF performed the best. Anyway, let me introduce different algorithms below (won't cover Robust Covariance for now). In anomaly detection, you typically have few bad samples and few labels.

## One Class SVM

Pretty straightforward - as the name suggests, it trains on normal samples and detects the soft boundary of the set of samples X. I read through the source code but didn't find anything particularly special. `OneClassSVM` overrides the `fit` method of the base class `BaseLibSVM`. For x, it directly takes the length of x and automatically generates an all-ones array as the corresponding labels.

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
clf.fit(x_train,y_train)        # can use y_train, or not

joblib.dump(clf, 'oneclass.pkl')

```
But this thing is way too slow. My laptop ran for two hours, and I couldn't stand listening to it whirring anymore, so I just killed it.

## Isolation Forest 

IsolationForest was proposed by Professor Zhou Zhihua. Let's call it iTree. It's an ensemble learning method that uses less memory and runs faster compared to LOF and OneClassSVM. The principle is tree construction, but unlike decision trees which use supervised learning and build based on labels, this construction process is completely random.

Construction process: randomly select m samples from n to use as training samples. Randomly select a feature from the samples, and randomly choose a value within the feature's range, then split. Values less than that go left, the rest go right. Then keep repeating - select feature, split - until you can't split anymore. Or until the tree reaches a certain height. You can set the height limit yourself. Once built, you can start predicting.

Prediction process: test data goes down the tree based on feature conditions until it reaches the end. Record the path length and number of edges traversed. Then calculate. Scores closer to 1 are more likely to be anomalies, below 0.5 is normal, around 0.5 is inconclusive.

Real use case [here](https://github.com/mylamour/blog/issues/27)

## Local Outlier Factor

Although LOF performs the best, it didn't perform well in the ATEC [risk payment](https://dc.cloud.alipay.com/index#/topic/intro?id=4) competition. While `Robust Covariance` (definitely the best fit, since normal and abnormal transactions should follow Gaussian distribution) worked well, it caused memory overflow on my machine. Plus the model it saved was huge - 4GB.

LOF is a density-based algorithm, so we have k-distance and reachability distance. The advantage of the LOF algorithm is that it considers both local and global properties of the dataset: it performs well even in datasets where anomalous samples have different underlying densities. The question isn't how separated the samples are, but how separated a sample is from its surrounding neighbors.

# PCA

PCA for anomaly detection has two approaches: one maps data to low-dimensional feature space, then checks each data point's deviation from others across different dimensions; the other maps data to low-dimensional feature space, then maps back to the original space, tries to reconstruct original data using low-dimensional features, and looks at reconstruction error. These two approaches seem different but are essentially similar. (This sentence is from a Zhihu user)

# References

* [Machine Learning - Anomaly Detection Algorithm (2): Local Outlier Factor](https://zhuanlan.zhihu.com/p/28178476)
* [Machine Learning - Anomaly Detection Algorithm (3): Local Outlier Factor](https://zhuanlan.zhihu.com/p/29091645)
* [Anomaly Detection Algorithm - IsolationForest](https://github.com/mylamour/blog/issues/27)
* [IsolationFOrest Paper](http://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/tkdd11.pdf)
* [What is One-Class Support Vector Machine (one class SVM)](https://www.zhihu.com/question/22365729)

---
layout: post
title: 写了个自动机器学习的项目
categories: 安全工程师
kerywords: 机器学习 工具 AutoCLF Auto Machine Learning
tags: AI与机器学习 工具 安全研发
---

无论是在参加比赛，还是在实际工程中，把数据处理完之后，肯定不会只用一种算法进行测试，不可避免的采用多种算法进行比较。而[autoclf](https://github.com/mylamour/autoclf)就是这次在阿里风险支付大赛进行中，花了两天撸出来的一个简单框架。

目录结构为
```
├── [4.0K]  clf
│   │
│   ├── [4.0K]  nn
│
├── [4.0K]  data
│
├── [4.0K]  pipe
│
└── [4.0K]  saved

```

`clf` 目录下是常见的或者自定义的算法， 而`nn` 目录下是自定义的深度学习算法，和`sklearn`接口绑定的，自定义的算法是以类的形式存在的，只需要实现`fit`,`score`,`predict`即可，但是如果自己的`fit`使用了
`sklearn`的训练,就无需再自定义`score`,`predict`了。例如这样: (`clf/isvc.py`)

```python

from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.feature_selection import SelectKBest,chi2

from sklearn.decomposition import PCA, NMF
from sklearn.svm import SVC



class IGridSVC():
    N_FEATURES_OPTIONS = [2, 4]
    C_OPTIONS = [1, 10, 100, 1000]
    param_grid = [
            {
            'reduce_dim': [PCA(iterated_power=7), NMF()],
            'reduce_dim__n_components': N_FEATURES_OPTIONS,
            'classify__C': C_OPTIONS
        },
            {
            'reduce_dim': [SelectKBest(chi2)],
            'reduce_dim__k': N_FEATURES_OPTIONS,
            'classify__C': C_OPTIONS
        },]

    pipe = Pipeline([
        ('reduce_dim', PCA()),
        ('classify', SVC( kernel="linear", probability=True))
    ])

    def __init__(self):
        self.model = None

    def fit(self,x_train, y_train):
        self.model = GridSearchCV(IGridSVC.pipe, cv=3, n_jobs=-1, param_grid=IGridSVC.param_grid)
        self.model = self.model.fit(x_train,y_train)

    def score(self,x_test,y_test):
        return self.model.score(x_test,y_test)
    
    def predict(self, x_test):
        return self.model.predict(x_test)

    def predict_proba(self, x_test):
        return self.model.predict_proba(x_test)
```

然后在`train.py`里调用即可，工程还在继续完善，准备增加命令行接口。然而在训练中最重要的无疑是数据预处理和特征选择，而在`train.py`中传入的数据就是来自`pipe`文件夹里定义的预处理函数。
`train.py`

```python
import os

import pandas as pd
import numpy as np

# Sklearn Common Import
from sklearn.metrics import confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.feature_selection import SelectKBest, SelectFromModel
from sklearn.pipeline import Pipeline
from sklearn.externals import joblib

# Decomposition
# PCA 无监督， LDA 有监督
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA

# Some Classifier Algorithms

from sklearn.ensemble import  RandomForestClassifier, AdaBoostClassifier,\
                             ExtraTreesClassifier,GradientBoostingClassifier,VotingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from xgboost import XGBClassifier

from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression


def train(x_train,y_train,x_test,y_test):

    clf1 = DecisionTreeClassifier()     #max_depth=4a
    clf1_1 = RandomForestClassifier()
    clf2 = KNeighborsClassifier(n_neighbors=7)
    clf3 = SVC(kernel='rbf', probability=True)      # So slowly
    clf4 = LogisticRegression(random_state=1)
    clf5 = XGBClassifier()
    clf6 = GaussianNB()
    clf7 = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1),
                            algorithm="SAMME",n_estimators=200)

    from clf import IGridSVC
    c_clf1 = IGridSVC()

    voting1 = VotingClassifier(
        estimators=[
            ('dt',clf1),
            ('knn', clf2),
            ('svc', clf3),
            ('lg',clf4)    
        ],
        voting='soft'
    )

    voting2 = VotingClassifier(
        estimators=[
            ('dt',clf1),
            ('knn', clf2),
            ('svc', clf3),
            ('lg',clf4),    
            ('xgb',clf5)
        ],
        voting='soft'
    )

    clfs = [  
        c_clf1,
        clf3,
        clf1,clf1_1,clf2,clf4,clf5,clf6,clf7,voting1,voting2
    ]

    for clf in clfs:
        name = clf.__class__.__name__
        modeldumpname = "saved/{}.pkl".format(name.lower())

        print("[*] Now Training With {:<10s}".format(name))

        try:
            clf.fit(x_train,y_train)
            score = clf.score(x_test,y_test)
            if os.path.isfile(modeldumpname):
                print("[x] {} Already Exists".format(modeldumpname))
                modeldumpname = "{}.second".format(modeldumpname)
                print("[-] Rename {}".format(modeldumpname))
                
            joblib.dump(clf,modeldumpname)

            print("[+] Saving Model {:<10s} with accuracy: {}".format(modeldumpname,score))

        except KeyboardInterrupt:
            print("[-] Skip {}".format(name))
        # if not name.startswith("i"):    # custom class not implement cross valdation 
        #     score = np.mean(cross_val_score(clf, x_train, y_train, cv=10))
        # else:
        #     score = np.mean(clf.cross_val_score(x_train,y_train,cv=10))


if __name__ == '__main__':
    
    print('Loading Data....',end='',flush=True)
    from pipe import iload_iris_pipe
    x_train, y_train, x_test, y_test = iload_iris_pipe()
    print('\tDone')
    train(x_train, y_train, x_test, y_test)
```

`pipe/iload_aliaetc.py`
```python
import pandas as pd
import os

from sklearn.model_selection import train_test_split

train_data_path = 'data/atec_anti_fraud_train.csv'
predict_data_path = 'data/atec_anti_fraud_test_a.csv'

DROPCOLUMS = ["id","label","date"]
# 0 .... 1, 0 is safe / 1 is not safe

def iload_aliatec_pipe():

    if os.path.isfile(train_data_path) and os.path.isfile(predict_data_path):
        print("[√] Path Checked, File Exists")
    else: 
        print("[X] Please Make Sure Your Datasets Was Exists")
        import sys
        sys.exit(1)
        
    data = pd.read_csv(train_data_path)
    data = data.fillna(0)
    unlabeled = data[data['label'] == -1]
    labeled = data[data['label'] != -1]

    train, test = train_test_split(labeled, test_size=0.2, random_state=42)

    cols = [c for c in DROPCOLUMS if c in train.columns]
    x_train = train.drop(cols,axis=1)

    cols = [c for c in DROPCOLUMS if c in test.columns]
    x_test = test.drop(cols,axis=1)

    y_train = train['label']
    y_test = test['label']
    return x_train, y_train, x_test, y_test

def iload_predict_data():
    upload_test = pd.read_csv(predict_data_path)
    upload_test = upload_test.fillna(0)
    upload_id = upload_test['id']
    
    cols = [c for c in DROPCOLUMS if c in upload_test.columns]
    upload_test = upload_test.drop(cols,axis=1)

    return upload_id, upload_test


def isave_predict_data(data_id,predict,filename):
    p = pd.DataFrame(predict,columns=["score"])
    res = pd.concat([data_id,p],axis=1)
    res.to_csv(filename,index=False)
    print("[+] Save Predict Result To {} Sucessful".format(filename))
```
而预测是单独的predict.py文件，会自动加载由`train.py`训练完成后的模型，然后进行批量预测，并保存到相应的文件夹中。 

ps: 1332 人参赛，目前居然只有36人提交结果。大佬都是在后面提交的啊。自己还是真的菜。不过让我想不明白的是，这个比赛每天只启动一次系统测评，不像之前的腾讯广告回流的那个，每次提交都会即时评测，可以方便调优，但这个又不是，搞不懂。不过我已经有了新的思路去做这个了。关键点不一定是那些个-1的标签，但一定是个突破点。

![screenshot from 2018-05-03 23-58-02](https://img.iami.xyz/images/39588187-df04c13a-4f2d-11e8-8046-695c8134d10b.png)


 # Resources
* [autoclf](https://github.com/mylamour/autoclf)
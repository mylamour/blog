---
layout: post
title: Built an AutoML Project
categories: Security Engineer
kerywords: Machine Learning Tool AutoCLF Auto Machine Learning
tags: AI and Machine Learning Tool Security R&D
translated: true
---

Whether competing in contests or working on real projects, after cleaning the data, you never just test with a single algorithm - you inevitably need to compare multiple algorithms. [autoclf](https://github.com/mylamour/autoclf) is a simple framework I built over two days while participating in the Alibaba Risk Payment Competition.

The directory structure is:
```
├── [4.0K]  clf
│   │
│   ├── [4.0K]  nn
│
├── [4.0K]  data
│
├── [4.0K]  pipe
│
└── [4.0K]  saved

```

The `clf` directory contains common or custom algorithms, while the `nn` directory has custom deep learning algorithms bound to the `sklearn` interface. Custom algorithms exist as classes - you just need to implement `fit`, `score`, and `predict`. But if your custom `fit` uses `sklearn` training, you don't need to redefine `score` and `predict`. Like this example: (`clf/isvc.py`)

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

Then just call it in `train.py`. The project is still being improved - planning to add a CLI interface. But the most important part of training is definitely data preprocessing and feature selection, and the data passed into `train.py` comes from preprocessing functions defined in the `pipe` folder.
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
# PCA unsupervised, LDA supervised
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
The prediction is in a separate predict.py file, which automatically loads models trained by `train.py`, then does batch predictions and saves them to the appropriate folder.

ps: 1332 people signed up for the competition, but only 36 have submitted results so far. The real experts all submit at the end. I'm still pretty bad at this. What I can't figure out is that this competition only runs system evaluation once per day, unlike the previous Tencent ad conversion contest where each submission was evaluated immediately for easy tuning. Not sure what they're thinking. But I already have new ideas for tackling this. The key might not be those -1 labels, but they're definitely a breakthrough point.

![screenshot from 2018-05-03 23-58-02](https://img.iami.xyz/images/39588187-df04c13a-4f2d-11e8-8046-695c8134d10b.png)


 # Resources
* [autoclf](https://github.com/mylamour/autoclf)

---
layout: post
title: sklearn和特征工程
categories: 学习数据挖掘的路上
kerywords: 机器学习 Sklearn 特征工程
tags: 机器学习
---

ipynb文件在我的gist[点这里](https://gist.github.com/mylamour/b1700c0b22253dac66498fe4d01fa727)，等到后期整理下，把`bitbucket`上我的机器学习笔记迁移过来, 本篇是 https://www.cnblogs.com/jasonfreak/p/5448385.html 的学习笔记
```python
# Learn from https://www.cnblogs.com/jasonfreak/p/5448385.html
# Note And Tutorial
# use `notedown features_engine.ipynb --to markdown --strip  >  xx.md`
# notedown installed by `pip install notedown`

%matplotlib inline

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
```

```python
iris = load_iris()
print(iris.data)
print(iris.target)
```

# 数据预处理

```python
# 标准化需要计算特征的均值和方差, 返回值为标准化后的数据
# x' = (x - mean(x)) / S
from sklearn.preprocessing import StandardScaler
StandardScaler().fit_transform(iris.data)
```

```python
# 归一化
from sklearn.preprocessing import Normalizer
Normalizer().fit_transform(iris.data)
```

```python
# 区间缩放法,最常见的是最值缩放
# x' = (x- Min)/(Max - Min)
from sklearn.preprocessing import MinMaxScaler
MinMaxScaler().fit_transform(iris.data)

```

# 标准化与归一化的区别
标准化是依照特征矩阵的列处理数据，其通过求z-score的方法，将样本的特征值转换到同一量纲下。
归一化是依照特征矩阵的行处理数据，其目的在于样本向量在点乘运算或其他核函数计算相似性时，拥有统一的标准，也就是说都转化为“单位向量。

```python
# 二値化
from sklearn.preprocessing import Binarizer
Binarizer(threshold=3).fit_transform(iris.data)
```

```python
# 定性特征One-Hot
from sklearn.preprocessing import OneHotEncoder
print(OneHotEncoder().fit_transform(iris.target.reshape((-1,1))))

```

```python
# 缺失值计算
# 返回值为计算缺失值后的数据

from sklearn.preprocessing import Imputer
Imputer().fit_transform(np.vstack(np.asarray([np.nan for  i in range(4)])), iris.data)
```

```python
# 数据变换
# 有基于多项式的,基于指数的,基于对数函数的
from sklearn.preprocessing import PolynomialFeatures
PolynomialFeatures().fit_transform(iris.data)

```

```python
from sklearn.preprocessing import FunctionTransformer
FunctionTransformer(np.log1p).fit_transform(iris.data)
```

# 特征选择

* 特征是否发散：

如果一个特征不发散，例如方差接近于0，也就是说样本在这个特征上基本上没有差异，这个特征对于样本的区分并没有什么用。

* 特征与目标的相关性：

这点比较显见，与目标相关性高的特征，应当优选选择。除方差法外，本文介绍的其他方法均从相关性考虑。
根据特征选择的形式又可以将特征选择方法分为3种：
* Filter：过滤法，
按照发散性或者相关性对各个特征进行评分，设定阈值或者待选择阈值的个数，选择特征。
* Wrapper：包装法，
根据目标函数（通常是预测效果评分），每次选择若干特征，或者排除若干特征。
* Embedded：嵌入法，
先使用某些机器学习的算法和模型进行训练，得到各个特征的权值系数，根据系数从大到小选择特征。类似于Filter方法，但是是通过训练来确定特征的优劣。

# Filter

```python
# Filter: 方差选择法
from sklearn.feature_selection import VarianceThreshold
VarianceThreshold(threshold=3).fit_transform(iris.data)
```

```python
# Filter: 相关系数法
from sklearn.feature_selection import SelectKBest
from scipy.stats import pearsonr
SelectKBest(lambda X, Y: \
                tuple(map(tuple,np.array(list(map(lambda x:\
                        pearsonr(x, Y), X.T))).T)), k=2)\
                    .fit_transform(iris.data, iris.target)

```

```python
# Filter: 卡方检验
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2

SelectKBest(chi2, k=2).fit_transform(iris.data, iris.target)
```

```python
# Filter: 互信息法
# from sklearn.feature_selection import SelectKBest

```

```python
# Warpper: 递归特征消除
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression

RFE(estimator=LogisticRegression(), n_features_to_select=2)\
                        .fit_transform(iris.data,iris.target)


```

# Embedded
使用带惩罚项的基模型，除了筛选出特征外，同时也进行了降维。
基于L1惩罚项,L1惩罚项降维的原理在于保留多个对目标值具有同等相关性的特征中的一个,所以没选到的特征不代表不重要。

结合L2惩罚项来优化,具体操作为：
若一个特征在L1中的权值为1，选择在L2中权值差别不大且在L1中权值为0的特征构成同类集合，将这一集合中的特征平分L1中的权值.

```python
# Embedded: 基于惩罚模型特征选择法
from sklearn.feature_selection import SelectFromModel
from sklearn.linear_model import LogisticRegression

SelectFromModel(LogisticRegression(penalty='l1', C=0.1))\
                .fit_transform(iris.data,iris.target)

```

```python
# Embedded: 基于树模型的特征选择
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import GradientBoostingClassifier

SelectFromModel(GradientBoostingClassifier())\
        .fit_transform(iris.data, iris.target)
```

```python
# 基于树模型
from sklearn.ensemble import ExtraTreesClassifier
clf = ExtraTreesClassifier()
clf.fit(iris.data,iris.target)
print(clf.feature_importances_)
# OR Just use Select From Model
SelectFromModel(clf, prefit=True).transform(iris.data)
```

# 降维

当特征选择完成后，可以直接训练模型了，但是可能由于特征矩阵过大，导致计算量大，训练时间长的问题，因此降低特征矩阵维度也是必不可少的。
常见的降维方法除了以上提到的基于L1惩罚项的模型以外，另外还有主成分分析法（PCA）和线性判别分析（LDA），线性判别分析本身也是一个分类模型。
PCA和LDA有很多的相似点，其本质是要将原始的样本映射到维度更低的样本空间中，但是PCA和LDA的映射目标不一样：
* PCA是为了让映射后的样本具有最大的发散性；
* 而LDA是为了让映射后的样本有最好的分类性能。
所以说PCA是一种无监督的降维方法，而LDA是一种有监督的降维方法。

```python
# 降维: PCA
from sklearn.decomposition import PCA
PCA(n_components=2).fit_transform(iris.data)

```

```python
# 降维: LDA
from sklearn.lda import  LDA
LDA(n_components=2).fit_transform(iris.data, iris.target)
```

# 总结

## 数据预处理

| 类                  | 功能               | 说明                                                     |
|---------------------|--------------------|----------------------------------------------------------|
| StandardScaler      | 无量纲化           | 标准化，基于特征矩阵的列，将特征值转换至服从标准正态分布 |
| MinMaxScaler        | 无量纲化           | 区间缩放，基于最大最小值，将特征值转换到[0, 1]区间上     |
| Normalizer          | 归一化             | 基于特征矩阵的行，将样本向量转换为“单位向量”             |
| Binarizer           | 二值化             | 基于给定阈值，将定量特征按阈值划分                       |
| OneHotEncoder       | 哑编码             | 将定性数据编码为定量数据                                 |
| Imputer             | 缺失值计算         | 计算缺失值，缺失值可填充为均值等                         |
| PolynomialFeatures  | 多项式数据转换     | 多项式数据转换                                           |
| FunctionTransformer | 自定义单元数据转换 | 使用单变元的函数来转换数据                               |


##  特征选择

| 类                | 所属方式 | 说明                                                   |
|-------------------|----------|--------------------------------------------------------|
| VarianceThreshold | Filter   | 方差选择法                                             |
| SelectKBest       | Filter   | 可选关联系数、卡方校验、最大信息系数作为得分计算的方法 |
| RFE               | Wrapper  | 递归地训练基模型，将权值系数较小的特征从特征集合中消除 |
| SelectFromModel   | Embedded | 训练基模型，选择权值系数较高的特征                     |



# References

* [机器学习中，有哪些特征选择的工程方法？](https://www.zhihu.com/question/28641663/answer/41653367)

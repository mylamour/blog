---
layout: post
title: Sklearn and Feature Engineering
categories: Security Engineer
kerywords: Machine Learning Sklearn Feature Engineering
tags: AI and Machine Learning Learning Data Mining
translated: true
---

The ipynb file is in my gist [click here](https://gist.github.com/mylamour/b1700c0b22253dac66498fe4d01fa727). I'll migrate my machine learning notes from `bitbucket` later. This post is my study notes from https://www.cnblogs.com/jasonfreak/p/5448385.html
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

# Data Preprocessing

```python
# Standardization requires calculating feature mean and variance, returns standardized data
# x' = (x - mean(x)) / S
from sklearn.preprocessing import StandardScaler
StandardScaler().fit_transform(iris.data)
```

```python
# Normalization
from sklearn.preprocessing import Normalizer
Normalizer().fit_transform(iris.data)
```

```python
# Interval scaling, most common is min-max scaling
# x' = (x- Min)/(Max - Min)
from sklearn.preprocessing import MinMaxScaler
MinMaxScaler().fit_transform(iris.data)

```

# Difference Between Standardization and Normalization
Standardization processes data based on the columns of the feature matrix. Through the z-score method, it converts feature values to the same scale.
Normalization processes data based on the rows of the feature matrix. Its purpose is to give sample vectors a unified standard when calculating similarity through dot product operations or other kernel functions, essentially transforming them all into "unit vectors".

```python
# Binarization
from sklearn.preprocessing import Binarizer
Binarizer(threshold=3).fit_transform(iris.data)
```

```python
# One-Hot encoding for categorical features
from sklearn.preprocessing import OneHotEncoder
print(OneHotEncoder().fit_transform(iris.target.reshape((-1,1))))

```

```python
# Imputing missing values
# Returns data after imputing missing values

from sklearn.preprocessing import Imputer
Imputer().fit_transform(np.vstack(np.asarray([np.nan for  i in range(4)])), iris.data)
```

```python
# Data transformation
# Can be polynomial-based, exponential-based, or logarithmic function-based
from sklearn.preprocessing import PolynomialFeatures
PolynomialFeatures().fit_transform(iris.data)

```

```python
from sklearn.preprocessing import FunctionTransformer
FunctionTransformer(np.log1p).fit_transform(iris.data)
```

# Feature Selection

* Feature variance:

If a feature doesn't vary much, for example if its variance is close to 0, it means samples have almost no difference in this feature, so the feature isn't useful for distinguishing samples.

* Feature correlation with target:

This is pretty obvious - features with high correlation to the target should be prioritized. Except for the variance method, all other methods introduced here consider correlation.
Based on the form of feature selection, methods can be divided into 3 types:
* Filter:
Score each feature by variance or correlation, then set a threshold or the number of features to select.
* Wrapper:
Based on an objective function (usually prediction performance), select or exclude several features at a time.
* Embedded:
First use some machine learning algorithms and models for training to get the weight coefficients of each feature, then select features based on coefficients from large to small. Similar to Filter methods, but determines feature quality through training.

# Filter

```python
# Filter: Variance threshold method
from sklearn.feature_selection import VarianceThreshold
VarianceThreshold(threshold=3).fit_transform(iris.data)
```

```python
# Filter: Correlation coefficient method
from sklearn.feature_selection import SelectKBest
from scipy.stats import pearsonr
SelectKBest(lambda X, Y: \
                tuple(map(tuple,np.array(list(map(lambda x:\
                        pearsonr(x, Y), X.T))).T)), k=2)\
                    .fit_transform(iris.data, iris.target)

```

```python
# Filter: Chi-square test
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2

SelectKBest(chi2, k=2).fit_transform(iris.data, iris.target)
```

```python
# Filter: Mutual information
# from sklearn.feature_selection import SelectKBest

```

```python
# Wrapper: Recursive feature elimination
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression

RFE(estimator=LogisticRegression(), n_features_to_select=2)\
                        .fit_transform(iris.data,iris.target)


```

# Embedded
Use base models with penalty terms, which both select features and perform dimensionality reduction.
Based on L1 penalty - the principle of L1 penalty dimensionality reduction is to keep one feature among multiple features that have equal correlation with the target value, so unselected features don't necessarily mean they're unimportant.

Optimize by combining L2 penalty:
If a feature has weight 1 in L1, select features that have similar weight in L2 but weight 0 in L1 to form a similar set, and evenly distribute the weight from L1 among features in this set.

```python
# Embedded: Penalty model-based feature selection
from sklearn.feature_selection import SelectFromModel
from sklearn.linear_model import LogisticRegression

SelectFromModel(LogisticRegression(penalty='l1', C=0.1))\
                .fit_transform(iris.data,iris.target)

```

```python
# Embedded: Tree model-based feature selection
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import GradientBoostingClassifier

SelectFromModel(GradientBoostingClassifier())\
        .fit_transform(iris.data, iris.target)
```

```python
# Tree model-based
from sklearn.ensemble import ExtraTreesClassifier
clf = ExtraTreesClassifier()
clf.fit(iris.data,iris.target)
print(clf.feature_importances_)
# OR Just use Select From Model
SelectFromModel(clf, prefit=True).transform(iris.data)
```

# Dimensionality Reduction

After feature selection is complete, you can train the model directly, but the feature matrix might be too large, causing high computational cost and long training time, so reducing feature matrix dimensions is essential.
Common dimensionality reduction methods include the L1 penalty-based models mentioned above, as well as Principal Component Analysis (PCA) and Linear Discriminant Analysis (LDA), where Linear Discriminant Analysis itself is also a classification model.
PCA and LDA have many similarities - their essence is to map original samples to a lower-dimensional sample space, but PCA and LDA have different mapping goals:
* PCA aims to make mapped samples have maximum variance;
* LDA aims to make mapped samples have the best classification performance.
So PCA is an unsupervised dimensionality reduction method, while LDA is a supervised dimensionality reduction method.

```python
# Dimensionality reduction: PCA
from sklearn.decomposition import PCA
PCA(n_components=2).fit_transform(iris.data)

```

```python
# Dimensionality reduction: LDA
from sklearn.lda import  LDA
LDA(n_components=2).fit_transform(iris.data, iris.target)
```

# Summary

## Data Preprocessing

| Class               | Function                    | Description                                                                           |
|---------------------|-----------------------------|---------------------------------------------------------------------------------------|
| StandardScaler      | Scaling                     | Standardization, column-based on feature matrix, converts feature values to standard normal distribution |
| MinMaxScaler        | Scaling                     | Interval scaling, based on max-min values, converts feature values to [0, 1] interval |
| Normalizer          | Normalization               | Row-based on feature matrix, converts sample vectors to "unit vectors"                |
| Binarizer           | Binarization                | Based on given threshold, divides quantitative features by threshold                  |
| OneHotEncoder       | Dummy encoding              | Encodes categorical data as quantitative data                                         |
| Imputer             | Missing value imputation    | Imputes missing values, can be filled with mean etc.                                  |
| PolynomialFeatures  | Polynomial transformation   | Polynomial data transformation                                                        |
| FunctionTransformer | Custom transformation       | Uses univariate functions to transform data                                           |


##  Feature Selection

| Class             | Method   | Description                                                                    |
|-------------------|----------|--------------------------------------------------------------------------------|
| VarianceThreshold | Filter   | Variance threshold method                                                      |
| SelectKBest       | Filter   | Can use correlation coefficient, chi-square test, maximal information coefficient as scoring methods |
| RFE               | Wrapper  | Recursively trains base model, eliminates features with smaller weight coefficients from feature set |
| SelectFromModel   | Embedded | Trains base model, selects features with higher weight coefficients            |



# References

* [What are the engineering methods for feature selection in machine learning?](https://www.zhihu.com/question/28641663/answer/41653367)

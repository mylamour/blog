---
layout: post
title: 机器学习笔记整理
categories: 学习数据挖掘的路上
tags: 学习笔记 机器学习
---

整理自Bitbucket中机器学习笔记和手抄本


* `from keras.utils.visualize_util import plot` api upgrade
> 

```python 

from keras.utils.vis_utils import plot_model
from IPython.display import Image

plot_model(model, to_file="model.png", show_shapes=True)
Image('model.png')

```

* ["Merge" versus "merge", what is the difference?](https://github.com/keras-team/keras/issues/3921)

>   Merge is a layer. Merge takes layers as input.Merge is usually used with Sequential models,merge is a function.merge takes tensors as input.merge is a wrapper around Merge. merge is used in Functional API. Using Merge:

```python
    left = Sequential()
    left.add(...)
    left.add(...)

    right = Sequential()
    right.ad(...)
    right.add(...)

    model = Sequential()
    model.add(Merge([left, right]))
    model.add(...)
    using merge:

    a = Input((10,))
    b = Dense(10)(a)
    c = Dense(10)(a)
    d = merge([b, c])
    model = Model(a, d)
```

`from keras.engine import merge` -> `from keras.layers import merge` 

* E tensorflow/stream_executor/cuda/cuda_blas.cc:444] failed to create cublas handle: CUBLAS_STATUS_NOT_INITIALIZED

> Probably Out Of Memory, Use `nvidia-smi ` check it, also `nvidia-smi -l 1`, and stop that process.

* Save whole model(architecture + weights + optimizer state) or just save weights
 
> 

```python

from keras.models import load_model

model.save('my_model.h5')  # creates a HDF5 file 'my_model.h5'
del model  # deletes the existing model

# returns a compiled model
# identical to the previous one
model = load_model('my_model.h5')

```

```python

json_string = model.to_json()

# save as YAML
yaml_string = model.to_yaml()

# model reconstruction from JSON:
from keras.models import model_from_json
model = model_from_json(json_string)

# model reconstruction from YAML
from keras.models import model_from_yaml
model = model_from_yaml(yaml_string)

```

* Vairble-Size Image As Input

> https://github.com/keras-team/keras/issues/1920

* Numpy remove scientific notation

> np.set_printoptions(suppress=True)

* How get input sequence length by keras?

> sequence_length = model.input.shape[1].value

* How get most common value in passed array?

> 

```python

from scipy.stats import mode
mode(array)

```

* What is val_loss and val_acc? what is different between acc and val_acc
> val_loss and val_acc is meaning your model accuracy in valdation datasets

* how to tell which keras model is better, Do I use the "acc" (from the training data?) one or the "val acc" (from the validation data?) one?

> 

```
Model1: 
    loss: 0.1884 - acc: 0.8062 - val_loss: 0.2542 - val_acc: 0.7449
Model2:
    loss: 0.1905 - acc: 0.8062 - val_loss: 0.2460 - val_acc: 0.7531
```

> [StackOverFlow Answer](https://stackoverflow.com/questions/34702041/how-to-tell-which-keras-model-is-better?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa)

> If you want to estimate the ability of your model to generalize to new data (which is probably what you want to do), then you look at the validation accuracy, because the validation split contains only data that the model never sees during the training and therefor cannot just memorize.

> If your training data accuracy ("acc") keeps improving while your validation data accuracy ("val_acc") gets worse, you are likely in an overfitting situation, i.e. your model starts to basically just memorize the data.

* `fit` difference with `fit_transform`
> https://datascience.stackexchange.com/questions/12321/difference-between-fit-and-fit-transform-in-scikit-learn-models

* 随机森林等于决策树加Bagging,Bagging原理是什么?
> 有放回的选出m个大小为n的子集作为信的训练集，在m个训练集上使用分类回归等算法，可得到m个模型，然后通过取平均值，多数票等方法，即可得到Bagging的结果

* 为什么要剪枝，预剪枝和后剪枝有什么区别
> 先剪枝，自上向下速度快，后剪枝自底向上准确率高。预剪枝是在每个节点划分前进行估计，若当前节点的划分不能带来决策树的泛化能力提升，则停止划分并将当前节点划分为叶节点。后剪枝则先从训练集生成一棵完整的决策树，然后自底向上的对非叶节点进行考察，若将该节点时对应的子树替换为叶节点不能带来泛化能力的提升，则该子树替换为叶节点。

* 随机森林的优缺点
> 优点:
1. 高度并行化
2. 随机选择决策树节点划分特征，在特征维度很高时，便能高效训练模型。
3. 选择特征，树都具有选择特征
4. 随机采样，使模型方差小，泛化能力强
5. 比Boosting简单
6. 对部分特征缺失不反感 然而感觉并不是
> 缺点:
1. 噪音比较大的样本，容易过拟合
2. 取值划分比较多的特征容易对RF的决策产生更大的影响，从而影响你和的模型的效果


<!-- * Loss是不是可以大于1, 值为多少时比较好? -->


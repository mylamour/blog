---
layout: post
title: 把Keras Models放进Sklearn的Pipeline
categories: 安全工程师
kerywords: 机器学习 聚类算法 GridSearch CV
tags: AI与机器学习 学习数据挖掘
---

# Create Keras Model 
```python
from keras.wrappers.scikit_learn import KerasClassifier
def create_model(kernel_initializer='he_normal', optimizer='adam', activation='relu', dropout=0.5):
    inputs = Input(shape=(sequence_length,), dtype='int32')
    embedding = Embedding(input_dim=vocabulary_size,
                          output_dim=embedding_dim, input_length=sequence_length)(inputs)
    reshape = Reshape((sequence_length, embedding_dim, 1))(embedding)

    conv_0 = Conv2D(num_filters, kernel_size=(
        filter_sizes[0], embedding_dim), padding='valid', kernel_initializer=kernel_initializer, activation=activation)(reshape)
    conv_1 = Conv2D(num_filters, kernel_size=(
        filter_sizes[1], embedding_dim), padding='valid', kernel_initializer=kernel_initializer, activation=activation)(reshape)
    conv_2 = Conv2D(num_filters, kernel_size=(
        filter_sizes[2], embedding_dim), padding='valid', kernel_initializer=kernel_initializer, activation=activation)(reshape)

    maxpool_0 = MaxPool2D(pool_size=(
        sequence_length - filter_sizes[0] + 1, 1), strides=(1, 1), padding='valid')(conv_0)
    maxpool_1 = MaxPool2D(pool_size=(
        sequence_length - filter_sizes[1] + 1, 1), strides=(1, 1), padding='valid')(conv_1)
    maxpool_2 = MaxPool2D(pool_size=(
        sequence_length - filter_sizes[2] + 1, 1), strides=(1, 1), padding='valid')(conv_2)

    concatenated_tensor = Concatenate(axis=1)(
        [maxpool_0, maxpool_1, maxpool_2])
    flatten = Flatten()(concatenated_tensor)
    dropout = Dropout(dropout)(flatten)
    output = Dense(units=2, activation='softmax')(dropout)

    # this creates a model that includes
    model = Model(inputs=inputs, outputs=output)

    model.compile(optimizer=optimizer, loss='binary_crossentropy',
                  metrics=['accuracy'])
    return model

keras_clf = KerasClassifier(build_fn=create_model)
```
如果是创建回归模型，就 `from keras.wrappers.scikit_learn import KerasRegressor`, 从上面函数可以看出，只要把自己以前的模型定义为一个函数，然后在`bind`函数(`KerasRegressor`或者`KerasClassifier`)里传进去即可

# Pipeline
```python
from sklearn.pipeline import Pipeline
pipline = Pipeline([
    # ('preprocess_step1',None),
    # ('preprocess_step2',None),
    # ('preprocess_step3',None)
    ('clf', keras_clf)
])
```
`pipeline`是sklearn中用于对整个数据训练流程进行流式处理的函数，可以把对数据进行预处理，特征选择等等都写作为每一步写进去即可．

# GridSearch CV
```python
from sklearn.model_selection import GridSearchCV
param_grid = {
    'clf__optimizer': ['rmsprop', 'adam', 'adagrad'],
    'clf__epochs': [200, 300, 400, 700, 1000],
    'clf__batch_size': [32, 64, 128],
    'clf__dropout': [0.1, 0.2, 0.3, 0.4, 0.5],
    'clf__kernel_initializer': ['he_normal', 'glorot_uniform', 'normal', 'uniform']
}
grid = GridSearchCV(pipline, cv=3, param_grid=param_grid)
grid.fit(X_train, y_train)
```
网格搜索听起来很高大上，也就是自动调参，也是暴力搜索．注意的是，在小数据集上很有用，数据集大了就不太适用了．

```python
print(" Best {} using {}".format(grid.best_score_, grid.best_params_))
means = grid.cv_results_['mean_test_score']
stds = grid.cv_results_['std_test_score']
params = grid.cv_results_['params']

for mean, stdev, param in zip(means, stds, params):
    print('{} {} with {}'.format(mean, stdev, param))
```
训练结束之后，可以通过`grid.best_score_`和`grid.best_params_`的方式得到其最优精度及参数.完整代码见[这里](https://ghostbin.com/paste/44wcu)

暴力搜索起到了一些作用，更好的方式，可以找若干篇论文中的参数(一般来讲，不会差别太大)，然后挑几个作为调参的参数．毕竟这些都是别人调过的，然后看下在这几种不同的参数上，模型表现出的效果．

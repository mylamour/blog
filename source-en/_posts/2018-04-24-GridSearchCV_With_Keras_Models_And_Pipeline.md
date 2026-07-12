---
layout: post
title: Plugging Keras Models into Sklearn's Pipeline
categories: Security Engineer
kerywords: machine learning clustering GridSearch CV
tags: AI and Machine Learning Learning Data Mining
translated: true
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
If you're building a regression model instead, just swap in `from keras.wrappers.scikit_learn import KerasRegressor`. The idea is simple — wrap your existing model definition as a function, then pass it into `KerasRegressor` or `KerasClassifier` via `build_fn`.

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
`Pipeline` is sklearn's way of chaining an entire training workflow together: preprocessing, feature selection, and model training as sequential steps. Add each step in order.

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
GridSearchCV is automated hyperparameter tuning through brute-force search. It works well on small datasets, but becomes expensive as the data grows.

```python
print(" Best {} using {}".format(grid.best_score_, grid.best_params_))
means = grid.cv_results_['mean_test_score']
stds = grid.cv_results_['std_test_score']
params = grid.cv_results_['params']

for mean, stdev, param in zip(means, stds, params):
    print('{} {} with {}'.format(mean, stdev, param))
```
After training, grab `grid.best_score_` and `grid.best_params_` to get the best accuracy and the params that got you there. Full code is [here](https://ghostbin.com/paste/44wcu).

Brute-force search can help, but it is often more efficient to review hyperparameters used in relevant papers, choose a reasonable subset, and compare those values. There is no need to rediscover a range that others have already established.

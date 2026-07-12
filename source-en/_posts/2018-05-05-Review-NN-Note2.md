---
layout: post
title: Machine Learning Notes Compilation
categories: Security Engineer
kerywords: AI and Machine Learning
tags: AI and Machine Learning
translated: true
---

Compiled from machine learning notes and handwritten notebooks in Bitbucket.


* `from keras.utils.visualize_util import plot` API update
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

> This is probably an out-of-memory issue. Check with `nvidia-smi ` or `nvidia-smi -l 1`, then stop the relevant process.

* Save the whole model (architecture, weights, and optimizer state) or only the weights
 
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

* Variable-Size Images as Input

> https://github.com/keras-team/keras/issues/1920

* Disable scientific notation in NumPy

> np.set_printoptions(suppress=True)

* How do I get the input sequence length in Keras?

> sequence_length = model.input.shape[1].value

* How do I get the most common value in an array?

> 

```python

from scipy.stats import mode
mode(array)

```

* What are `val_loss` and `val_acc`? What is the difference between `acc` and `val_acc`?
> `val_loss` and `val_acc` measure the model's loss and accuracy on the validation dataset.

* How do I determine which Keras model is better? Should I use `acc` from the training data or `val_acc` from the validation data?

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

* Difference between `fit` and `fit_transform`
> https://datascience.stackexchange.com/questions/12321/difference-between-fit-and-fit-transform-in-scikit-learn-models

* Random Forest equals Decision Tree plus Bagging, what is Bagging?
> Bagging works by randomly selecting m subsets of size n with replacement as new training sets. Train classification/regression algorithms on these m training sets to get m models, then use averaging, majority voting, etc. to get the final Bagging result.

* Why pruning? What's the difference between pre-pruning and post-pruning?
> Pre-pruning is top-down and fast, post-pruning is bottom-up and more accurate. Pre-pruning estimates before splitting each node - if the split doesn't improve generalization, stop and make it a leaf node. Post-pruning first builds a complete decision tree from the training set, then examines non-leaf nodes bottom-up - if replacing a subtree with a leaf node doesn't hurt generalization, replace it.

* Pros and cons of Random Forest
> Pros:
1. Highly parallelizable
2. Randomly selects features for decision tree node splits, can efficiently train models even with high feature dimensionality
3. Feature selection capability, trees inherently select features
4. Random sampling makes model variance low and generalization strong
5. Simpler than Boosting
6. Not sensitive to partial feature missing though honestly feels like it is

> Cons:
1. Easily overfits on noisy samples
2. Features with more split values tend to have bigger influence on RF decisions, affecting the fitted model's performance


<!-- * Can Loss be greater than 1, what value is good? -->

---
layout: post
title: Machine Learning Notes Compilation
categories: Security Engineer
kerywords: AI and Machine Learning
tags: AI and Machine Learning
translated: true
---

Compiled from machine learning notes and handwritten notebooks in Bitbucket


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


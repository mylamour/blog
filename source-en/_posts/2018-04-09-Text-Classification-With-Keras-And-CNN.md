---
layout: post
title: Text Classification with Keras and CNN
categories: Security Engineer
keywords: Text Classification, Keras, CNN, text classification
kerywords: Text Classification, Keras, CNN, text classification
tags: AI-and-ML Learning-Data-Mining
translated: true
---

Originally written as internal documentation at work, now reorganized and cleaned up.

# Overview

Deep learning is a branch of machine learning — neither of them is new tech, both have been around for a long time. The reason deep learning started getting so much public attention recently comes down to two things: one, computing power finally caught up and allowed us to actually run experiments that previously could only exist as theory; two, media hype. Deep learning has performed really well across a lot of areas lately, especially image recognition and NLP. But everything has tradeoffs — deep learning is no exception. ML and DL both have their strengths and weaknesses, and figuring out which one fits your actual use case is what engineers are supposed to be doing.

Traditional ML requires **data collection and labeling** plus **feature extraction** (either by hand or with tools). Feature engineering typically takes up 70%+ of a project's total time. There's a great [tutorial](https://www.cnblogs.com/jasonfreak/p/5448385.html) on this in the references. The cleaned-up Jupyter notebook is available [here](https://gist.github.com/mylamour/b1700c0b22253dac66498fe4d01fa727). Deep learning sidesteps manual feature engineering by scaling up data and building more complex networks with more layers, letting them learn features automatically. The core mechanisms: filters scan for features, pooling layers reduce dimensionality going into the next layer, backpropagation + gradient descent find decent parameters, and activation functions decide the output class. The obvious tradeoff is that this automated approach chews through a lot more compute, memory, and time — and needs a lot more data.

Worth noting: ML is not magic, and not everything should be solved with ML. You need to ask whether it actually improves accuracy over traditional methods. We figure that out through experimentation. ML problems generally fall into four buckets: classification, clustering, regression, and prediction. Classification is the most common. Depending on domain you get image classification, text classification, etc. By number of classes you have binary and multi-class. Text classification breaks down further into long-text vs short-text classification, and by label availability into supervised vs unsupervised. That kind of thing.

# Text Classification

Whether it's image classification or text classification, computers fundamentally don't "understand" what you're showing them. You tell it "this is a cat", "this is a dog", "this is a rumor", "this is a famous quote" — it has no idea. Computers live in a world of 0s and 1s. To make them work with data, you have to **convert it into vectors** first. Converting images to arrays is pretty intuitive since digital images are already arrays. Converting text to vectors is trickier — the mapping strategy matters a lot. `tf-idf` and `skipngram` are the common approaches. Then Google came out with the famous word2vec. There are others too, like `glove`. For generating word vectors, sentence vectors, etc., I'd suggest using `gensim`.

```
* Text preprocessing - reading
* Text preprocessing - tokenization
* Text preprocessing - POS tagging  (haven't used this)
* Text preprocessing - lexical dependencies  (haven't used this)
* Text preprocessing - syntactic dependencies  (haven't used this)
* Text preprocessing - named entity recognition  (haven't used this)
* Text preprocessing - generating word vectors
Just read a book for these — more authoritative and detailed (or I'll update this later)
```

## TF-IDF

Used to extract features from text. Already covered in a previous [text summarization post](/Text-Summarization-GF/), not going to repeat it here. Can be combined with `sklearn pipeline` for preprocessing.

```python

n_features = 20000
n_components = 6

# Read dir file and single line in list
files = read_dir('/home/mour/working/YaraGEN/webshelldata/uniqphp')

# Convert To Vectorizer Transform With TFIDF based on Hashing Vectorizer
hasher = HashingVectorizer(n_features=n_features, stop_words='english',
                                alternate_sign=False,
                                norm=None, binary=False)
vectorizer = make_pipeline(hasher, TfidfTransformer())

X = vectorizer.fit_transform(files)

```

The resulting X is the converted word vector.
> As for why `HashingVectorizer` first then `Tfidf` — I only saw this pattern a few days ago. Used to just go straight to `Tf-idf`.

## What methods exist for text classification?

Now that text has been converted to vectors, any algorithm that works for classification works for text classification too. Traditional ML is mostly statistics-based; deep learning is neural-network-based, where the neuron is the smallest building block (a perceptron). Worth understanding the fundamentals and working through the math. That said, the libraries are mature and tools are everywhere. Here's a `Decision Tree` example using sklearn:

```python

import matplotlib.pyplot as plt

from sklearn.datasets.samples_generator import make_blobs
from sklearn.tree import DecisionTreeClassifier

X, y = make_blobs(n_samples=300, centers=4, random_state= 0, cluster_std=1.0)

tree = DecisionTreeClassifier()
tree.fit(X,y)
labels = tree.predict(X)

plt.subplot(1,2,1)
plt.scatter(X[:, 0], X[:, 1], c=y, s=50, cmap='rainbow')

plt.subplot(1,2,2)
plt.scatter(X[:, 0], X[:, 1], c=labels, s=50, cmap='brg')

plt.show()

```

![demo_decison_tree](https://img.iami.xyz/images/mldl/demo_decison_tree.png)

# CNN and Text Classification

As you can see, decision trees do a solid job classifying data with obvious patterns. For neural networks, the deep learning library landscape has basically split into two camps: `tensorflow`+`keras` and `pytorch` (`caffe` and `pytorch` development merged, `theano` looks like it's being abandoned). Bottom line: the libraries are all mature at this point, just pick one and write the code. Here's a CNN model using Keras:

```python

from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from tensorflow.contrib import learn

from keras.layers import Input, Dense, Embedding, Conv2D, MaxPool2D
from keras.layers import Reshape, Flatten, Dropout, Concatenate
from keras.callbacks import ModelCheckpoint
from keras.optimizers import Adam
from keras.models import Model
from sklearn.model_selection import train_test_split
from data_helpers import load_train_data,load_data_and_labels_from_list
from sklearn.utils import shuffle

from colorama import Fore

import numpy as np
import random
import itertools

from colorama import Fore

print(Fore.GREEN + '[-]' + Fore.RESET + 'Loading data...')
X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=42)

sequence_length = X.shape[1]
vocabulary_size = len(vocabulary_inv)
embedding_dim = 128
filter_sizes = [3,4,5]
num_filters = 128
drop = 0.5

epochs = 200
batch_size = 64


def gen(gen_size=250):
     # Create empty arrays to contain batch of features and labels#
    gen_X = np.zeros((gen_size, sequence_length), dtype=np.uint8)
    gen_y = np.zeros((gen_size, 2), dtype=np.uint8)

    while True:
        for i in range(gen_size):
            index = random.choice(range(len(X)))
            gen_X[i] = X[index]
            gen_y[i] = y[index]
        yield gen_X, gen_y

print(Fore.GREEN + '[-]' + Fore.RESET + 'Creating Network...')

inputs = Input(shape=(sequence_length,), dtype='int32')
embedding = Embedding(input_dim=vocabulary_size, output_dim=embedding_dim, input_length=sequence_length)(inputs)
reshape = Reshape((sequence_length,embedding_dim,1))(embedding)

conv_0 = Conv2D(num_filters, kernel_size=(filter_sizes[0], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)
conv_1 = Conv2D(num_filters, kernel_size=(filter_sizes[1], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)
conv_2 = Conv2D(num_filters, kernel_size=(filter_sizes[2], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)

maxpool_0 = MaxPool2D(pool_size=(sequence_length - filter_sizes[0] + 1, 1), strides=(1,1), padding='valid')(conv_0)
maxpool_1 = MaxPool2D(pool_size=(sequence_length - filter_sizes[1] + 1, 1), strides=(1,1), padding='valid')(conv_1)
maxpool_2 = MaxPool2D(pool_size=(sequence_length - filter_sizes[2] + 1, 1), strides=(1,1), padding='valid')(conv_2)

concatenated_tensor = Concatenate(axis=1)([maxpool_0, maxpool_1, maxpool_2])
flatten = Flatten()(concatenated_tensor)
dropout = Dropout(drop)(flatten)
output = Dense(units=2, activation='softmax')(dropout)

# this creates a model that includes
model = Model(inputs=inputs, outputs=output)

checkpoint = ModelCheckpoint('checkpoint/weights.{epoch:03d}-{val_acc:.4f}.hdf5', monitor='val_acc', verbose=1, save_best_only=True, mode='auto')
adam = Adam(lr=1e-4, beta_1=0.9, beta_2=0.999, epsilon=1e-08, decay=0.0)

model.compile(optimizer=adam, loss='binary_crossentropy', metrics=['accuracy'])


print(Fore.GREEN + '[-]' + Fore.RESET + 'Traning Model...')
model.fit(X_train, y_train, batch_size=batch_size, epochs=epochs, verbose=1, callbacks=[checkpoint], validation_data=(X_test, y_test))  # starts training

# print(Fore.GREEN + '[-]' + Fore.RESET + 'Traning Model With Data Generator...')
# model.fit_generator(gen(),validation_data=gen(), steps_per_epoch=batch_size,verbose=1, epochs=epochs, validation_steps=1280 )


# model.evaluate(X_test,y_test)
model.save('oneword_webshell.h5')
print(Fore.GREEN + '[-]' + Fore.RESET + 'Saveing Model Sucessful')


```

The key part is the model definition: Input layer, Conv layer, MaxPool layer. As a high-level interface over `tensorflow`, besides `keras` there's also `tflearn`, but personally I find `keras` way more convenient. Check the [official docs](https://keras-cn.readthedocs.io/en/latest/) for details.

```
inputs = Input(shape=(sequence_length,), dtype='int32')
embedding = Embedding(input_dim=vocabulary_size, output_dim=embedding_dim, input_length=sequence_length)(inputs)
reshape = Reshape((sequence_length,embedding_dim,1))(embedding)

conv_0 = Conv2D(num_filters, kernel_size=(filter_sizes[0], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)
conv_1 = Conv2D(num_filters, kernel_size=(filter_sizes[1], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)
conv_2 = Conv2D(num_filters, kernel_size=(filter_sizes[2], embedding_dim), padding='valid', kernel_initializer='he_normal', activation='relu')(reshape)

maxpool_0 = MaxPool2D(pool_size=(sequence_length - filter_sizes[0] + 1, 1), strides=(1,1), padding='valid')(conv_0)
maxpool_1 = MaxPool2D(pool_size=(sequence_length - filter_sizes[1] + 1, 1), strides=(1,1), padding='valid')(conv_1)
maxpool_2 = MaxPool2D(pool_size=(sequence_length - filter_sizes[2] + 1, 1), strides=(1,1), padding='valid')(conv_2)

concatenated_tensor = Concatenate(axis=1)([maxpool_0, maxpool_1, maxpool_2])
flatten = Flatten()(concatenated_tensor)
dropout = Dropout(drop)(flatten)
output = Dense(units=2, activation='softmax')(dropout)

# this creates a model that includes
model = Model(inputs=inputs, outputs=output)

```

The way I defined the model above is just one option — Keras supports multiple styles. You can also use `Sequential` and `add` layers one by one. If you're running low on memory, you can train with a `generator` instead, which is what the `gen` function above implements. Personally though I found it even slower.

<!-- 
## Installing cuda and libcudnn

* NVIDIA GPU driver, matching version for your OS
Find the [driver](http://www.nvidia.com/Download/index.aspx) for your GPU model and install it.

* [cuda download and install](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1604&target_type=deblocal)

> `sudo dpkg -i cuda-repo-ubuntu1604-9-1-local_9.1.85-1_amd64.deb`

> `sudo apt-key add /var/cuda-repo-<version>/7fa2af80.pub`

> `sudo apt-get update`

> `sudo apt-get install cuda`

* libcudnn
> Requires registration to download

Command history from my install:
```
wget -c "https://developer.nvidia.com/compute/cuda/9.0/Prod/local_installers/cuda_9.0.176_384.81_linux-run"
apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub
echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64 /" | sudo tee /etc/apt/sources.list.d/cuda.list
sudo apt-get update
sudo apt-get -y install cuda-drivers cuda

```

Or just use an [Aliyun](https://help.aliyun.com/document_detail/60149.html?spm=5176.8300896.676852.2.79f16539AHvVpQ) image with pre-installed drivers — AWS AMIs have even more options. Strongly recommend this approach, saves you the whole install process. Every second that instance is running costs money. These days I'd just recommend Google Colab — super convenient, free GPU instances. Keep in mind though, free tier only gets you 12G RAM, not great for large datasets, only good for testing. -->

# References
<!-- * [NVIDA DRIVER INSTALL](http://www.nvidia.com/Download/index.aspx)
* [NVIDA CUDA INSTALL](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1604&target_type=deblocal)
* [cudnn install guide](http://docs.nvidia.com/deeplearning/sdk/cudnn-install/index.html) -->
* [Pros and cons of classification algorithms in data mining](https://www.zhihu.com/question/24169940)
* [Feature engineering on a single machine with sklearn](https://www.cnblogs.com/jasonfreak/p/5448385.html)
* [CNN notes summary](/Review-NN-Note/)
* [Keras Chinese documentation](https://keras-cn.readthedocs.io/en/latest/)

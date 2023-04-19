---
layout: post
title: 使用Keras和CNN进行文本分类
categories: 安全工程师
keywords: Text Classification, Keras, CNN, 文本分类
tags: AI与机器学习 学习数据挖掘
---

以下原为工作时编写的文档，现在进行重新整理

# 概述

深度学习是机器学习的一个分支,两者都并非新兴的技术,都是很久之前就提出来了。而之所以进来深度学习开始大范围的进入公众的视野，一来是计算能力的提升，使得过去只能存在推导不能得到实验的结果得到了证实，二来就是媒体的宣传了。虽然深度学习在近年来在各个领域都取得了非常好的表现，尤其是在图像识别和自然语言处理方面。但正所谓尺有所长，寸有所短，深度学习并不无缺点。机器学习和深度学习的各有优劣，如何根据自己的业务场景进行选择才是工程师应该做的事情。

传统机器学习需要对数据进行**收集标注**以及人工或者机器进行**特征提取**，一般来讲，特征工程往往会占到整个项目的70%或以上的时间，关于特征工程，引用里提供了一份很好的[教程](https://www.cnblogs.com/jasonfreak/p/5448385.html)。经过整理后的jupyter notebook可以在[此处](https://gist.github.com/mylamour/b1700c0b22253dac66498fe4d01fa727)下载。而深度学习恰恰可以避免手工提取特征，通过增大数据量和构造更加复杂的神经网络，增加神经网络的层数使其自动学习到特征。其中利用的原理主要有滤波器扫描特征，池化层减少特征和下一层的输入，以及通过误差逆传播算法以及梯度下降的方式确定相对优参数，采用激活函数以便用来确定输出类别等等。显而易见的是，这种自动化的方式会占用较大的计算和内存，以及更多的时间。同时更多的数据量。

需要注意的是，机器学习并不能被神化，也不是什么都适合用机器学习来做。精确度和传统方法相比是否有新的提升。我们需要在实验的过程中选择。机器学习一般可以被分为分类，聚类，回归，预测四类问题。分类是机器学习中常见的问题。对应不同领域则有图像分类，文本分类等等。根据类别则又有二分类，多分类等。文本分类根据文本还能被分为长文本分类，短文本分类。数据有无标签又可以被分为有监督学习分类，和无监督学习分类。大致诸如此类。

# 文本分类

无论是图像分类还是文本分类，计算机或者程式本身是不能识别的，你告诉他这是猫，这是狗，这是谣言，这是名句。他不懂的。计算机的世界是0和1，数字构成的世界。想要他认识就先要**将数据转换成向量**。将图像转换为数组比较好理解，数字图像本身就是一个数组。而将文本本身转换成向量，如何映射是一个比较关键的事情。`tf-idf`,`skipngram`是比较常用的方式。之后google又提出了著名的wordvec。当然还有其他的一些方法，例如,`glove`。对于如何生成词向量句子向量之类的，建议使用`gensim`

```
* 文本预处理-读取
* 文本预处理-分词
* 文本预处理-词性标注  (没有用到过)
* 文本预处理-词法依存  (没有用到过)
* 文本预处理-句法依存  (没有用到过)
* 文本预处理-命名实体识别  (没有用到过)
* 文本预处理-生成词向量
这些还是看书吧，既权威又详细(或者以后再更新)
```

## TF-IDF

用于从文本中提取特征，之前[文本摘要](https://iami.xyz/Text-Summarization-GF/)的博客中已经介绍过了，此处不再介绍。可以结合`sklearn pipline`一起做预处理的工作。

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

生成的X就是已经转化后的词向量了.
> 至于为什么先`HashingVectorizer`然后`Tfidf`,我也是前几天刚见这种方式，以前都是只采用`Tf-idf`方式

## 文本分类的方法有哪些 

既然文本已经转换为了向量，那么应用于分类的算法也就能应用与文本分类，传统的机器学习目前是以统计学为基础，深度学习模型主要以神经网络为基础，神经网络的神经元就是最小的感知机。这些还是建议了解一下，看下公式的推到过程。当然库已经非常完善了，各种工具也是层出不穷。例如我们以sklearn库为示例，实现的`Decison tree`.

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

![demo_decison_tree](../image/mldl/demo_decison_tree.png)

# CNN与文本分类

可以看到，对具有明显规律的数据，决策树可以得到很好的分类效果。那么对于神经网络而目前深度学习常采用的库已经势力均分了，`tensorflow`+`keras`和`pytorch`(`caffe`和`pytorch`的开发已经合并了,`theano`好像已经要放弃维护了)。总而言之，库这方面都已经很成熟了，只需要去使用，写出来代码就行了。这是以keras为示例的CNN模型的代码。

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

而关键的模型定义如下,输入层(Input),卷积层(Conv),池化层(MaxPool)。 作为`tensorflow`的上层接口，除了`keras`还有`tflearn`, 不过个人觉的使用`keras`十分方便，具体可参考`keras`的[官网](https://keras-cn.readthedocs.io/en/latest/)。

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

上面这种定义方式，只是其中一种，Keras本身支持不同方式的定义，还可以采用Sequential ,然后逐层add的方式。假如机器内存不足，可以采用`generator`的方式进行训练，上面代码中gen函数实现的就是以该方式进行训练的，但是个人觉得更慢了。

<!-- 
## cuda与libcudnn安装

* NVIDIA 显卡驱动,对应操作系统的对应版本
去官网找到对应型号的[对应驱动](http://www.nvidia.com/Download/index.aspx),进行下载安装.

* [cuda下载安装](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1604&target_type=deblocal)

> `sudo dpkg -i cuda-repo-ubuntu1604-9-1-local_9.1.85-1_amd64.deb`

> `sudo apt-key add /var/cuda-repo-<version>/7fa2af80.pub`

> `sudo apt-get update`

> `sudo apt-get install cuda`

* libcudnn
> 需要注册,才能下载

以下为安装过程中的历史命令
```
wget -c "https://developer.nvidia.com/compute/cuda/9.0/Prod/local_installers/cuda_9.0.176_384.81_linux-run"
apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub
echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64 /" | sudo tee /etc/apt/sources.list.d/cuda.list
sudo apt-get update
sudo apt-get -y install cuda-drivers cuda

```

或者直接用预装好驱动的[Aliyun](https://help.aliyun.com/document_detail/60149.html?spm=5176.8300896.676852.2.79f16539AHvVpQ)镜像,像AWS的AMI更是有更多的选择.建立采用该方式,省去安装过程.毕竟实例开着分分秒秒都是钱. 现在推荐google的cloab，更是方便的不用说。免费的gpu加速实例，但是需要注意的是，免费的内存只有12G,不是适合大量的数据全撸进去，只适合，测试。 -->

# References
<!-- * [NVIDA DRIVER INSTALL](http://www.nvidia.com/Download/index.aspx)
* [NVIDA CUDA INSTALL](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=1604&target_type=deblocal)
* [cudnn install guide](http://docs.nvidia.com/deeplearning/sdk/cudnn-install/index.html) -->
* [数据挖掘算法中分类算法的优劣](https://www.zhihu.com/question/24169940)
* [使用sklearn做单机特征工程](https://www.cnblogs.com/jasonfreak/p/5448385.html)
* [CNN 笔记整理](https://iami.xyz/Review-NN-Note/)
* [Keras中文文档](https://keras-cn.readthedocs.io/en/latest/)
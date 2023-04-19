---
layout: post
title: fuzzing随机性与char-rnn样本生成
categories: 安全工程师
kerywords: 模糊测试，机器学习，fuzzing，char-rnn
tags: AI与机器学习 Fuzzing
---


# Fuzzing测试与用例的随机性

Fuzzing的原理很简单，就是生成随机数据丢给被测试系统，得到输出。即随机输入得到输出的过程。很多CVE也都是通过fuzzing得到的。比较知名的心脏滴血就是。

但是关于测试样本生成的过程，有基于模式的，有随机的，也有简单重复的。常见是从各处收集到payload用于测试，至于工具生成的话，比较著名的有radamsa。至于生成的数据，初始之时，让我比较疑惑的是数据到底是随机的好，还是有规律的好。毕竟char-rnn生成的文本，并不能很好的看出pattern或者及时去重。经过一个多月的思考，最终决定认为随机或者完全随机都可以。所以char-rnn可以作为输入。因为本身模糊测试即是通过不确定的输入去观测程序反应，那么不可预期的随机生成应该也是没有问题的。

针对C/C++等二进制程序，拿到源码的情况下,编译器对函数进行插桩。拿不到源码的情况下用QEMU模拟，然后进行fuzzing 也可。其他的技巧有对python程序fuzzing的话解析AST，修改解析树进行fuzzing等等，总之各种办法倒是有的。

但是在不同的平台下依旧有些问题，比如说mac下os fork的速度比较慢，所以afl这种fuzzing程序，非常不利于在mac下使用。在demo程序的fuzzing中，大概在公司mac上8核满负载跑了2小时，没出任何结果，丢给8核的ubuntu，只用了不到16分钟就跑出来了。同样Windows下也不是个好的选择。

具体的这些工具使用，不打算在这介绍，具体可见我的gist,[这里](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e)，还算比较详细，同时包含了对几种程序进行fuzzing的示例。


# char rnn与文本生成 

了解Char RNN先要了解RNN， RNN和LSTM，GRU都是比较擅长处理序列问题，通过逻辑门结构，去降低其序列前后的依赖。从而使神经网络的输出更加符合要求(对于序列生成，似乎不好用准确二字去评价)。

从下图可以看出来，RNN的输出关系可以使一对一，一对多，多对一，多对多等等。

![image](https://img.iami.xyz/images/mldl/rnn.jpeg)

文本的生成是一个序列，而参与训练的也是一个序列，所以看成是一个多对多的训练过程。一段文本作为序列丢进神经网络, 独热编码处理成向量后丢给RNN单元，进行训练。其实是生成的前一个字符，作为下个字符输出的输入。

>虽然简单基础但可以清晰度反应句子生成的运行流程，首先需要建立一个词库Vocab包含可能出现的所有字符或是词汇，每次模型将预测得到句子中下一个将出现的词汇，要知道softmax输出的只是一个概率分布，其维度为词库 Vocab 的size，需再通过函数将输出概率分布转化为 One-hot vector，从词库 Vocab 中检索得出对应的词项；在“Char-RNN”模型训练时，使用窗口在语料上滑动，窗口之内的上下文及其后紧跟的字符配合分别为一组训练样本和标签，每次以按照固定的步长滑动窗口以得出全部 “样本-标签” 对。  --引用自知乎专栏

具体的实现有很多种方法，去年的时候用darknet，训练集用的是xss的payload。但是没有测试具体的效果。作为样本生成来说，完全没有任何问题。python的话，keras,pytorch, tensorflow实现的各种版本也都有，所以仅仅实现概念验证，还是比较容易的。

char-rnn并不是唯一的方法，lstm也可以， 下面提供了一份lstm生成文本的代码，来自Nietzsche。当然采用GAN也可以生成文本。但是并不是很适用于文本生成，具体参见强化学习在生成对抗网络文本生成中扮演的角色、

```python

'''Example script to generate text from Nietzsche's writings.

At least 20 epochs are required before the generated text
starts sounding coherent.

It is recommended to run this script on GPU, as recurrent
networks are quite computationally intensive.

If you try this script on new data, make sure your corpus
has at least ~100k characters. ~1M is better.
'''

from __future__ import print_function
from keras.callbacks import LambdaCallback
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.optimizers import RMSprop
from keras.utils.data_utils import get_file
import numpy as np
import random
import sys
import io


with io.open('input.txt','rb') as f:
    text = f.read().lower()
print('corpus length:', len(text))

chars = sorted(list(set(text)))
print('total chars:', len(chars))
char_indices = dict((c, i) for i, c in enumerate(chars))
indices_char = dict((i, c) for i, c in enumerate(chars))

# cut the text in semi-redundant sequences of maxlen characters
maxlen = 40
step = 3
sentences = []
next_chars = []
for i in range(0, len(text) - maxlen, step):
    sentences.append(text[i: i + maxlen])
    next_chars.append(text[i + maxlen])
print('nb sequences:', len(sentences))

print('Vectorization...')
x = np.zeros((len(sentences), maxlen, len(chars)), dtype=np.bool)
y = np.zeros((len(sentences), len(chars)), dtype=np.bool)
for i, sentence in enumerate(sentences):
    for t, char in enumerate(sentence):
        x[i, t, char_indices[char]] = 1
    y[i, char_indices[next_chars[i]]] = 1


# build the model: a single LSTM
print('Build model...')
model = Sequential()
model.add(LSTM(128, input_shape=(maxlen, len(chars))))
model.add(Dense(len(chars), activation='softmax'))

optimizer = RMSprop(lr=0.01)
model.compile(loss='categorical_crossentropy', optimizer=optimizer)


def sample(preds, temperature=1.0):
    # helper function to sample an index from a probability array
    preds = np.asarray(preds).astype('float64')
    preds = np.log(preds) / temperature
    exp_preds = np.exp(preds)
    preds = exp_preds / np.sum(exp_preds)
    probas = np.random.multinomial(1, preds, 1)
    return np.argmax(probas)


def on_epoch_end(epoch, _):
    # Function invoked at end of each epoch. Prints generated text.
    print()
    print('----- Generating text after Epoch: %d' % epoch)

    start_index = random.randint(0, len(text) - maxlen - 1)
    for diversity in [0.2, 0.5, 1.0, 1.2]:
        print('----- diversity:', diversity)

        generated = ''
        sentence = text[start_index: start_index + maxlen]
        generated += sentence
        print('----- Generating with seed: "' + sentence + '"')
        sys.stdout.write(generated)

        for i in range(400):
            x_pred = np.zeros((1, maxlen, len(chars)))
            for t, char in enumerate(sentence):
                x_pred[0, t, char_indices[char]] = 1.

            preds = model.predict(x_pred, verbose=0)[0]
            next_index = sample(preds, diversity)
            next_char = indices_char[next_index]

            generated += next_char
            sentence = sentence[1:] + next_char

            sys.stdout.write(next_char)
            sys.stdout.flush()
        print()

print_callback = LambdaCallback(on_epoch_end=on_epoch_end)

model.fit(x, y,
          batch_size=128,
          epochs=60,
          callbacks=[print_callback])

```

# 展望

对fuzzing测试的payload生成，应该是利用到攻击过程比较有看点，也是比较初级可入手的地方。至于那些扫描系统时针对Banner分类提高识别率的我觉得倒不算真正的攻击。微软Risk Detection实验室出过一个关于Machine learning和Fuzzing的Paper，还有线上的演示，但是距离申请demo的也过了几周，可能邮件掉垃圾箱了。也可能没有人维护了。无语。

利用RL进行fuzzing的改造，这是两月前和金晴云华的曲武老哥讨论相关知识时谈到说用RL去做。思考一段时间后，也尝试设计了最初的原型。但是根据强化学习对样本的稀疏性来说，似乎也并不是好的选择。之前比较犹豫的是随机性的问题，现在犹豫的是如何验证效果。是否需要部署大量的机器？or?

# 引用

* [Start Fuzzing](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e)
* [关于Fuzz工具的那些事儿](http://www.freebuf.com/sectool/76861.html)
* [The Unreasonable Effectiveness of Recurrent Neural Networks](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)
* [RNN 循环神经网络系列 1](https://juejin.im/post/59f0c5b0f265da43085d3e94)
* [知乎: Role of RL in Text Generation by GAN](https://zhuanlan.zhihu.com/p/29168803)
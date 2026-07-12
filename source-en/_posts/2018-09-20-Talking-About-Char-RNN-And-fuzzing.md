---
layout: post
title: Randomness in Fuzzing and Sample Generation with Char-RNN
categories: Security Engineer
kerywords: fuzz testing, machine learning, fuzzing, char-rnn
tags: AI-and-ML Fuzzing
translated: true
---


# Randomness in Fuzzing and Test Cases

The idea behind fuzzing is simple: send random data to the system under test and observe the output. Many CVEs have been found this way, including Heartbleed.

Test samples can be generated with patterns, random mutation, or simple repetition. A common practice is to collect payloads from multiple sources; among generation tools, radamsa is probably the best known. I initially wondered whether random or structured input was more useful, especially because char-RNN output has no obvious patterns and is difficult to deduplicate. After considering it for more than a month, I concluded that either random or fully random input can work. Char-RNN output can therefore be useful input: fuzzing is fundamentally about observing program behavior under uncertain inputs.

For binary programs in C/C++, if you have the source code you can instrument functions at compile time. Without source code, QEMU emulation + fuzzing also works. There are other tricks too — like parsing the AST for Python programs and mutating the parse tree for fuzzing. Point is, there's always a way.

There are still platform-specific concerns. For example, `fork` is noticeably slower on macOS, which makes AFL difficult to use there. In one demo-program run, an eight-core Mac at full load found nothing in two hours; the same job on an eight-core Ubuntu host produced results in under 16 minutes. Windows is also a poor choice for this workload.

I'm not going to walk through the tooling in detail here — check out my gist [here](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e), it's reasonably detailed and includes examples of fuzzing a few different types of programs.


# Char-RNN and Text Generation

To understand Char-RNN, you first need to understand RNN. RNN, LSTM, and GRU are all good at handling sequence problems — through gating mechanisms, they reduce long-range dependencies in sequences, making the neural network output more aligned with what you want (for sequence generation, "accurate" isn't really the right word to use).

As you can see below, RNN's output relationships can be one-to-one, one-to-many, many-to-one, many-to-many, etc.

![image](https://img.iami.xyz/images/mldl/rnn.jpeg)

Text generation is a sequence, and the training data is also a sequence, so it's naturally a many-to-many training process. A piece of text as a sequence gets fed into the neural network, processed into vectors via one-hot encoding, then sent through the RNN unit for training. In practice, the previously generated character becomes the input for predicting the next character.

> Though simple and foundational, it clearly shows how sentence generation works. First you build a vocabulary (Vocab) containing all possible characters or words. Each time, the model predicts the next word that will appear in the sentence. The softmax output is just a probability distribution with dimensions equal to the Vocab size — you then convert that output probability distribution into a one-hot vector and look up the corresponding word in the Vocab. During Char-RNN training, a window slides over the corpus; the context within the window plus the character immediately following it form a training sample-label pair, and the window slides at a fixed step size to generate all sample-label pairs. -- quoted from Zhihu

There are many ways to implement this. Last year I used darknet with XSS payloads as the training corpus, although I did not evaluate its effectiveness. It worked as a sample generator. Python implementations are available in Keras, PyTorch, and TensorFlow, so a proof of concept is straightforward to assemble.

Char-rnn isn't the only option — LSTM works too. Here's some LSTM text generation code, from the Nietzsche example. GAN can also generate text, but it's not well-suited for text generation specifically — see the piece on the role of reinforcement learning in GAN text generation.

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

# What's Next

Using ML-generated payloads in a fuzzing pipeline seems the most interesting and practical offensive application, and it is a useful entry point. Banner classification during scanning may improve recognition rates, but it is not an attack technique by itself. Microsoft's Risk Detection Lab published a paper on machine learning and fuzzing with an online demo; several weeks after I requested access, I had not received a response.

I discussed using reinforcement learning to improve fuzzing with Wu Qu from Jinqingyunhua about two months earlier, and later sketched an initial prototype. Given the sparsity of RL rewards, however, it may not be a good fit. The remaining question is how to validate its effectiveness: would that require a large number of machines, or another evaluation approach?

# References

* [Start Fuzzing](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e)
* [关于Fuzz工具的那些事儿](http://www.freebuf.com/sectool/76861.html)
* [The Unreasonable Effectiveness of Recurrent Neural Networks](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)
* [RNN 循环神经网络系列 1](https://juejin.im/post/59f0c5b0f265da43085d3e94)
* [知乎: Role of RL in Text Generation by GAN](https://zhuanlan.zhihu.com/p/29168803)

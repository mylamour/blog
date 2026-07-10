---
layout: post
title: CNN Study Notes
categories: Security Engineer
tags: AI and Machine Learning Learning Data Mining
translated: true
---

# FAQ

[What does Maxpooling actually do](https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks)
> 1. Invariance — it cares more about whether a feature exists than exactly where it is. Think of it as a strong prior that forces learned features to tolerate some spatial variation.
> 2. Shrinks the input size for the next layer (removes redundancy), cutting down computation and parameter count.
> 3. Produces fixed-length output. (Useful for text classification where input length varies — pooling gives you a consistent output size.)
> 4. Helps prevent overfitting, though it can also cause underfitting if overdone.
>> Author: [Zhihu user](https://www.zhihu.com/question/36686900/answer/91714601)

How do you design a good neural network?
> Honestly, no idea yet. But for parameter initialization you can just use what `tensorflow` gives you, for example:

```python
W1 = tf.Variable(tf.random_normal([784,256]))
b1 = tf.Variable(tf.random_normal([256]))

W1 = tf.get_variable("W1", shape=[784, 256],
                     initializer=tf.contrib.layers.xavier_initializer())
b1 = tf.Variable(tf.random_normal([256]))
```
This gets you noticeably better accuracy. Good initial parameters make a real difference.

How many hidden layers should you use?
> Trial and error.

What activation functions are there, what do they do, and how do you pick one?
> Activation functions introduce non-linearity, so the network can handle non-linearly separable problems.
> [Visualizing 26 activation functions](https://dashee87.github.io/data%20science/deep%20learning/visualising-activation-functions-in-neural-networks/)
> [What's the point of activation functions in neural networks — Zhihu](https://www.zhihu.com/question/22334626)

What pooling methods are there?
> * maxpooling (slide a window, take the max value of features in the neighborhood)
> * meanpooling (take the average)

What do filters do?
> At its core, a neural network is basically layers of filters stacked on top of each other — filtering out low-level features, selecting high-level ones.

How do you reduce overfitting in a backpropagation network?
> * Early stopping — stop training when training error keeps dropping but validation error starts climbing
> * Regularization — add a term to the loss function that penalizes network complexity
>> [What exactly is regularization in machine learning? — Zhihu](https://www.zhihu.com/question/20924039)

What's the difference between standard BP and accumulated BP?
> Same as the difference between standard gradient descent and stochastic gradient descent.

How do you escape local minima?

> * Initialize multiple neural networks with different sets of parameters, train them all the standard way, pick the one with lowest error as your final model
> * Simulated annealing — at each step accept a worse solution with some probability
> * Use stochastic gradient descent

[Epoch vs Batch — what's the difference](https://stackoverflow.com/questions/4752626/epoch-vs-iteration-when-training-neural-networks)
> One full pass through all the data is an Epoch. That full pass gets split into smaller chunks (batches) for each iteration.

When does a CNN require fixed-size input, and when doesn't it?
> If there's a fully connected layer, input size must be fixed — because the FC layer connects every input pixel together, and once the parameter count is set it can't change. So inputs have to be uniform. If you only have convolution and pooling layers, image size doesn't matter — the filter just scans whatever it gets.

What if images are different sizes but you need fixed size?
> * Force resize, but this falls apart if you need fine-grained detection of objects — it distorts things.
> * Manual annotation — recommend [labelImg](https://github.com/tzutalin/labelImg)

# Resources

* [How to understand backpropagation](https://www.zhihu.com/question/27239198?rf=24827633)
* [How to tune CNN hyperparameters](https://www.zhihu.com/question/27962483)
* [Zen and the art of bra recognition](https://zhuanlan.zhihu.com/p/25774111)
* [Neural network top answers on Zhihu](https://www.zhihu.com/topic/20043586/top-answers)
* [Intuitive explanation of CNNs](https://www.zhihu.com/question/39022858/answer/81026163)
* [What does Dropout do](https://yq.aliyun.com/articles/68901)
* [Math foundations for machine learning](https://zhuanlan.zhihu.com/p/25197792)
* [Is it worth implementing ML algorithms from scratch yourself?](https://www.zhihu.com/question/36768514/answer/81937823)
> Yes, and try to speed them up too. Get the fundamentals, then experiment.

* [Classic deep learning interview questions](https://zhuanlan.zhihu.com/p/25005808)
* [55 classic TensorFlow examples](https://zhuanlan.zhihu.com/p/27577246)
* [LSTM/RNN tutorials worth reading](https://www.zhihu.com/question/29411132/answer/51515231)
* [Deformable convolution, separable convolution? Ten brilliant tricks in CNNs](https://zhuanlan.zhihu.com/p/28749411)

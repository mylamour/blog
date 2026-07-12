---
layout: post
title: DGA Detection with fasttext
categories: Security Engineer
kerywords: Machine Learning DGA Detection
tags: AI and Machine Learning Learning Data Mining Intrusion Detection
translated: true
---

# Content

I first encountered fastText for text classification in July of the previous year, while working on webshell detection. I ultimately used CNN text classification for that project. There was already material on fastText available at the time, so I do not cover the theory here; earlier posts address it.

Without a GPU, I decided to try fastText for text classification after wrapping up the automated threat-list work.

The full project is [here](https://github.com/mylamour/DGADomain), with usage instructions included. I used the public dataset from 360netlab, plus an Alexa top 100 million list.

![img](https://img.iami.xyz/images/47637980-3d043d00-db98-11e8-9bf3-537a4ecf90ee.png)

After 250 epochs, accuracy reached 1. The model was large, however, so `quantize` can be used during training to compress it. This reduces accuracy: the higher the cutoff value, the smaller the model and the lower the accuracy.

# Other

Last week I found a serious data leak on an internal platform and reported it directly to the project lead. A large batch of sensitive data, including training datasets from different platforms, had been exposed. The initial response was to patch only the frontend. When I checked again, path traversal still worked and it was still possible to read other users' data without authorization. By design, non-users should not be able to download anything, and users should not be able to access one another's datasets. After only a few sentences, he brought up the Mooncake incident and started lecturing me about values before the authorization flaw was addressed. This “technical expert”—honestly, what a joke.

Even if most people know the right values, that does not mean they will act accordingly—let alone people with ulterior motives. Elevating every issue into a question of values is not helpful.

# Resources

* [DGADomain](https://github.com/mylamour/DGADomain)
* [fasttext text classification](https://fasttext.cc/docs/en/supervised-tutorial.html)

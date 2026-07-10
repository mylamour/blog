---
layout: post
title: DGA Detection with fasttext
categories: Security Engineer
kerywords: Machine Learning DGA Detection
tags: AI and Machine Learning Learning Data Mining Intrusion Detection
translated: true
---

# Content

I first ran into fasttext for text classification back in July last year, when I was working on webshell detection. Eventually went with CNN Text Classification for that project instead. There was already some material on fasttext floating around at the time. I won't get into the theory here — it's covered in earlier posts.

Since I didn't have a GPU, after wrapping up the automated threat list work I decided to give fasttext a shot for text classification.

The full project is [here](https://github.com/mylamour/DGADomain), with usage instructions included. I used the public dataset from 360netlab, plus an Alexa top 100 million list.

![img](https://img.iami.xyz/images/47637980-3d043d00-db98-11e8-9bf3-537a4ecf90ee.png)

After 250 epochs the accuracy gets pretty solid — hits 1. The model is huge though, so you can use `quantize` during training to compress it. That does drop accuracy: the higher the cutoff value, the smaller the model and the lower the accuracy.

# Other

Last week I found a pretty serious data leak on an internal platform at the company. I just reached out directly to the project lead and told him — a big batch of sensitive data had leaked (training datasets pushed from different platforms). This guy, this "technical expert", just went and patched the frontend and called it done. Today I checked again: path traversal still works, still possible to read other users' data without authorization. By design, non-users of the app shouldn't be able to download anything, and users shouldn't be able to touch each other's datasets either. We barely got two sentences in when he pivoted to the mooncake incident and started lecturing me about "values." This "expert"... yeah, lol.

Even if most people know what the right values are, that doesn't mean they'll actually act on them. And for those with bad intentions? Even worse. Escalating every issue to "values" is not exactly a productive move.

# Resources

* [DGADomain](https://github.com/mylamour/DGADomain)
* [fasttext text classification](https://fasttext.cc/docs/en/supervised-tutorial.html)

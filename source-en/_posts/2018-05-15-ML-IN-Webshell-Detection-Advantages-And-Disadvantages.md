---
layout: post
title: Lessons Learned Using Machine Learning in Web Security Detection
categories: Security Engineer
kerywords: Webshell detection, machine learning, comparison
tags: AI-and-machine-learning learning-data-mining intrusion-detection-and-anti-intrusion
translated: true
---


# Intro

The classic approach to detecting common web attacks — SQL injection, XSS, DGA, you name it — has always been blacklists, whitelists, and regex rules. With machine learning, though, all of these: SQL injection, XSS, Webshell — can be treated as text problems. So building a general-purpose detection system for common web threats basically becomes a text classification task. This post is a quick brain-dump of things to watch out for when using ML for this kind of detection.

# The Text Classification Pipeline

Classification is supervised learning. The general flow is: data preprocessing -> feature extraction -> train classifier -> save model -> predict.

Of these, data preprocessing and feature extraction are arguably the most important. Good features beat fancy algorithms every time.

Things to keep in mind:

* Whether you use word vectors, sentence vectors, or document vectors depends entirely on your use case — no single right answer.
* Word vector lengths can vary when you build them.
* Make sure all vectors end up the same length after conversion. If they differ, pad to the longest one. That said, this depends on your network design — if you're using variable-length inputs, you don't need to worry about this.
* Before going straight to neural networks, try traditional ML methods first. Easier to benchmark and way faster to iterate.
* If your text is short and your vocabulary space is small — like one-liner webshell detection — you might hit 1.0 precision on training data, but test set performance will be terrible. For DGA, ensemble methods get around 89% accuracy. LSTM can apparently hit 1.0 according to other people's results, but I haven't trained one myself.
* Watch your positive/negative sample distribution and make sure there's enough variety. For example, a webshell detector trained only on WordPress samples performs poorly against Discuz and phpMyAdmin.
* Some files can't be read normally — you can work around this by writing something like a `strings` command to extract readable content.
* If you don't have enough negative samples, use data augmentation. The simplest version: just copy-paste existing ones.
* If you're running low on memory, use `fit_generator` — but be warned, it's slow.


# General Detection Methodology

So yeah, it's pretty clear: for all these text-based threats — webshell, XSS, SQL injection, DGA — text classification is a natural fit. But to really nail detection for any specific threat, you need to pull in features from more dimensions.

## Compared to Traditional Methods

* Traditional approach: endless rules to write, endless blacklists and whitelists to maintain. Not great at catching variants. But it's fast.
* Machine learning approach: you need labeled samples, and getting a good training set is genuinely hard. Training is slow, and inference is nowhere near as fast as regex matching. That said, it handles variants much better — for example, detecting callback-style functions is noticeably better with ML than with rule-based methods.
* One approach lives or dies by its ruleset, the other by its training data.
* Using anomaly detection instead of classification sidesteps the sample problem, but the results still aren't perfect.

## Neural Network Tricks

When you're going the ML route, first nail down your inputs and outputs — what form do they take? Continuous or discrete? Classification or clustering? As for network depth, there's honestly no magic formula — you just have to experiment. Start with two or three layers and 100–200 neurons. If performance is bad, add layers and neurons until you're overfitting, then scale back. You can also use published papers as a starting point for hyperparameters — e.g., 10-fold cross-validation is standard, and 5-gram tokenization tends to work well for webshell detection. Initial parameter choices matter a lot.


## Better Detection Strategies

* Use traditional methods as a first pass to filter out the obvious stuff, then run ML on the uncertain cases.
* Use regex rules to label known webshells, then break them down into subcategories — now you've got a multi-class problem instead of binary.
* Try to aggregate features from multiple dimensions — even though pure text vectors can already get you solid results.

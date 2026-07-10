---
layout: post
title: Fuzzing Learning Notes: sqlite3 with fuzzer-test-suite
categories: Security Engineer
kerywords: Fuzzing fuzzer-test-suite sqlite3
tags: Fuzzing Archive
translated: true
---

In this blog, all you need is only `https://github.com/google/fuzzer-test-suite/` .

First, prepare your environment, it must be installed with `docker` and `git`. Then, let's start. 
Look at this picture, all steps will happen when you
 `git clone https://github.com/google/fuzzer-test-suite/ && cd  fuzzer-test-suite`.

So, just follow the picture step by step, and you'll eventually get it running (just for learning).
And you should know, the most important thing is the `fuzzer` — you can customize it yourself, and most of the time 
 your results depend on it. 


![image](https://img.iami.xyz/images/62118830-e2764980-b2ad-11e9-9700-29d3d586a074.png)
![image](https://img.iami.xyz/images/62119086-5d3f6480-b2ae-11e9-846e-cbea11d57150.png)

Good luck to you, hope you can find bugs in sqlite3.

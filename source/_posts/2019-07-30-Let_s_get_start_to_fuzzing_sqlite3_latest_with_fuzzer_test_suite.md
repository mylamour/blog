---
layout: post
title: Fuzzing学习笔记：fuzzing sqlite3 latest with fuzzer-test-suite
categories: 安全工程师
kerywords: Fuzzing fuzzer-test-suite sqlite3
tags: Fuzzing 旧文迁移
---

In this blog, all you need is only `https://github.com/google/fuzzer-test-suite/` .

First, prepare your environment, it must be installed with `docker` and `git`.  Then, let's start. 
look at this picture, all steps was happed  when you
 `git clone https://github.com/google/fuzzer-test-suite/ && cd  fuzzer-test-suite`.

So, just follow the picture step by step, finally you would make it running(Just for learning).
And you should know, most important is `fuzzer`, you can custom it by yourself, and most time 
 you result was depend on it. 


![image](https://img.iami.xyz/images/62118830-e2764980-b2ad-11e9-9700-29d3d586a074.png)
![image](https://img.iami.xyz/images/62119086-5d3f6480-b2ae-11e9-846e-cbea11d57150.png)

Good luck to you,  wish you can find the bug in sqlite3.

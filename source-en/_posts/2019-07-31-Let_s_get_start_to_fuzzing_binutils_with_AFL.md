---
layout: post
title: Fuzzing Learning Notes - binutils with AFL
categories: Security Engineer
kerywords: Fuzzing AFL
tags: Fuzzing Archive
translated: true
---

In the beginning of this blog, look at this picture. It was fuzzing with `readelf` (one of `binutils`).
![image](https://img.iami.xyz/images/62205434-04f98700-b3c2-11e9-8188-6302cf718bff.png)
And nothing was found...

Now, let's follow these steps until you can fuzz it by yourself.

![image](https://img.iami.xyz/images/62205586-5b66c580-b3c2-11e9-9ca0-fd4a16118db9.png)
![image](https://img.iami.xyz/images/62205714-a41e7e80-b3c2-11e9-8f6e-c193ffa3795e.png)

So, maybe you already know about these tricks. Yes, right. You can just compile it with `afl-gcc` or `afl-g++` or `afl-clang` when you get the source code. And generate lots of data to feed it to `afl-fuzz`.

In this situation, you should be able to fuzz many programs.

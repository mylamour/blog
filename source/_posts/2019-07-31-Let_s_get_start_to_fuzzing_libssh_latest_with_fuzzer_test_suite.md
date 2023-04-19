---
layout: post
title: Fuzzing学习笔记：fuzzing libssh latest with fuzzer-test-suite
categories: 安全工程师
kerywords: Fuzzing fuzzer-test-suite libssh
tags: Fuzzing 旧文迁移
---

First, you should read this [issues](https://github.com/mylamour/blog/issues/63), then you would got a overview of it.  and should able to use this docker image
Now, let me show you how to modify and run it easily.

1. `cd /root/FTS/libssh-2017-1272`
2. `vim build.sh`
![image](https://img.iami.xyz/images/62205063-25751180-b3c1-11e9-8811-6597116f9582.png)
3. `cd .. && ./libssh-2017-1272/build.sh`
4. `./libssh-2017-1272-fsanitize_fuzzer`
![image](https://img.iami.xyz/images/62205143-5d7c5480-b3c1-11e9-882a-a5503bd6d580.png)

Best wish to you, good luck.  (may be you should modify `libssh_server_fuzzer.cc` by yourself.)

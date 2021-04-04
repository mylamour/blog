---
layout: post
title: Let's get start to fuzzing binutils with AFL
categories: 安全工程师
kerywords: Fuzzing AFL
tags: Fuzzing
---

In the begin at the blog,  look at this picture, it was fuzzing with `readelf` ( one of `binutils` )
![image](https://user-images.githubusercontent.com/12653147/62205434-04f98700-b3c2-11e9-8188-6302cf718bff.png)
And nothing was found ... 

Now, let  follow this steps, until you can fuzz it by yourself.

![image](https://user-images.githubusercontent.com/12653147/62205586-5b66c580-b3c2-11e9-9ca0-fd4a16118db9.png)
![image](https://user-images.githubusercontent.com/12653147/62205714-a41e7e80-b3c2-11e9-8f6e-c193ffa3795e.png)

So, may be you already know about this tricks. yes , right. you can just compile it with `afl-gcc` or `afl-g++`、`afl-calng` when you got the source code. And generate lots data to feed it to `afl-fuzz`
In this situation, you should able to fuzzing with many program.
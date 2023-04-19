---
layout: post
title: Fuzzing学习笔记：AFL入门 
categories: 安全工程师
kerywords: Fuzzing tutorial 
tags: Fuzzing 旧文迁移
---

Fuzzing就是模糊测试，简单来说就是产生各种变异输入源进行输入，这也就意味着。如何寻找输入点（二进制文件，web服务，系统软件，网络协议，文件系统，操作系统），如何持续产生高效输入源（怎么样使你的输入更加有效能够让程序崩溃？）如何分析不同输入后目标产生的结果。如何将整个流程自动化起来。
去年的时候有一篇论文对历史以来的fuzzing技术做了综述，可以参考[The Art, Science, and Engineering of Fuzzing: A Survey](https://arxiv.org/pdf/1812.00140.pdf). 本篇博客主要记录了自己如何根据教程进行学习的过程，大部分整理自[gist](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e)。


# mutators

radamsa用于生成随机的fuzz向量(不用在意这些名词),当然你也可以直接写代码自己生产不同的变异输入。

1.克隆代码并编译
`git clone https://gitlab.com/akihe/radamsa.git && cd radamsa && make && sudo make install`

![image](https://img.iami.xyz/images/44978555-99cee700-af9d-11e8-8e9e-0a3111de5bdd.png)

2.使用：`echo 随便什么 | radamsa` 生成攻击载荷

![image](https://img.iami.xyz/images/44978666-d995ce80-af9d-11e8-8e7e-76ebead99717.png)

![image](https://img.iami.xyz/images/44978719-f205e900-af9d-11e8-813a-3b95d57eaf1a.png)

3.其他用法
* 生成多个testcase
`echo "岁月神偷"| radamsa -d 2 -n 10`
生成10个，每2毫秒一次，可以调整一下。比如说`-d 600` ，随意喽。

![image](https://img.iami.xyz/images/44979655-414d1900-afa0-11e8-9e28-ed6b99150036.png)

* 针对文件生成testcase
`radamsa -r guest.jpg -o ./1.png`

<img src="https://img.iami.xyz/images/44980007-35158b80-afa1-11e8-8846-8679c5ddd47c.png" width="200" height="200" />
<img  src="https://img.iami.xyz/images/44980200-bec55900-afa1-11e8-969f-7dc891246279.png" width="200" height="200" />
<img src="https://img.iami.xyz/images/44980207-c38a0d00-afa1-11e8-8a4c-a816fc5dbaab.png" width="200" height="200" />
<img src="https://img.iami.xyz/images/44980216-c97fee00-afa1-11e8-9a6f-3cec98afb8c3.png" width="200" height="200" />


以上为对原图的改变
 针对文件的缩放和同一行排版在markdown中可以使用如下的操作。

```javascript 
<img  align="right" src="https://xxx.png" width="200" height="200" />
```

# Fuzzer

目前已经有许多工具可以进行fuzzing，其中比较知名的有AFL， DynamoRIO， libfuzzer， oss-fuzz等，此处主要介绍下AFL的使用。工具不尽相同，工作流程也不一而足。但是原理都是差不多的。这个需要自己去了解。我也仍在摸索的过程。

## AFL
不建议mac下使用，因为mac os的fork比较慢。建议

1.*Nix

这个教程是在Ubuntu下作的
```shell
$ sudo apt-get install clang-3.8 build-essential llvm-3.8-dev gnuplot-nox
$ sudo update-alternatives --install /usr/bin/clang clang `which clang-3.8` 1
$ sudo update-alternatives --install /usr/bin/clang++ clang++ `which clang++-3.8` 1
$ sudo update-alternatives --install /usr/bin/llvm-config llvm-config `which llvm-config-3.8` 1
$ sudo update-alternatives --install /usr/bin/llvm-symbolizer llvm-symbolizer `which llvm-symbolizer-3.8` 1

```
 下载最新版的
```shell
wget http://lcamtuf.coredump.cx/afl/releases/afl-latest.tgz
tar -xf afl-latest.tgz
```
然后进行编译
```
$ cd afl-2.52b 
$ make
$ make -C llvm_mode

```

编译`qemu`模式(适用于无目标程序源码的情景)的话，需要去单独的到`qemu_mode`下面编译，虽然没有源码，但是利用`QEMU`翻译`block`做`instrumentation`

之后使用的时候就用`afl-gcc`编译， 即 `CC=afl-gcc CXX=afl-g++ ./configure` 或者用`CC=afl-clang ./configure`之类的，然后`make`.

`./afl-fuzz -i testcase_dir -o findings_dir /path/to/program [...params...]`
如果末尾的params是`@@`， 代表将会由你testcase文件夹中的文件名取代
`./afl-fuzz -i testcase_dir -o findings_dir /path/to/program @@`

而且afl还支持分布式运行，具体可以参考下面的命令行
```shell
afl-fuzz -i input_dir -o fuzz_output -M master ./test @@
afl-fuzz -i input_dir -o fuzz_output -S slave1 ./test @@
afl-fuzz -i input_dir -o fuzz_output -S slave2 ./test @@ 
afl-fuzz -i input_dir -o fuzz_output -S slave3 ./test @@  
```
如果进程退出了还可以用这个命令进行恢复，完美。

```
afl-fuzz -i- -o fuzz_output -M master ./test @@
afl-fuzz -i- -o fuzz_output -S slave1 ./test @@
afl-fuzz -i- -o fuzz_output -S slave2 ./test @@
afl-fuzz -i- -o fuzz_output -S slave3 ./test @@
```

不过这些你都能在afl的readme里面看到。


2.Windows： WinAFL fuzzing VLC with DynamoIRO

windows下的神器自然是winafl了，看神器吧（不过我感觉可能是我电脑太差劲了？用不好。。。感觉没啥效果）

```cmd
afl-fuzz.exe -i C:\Users\i\Desktop\Fuzzing\db -o C:\Users\i\Desktop\Fuzzing\results -D C:\Users\i\Desktop\Fuzzing\DynamoRIO\bin64 -t 20000 -- -fuzz_iterations 5000 -target_module "D:\Program Files (x86)\VideoLAN\VLC\vlc.exe" -target_offset 0x532a0 -nargs 2 -m 1024 -- "D:\Program Files (x86)\VideoLAN\VLC\vlc.exe" @@
```

![image](https://img.iami.xyz/images/45439093-7f0e1800-b6eb-11e8-901e-29e5ebc0db16.png)
![image](https://img.iami.xyz/images/45439106-86352600-b6eb-11e8-9103-353f56f5bb0b.png)
![image](https://img.iami.xyz/images/45438403-a7951280-b6e9-11e8-8f38-fbadc416ad08.png)

# 其他
fuzz到crash只是第一步，如何根据crash创建payload才是重要的事情。

# Resources
* [The Art, Science, and Engineering of Fuzzing: A Survey](https://arxiv.org/pdf/1812.00140.pdf)
* [AFL(American Fuzzy Lop)实现细节与文件变异](https://paper.seebug.org/496/)
* [Radamsa的常规用法](http://www.cs.tut.fi/tapahtumat/testaus12/kalvot/Wieser_20120606radamsa-coverage.pdf)
* [fuzzer-test-suite](https://github.com/google/fuzzer-test-suite)
* [OWASP Fuzzing](https://www.owasp.org/index.php/Fuzzing)
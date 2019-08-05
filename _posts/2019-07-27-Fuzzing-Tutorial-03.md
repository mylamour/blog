---
layout: post
title: Linux Kernel Fuzzing With QEMU And AFL
categories: HowTo
kerywords: Fuzzing tutorial 
tags: 知识回顾 学习笔记
---

(本教程主要在cnetos完成,工具主要为triforceAFL)

## 安装triforceAFL及QEMU以及编译内核
1.安装QEMU依赖
```shell
yum install git glib2-devel libfdt-devel pixman-devel zlib-devel  qemu-kvm libvirt libvirt-python libguestfs-tools virt-install
```

2.安装TriforceAFL
```
git clone https://github.com/nccgroup/TriforceAFL
cd TriforceAFL
make
```
注，如果在Ubuntu上编译不通过，可以进入qemu_mode/修改脚本，然后重新make
```shell
./configure --target-list="aarch64-softmmu,microblazeel-softmmu" --enable-fdt --disable-kvm --disable-xen 
```
![image](https://user-images.githubusercontent.com/12653147/61783502-6edcc400-adf7-11e9-9c0f-ae032f7d1cbd.png)

事实证明还是在Centos上比较容易搞定。

下面跟着TriforceLinuxSyscallFuzzer去做内核fuzz的教程，注意TriforceLinuxSyscallFuzzer和TriforceAFL在同一目录。

```shell
git clone https://github.com/nccgroup/TriforceLinuxSyscallFuzzer
yum install glibc-static
cd TriforceLinuxSyscallFuzzer
make

```

3.编译内核

步骤基本如下：
* 下载代码 `wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.2.2.tar.xz`
* 安装依赖(如果还缺少其他依赖的话继续安装) 
> `yum install ncurses-devel elfutils-libelf-devel` 
`yum install -y ncurses-devel make gcc bc bison flex elfutils-libelf-devel openssl-devel grub2`
* 编译 
```
tar -xf linux-5.2.2.tar.xz && cd linux-5.2.2
cp /boot/config-$(uname -r) .config  # 使用这个你需要一路回车很久，不如用make menuconfig吧，更方便
make
```
此处本来尝试了采用afl-gcc和afl-g++去编译，但是没有成功。
更改install的路径`vim Makefile`在大概919行的位置，更改目录为自己的。此处为
![image](https://user-images.githubusercontent.com/12653147/61921831-00f6e080-af4e-11e9-80e1-3fd165101c0a.png)
然后运行`make install`
就可以看到对应的文件已经在目录下了
然后查看`ls /proc/kallsyms` 。这个文件包含了kernel image和动态加载模块的符号表。 如果没有该文件，可以通过下面命令开启:

`sudo sh -c "echo 0  > /proc/sys/kernel/kptr_restrict"`

然后把对应的文件拷贝到你的kern目录下
```shell
cp /proc/kallsyms  .
cp arch/x86/boot/bzImage /home/ops/fuzz_learning/tools/kern
```
![image](https://user-images.githubusercontent.com/12653147/61921855-1966fb00-af4e-11e9-9f6b-c79953f57de0.png)

由上图看内核编译就绪，接下来开始运行

```
make inputs
./runFuzz -M 10
```

![image](https://user-images.githubusercontent.com/12653147/61921965-72cf2a00-af4e-11e9-8d68-0787e594111c.png)

当然最重要的是，如果能看到Crash就好了...

# 其他
昨天打开知乎看到一个问答里谈到期望管理，又牵扯出为什么好人要经历九九八十一难才能成佛，而坏人却是放下屠刀，立地成佛？ 
初一想，觉得的确有些不公与不满。无论是对目标的期望怎么样，或者期望管理怎么样。从另一个方面说，好人经历九九不十一难是为了找到一个让他能够发生改变的契机点，因为有无数个对立面的诱惑，好人无法经历全部，也不能确认是否能够抵挡的住所有诱惑。阿难尚且抵挡不住摩登伽女的诱惑，何况好人乎。而坏人的本质已经是个坏人，身处诱惑与肮脏，为恶之中。而放下屠刀这个动作是坏人自己本身去做得，从自己内心把恶放到了另一面。而从心的改变，往往是持久的。自古贪官多穷苦出身，这不是讽刺清贫，清贫并非不好，难得的是能够始终保持如一。而且即便坏人放下屠刀，立地成佛。在以后的日子中并不意味着就不再接受考验。所以很多成语，只是通俗大众的去解释，并非那么精准详细的去限定某些事情。再如花和尚鲁智深，水浒中为数不多得以善终的一位，无论是不是侠义，也算是杀人无数。但是出家之后的那句揭语：扯断金绳玉所，今日方知我是我。岂不正是顿悟，放下不是一时，是一个过程。持久的过程。 
> 平生不修善果，只爱杀人放火。 忽地顿开金绳，这里扯断玉锁。 咦！ 钱塘江上潮信来，今日方知我是我。


# 参考资料
* [System.map和kallsyms文件](https://luobuda.github.io/2017/04/23/System-map%E5%92%8Ckallsyms%E6%96%87%E4%BB%B6/)
* [TriforceAFL](https://github.com/nccgroup/TriforceAFL)
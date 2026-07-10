---
layout: post
title: Fuzzing Tutorial - Linux Kernel Fuzzing
categories: Security Engineer
kerywords: Fuzzing tutorial 
tags: Fuzzing Legacy Migration
translated: true
---

(This tutorial is mainly done on CentOS, using TriforceAFL as the main tool)

## Installing TriforceAFL, QEMU, and Compiling the Kernel
1. Install QEMU dependencies
```shell
yum install git glib2-devel libfdt-devel pixman-devel zlib-devel  qemu-kvm libvirt libvirt-python libguestfs-tools virt-install
```

2. Install TriforceAFL
```
git clone https://github.com/nccgroup/TriforceAFL
cd TriforceAFL
make
```

Note: If compilation fails on Ubuntu, you can modify the script in qemu_mode/ and remake

```shell
./configure --target-list="aarch64-softmmu,microblazeel-softmmu" --enable-fdt --disable-kvm --disable-xen 
```
![image](https://img.iami.xyz/images/61783502-6edcc400-adf7-11e9-9c0f-ae032f7d1cbd.png)

Turns out it's easier to get it working on CentOS.

Now follow the TriforceLinuxSyscallFuzzer tutorial for kernel fuzzing. Note that TriforceLinuxSyscallFuzzer and TriforceAFL should be in the same directory.

```shell
git clone https://github.com/nccgroup/TriforceLinuxSyscallFuzzer
yum install glibc-static
cd TriforceLinuxSyscallFuzzer
make

```

3. Compile the kernel

Basic steps:
* Download the source code `wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.2.2.tar.xz`
* Install dependencies (if other dependencies are missing, continue installing) 
> `yum install ncurses-devel elfutils-libelf-devel` 
`yum install -y ncurses-devel make gcc bc bison flex elfutils-libelf-devel openssl-devel grub2`
* Compile 
```
tar -xf linux-5.2.2.tar.xz && cd linux-5.2.2
cp /boot/config-$(uname -r) .config  # Using this method requires pressing enter for a long time, better to use make menuconfig instead
make
```
I originally tried using afl-gcc and afl-g++ for compilation, but it didn't work.
Change the install path by editing `vim Makefile` around line 919, modify the directory to your own. In this case:
![image](https://img.iami.xyz/images/61921831-00f6e080-af4e-11e9-80e1-3fd165101c0a.png)
Then run `make install`
You can see the corresponding files are now in the directory
Then check `ls /proc/kallsyms`. This file contains the symbol table of the kernel image and dynamically loaded modules. If the file doesn't exist, you can enable it with this command:

`sudo sh -c "echo 0  > /proc/sys/kernel/kptr_restrict"`

Then copy the corresponding files to your kern directory
```shell
cp /proc/kallsyms  .
cp arch/x86/boot/bzImage /home/ops/fuzz_learning/tools/kern
```
![image](https://img.iami.xyz/images/61921855-1966fb00-af4e-11e9-9f6b-c79953f57de0.png)

From the image above, the kernel compilation is ready. Now let's run it

```
make inputs
./runFuzz -M 10
```

![image](https://img.iami.xyz/images/61921965-72cf2a00-af4e-11e9-8d68-0787e594111c.png)

Of course, the most important thing is to see a Crash...

# Random Thoughts
Yesterday I saw a Q&A on Zhihu about expectation management, which then led to the question: why do good people have to go through eighty-one trials to become Buddha, while bad people only need to "put down the butcher's knife and instantly become Buddha"? 
At first thought, it does seem unfair and unsatisfying. No matter what expectations you have for your goals or how you manage expectations. From another perspective, good people go through eighty-one trials to find a turning point that can make them change, because there are countless temptations from opposing sides. Good people can't experience all of them, and can't be sure if they can resist all temptations. Even Ananda couldn't resist the temptation of Matangi, let alone ordinary good people. But the nature of bad people is already bad - they're immersed in temptation and filth, doing evil. And "putting down the butcher's knife" is an action that bad people do themselves, putting evil on the other side from within their heart. And change from the heart is often lasting. Since ancient times, many corrupt officials came from poor backgrounds - this isn't mocking poverty. Poverty isn't bad, what's rare is being able to maintain consistency throughout. And even if bad people put down the butcher's knife and instantly become Buddha, it doesn't mean they won't face tests in the days ahead. So many idioms are just popular explanations for the masses, not precise definitions of certain things. Take Lu Zhishen for example, one of the few in Water Margin who met a good end. Whether righteous or not, he still killed countless people. But after becoming a monk, that verse: "Break the golden cord and jade lock, today I finally know I am me." Isn't that enlightenment? Letting go isn't a moment, it's a process. A lasting process.
> A lifetime without cultivating good karma, only loving to kill and burn. Suddenly opening the golden cord, here breaking the jade lock. Ah! The tide comes on the Qiantang River, today I finally know I am me.


# References
* [System.map and kallsyms files](https://luobuda.github.io/2017/04/23/System-map%E5%92%8Ckallsyms%E6%96%87%E4%BB%B6/)
* [TriforceAFL](https://github.com/nccgroup/TriforceAFL)

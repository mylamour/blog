---
layout: post
title: Fuzzing Learning Notes - Getting Started with AFL
categories: Security Engineer
kerywords: Fuzzing tutorial 
tags: Fuzzing archived
translated: true
---

Fuzzing, or fuzz testing, is basically feeding a program with all kinds of mutated inputs. This means figuring out where to inject inputs (binaries, web services, system software, network protocols, filesystems, operating systems), how to keep generating effective inputs (how do you make your inputs more likely to crash the program?), how to analyze what happens when different inputs hit the target, and how to automate this whole pipeline.

Last year there was a paper that surveyed the history of fuzzing techniques, worth checking out: [The Art, Science, and Engineering of Fuzzing: A Survey](https://arxiv.org/pdf/1812.00140.pdf). This blog post is mainly my notes on learning from tutorials, mostly organized from my [gist](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e).


# mutators

radamsa is used to generate random fuzz vectors (don't worry about the terminology), though you can also just write code yourself to produce different mutated inputs.

1. Clone and compile
`git clone https://gitlab.com/akihe/radamsa.git && cd radamsa && make && sudo make install`

![image](https://img.iami.xyz/images/44978555-99cee700-af9d-11e8-8e9e-0a3111de5bdd.png)

2. Usage: `echo whatever | radamsa` to generate attack payloads

![image](https://img.iami.xyz/images/44978666-d995ce80-af9d-11e8-8e7e-76ebead99717.png)

![image](https://img.iami.xyz/images/44978719-f205e900-af9d-11e8-813a-3b95d57eaf1a.png)

3. Other usage patterns
* Generate multiple testcases
`echo "time thief"| radamsa -d 2 -n 10`
Generate 10 cases, one every 2 milliseconds. You can adjust this, like `-d 600`, whatever works.

![image](https://img.iami.xyz/images/44979655-414d1900-afa0-11e8-9e28-ed6b99150036.png)

* Generate testcases from files
`radamsa -r guest.jpg -o ./1.png`

<img src="https://img.iami.xyz/images/44980007-35158b80-afa1-11e8-8846-8679c5ddd47c.png" width="200" height="200" />
<img  src="https://img.iami.xyz/images/44980200-bec55900-afa1-11e8-969f-7dc891246279.png" width="200" height="200" />
<img src="https://img.iami.xyz/images/44980207-c38a0d00-afa1-11e8-8a4c-a816fc5dbaab.png" width="200" height="200" />
<img src="https://img.iami.xyz/images/44980216-c97fee00-afa1-11e8-9a6f-3cec98afb8c3.png" width="200" height="200" />


The above shows mutations of the original image.
For resizing images and inline alignment in markdown, you can use:

```javascript 
<img  align="right" src="https://xxx.png" width="200" height="200" />
```

# Fuzzer

There are already many fuzzing tools out there, with the more well-known ones being AFL, DynamoRIO, libfuzzer, oss-fuzz, etc. Here I'll mainly cover AFL usage. Different tools work differently, and workflows vary. But the principles are pretty similar. You need to explore this yourself. I'm still learning too.

## AFL
Not recommended on Mac, because macOS fork is pretty slow.

1.*Nix

This tutorial is done on Ubuntu
```shell
$ sudo apt-get install clang-3.8 build-essential llvm-3.8-dev gnuplot-nox
$ sudo update-alternatives --install /usr/bin/clang clang `which clang-3.8` 1
$ sudo update-alternatives --install /usr/bin/clang++ clang++ `which clang++-3.8` 1
$ sudo update-alternatives --install /usr/bin/llvm-config llvm-config `which llvm-config-3.8` 1
$ sudo update-alternatives --install /usr/bin/llvm-symbolizer llvm-symbolizer `which llvm-symbolizer-3.8` 1

```
Download the latest version
```shell
wget http://lcamtuf.coredump.cx/afl/releases/afl-latest.tgz
tar -xf afl-latest.tgz
```
Then compile
```
$ cd afl-2.52b 
$ make
$ make -C llvm_mode

```

To compile `qemu` mode (for scenarios where you don't have target program source code), you need to go to `qemu_mode` separately and compile. Even without source code, you can use `QEMU` to translate `blocks` for `instrumentation`.

When using it, compile with `afl-gcc`, like `CC=afl-gcc CXX=afl-g++ ./configure` or `CC=afl-clang ./configure`, then `make`.

`./afl-fuzz -i testcase_dir -o findings_dir /path/to/program [...params...]`
If the params at the end is `@@`, it means it will be replaced by filenames from your testcase folder
`./afl-fuzz -i testcase_dir -o findings_dir /path/to/program @@`

AFL also supports distributed runs, you can refer to the commands below
```shell
afl-fuzz -i input_dir -o fuzz_output -M master ./test @@
afl-fuzz -i input_dir -o fuzz_output -S slave1 ./test @@
afl-fuzz -i input_dir -o fuzz_output -S slave2 ./test @@ 
afl-fuzz -i input_dir -o fuzz_output -S slave3 ./test @@  
```
If a process exits, you can also use this command to resume, perfect.

```
afl-fuzz -i- -o fuzz_output -M master ./test @@
afl-fuzz -i- -o fuzz_output -S slave1 ./test @@
afl-fuzz -i- -o fuzz_output -S slave2 ./test @@
afl-fuzz -i- -o fuzz_output -S slave3 ./test @@
```

You can find all of this in AFL's readme though.


2.Windows: WinAFL fuzzing VLC with DynamoRIO

The go-to tool on Windows is naturally WinAFL, check it out (though I feel like maybe my computer is too crappy? Can't really get it to work... doesn't seem very effective)

```cmd
afl-fuzz.exe -i C:\Users\i\Desktop\Fuzzing\db -o C:\Users\i\Desktop\Fuzzing\results -D C:\Users\i\Desktop\Fuzzing\DynamoRIO\bin64 -t 20000 -- -fuzz_iterations 5000 -target_module "D:\Program Files (x86)\VideoLAN\VLC\vlc.exe" -target_offset 0x532a0 -nargs 2 -m 1024 -- "D:\Program Files (x86)\VideoLAN\VLC\vlc.exe" @@
```

![image](https://img.iami.xyz/images/45439093-7f0e1800-b6eb-11e8-901e-29e5ebc0db16.png)
![image](https://img.iami.xyz/images/45439106-86352600-b6eb-11e8-9103-353f56f5bb0b.png)
![image](https://img.iami.xyz/images/45438403-a7951280-b6e9-11e8-8f38-fbadc416ad08.png)

# Other Notes
Fuzzing to a crash is just the first step, figuring out how to create a payload from the crash is what really matters.

# Resources
* [The Art, Science, and Engineering of Fuzzing: A Survey](https://arxiv.org/pdf/1812.00140.pdf)
* [AFL(American Fuzzy Lop) Implementation Details and File Mutation](https://paper.seebug.org/496/)
* [Common Usage of Radamsa](http://www.cs.tut.fi/tapahtumat/testaus12/kalvot/Wieser_20120606radamsa-coverage.pdf)
* [fuzzer-test-suite](https://github.com/google/fuzzer-test-suite)
* [OWASP Fuzzing](https://www.owasp.org/index.php/Fuzzing)

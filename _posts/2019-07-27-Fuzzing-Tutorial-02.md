---
layout: post
title: Chromium Fuzzing with libfuzzer
categories: 安全工程师
kerywords: Fuzzing tutorial 
tags: Fuzzing
---

接上篇，当然依旧是整理自[gist](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e)。

libfuzzer是llvm下面的一个项目
> LibFuzzer is in-process, coverage-guided, evolutionary fuzzing engine. LibFuzzer is linked with the library under test, and feeds fuzzed inputs to the library via a specific fuzzing entrypoint (aka “target function”); the fuzzer then tracks which areas of the code are reached, and generates mutations on the corpus of input data in order to maximize the code coverage. The code coverage information for libFuzzer is provided by LLVM’s SanitizerCoverage instrumentation.

下面开始搞一搞吧

#  Chromium fuzzing tutorial

ubuntu16.04:
```shell

git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:/path/to/depot_tools"             #使用绝对路径
mkdir ~/chromium && cd ~/chromium
fetch --nohooks chromium                           # 大概下载10G左右
cd src 
./build/install-build-deps.sh                     # 安装依赖
gclient runhooks                            # 运行  Chromium-specifices
# 准备构建
gn gen out/Default                   # 生成ninja文件准备构建

#mount -t tmpfs -o size=20G,nr_inodes=40k,mode=1777 tmpfs /root/chromium/src/out  
# 20G小了，编译没有够用，空间不够重新开大点。

# 构建
autoninja -C out/Default chrome  
```

![image](https://user-images.githubusercontent.com/12653147/44777163-71657800-abac-11e8-8d0b-690e5bc0b0da.png)
![image](https://user-images.githubusercontent.com/12653147/44777726-dff70580-abad-11e8-8c14-dc031bdb64e0.png)

8核8G的机器，前面的基本上一秒编译一个，看来可能要9个小时后才能编译完。运气好的话

![image](https://user-images.githubusercontent.com/12653147/44888428-c4057800-ad03-11e8-9494-1e1afa1e865a.png)

编译结束,大小也变成了49G

![image](https://user-images.githubusercontent.com/12653147/44888721-30cd4200-ad05-11e8-8b3e-b926f5db6d3d.png)

构建libfuzzer

```
 $ gn gen out/libfuzzer '--args=use_libfuzzer=true is_asan=true is_ubsan_security=true is_debug=false enable_nacl=false' --check
 $ ninja -C out/libfuzzer v8_json_parser_fuzzer
```
![image](https://user-images.githubusercontent.com/12653147/44890311-4d20ad00-ad0c-11e8-8c50-8b0707517ab0.png)

```
$ ./out/libfuzzer/v8_json_parser_fuzzer ~/chromium/testcases/json_parser_corpus/ --dict=json.dict -jobs=6 -workers=6
```
![image](https://user-images.githubusercontent.com/12653147/44891509-4e54d880-ad12-11e8-848d-5418dcbfb95c.png)


# ToDo

- [ ] gn用法
- [ ] ninja 用法

# References

* [安装步骤](https://security.googleblog.com/2016/08/guided-in-process-fuzzing-of-chrome.html)
* [chromium fuzzing 教程](https://chromium.googlesource.com/chromium/src/testing/libfuzzer/+/HEAD/efficient_fuzzer.md)
* [v8 testcases](https://github.com/v8/v8/tree/master/test)
* [LibFuzzer](https://llvm.org/docs/LibFuzzer.html)
* [libfuzzer-workshop](https://github.com/Dor1s/libfuzzer-workshop)

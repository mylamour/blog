---
layout: post
title: Fuzzing Learning Notes: libfuzzer and Chromium
categories: Security Engineer
kerywords: Fuzzing tutorial 
tags: Fuzzing
translated: true
---

Following up from the previous post, still organizing from [gist](https://gist.github.com/mylamour/640622641ee39edf3701544a4303cb2e).

libfuzzer is a project under llvm
> LibFuzzer is in-process, coverage-guided, evolutionary fuzzing engine. LibFuzzer is linked with the library under test, and feeds fuzzed inputs to the library via a specific fuzzing entrypoint (aka "target function"); the fuzzer then tracks which areas of the code are reached, and generates mutations on the corpus of input data in order to maximize the code coverage. The code coverage information for libFuzzer is provided by LLVM's SanitizerCoverage instrumentation.

Let's get started

#  Chromium fuzzing tutorial

ubuntu16.04:
```shell

git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:/path/to/depot_tools"             # use absolute path
mkdir ~/chromium && cd ~/chromium
fetch --nohooks chromium                           # downloads about 10G
cd src 
./build/install-build-deps.sh                     # install dependencies
gclient runhooks                            # run Chromium-specifices
# prepare build
gn gen out/Default                   # generate ninja files for building

#mount -t tmpfs -o size=20G,nr_inodes=40k,mode=1777 tmpfs /root/chromium/src/out  
# 20G was too small, compilation ran out of space. Need to increase it.

# build
autoninja -C out/Default chrome  
```

![image](https://img.iami.xyz/images/44777163-71657800-abac-11e8-8d0b-690e5bc0b0da.png)
![image](https://img.iami.xyz/images/44777726-dff70580-abad-11e8-8c14-dc031bdb64e0.png)

On an 8-core 8GB machine, the initial builds are basically one per second, looks like it might take 9 hours to finish. If we're lucky.

![image](https://img.iami.xyz/images/44888428-c4057800-ad03-11e8-9494-1e1afa1e865a.png)

Build complete, size grew to 49G

![image](https://img.iami.xyz/images/44888721-30cd4200-ad05-11e8-8b3e-b926f5db6d3d.png)

Building libfuzzer

```
 $ gn gen out/libfuzzer '--args=use_libfuzzer=true is_asan=true is_ubsan_security=true is_debug=false enable_nacl=false' --check
 $ ninja -C out/libfuzzer v8_json_parser_fuzzer
```
![image](https://img.iami.xyz/images/44890311-4d20ad00-ad0c-11e8-8c50-8b0707517ab0.png)

```
$ ./out/libfuzzer/v8_json_parser_fuzzer ~/chromium/testcases/json_parser_corpus/ --dict=json.dict -jobs=6 -workers=6
```
![image](https://img.iami.xyz/images/44891509-4e54d880-ad12-11e8-848d-5418dcbfb95c.png)


# ToDo

- [ ] gn usage
- [ ] ninja usage

# References

* [Installation steps](https://security.googleblog.com/2016/08/guided-in-process-fuzzing-of-chrome.html)
* [chromium fuzzing tutorial](https://chromium.googlesource.com/chromium/src/testing/libfuzzer/+/HEAD/efficient_fuzzer.md)
* [v8 testcases](https://github.com/v8/v8/tree/master/test)
* [LibFuzzer](https://llvm.org/docs/LibFuzzer.html)
* [libfuzzer-workshop](https://github.com/Dor1s/libfuzzer-workshop)

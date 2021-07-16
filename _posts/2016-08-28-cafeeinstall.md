---
layout: post
title: How to Install Caffe in Jeston TK1 
categories: 学习数据挖掘的路上
keywords: Caffe Jeston Tk1 OCR
tags: 实习笔记
---

# Jeston TK1 Install Caffe

``` bash
#!/bin/bash

#以下安装为在jeston TK1(安装的是ubuntu 14.04LTS)上所完成，无意外当适用于普通linux系统.但是在选择cudnn时务必选择自己系统对应的版本。

#安装git
sudo add-apt-repository universe
sudo apt-get update
sudo pat-get install git 

#需要安装opencv ,参考官网
sudo apt-get install build-essential
sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
sudo apt-get install python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev

cd ~
git clone https://github.com/opencv/opencv.git
mkdir build 
cd build
cmake ..
make
sudo make install


#安装依赖
sudo apt-get install -y gcc-4.7 g++-4.7
sudo apt-get install libprotobuf-dev libleveldb-dev libsnappy-dev libopencv-dev libboost-all-dev libhdf5-serial-dev libgflags-dev libgoogle-glog-dev liblmdb-dev protobuf-compiler libatlas-base-dev
sudo apt-get install python-dev python-pip python-numpy gfortran

#如果出现cv:imagecode undefined ， 请 尝试 sudo ldconfig ，或者在makefile里面直接把libopencvXXX的库连接上去。
#如果是opencv3，你需要在makefile.config里面讲opencv3选项选中。

#if you need cudnn, you should download cudnn lib and unzip it to cuda path。 注意cudnn的版本，即便是cuda-6.5也需要cudnn version >3 这个需要去nvdia官网注册，然后才能下载。
#sudo cp cudnn.h /usr/local/cuda/include
#sudo cp libcudnn* /usr/local/cuda/lib


#安装caffe 
cd ~
git clone https://github.com/BVLC/caffe.git
cd caffe
cp Makefile.config.example Makefile.config
#如果你是直接采用在caffe目录下面进行make -j 4 all， 也未尝不可。
mkdir build
cd build
cmake ..
make -j 4 all


#other， caffe 安装过程gcc ,g++ 4.7 版本，版本不同导致出现问题。不知道是否已经解决了。我之前安装的是5.8的吧，最后又装了4.7的才行。
#Youtube 上有个jestonhacks，还是不会安装的话可以看他的教程,不过他的教程也有很多问题，毕竟时间已经很久了。
#安装完成之后，去caffe官网跑个demo看看。
#也许你在安装opencv的过程中也会出现问题，那么，不论哪里出现了问题都记得多google即可。
#另附：没有显示器的情况下，用一根网线也是可以连接进Jeston TK1的，最初之所以没有连接进去，是因为以前用的时候设了静态IP，以至于不能重新获得新的IP。

```


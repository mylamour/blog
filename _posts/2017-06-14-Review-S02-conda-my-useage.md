---
layout: post
title: conda in action
categories: HowTo
tags: 知识回顾 学习笔记
---


无论是使用virtualenv还是conda，本意无非是使开发环境变得干净纯粹，当然我们还可以使用`vagrant`启动一个虚拟机，在虚拟机里操作，或者`docker`起一个`container`也一样。

* 基础的用法

```bash
$ conda info --env
$ conda create -n testenv
$ activate testenv
$ deactivate testenv
```
* 在`linux`下你可能需要这样
```bash
$ source activate testenv
$ source deactivate testenv
```
* 指定`python`版本
```bash
$ conda create -n testenv python=27
```
* 删除某个虚拟环境
```bash
$ conda env remove --name tensorflow
```

* 使`jupyter`使用某个虚拟环境
```bash
$ source activate myenv
$ python -m ipykernel install --user --name myenv --display-name "Python (myenv)"
$ source activate other-env
$ python -m ipykernel install --user --name other-env --display-name "Python (other-env)"
```

* 在服务器上启动一个无浏览器的`jupyter notebook`
```bash
$ jupyter notebook --no-browser
$ jupyter notebook --no-browser --port 6699
```

* 集成`pyspark`
```bash
#step 1 
 $ mv spark-1.2.0-bin-hadoop2.4 /opt/spark-1.2.0
 $ ln -s /opt/spark-1.2.0 /opt/spark
#step 2 (长久生效应该将下列的语句写到bashrc文件里，或者zshrc里)
 $ export SPARK_HOME=/opt/spark
 $ export PATH=$SPARK_HOME/bin:$PATH
 $ export PYSPARK_DRIVER_PYTHON=jupyter
 $ export PYSPARK_DRIVER_PYTHON_OPTS='notebook'

#step 3 
 $ pyspark

```

* 集成 `R`
```R
> install.packages(c('repr', 'IRdisplay', 'evaluate', 'crayon', 'pbdZMQ', 'devtools', 'uuid', 'digest'))
devtools::install_github('IRkernel/IRkernel')
> IRkernel::installspec()
```

> 当然，docker似乎已经成了更加方便的部署方法，可我觉得哪里缺了点什么。这些东西一定要自己先手动部署一次。之后再使用也知道是个怎么回事了。

#### Resources

* [pyspark-with-jupyter](https://blog.sicara.com/get-started-pyspark-jupyter-guide-tutorial-ae2fe84f594f)
* [docker-pyspakr-jupyter](https://github.com/jupyter/docker-stacks/tree/master/pyspark-notebook)
* [IRkernel](https://github.com/IRkernel/IRkernel)
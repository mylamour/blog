---
layout: post
title: GIL和Python并行编程（一）
categories: 安全工程师 
keywords: GIL, mutliprocessing, threading, python, parallerl programing
tags: 安全研发
---


# 基本概念

* 进程
> 一个进程有多个线程，进程拥有独立的内存空间，进程间通信较为方便

* 线程
> 不可划分的最小单位

* 协程
> 由某个调度程序进行控制调度

* 阻塞非阻塞
> 关注点是程序在等待调用结果(消息，返回值)时的状态，处理IO时都是阻塞和非阻塞都是同步IO,只有使用了特殊的API才是异步IO

* 异步与同步
> 关注点是消息通信机制，同步则在发出调用之后即返回结果，或者等待到这个结果。异步是在调用之后不会得到结果，被调用函数计算出结果之后会通知调用者,或者通过回调函数处理。


# GIL

pass

## Performance Notes

* 多线程,多进程(单机多进程，多机多进程)
* 多进程可以直接用multiprocess或者从shell之类启动多个python进程
* 分布式的方式
* 直接采用gevent的monkey patch(协程)
* 编写扩展，ctypes编写c库，由python调用,或者编写rust扩展也行，
* 换解释器，换成pypy解释器，据说代码运行速度可以快6.3倍,但是并不实用,好多库的实现依赖不同

# 并行编程(Parallel Programing)
talk is cheap, show me the demo code...

## 线程

### MultiThread

一般来讲，直接继承自`threading.Thread`,即可

```python

import threading
import time

exitFlag = 0

class mThread( threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)

        self.threadID = threadID
        self.name = name
        self.counter = counter

    def run(self):
        print("Starting "+ self.name)
        print_time(self.name, self.counter, 5)
        print("Esxiting " + self.name)

def print_time(threadName, delay, counter):
    while counter:
        if exitFlag:
            thread.exit()
        time.sleep(delay)

        print("{} {}".format(threadName,time.ctime(time.time())))

        counter -= 1

thread1 = mThread(1, "Thread-1", 1)
thread2 = mThread(2, "Thread-2", 2)

thread1.start()
thread2.start()

print("Exiting Main Thread")       

```

### Thread Pool

不建议使用，使用进程池吧
<!-- Cpython的实现中,由于GIL的限制,只有一个线程可以运行。 -->

* 写法一,使用`concurrent`模块的`ThreadPool`

```python

from concurrent import ThreadPool

p = ThreadPool(4)
p.map(f,range(10))

```

* 写法二,使用`concurrent`模块的`ThreadPoolExecutor`以及`with`

```python

from concurrent import futures

def f(x):
    return x*x

with futures.ThreadPoolExecutor(max_workers=4) as ex:
    print(list(ex.map(f, range(10))))

```

* 写法三，使用`gevent`库的`ThreadPool`

```python

# code from https://github.com/gevent/gevent/blob/master/examples/threadpool.py

import time
import gevent
from gevent.threadpool import ThreadPool


pool = ThreadPool(3)
start = time.time()
for _ in range(4):
    pool.spawn(time.sleep, 1)
gevent.wait()
delay = time.time() - start
print('Running "time.sleep(1)" 4 times with 3 threads. Should take about 2 seconds: %.3fs' % delay)

```


## 进程

### MultiProcess

```python

import multiprocessing

def worker(num):
    print("Worker: {}".format(num))

jobs = []

for i in range(5):
    p = multiprocessing.Process(target=worker,args=(i,))
    jobs.append(p)
    p.start()

```

### ProcessPool 

* 写法一,使用`multiprocessing`模块的`Pool`

```python

from multiprocessing import Pool
p = Pool(4)

def f(x):
    return x*x

print(p.map(f, range(10)))

```

* 写法二,使用`multiprocessing`模块的`Pool`以及上下文管理器`With`

```python

from multiprocessing import Pool, TimeoutError
import time
import os

def f(x):
    return x*x

with Pool(processes=4) as pool:
    print(pool.map(f,range(10)))

```

* 写法三,使用`concurrent`模块的`ProcessPoolExecutor`以及`with`

```python

from concurrent import futures

def f(x):
    return x*x

with futures.ProcessPoolExecutor(max_workers=4) as ex:
    print(list(ex.map(f, range(10))))
    
    # Also you can use ex.submit, and get it's value by result() method
    #for i in range(10):
    #    res = ex.submit(f,i)
    #    print(res.result())

```


## 协程

使用gevent的猴子补丁,尽量早，在代码的一开始就导入并使用。不用对其他代码进行修改就可以达到加速。

```python

from gevent import monkey
monkey.patch_all()

```

其他的用的并不多,不是很清楚，还是等更熟悉了再添加。

## 其他

### 队列: 

* [queue](https://docs.python.org/3/library/queue.html): A synchronized queue class

```python
# demo code from https://docs.python.org/3/library/queue.html

def worker():
    while True:
        item = q.get()
        if item is None:
            break
        do_work(item)
        q.task_done()

q = queue.Queue()
threads = []
for i in range(num_worker_threads):
    t = threading.Thread(target=worker)
    t.start()
    threads.append(t)

for item in source():
    q.put(item)

# block until all tasks are done
q.join()

# stop workers
for i in range(num_worker_threads):
    q.put(None)
for t in threads:
    t.join()

```

* [multiprocessing.Queue](https://docs.python.org/3/library/multiprocessing.html#multiprocessing.Queue): Implements all the methods of `queue.Queue` except for `task_done` and `join`

```python

import multiprocessing
import random
import string

class Fun:
    def __init__(self, name):
        self.name = name

    def do_it(self):
        name = multiprocessing.current_process().name
        print("{} Just Do it; Fun {}".format(name, self.name))


def worker(q):
    obj = q.get()
    obj.do_it()


queue = multiprocessing.Queue()

p = multiprocessing.Process(target=worker, args=(queue,))
p.start()

queue.put(Fun("{}".format(random.choice(string.ascii_uppercase))))

queue.close()
queue.join_thread()
p.join()

```

# Other

下篇详细写GIL和并行编程中的通信，进程间通信等。

# References

* [怎样理解阻塞非阻塞与同步异步的区别？](https://www.zhihu.com/question/19732473)
* [Linux IO模式及 select、poll、epoll详解](https://segmentfault.com/a/1190000003063859)
* [Parallel Programming with Python.pdf](http://file.allitebooks.com/20160421/Python%20Parallel%20Programming%20Cookbook.pdf)
* [Python的GIL是什么鬼，多线程性能究竟如何](http://cenalulu.github.io/python/gil-in-python/)
* [Python Parallel Programming Cookbook.pdf](http://file.allitebooks.com/20160421/Python%20Parallel%20Programming%20Cookbook.pdf)
* [Coroutines Python](http://www.dabeaz.com/coroutines/Coroutines.pdf)
* [Python Parallal Programming](https://github.com/mylamour/python-and-pythonic)
* [multiprocessing doc](https://docs.python.org/3/library/multiprocessing.html)
* [Understanding the python GIL](https://www.dabeaz.com/python/UnderstandingGIL.pdf)
* [Multiprocessing Queue Source Code](https://github.com/python/cpython/blob/3.6/Lib/multiprocessing/queues.py)
* [queue source code](https://github.com/python/cpython/blob/3.6/Lib/queue.py)
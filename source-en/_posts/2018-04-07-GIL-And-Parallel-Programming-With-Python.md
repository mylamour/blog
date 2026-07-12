---
layout: post
title: GIL and Python Parallel Programming (Part 1)
categories: Security Engineer
kerywords: GIL, mutliprocessing, threading, python, parallerl programing
tags: Security Development
translated: true
---


# Basic Concepts

* Process
> A process has multiple threads. Processes have independent memory spaces, and inter-process communication is relatively convenient.

* Thread
> The smallest indivisible unit.

* Coroutine
> Controlled and scheduled by some scheduler.

* Blocking vs Non-blocking
> This describes the program's state while it waits for a call result (a message or return value). Both blocking and non-blocking I/O can be synchronous; I/O becomes asynchronous only when the relevant APIs are used.

* Asynchronous vs Synchronous
> This describes the communication mechanism. A synchronous call returns a result immediately or waits for one. An asynchronous call returns before the result is available; the called function later notifies the caller or invokes a callback.


# GIL

pass

## Performance Notes

* Multi-threading, multi-processing (single-machine multi-process, multi-machine multi-process)
* Multi-processing can be done directly with multiprocess or by starting multiple Python processes from the shell
* Distributed approach
* Directly use gevent's monkey patch (coroutine)
* Write extensions, use ctypes to write C libraries called by Python, or write Rust extensions
* Switch interpreters. PyPy can reportedly execute code up to 6.3 times faster, but this is not always practical because library implementations and dependencies differ.

# Parallel Programming
Theory is useful, but the examples below are more concrete.

## Thread

### MultiThread

Generally speaking, just inherit from `threading.Thread` directly

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

Not recommended, use process pool instead
<!-- In CPython's implementation, due to GIL restrictions, only one thread can run. -->

* Approach 1, use `ThreadPool` from the `concurrent` module

```python

from concurrent import ThreadPool

p = ThreadPool(4)
p.map(f,range(10))

```

* Approach 2, use `ThreadPoolExecutor` from the `concurrent` module with `with`

```python

from concurrent import futures

def f(x):
    return x*x

with futures.ThreadPoolExecutor(max_workers=4) as ex:
    print(list(ex.map(f, range(10))))

```

* Approach 3, use `ThreadPool` from the `gevent` library

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


## Process

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

* Approach 1, use `Pool` from the `multiprocessing` module

```python

from multiprocessing import Pool
p = Pool(4)

def f(x):
    return x*x

print(p.map(f, range(10)))

```

* Approach 2, use `Pool` from the `multiprocessing` module with context manager `With`

```python

from multiprocessing import Pool, TimeoutError
import time
import os

def f(x):
    return x*x

with Pool(processes=4) as pool:
    print(pool.map(f,range(10)))

```

* Approach 3, use `ProcessPoolExecutor` from the `concurrent` module with `with`

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


## Coroutine

Use gevent's monkey patch as early as possible, at the very beginning of the code. No need to modify other code to achieve acceleration.

```python

from gevent import monkey
monkey.patch_all()

```

I do not use the other approaches often and am not yet familiar enough with them to cover them here. I will add more as I learn.

## Other

### Queue: 

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

I will cover the GIL, communication in parallel programs, and inter-process communication in more detail in the next post.

# References

* [How to understand the difference between blocking/non-blocking and synchronous/asynchronous?](https://www.zhihu.com/question/19732473)
* [Linux IO modes and detailed explanation of select, poll, epoll](https://segmentfault.com/a/1190000003063859)
* [Parallel Programming with Python.pdf](http://file.allitebooks.com/20160421/Python%20Parallel%20Programming%20Cookbook.pdf)
* [What is Python's GIL, how is multi-threading performance really](http://cenalulu.github.io/python/gil-in-python/)
* [Python Parallel Programming Cookbook.pdf](http://file.allitebooks.com/20160421/Python%20Parallel%20Programming%20Cookbook.pdf)
* [Coroutines Python](http://www.dabeaz.com/coroutines/Coroutines.pdf)
* [Python Parallal Programming](https://github.com/mylamour/python-and-pythonic)
* [multiprocessing doc](https://docs.python.org/3/library/multiprocessing.html)
* [Understanding the python GIL](https://www.dabeaz.com/python/UnderstandingGIL.pdf)
* [Multiprocessing Queue Source Code](https://github.com/python/cpython/blob/3.6/Lib/multiprocessing/queues.py)
* [queue source code](https://github.com/python/cpython/blob/3.6/Lib/queue.py)

---
layout: post
title: 软件工程实践：以Python为例
categories: 安全架构师
kerywords: python flask celery react nextjs OOP 面向对象编程 AI 数据库 ORM 框架 软件工程 日志管理 异常处理 版本管理 部署 持续发布 容器化 云 K8S AI-Driven Cursor Gemini ChatGPT Sqlachemy
tags: 安全研发
translated: true
---


> 我做过一些产品设计，但代码量一般，尤其是最近两年写的更少了。好在最近又开始重新拾起相关知识，因此总结了一些笔记，不过比较初级, 详细见下。

# 1. 从编程语言开始

python是一门很简单的语言，而且生态丰富，存在各种造好的轮子。这是我在没有阅读《Python高级编程》之前的想法，这本书一共出了两版，阅读第一版的时候还是2017年，让小白我大为震惊，也大受裨益。虽然入门的知识一天就可以学会，但在此之外还有一些值得关注的点，此处将部分Topic列在下面：

* 从命名与注释开始
* 包管理: `__init__.py` , `requirements.txt`的形成
* 相对路径与绝对路径与当前执行路径 （`pathlib`）
* 不同Python文件之间的互相调用
* 装饰器
* 上下文管理器
* 异步处理
* 并行处理
* 不固定长度传参
* 函数类型校验
* 类的继承
* 高级数据结构
* 内置的一些标准库的常见用法： 以`collections`, `contextlib`, `functools`， `multiprocessing`, `asyncio`为例等
* 动态加载文件

## 1.1 命名规范

- **变量名**: 小写字母和下划线，例如 `my_variable`。
- **函数名**: 小写字母和下划线，例如 `calculate_sum()`。
- **类名**: 首字母大写，例如 `MyClass`。
- **常量**: 全大写和下划线, 例如 `MAX_CONNECTIONS`。
- **模块名**: 应该是简短的、小写的名字，如果能提高可读性，可以使用下划线，例如 `my_module.py`。

## 1.2 注释

- **块注释 (#)**: 用于解释紧随其后的代码块的逻辑。
- **行内注释**: 用于解释单行代码的复杂部分，但应谨慎使用，好的代码应该自解释。
- **文档字符串 (Docstrings)**: 使用 `"""..."""` 为模块、类、函数或方法提供文档。它是 help() 函数和自动文档工具的数据来源。

```python
"""这是一个模块级别的文档字符串，解释该模块的用途。"""

MAX_RETRIES = 3  # 常量：最大重试次数

class NetworkHandler:
    """处理网络请求的类。"""
    def __init__(self, host):
        self.host = host

def fetch_data(url: str) -> str:
    """
    从给定的URL获取数据。

    Args:
        url (str): 需要获取数据的URL。

    Returns:
        str: 从URL返回的文本内容。
    """
    # 这是一个块注释，解释下面的逻辑
    # ... some logic here ...
    data = f"Data from {url}" # 这是一个行内注释
    return data

print(help(fetch_data))
```

## 1.3 包的标识

`__init__.py` 文件有两个主要作用：

- **将目录标记为Python包**: 只要一个目录包含了 `__init__.py` 文件，Python就会将其视为一个包，从而允许我们使用点号`.`来导入该目录下的模块。即使文件是空的。

- **定义包的公开API**: 我们可以在 `__init__.py` 中使用 `__all__` 变量来显式地定义当使用 `from my_package import *` 时，哪些模块或变量应该被导入。这是一种控制命名空间和提供清晰API的方式。

示例结构:

```log
my_project/
├── my_package/
│   ├── __init__.py
│   ├── module1.py
│   └── module2.py
└── main.py
```

`my_package/__init__.py` 内容:

```python
print("Initializing my_package...")
from .module1 import func1
from .module2 import MyClass

# 定义公开API
__all__ = ['func1', 'MyClass']
```

## 1.4 项目依赖

`requirements.txt` 文件用于记录项目所依赖的所有第三方库及其版本。

生成 `requirements.txt`:

* 使用虚拟环境

```bash
pip freeze > requirements.txt
```
* 使用`pipreqs`

```bash
pipreqs /path/to/your/project --force --encoding utf-8
```

* 使用 `requirements.txt` 安装依赖:

```bash
pip install -r requirements.txt
```

`requirements.txt` 示例:

```python
celery==5.5.3
cryptography==45.0.4
Flask==3.1.1
flask_cors==6.0.0
flask_sqlalchemy==3.1.1
pandas==2.3.0
Requests==2.32.4
```

## 1.5 路径处理

忘记 `os.path` 吧！`pathlib` 模块以面向对象的方式处理文件系统路径，让代码更具可读性和跨平台兼容性。

| 操作 | `os.path` (旧方法) | `pathlib` (新方法) |
| :--- | :--- | :--- |
| 获取当前路径 | `os.getcwd()` | `Path.cwd()` |
| 拼接路径 | `os.path.join('dir', 'file.txt')` | `Path('dir') / 'file.txt'` |
| 判断文件是否存在 | `os.path.exists(p)` | `Path(p).exists()` |
| 读取文件 | `with open(p, 'r') as f: ...` | `Path(p).read_text()` |

```python
from pathlib import Path

# 获取当前执行脚本的路径
current_path = Path.cwd()
print(f"当前工作路径: {current_path}")

# 构建路径
config_path = current_path / 'config' / 'settings.ini'
print(f"配置文件路径: {config_path}")

# 获取父目录
parent_dir = config_path.parent
print(f"父目录: {parent_dir}")

# 检查路径是否存在
print(f"配置文件是否存在? {config_path.exists()}")
```

-----

## 1.6 不同Python文件之间的互相调用 (模块化)

* 绝对导入 // 推荐使用绝对导入，它从项目的根目录（包含 `__init__.py` 的顶级包）开始，路径引用清晰。

```python
# 在 my_project/main.py 中
from my_package.module1 import func1
from my_package.module2 import MyClass

func1()
instance = MyClass()
```

* 相对导入 // 使用点号（`.`）来指代当前位置。一个点表示当前目录，两个点表示上级目录。只能在package内使用，不能用于顶层执行脚本

```python
# 在 my_package/module1.py 中，如果想调用 module2 的内容
from .module2 import MyClass # . 表示从当前包（my_package）开始

def func1():
    print("This is func1.")
    c = MyClass()
    c.show()
```

-----

## 1.7 装饰器 (Decorator)

装饰器本质上是一个接收函数作为参数并返回一个新函数的函数。它允许我们在不修改原函数代码的情况下，为其增加新的功能（例如：日志、计时、权限校验）。

```python
import time
from functools import wraps

def timing_decorator(func):
    """一个简单的计时装饰器"""
    @wraps(func)  # 使用wraps保留原函数的元信息（如__name__, __doc__）
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        print(f"函数 '{func.__name__}' 运行耗时: {end_time - start_time:.4f} 秒")
        return result
    return wrapper

@timing_decorator
def complex_calculation(n):
    """一个模拟耗时计算的函数"""
    total = 0
    for i in range(n):
        total += i
    return total

print(complex_calculation(10000000))
```

-----

## 1.8 上下文管理器 (Context Manager)

上下文管理器通过 `with` 语句来自动管理资源的分配和释放，确保像文件句柄、网络连接等资源在使用完毕后能被正确关闭，即使在发生异常时也是如此。

* 基于类实现 //实际就是自己实现了 `__enter__` 和 `__exit__`

```python
class MyTimer:
    def __enter__(self):
        print("计时开始...")
        self.start_time = time.perf_counter()
        return self # 这个返回值会赋给 as 后面的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        # exc_type, exc_val, exc_tb 用于接收异常信息
        self.end_time = time.perf_counter()
        print(f"代码块运行耗时: {self.end_time - self.start_time:.4f} 秒")
        # 如果返回 True，表示异常已经被处理
        return False

with MyTimer():
    # 执行一些耗时操作
    time.sleep(1)
```

* 使用 `contextlib`

```python
from contextlib import contextmanager

@contextmanager
def simple_timer():
    print("计时开始...")
    start_time = time.perf_counter()
    try:
        yield # yield 之前的代码是 __enter__ 部分，之后是 __exit__ 部分
    finally:
        end_time = time.perf_counter()
        print(f"代码块运行耗时: {end_time - start_time:.4f} 秒")

with simple_timer():
    time.sleep(1)
```

## 1.9 异步处理 (Asynchronous Processing)

异步处理允许程序在等待I/O操作（如网络请求、数据库读写）完成时，转而执行其他任务，从而极大地提高单线程的效率。`asyncio` 是Python用于编写并发代码的标准库。

  - `async def`: 定义一个协程（coroutine）。
  - `await`: 暂停当前协程的执行，等待一个可等待对象（awaitable）完成。

```python
import asyncio
import time

async def fetch_data(url: str, delay: int) -> dict:
    print(f"开始抓取 {url}...")
    await asyncio.sleep(delay) # 模拟网络I/O延迟
    print(f"完成抓取 {url}")
    return {"url": url, "status": "ok"}

async def main():
    start = time.perf_counter()
    
    # 使用 asyncio.gather 并发运行多个协程
    tasks = [
        fetch_data("http://site1.com", 2),
        fetch_data("http://site2.com", 1),
        fetch_data("http://site3.com", 3),
    ]
    results = await asyncio.gather(*tasks)
    
    end = time.perf_counter()
    print(f"所有任务完成，总耗时: {end - start:.2f} 秒")
    print("结果:", results)

# 在Jupyter或IPython中，可以直接await
# await main() 

# 在普通的.py文件中，需要这样启动
if __name__ == "__main__":
    asyncio.run(main())
```

## 1.10 并行处理 (Parallel Processing) 

由于Python的全局解释器锁（GIL）的存在，单个Python进程无法同时利用多个CPU核心。`multiprocessing` 模块通过创建多个进程来绕过GIL，实现真正的并行计算。

```python
import multiprocessing
import time

def cpu_bound_task(n):
    """一个CPU密集型任务"""
    count = 0
    for i in range(n):
        count += i
    return count

if __name__ == "__main__":
    N = 100_000_000
    
    start_time = time.perf_counter()

    # 创建一个进程池，自动管理进程的创建和销毁
    with multiprocessing.Pool(processes=4) as pool:
        # 使用 map 将任务分配给进程池中的进程
        # 将任务分割成4部分
        results = pool.map(cpu_bound_task, [N//4] * 4)
    
    total_result = sum(results)
    end_time = time.perf_counter()
    
    print(f"并行计算结果: {total_result}")
    print(f"并行计算耗时: {end_time - start_time:.4f} 秒")

    # 对比单进程计算
    start_time_single = time.perf_counter()
    single_result = cpu_bound_task(N)
    end_time_single = time.perf_counter()
    print(f"\n单进程计算结果: {single_result}")
    print(f"单进程计算耗时: {end_time_single - start_time_single:.4f} 秒")
```

## 1.11 不固定长度传参 (`*args` 和 `**kwargs`)

  - `*args`: 将传入的多个位置参数打包成一个元组（tuple）。
  - `**kwargs`: 将传入的多个关键字参数打包成一个字典（dict）。

```python
def flexible_function(*args, **kwargs):
    print("位置参数 (args):", args)
    print("关键字参数 (kwargs):", kwargs)

flexible_function(1, "hello", True, name="Alice", age=30)
```

## 1.12 函数类型校验 (Type Hinting)

从Python 3.5开始，引入了类型提示，可以（但非强制）为函数参数和返回值添加类型信息。而且可以被静态分析工具（如 `mypy`）用来检查类型错误。

```python
from typing import List, Optional

def process_data(data: List[int], name: str) -> Optional[float]:
    """
    处理一个整数列表。
    :param data: 整数列表。
    :param name: 数据集的名称。
    :return: 处理后的平均值，如果列表为空则返回None。
    """
    if not data:
        return None
    print(f"Processing data for {name}")
    return sum(data) / len(data)

# mypy 会检查出下面的调用是错误的
# process_data("not a list", "test")
```

## 1.13 类的继承 (Class Inheritance)

```python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self):
        raise NotImplementedError("子类必须实现这个方法")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

my_dog = Dog("Buddy")
my_cat = Cat("Lucy")

print(my_dog.speak())
print(my_cat.speak())
```

## 1.14 高级数据结构

`collections` 模块提供了一系列高性能的、专用的容器数据类型，它们是Python通用内置容器（`dict`, `list`, `set`, `tuple`）的替代品。

- `collections.defaultdict`: 当访问一个不存在的键时，会自动创建一个默认值。
- `collections.Counter`: 一个用于计数的字典子类。
- `collections.deque`: 双端队列，在两端添加和删除元素都非常快（O(1)）。
- `collections.namedtuple`: 创建带有命名字段的元组子类，提高代码可读性。

```python
from collections import defaultdict, Counter, deque, namedtuple

# defaultdict
s = 'mississippi'
d = defaultdict(int)
for k in s:
    d[k] += 1
print(sorted(d.items()))

# Counter
c = Counter(s)
print(c)
print(c.most_common(2)) # 出现频率最高的两个元素

# deque
q = deque(maxlen=3) # 创建一个最大长度为3的队列
q.append(1)
q.append(2)
q.append(3)
print(q)
q.append(4) # 当添加新元素时，另一端的元素会自动被挤出
print(q)
q.appendleft(0)
print(q)

# namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p)
print(p.x, p.y)
```

## 1.15 内置标准库

* `functools`

该模块主要用于高阶函数，即操作或返回其他函数的函数。

  - `functools.wraps`: 在装饰器中使用，用于保留被装饰函数的元信息。 (已在装饰器部分演示)
  - `functools.lru_cache`: 一个非常强大的装饰器，可以为函数提供最近最少使用（LRU）缓存功能，对于输入相同、计算耗时的函数有奇效。

```python
from functools import lru_cache
import time

@lru_cache(maxsize=None) # maxsize=None表示缓存不限制大小
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

start = time.perf_counter()
print(fibonacci(35))
print(f"带缓存的斐波那契计算耗时: {time.perf_counter() - start:.6f}s")

# 如果没有缓存，计算fibonacci(35)会非常非常慢
```

* `contextlib`
* `collections`
* `asyncio`
* `multiprocessing`


## 1.16 动态加载文件 (Dynamic File Loading)

有时，我们需要根据配置或用户输入在运行时动态地加载Python模块。这在插件式架构中非常常见。`importlib` 模块是实现这一功能的标准方式。

假设我们有如下插件结构：

```log
plugins/
├── __init__.py
├── plugin_a.py
└── plugin_b.py
```

`plugin_a.py`:

```python
def run():
    print("Executing Plugin A")
```

`plugin_b.py`:

```python
def run():
    print("Executing Plugin B")
```

主程序动态加载并执行插件:

```python
import importlib

def load_and_run_plugin(plugin_name: str):
    try:
        # 动态构建模块路径
        module_path = f"plugins.{plugin_name}"
        
        # 使用 importlib 动态导入模块
        plugin_module = importlib.import_module(module_path)
        
        # 检查模块中是否有 'run' 函数并执行
        if hasattr(plugin_module, 'run'):
            plugin_module.run()
        else:
            print(f"插件 '{plugin_name}' 没有找到 'run' 函数。")
            
    except ImportError:
        print(f"错误: 无法找到或加载插件 '{plugin_name}'。")

# 模拟根据配置加载插件
plugins_to_load = ["plugin_a", "plugin_b", "plugin_c"] # plugin_c 不存在

for plugin in plugins_to_load:
    print(f"\n--- Loading {plugin} ---")
    load_and_run_plugin(plugin)
```

最后值得一提的是，对于这一部分的语法，类的设计，异步并行等任务的代码实现，AI统统都能做。代码写的只好不差。媲美甚至超过了中级的软件工程师。但使用AI的过程毫无疑问养成依赖。如果让他充当老师，可以快速的帮助学习新知识，但如果全部用来实施，则很容易使自己变得钝化。失去了思考的过程，甚至也不再知道分步骤解决等。个人觉得应该是在知道过程是什么样的情况下，让AI帮助实现对应的代码，以及逻辑会更好一些。（行业外人员不具备基础知识，不予讨论）

# 2. OOP与设计模式

面向对象编程（OOP）和设计模式在代码开发中属于难以避免的两个话题，但往往讨论起来的时候又会让人觉得很抽象。实际代码编写中，OOP的思维和设计模式的合理使用能够减少大量重复代码，并使得代码结构清晰。 

谈到OOP就少不了类和方法。实际是来自四大基本原则：封装 (Encapsulation)、继承 (Inheritance)、多态 (Polymorphism) 和 抽象 (Abstraction)。

```python
# 抽象基类 (展示了抽象)
from abc import ABC, abstractmethod

class Animal(ABC):
    """
    动物 - 父类 (基类)
    这是一个抽象类，不能被实例化。它定义了一个所有动物都应该有的行为 `speak`。
    """
    def __init__(self, name):
        # 封装：属性 name 被封装在 Animal 类中
        self.name = name

    @abstractmethod
    def speak(self):
        """
        这是一个抽象方法，子类必须实现它。
        """
        pass

# Dog 和 Cat 继承了 Animal (展示了继承)
class Dog(Animal):
    """
    狗 - 子类 (派生类)
    继承自 Animal 类。
    """
    def speak(self):
        # 重写父类的 speak 方法
        return f"{self.name} says Woof!"

class Cat(Animal):
    """
    猫 - 子类 (派生类)
    继承自 Animal 类。
    """
    def speak(self):
        # 重写父类的 speak 方法
        return f"{self.name} says Meow!"

# --- 主程序 ---

# 创建不同类的实例
my_dog = Dog("Buddy")
my_cat = Cat("Lucy")

# 打印结果，展示了封装（我们通过对象直接访问其行为，而不用关心内部实现）
print(my_dog.speak())
print(my_cat.speak())


def animal_sound(animal: Animal):
    print(animal.speak())

animal_sound(my_dog)
animal_sound(my_cat)

```

设计模式，比较常用的又代理，单例，工厂等。不在这里写了，直接参考这个github项目 [Python Patterns](https://github.com/faif/python-patterns)


# 3. 微服务

对于微服务的唯一衡量标准，就是能够快速的用任何一门语言，几百行代码重写对应的服务。仅通过单一服务维护程序内部的逻辑，并通过API对外暴露即可。针对整个调用的链路，如果是无状态的请求，最为简单。如果是有状态的则需要考虑数据的一致性，以及token的传递等。

使用python写API接口最简答的框架莫过于`flask`, 当然现在`fastapi`似乎更胜一筹。但正如前面所说，编写微服务的时候，可以使用任何一门语言，恰好在最近的代码中遇到了某些平台不具备python SDK的情况，只能以对方提供的Java SDK撰写逻辑，然后wrap出对应的api服务。

## 3.1 API互相调用

* 使用python去提供API 服务
```python
from flask import Flask, jsonify, request, render_template, send_file
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cryptovault.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.route("/api/apply", methods=["POST"])
def apply_for_asset():
    data = request.get_json()
    asset_type = data.get("type")
    
    try:
        if asset_type == 'certificate':
            if issuer == 'CFCA':
                new_cert_entry = Certificate(
                    id=new_id,
                    subject=common_name,
                    issuer="CFCA",
                    expires="Pending",
                    status="Processing"
                )
                db.session.add(new_cert_entry)
                
                history_entry = History(asset_id=new_id, status="Submitted", event_date=get_current_date())
                db.session.add(history_entry)
                
                db.session.commit() 
                # Call the celery task
                submit_csr_generation_and_ca_submission.delay(common_name, new_id, data.get("sans", ""))

```

在`submit_csr_generation_and_ca_submission`中，我们通过调用其他的api服务，完成对应的操作。

* 使用Java处理其他平台的逻辑并对内提供API服务供python调用
```java
package com.legendary.javalin;

import cfca.monkiki.util.XmlUtil2;
import cfca.ra.vo.response.CertResponseVO;
import com.google.gson.Gson;
import io.javalin.Javalin;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.IOException;

@Slf4j
public class ApiServer {
    public static void main(String[] args) throws IOException {

        Javalin javalin = Javalin.create();
        Javalin app = javalin.start(7070);

        // Define the POST endpoint for applying for a certificate
        app.post("/applyCertificate", ctx -> {
            try {
                CertificateRequest request = new Gson().fromJson(ctx.body(), CertificateRequest.class);
                CertificateService service = new CertificateService();
                CertResponseVO responseVO = service.applyForCertificate(request);
                String responseXml = XmlUtil2.vo2xml(responseVO, "Response");
                ctx.contentType("application/xml");
                ctx.result(responseXml);
            } catch (Exception e) {
                log.error("/applyCertificate process failed", e);
                ctx.status(500).result("Error processing request: " + e.getMessage());
            }
        });

        log.info("API Server started on port 7070. Use POST /applyCertificate to request a certificate.");
    }
}
```

## 3.2 前后端分离

前后端分离，其实也算是微服务的一种，尤其是在react和angular，vue这些框架的作用下。 而在微服务架构下，以API形式交互数据的话，采用前后端分离反而是一种非常利于快速开发的方法。前端组件在获得数据后也可以自行消费和组装，而不必完全依赖于后端处理。但我其实不擅长前端编写。在写代码的过程中，也是靠AI来把原型转化为代码。当然，对于`flask`而言，渲染前端代码也是非常方便的，尽管这不能完全算作前后端分离。最简单的情况，甚至可以是直接render对应的html文件即可。 当然也可以通过`next.js`等进行编写。

```python
@app.route("/")
def serve_dashboard():
    return render_template("index.html")
```

## 3.3 异步调用

* 异步调用

`app.py` 提供发送接口，用户触发发送按钮后，后台`tasks.py`触发异步任务

```python

@app.route("/api/certs/<string:cert_id>/send_pfx", methods=["POST"])
def send_cert_pfx(cert_id):
    data = request.get_json()
    pfx_password = data.get("password")
    recipient_email = data.get("email")

    if not pfx_password or not recipient_email:
        return jsonify({"error": "Recipient email and PFX password are required."}), 400

    # Trigger the background task
    from tasks import send_pfx_email_task
    send_pfx_email_task.delay(cert_id, pfx_password, recipient_email)

    return jsonify({"message": f"Certificate is being sent to {recipient_email} in the background."}), 202

```

如果在windows中运行，则需要`celery -A tasks.celery_app worker -l info -P eventlet`


`tasks.py`
```python
@celery_app.task(name="tasks.send_pfx_file_with_email")
def send_pfx_email_task(cert_id, pfx_password, recipient_email):
    """
    Celery task to generate and email a PFX file in the background.
    """
    with app.app_context():
        crypto_key = CryptoKey.query.get(cert_id)
        cert_info = Certificate.query.get(cert_id)

        if not crypto_key or not crypto_key.certificate_pem or not crypto_key.private_key_pem or not cert_info:
            print(f"Error in task: Could not find certificate or key for {cert_id}")
            return

        try:
            private_key = serialization.load_pem_private_key(crypto_key.private_key_pem.encode(), password=None)
            cert = x509.load_pem_x509_certificate(crypto_key.certificate_pem.encode())
            
            pfx_bytes = pkcs12.serialize_key_and_certificates(
                name=cert_info.subject.encode(),
                key=private_key,
                cert=cert,
                cas=None,
                encryption_algorithm=serialization.BestAvailableEncryption(pfx_password.encode())
            )

            msg = MIMEMultipart()
            msg['From'] = app.config['SMTP_SENDER_EMAIL']
            msg['To'] = recipient_email
            msg['Subject'] = f"Your Certificate: {cert_info.subject}"

            body = f"Please find your requested certificate ({cert_info.subject}) attached as a password-protected PFX file.\n\nThe password to open the file is: {pfx_password}"
            msg.attach(MIMEText(body, 'plain'))

            part = MIMEBase('application', 'octet-stream')
            part.set_payload(pfx_bytes)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{cert_info.subject}.pfx"')
            msg.attach(part)
            
            with smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT']) as server:
                server.starttls()
                server.login(app.config['SMTP_USERNAME'], app.config['SMTP_PASSWORD'])
                server.send_message(msg)
            print(f"Successfully sent PFX for {cert_id} to {recipient_email}")

        except Exception as e:
            print(f"Failed to send email for {cert_id}: {e}")
            traceback.print_exc()
```

## 3.4 容器化

使用docker来打包代码， 用来打包python代码的Dockerfile

```Dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN mkdir -p /app/data

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

用来打包Java代码的Dockerfile
```Dockerfile
FROM maven:3.8.5-openjdk-11 AS builder

WORKDIR /app

COPY pom.xml .

COPY libs/ /app/libs/

RUN mvn install:install-file -Dfile=/app/libs/RAToolkit-3.3.9.1.jar -DgroupId=cfca.toolkit -DartifactId=RAToolkit -Dversion=3.3.9.1 -Dpackaging=jar
RUN mvn install:install-file -Dfile=/app/libs/CommonVO-3.3.9.1.jar -DgroupId=cfca.toolkit -DartifactId=CommonVO -Dversion=3.3.9.1 -Dpackaging=jar

COPY src /app/src

RUN mvn package -DskipTests

FROM eclipse-temurin:11-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/my-javalin-app-1.0.jar /app/application.jar

EXPOSE 7070

ENTRYPOINT ["java", "-jar", "/app/application.jar"]

```

# 0x04 框架与库

按照一种比喻来说，使用库是你去宜家逛着买家具，你爱用哪个用哪个，爱怎么用怎么用。 用框架的话就像买精装修的房子，已经帮你完成了所有的装修和设计。这其实意味着，使用库的时候控制权在你，代码要按照你的来。使用框架的时候，你要按照框架的来，框架操作你。总结起来就是“别调用我们，我们会调用你”（Don't call us, we'll call you）

例如`flask`和`django`是python的两个典型web框架，`requests`和`Beautiful Soup`则是典型的库。 对于前端而言，`jquery`是典型的web库，而`react`则是典型的web框架。 但还有一种是在库和框架之间的灰色地带，不太好定义，例如ORM相关的，行为上更像是一个库，你调用它做事情，但同时他也约束你。如果你使用过`sqlachemy`就应该知道我在说什么。

现在列出一些python编程需要关注和熟悉的框架和库：

* **web框架** : `flask` , `django`
* **DB相关**： `sqlachemy` , `sqlite`, `redis`
* **网络相关**: `requests`, `fastapi` 
* **数据相关**: `pandas` , `sqlachemy`, `sklearn` , `pytorch`, `kears`
* **任务调度**: `celery`, `gevent`
* **密码相关**: `cryptography`
* **命令行相关**: `click`
* **配置相关**: `dynaconf`
* **日志相关**: `logging`

前端的话可能需要关注一下: `react`,`next.js`, `tailwindcss`, `bootstrap`等

# 5. 测试驱动开发

TDD是敏捷开发的一种方法，可以确保每个单独的功能能够正确的按预期执行。一般是先写测试用例，再写能通过测试用例的代码。这里列的测试驱动开发和该定义不同，旨在描述，需要为应用程序编写足够的测试用例，以便使代码能够正常运行。

* 使用 `unittest`进行单元测试

```python
import os
import unittest
import json
import sqlite3
from datetime import datetime, timedelta
from app import app, get_db_connection, init_db

class CryptoVaultTestCase(unittest.TestCase):
    """Test suite for the CryptoVault Flask application."""

    def setUp(self):
        """Set up a new test client and a temporary database."""
        # Use an in-memory SQLite database for testing
        self.db_fd, app.config['DATABASE'] = ":memory:", ":memory:"
        app.config['TESTING'] = True
        self.client = app.test_client()

        # The application context is needed to work with the database
        with app.app_context():
            init_db()

    def tearDown(self):
        """Clean up the database after each test."""
        # The in-memory database vanishes on its own, so no file to close.
        pass

    def test_01_init_db(self):
        """Test if the database initialization creates all necessary tables."""
        with app.app_context():
            conn = get_db_connection()
            cursor = conn.cursor()
            tables = ["keys", "certificates", "history", "crypto_keys"]
            for table in tables:
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                self.assertIsNotNone(cursor.fetchone(), f"Table '{table}' was not created.")
            conn.close()

    def test_02_create_and_get_ca(self):
        """Test the creation and retrieval of the internal CA."""
        with app.app_context():
            # Test CA creation endpoint
            response = self.client.post('/api/internal_ca/create')
            self.assertEqual(response.status_code, 200)
            json_data = json.loads(response.data)
            self.assertIn("Internal CA created", json_data['message'])

            # Test CA retrieval endpoint
            response = self.client.get('/api/internal_ca')
            self.assertEqual(response.status_code, 200)
            json_data = json.loads(response.data)
            self.assertIn("CN=cryptovault-ca.local", json_data['subject'])
            self.assertIn(".pem", json_data['pem'])

    def test_03_apply_for_rsa_key(self):
        """Test applying for a new RSA key."""
        response = self.client.post('/api/apply',
            data=json.dumps({
                "type": "key",
                "name": "Test RSA Key",
                "keyType": "RSA-4096"
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('key created successfully', json_data['message'])
        key_id = json_data['id']

        # Verify the key is in the database
        with app.app_context():
            conn = get_db_connection()
            key_row = conn.execute("SELECT * FROM keys WHERE id = ?", (key_id,)).fetchone()
            self.assertIsNotNone(key_row)
            self.assertEqual(key_row['name'], "Test RSA Key")
            
            crypto_row = conn.execute("SELECT * FROM crypto_keys WHERE asset_id = ?", (key_id,)).fetchone()
            self.assertIsNotNone(crypto_row['private_key_pem'])
            self.assertIsNotNone(crypto_row['public_key_pem'])
            conn.close()
            
```

* 使用`locust`进行压力测试

```python
import random
import string
import time
from locust import HttpUser, task, between, events

# --- Configuration ---
# The base URL of your running Flask application
HOST_URL = "http://127.0.0.1:5000"

# --- Helper Functions ---
def get_random_string(length=128):
    """Generates a random string of fixed length."""
    letters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters) for i in range(length))

class CryptoApiUser(HttpUser):
    """
    A user class that simulates a client interacting with the crypto API.
    It will first ensure an AES key exists, then continuously test the
    encrypt and decrypt endpoints.
    """
    # Wait between 0.5 and 2 seconds between tasks
    wait_time = between(0.5, 2.0)
    host = HOST_URL

    def on_start(self):
        """
        Called when a Locust start event is triggered.
        This method ensures that a valid AES key exists for the test.
        It will try to find an existing 'AES-256' key, and if none are found,
        it will create one.
        """
        self.key_id = None
        print("Initializing user, finding or creating an AES key...")

        try:
            # 1. Fetch all existing keys
            with self.client.get("/api/keys", catch_response=True) as response:
                if not response.ok:
                    response.failure("Failed to get keys list.")
                    return
                
                keys = response.json()
                # 2. Find the first active AES-256 key
                for key in keys:
                    if key.get("type") == "AES-256" and key.get("status") == "Active":
                        self.key_id = key["id"]
                        print(f"User found existing active AES key: {self.key_id}")
                        break
            
            # 3. If no key was found, create a new one
            if not self.key_id:
                print("No active AES key found. Creating a new one for the test.")
                payload = {
                    "type": "key",
                    "name": f"perf-test-key-{int(time.time())}",
                    "keyType": "AES-256"
                }
                with self.client.post("/api/apply", json=payload, catch_response=True) as response:
                    if response.ok:
                        self.key_id = response.json().get("id")
                        print(f"User created new AES key: {self.key_id}")
                    else:
                        response.failure("Failed to create a new AES key for the test.")
                        print("Could not create key. User will be unable to run tasks.")
        
        except Exception as e:
            print(f"An exception occurred during user setup: {e}")
            # This user will not be able to proceed.
            self.key_id = None

    @task
    def encrypt_and_decrypt_flow(self):
        """
        This task simulates a full user flow:
        1. Encrypt a piece of random data.
        2. Decrypt the resulting ciphertext.
        """
        if not self.key_id:
            # If the key setup failed, we can't run the test.
            # We can skip this task for this user.
            print("Skipping task: key_id not set.")
            time.sleep(self.wait_time())
            return
            
        plaintext = get_random_string(256) # Test with 256 bytes of data
        ciphertext = None

        # --- Encrypt Task ---
        encrypt_payload = {"keyId": self.key_id, "text": plaintext}
        with self.client.post(
            "/api/crypto/encrypt",
            json=encrypt_payload,
            name="/api/crypto/encrypt",
            catch_response=True
        ) as response:
            if response.ok:
                try:
                    ciphertext = response.json().get("result")
                    if not ciphertext:
                        response.failure("Encrypt endpoint returned OK but no result.")
                except Exception:
                    response.failure("Failed to parse JSON from encrypt response.")
            else:
                response.failure(f"Encrypt request failed with status {response.status_code}")
                return # Can't proceed to decrypt if encrypt failed

        # Wait a moment before decrypting
        time.sleep(0.1) 

        # --- Decrypt Task ---
        if ciphertext:
            decrypt_payload = {"keyId": self.key_id, "text": ciphertext}
            with self.client.post(
                "/api/crypto/decrypt",
                json=decrypt_payload,
                name="/api/crypto/decrypt",
                catch_response=True
            ) as response:
                if response.ok:
                    try:
                        decrypted_text = response.json().get("result")
                        if decrypted_text != plaintext:
                            response.failure("Decryption result did not match original plaintext.")
                    except Exception:
                        response.failure("Failed to parse JSON from decrypt response.")
                else:
                    response.failure(f"Decrypt request failed with status {response.status_code}")

```


# 6. 日志记录与异常处理

详细的日志记录非常利于溯源和排错。有时候你在运行代码的过程中，printf的文件可能是无法输出回终端的，而通过设置loggin输出的级别则能够有效的看到对应的日志。另外就是通过结合在异常处理场景中的实现，能够极为有效的帮助发现问题所在。例如前几天在处理CISM习题集的过程中，同样的数据逻辑结构（json格式，字段一致）的题库但是无法导入到APP中，几经检测，后来发现在某一个习题中，只有`a,b,c`三个选项，因为缺失了一个所致。当然，这也是代码不够健壮导致。常见的还有忘了strip空格和换行等。

对于高级用法，还可以定义自定义异常, 这让错误处理更具业务含义，也使上层调用者可以捕获更精确的异常类型。以及保持异常链 (raise ... from ...)，这样在捕获一个底层异常并抛出你自己的自定义异常时，对于调试根源问题至关重要。


`exception.py`
```python
class TransactionError(Exception):
    """处理交易时所有自定义错误的基类。"""
    pass

class DataValidationError(TransactionError):
    """当输入数据未能通过验证规则时引发。"""
    pass

class APIFailureError(TransactionError):
    """当与外部 API 通信失败时引发。"""
    pass
```

```python
import logging
from .exceptions import APIFailureError

logger = logging.getLogger(__name__)

def send_to_payment_gateway(transaction: dict):
    """
    模拟发送交易到支付网关。
    为了演示，如果 user_id 是 'api_fail'，则模拟失败。
    """
    tx_id = transaction['transaction_id']
    logger.debug(f"准备发送交易 {tx_id} 到支付网关...")
    
    if transaction.get('user_id') == 'api_fail':
        # 模拟 API 调用失败
        error_msg = f"支付网关拒绝了交易 {tx_id}: 余额不足。"
        logger.error(error_msg)
        raise APIFailureError(error_msg)
        
    logger.info(f"交易 {tx_id} 已成功发送到支付网关。")
    return {"status": "success", "transaction_id": tx_id}
```

# 7. 版本管理与发布

版本管理一般使用git进行，实际过程中，有人通过分支合并，有人直接review提交到master，两种方式都是可以的。虽然我更推荐前者。另外这里不关注git命令，讲一下

## 7.1 关注or忽略的文件

* git时忽略的文件使用`.gitignore`
* docker编译时忽略的文件使用`.dockerignore`
* 配置文件放在 `.env` 或者 `.dev.yaml`, `.prod.yaml`
* `.github`目录下放一些workflow相关的配置文件，定义pipeline等

同时，本地开发的时候会把对应的配置文件放在`.dev.yaml`或者`.env`文件中，虽然此时已经完成了配置分离，但由于配置文件中存在着敏感信息，仍然需要进一步的完成相应的密钥管理，以便提高程序在配置过程中的安全性。

## 7.2 基础设施即代码(IAC)

容器化后最适用的莫过于云上部署，以及在云上使用`K8S`，**容器和云是绝配**。 这里需要关注两个产品。即`terraform`和`ansible`。
前者用于资源创建，后者用于资源配置。针对IAC相关的东西，之前blog有，就不写了。值得一提的就是，不要只把`terraform` 用于管理云，它还可以管理`k8s`, `hashicorp vault`,`AAD`等。

# 8. AI编程实践技巧

基本上市面上的模型和工具我都使用过，`cursor`, `firebase.studio`, `bolt.new`,`v0.dev`, `claude.ai`, `trae`, `chatgpt`, `grok`,`deepseek`,`kimi`, `ragflow`, `vllm`, `ollam`。 以及一些产品的企业版`hiagent`, `Dify`。从最初的惊喜，欣喜若狂到后面开始意识到设计到落地之间的gap，发现从UI大饼到最终交付之间存在的缺陷。 在模型，服务，编辑器的尝试过程中，发现了一个比较有效的用法，可以帮助实现这个缺陷的跨越。那就是在微服务上的应用。 尤其是在模型迭代之后。以前： Grok帮你brainstorm， Gemini帮你细化设计并输出新的Prompt，Claude帮你写代码。现在直接是Gemini帮你brainstorm并细化设计并输出新的Prompt，并帮你写代码。以前的以前我还专注在prompt的设计上，虽然确实也做出来了一些东西。

但现在我要说的是只需要通过：

1. 处理2-3个单文件（一个后端逻辑，一个前端代码，一个新的需求demo）提供的微服务api，实现对应的逻辑。
2. 每处理完一个功能后，编写单元测试，并使用版本管理进行commit。
3. 启用一个新的对话，继续1，2以便完成新的功能。

只需要通过这两个简单的技巧，你就可以以微服务的形式，把对应产品的前后端均实现出来。处理单文件的时候，如果你需要引入新的需求，就把新需求的demo文件简单写出来，确保逻辑可行之后。然后再整理回源代码。 当然，也可以去在cursor里设置code rule，但是我觉得比较重，不如这种简单的方法。
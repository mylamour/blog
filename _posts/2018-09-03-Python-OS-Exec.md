---
layout: post
title: Python: 执行系统命令与安全编码
categories: 安全工程师  
kerywords: python 系统命令执行
tags:  安全研发 python
---

因为参与到`SDLChina`的文档编写，恰好公司内的编程语言采用的是`Python`,故整理之。此文亦可在sdlchina官网看见。

## python语言安全

本身要注意的有，一些危险函数,危险模块的调用，主要是系统调用。这个如果调用一定要对输入输出做好过滤，以下是代码中各种导致进行系统调用的方式。尽量避免。

- 避免各种情况导致系统调用
- 谨慎使用Eval
- 数据序列化

### type 1: keywords

```bash
exec('import os ;os.system("ls")')
eval('__import__("os").system("ls")')
f'''{__import__('os').system('ls')}'''
[].__class__.__mro__[-1].__subclasses__()
_builtin__.open('/etc/passwd')
system('ls')
[].__class__.__base__.__subclasses__()[59]()._module.linecache.__dict__['o'+'s'].__dict__['sy'+'stem']('l'+'s')   # only python2`
[].__class__.__base__.__subclasses__()[59](linecache.getlines, '/etc/password')
[].__class__.__base__.__subclasses__()[59](exec, '("__import__("os").system("ls")")')

```

### type 2: python lib

```bash
subprocess.Popen('ls')
os.popen('ls')
importlib
builtins.open('/etc/passwd')
linecache.getlines('/etc/passwd')

```
### type 3: python import

```bash
1. __import
2. import
3. importlib

```

### type 4: other
1. 
```python
import sys
sys.modules['NB']='/Users/mour/anaconda3/lib/python3.6/os.py'
import NB
```
2. base64 deocde encode 
3. pickle

## Web编程

对应Web编程中安全概念在python web框架中的实现。url跳转，目录遍历，任意文件读取也需要考虑在内。针对不同的框架也需要。

### Flask 安全

- 使用Flask-Security
- 直接生成 HTML 而不通过使用Jinja2
- 不要在用户提交的数据上调用Markup
- 使用 Content-Disposition: attachment 标头去避免上传html文件
- 防止CSRF，flask本身没有实现该功能

### Django 安全

可参考[phithon](https://www.leavesongs.com)的博客，有较多相关资料。

- 关闭DEBUG模式
- 关闭swagger调试
- 妥善保存SECRET_KEY
- 使用SecurityMiddleware
- 设置SECURE_HSTS_SECONDS开启HSTS头，强制HTTPS访问
- 设置SECURE_CONTENT_TYPE_NOSNIFF输出nosniff头，防止类型混淆类漏洞
- 设置SECURE_BROWSER_XSS_FILTER输出x-xss-protection头，让浏览器强制开启XSS过滤
- 设置SECURE_SSL_REDIRECT让HTTP的请求强制跳转到HTTPS
- 设置SESSION_COOKIE_SECURE使Cookie为Secure，不允许在HTTP中传输
- 设置CSRF_COOKIE_SECURE使CSRF Token Cookie设置为Secure，不允许在HTTP中传输
- 设置CSRF_COOKIE_HTTPONLY为HTTP ONLY
- 设置X_FRAME_OPTIONS返回X-FRAME-OPTIONS: DENY头，以防止被其他页面作为框架加载导致ClickJacking
- 部署前运行安全性检测 django-admin.py checksecure --settings=production_settings

## 审计工具
安装使用方式较为简单，所以不做介绍。
- [AST-based static Analyzer: Bandit](https://github.com/openstack/bandit)
- [Static Analyzer: PYT](https://github.com/python-security/pyt)

## 引用

* [从Pwnhub诞生聊Django安全编码](https://www.leavesongs.com/PYTHON/django-coding-experience-from-pwnhub.html)
* [Python安全编码与代码审计](http://xxlegend.com/2015/07/30/Python%E5%AE%89%E5%85%A8%E7%BC%96%E7%A0%81%E5%92%8C%E4%BB%A3%E7%A0%81%E5%AE%A1%E8%AE%A1/)
* [Django Secure](https://django-secure.readthedocs.io/en/latest/settings.html)
* [Flask安全注意事项](http://docs.jinkan.org/docs/flask/security.html)
* [Python安全和代码审计相关资料](https://github.com/bit4woo/python_sec)
* [Flask debu pin 安全问题](https://xz.aliyun.com/t/2553)
* [Python沙箱逃逸的n种姿势](https://xz.aliyun.com/t/52)
* [Escaping python sanbox](https://zolmeister.com/2013/05/escaping-python-sandbox.html)
* [Pickle Security](http://v0ids3curity.blogspot.com/2012/10/exploit-exercise-python-pickles.html)
* [Security Guide for developers](https://github.com/FallibleInc/security-guide-for-developers)
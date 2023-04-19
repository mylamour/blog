---
layout: post
title: 爬虫学习二
categories: 一个小学生
kerywords: Spider Web Crawler
tags: 爬虫与反爬虫 旧文迁移
---

[爬虫学习一](https://iami.xyz/Python-Web-Spider-I)

# 基础

1. urllib2(用来下载网页)
* simple
```python
         import urllib2
        
        response = urllib2.urlopen('http://www.aol.com')         #直接请求
        
        print response.getcode()                              #看看状态码

        cont = response.read()                                #读取内容，可以在前面加个如果状态码有效
```
* Add Head, data
```python
        import urllib2
        
        request = urllib2.Request(url)                  #创建request对象
        
        request.add_data('xxx','xxx')                   #增加数据
        
        request.add_header('User-Agent', 'Mozilla/5.0')     #伪装成浏览器
        
        response = urllibe2.urlopen(request)            #发送请求
```
* advance
其实就是Cookie,Proxy,Redirect相关的,分别是HTTPCookieProcessor , ProxyHandler , HTTPRedirectHandler 

```python
        import urllibe2, cookielib
        
        cj = cookielib.CookieJar()
        
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
        
        urllib2.install_opener(opener)
        
        response = urllib2.urlopen("http://www.google.com/")
```
        
        
2. Beautifuk Soup (用来解析网页)
从一个Html网页创建一个Beautiful对象，然后可以搜索节点，find_all,find等可以访问节点的名称和属性。当然配合正则表达式更好。 ```<a href='1111.html' class='article_link'> python </a> ```像这一个节点名称为a，属性href为1111.html，属性class为article_link，而节点内容为python
创建beautifulSoup对象
```bash
from bs4 import BeautifulSoup
soup = BeautifulSoup( html_doc,  'html.parser', from_encoding='utf-8' )
```
搜索节点
```python
        find_all(nane, attrs, string)      
        node = soup.find_all('a')     
        soup.find_all('a', href='1111.html')
        soup.find_all('a', href= re.compile(r'/view/\d+\.htm'))     #正则匹配 
        soup.find_all ('div', class_= 'abc', string= 'Python')
```
访问节点信息
```python
        node.naem
        node['href']
        node.get_text()
```   
        
3. 连接数据库(前提是要安装好数据库)

* PostgreSQL

```python
        import psycopg2  
        
        conn = psycopg2.connect("dbname='dbname' user='username' host='localhost' password='password'")  

        cur = conn.cursor()  
        
        cur.execute("select * from dbtable")  
        
        for row in cur:  
        
             print row 
        
         conn.close() 
```

* ms sql

```python
        import psmssql  

        conn = psmssql.connect(host='yourhost', user='loginname', password='password', database='dbname', charset='utf8')  
        
        cur = conn.cursor()  
        
        cur.execute('select * from dbtable')  
        
        for row in cur:  

                print row 
        
        conn.close() 
```

* mysql

```python
        import MySQLdb

        conn= MySQLdb.connect( host='localhost', port = 3306, user='username', passwd='password', db ='dbname',)
        
        cur = conn.cursor()
        
        cur.execute("delete from student where grade > 30")
        
        cur.close()

        conn.commit()
        
        conn.close()
```
        
# 资料补充

还可以使用一些web框架去写爬虫，例如flask，django（手撕包菜用的就是这个）,tornado。当然其他语言也可以写爬虫，java, ruby,php等，还有go啊，js啊
        
* [Scrapy](http://scrapy.org/)

* [Requests](http://www.python-requests.org/)

* [CasperJS/PhantomJS](http://casperjs.org)
    
* [HtmlParser](https://docs.python.org/3/library/html.parser.html)
    
* [你见过那些瞠目结舌的爬虫技巧-知乎](http://www.zhihu.com/question/38192299)
    
* [Tornado框架的爬虫示例](http://www.tornadoweb.org/en/stable/guide/queues.html) 
* [Nutch](http://nutch.apache.org/)
    
  

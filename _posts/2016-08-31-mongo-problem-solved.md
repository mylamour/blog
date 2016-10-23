---
layout: post
title: 几个mongo的小问题
categories: 全栈工程师
tags: 学习笔记 数据存储
---
## 几个mongo的小问题
#### 别人问的问题，还有自己遇到的问题。

#### 1.mongo bacthsize的问题(Assertion: 10334):
>`mongorestore -d my-database --batchSize=100 ./database-dump-directory`
>>这个会使速度变慢，但是能解决，因为最开始我提出是`mongd --repair --dbpath="dbpath"`或者`db.runCommand({repairDatabase:1})`,然后再重新导出来，但是很不幸，不行。

#### 2.聚类查找，统计每月新增用户量:
> `db.accounts.aggregate({$project:{month : {$month:"$createdAt"}}})` 
>> 注： 你的$month对应的应该是你自己的用户注册时间。同样如果把$month替换成$year,$day，可以统计出当天或当年的。


#### 3.导入BSON格式
> `mongorestore -d db_name -c collection_name path/file.bson`

> `mongorestore --drop -d db_name -c collection_name path/file.bson`


#### 4. 有人的mongo不能更换默认数据库:
> 最后发现是权限的问题,因为他采用的方法又新建了一个mongo用户，所以导致权限问题，不能更改配置文件的默认数据库。

#### 5. Windows下启动Mongo
> 虽然我把mongo的bin目录加了环境变量，但是每次还是要cd到特定目录，比较烦。于是建一个xx.cmd文件。经测试发现不能把该文件放在中文名称目录下，否则会报错。无法启动。
> 
```bash 
E:
cd Mongodb
echo "Now You In E:\Mongodb"
start .\bin\mongod.exe --config .\data\mongo.config
echo "You mongo server is running"
```

#### 6.删除小与特定日期的记录
> 
`db.logTemplate.remove({"operationTime":{$lt:ISODate("2016-07-01T16:00:00Z")}})`

#### 7.find与findone的区别  
> 
* findOne()只返回一个文档对象
* find()返回一个集合列表， 如果不指定过滤范围，它将返回整个集合，客户端中最多只显示前20个文档。

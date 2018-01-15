---
layout: post
title: Mongo的故事 
categories: 学习数据挖掘的路上
tags: 
- 学习笔记 
- 数据存储
---


## 汉庭csv
汉庭的2000万数据，很老的裤子了，拿出来练练mongo
> `find ./ -type f -name "*.csv"  -exec mongoimport -d hanting -c human --type csv --headerline {} \;`

* 关于导入导出
>`$mongoimport -d dbname -c collectionsname --type csv --headerline inputfilname.csv`	
+ 很明显不用多说,headerline是看csv文件具不具有头字段
>`$mongoexport -d dbname -c collectionsname -o outputfilename.csv`

* 关于备份和恢复
> `mongodump -h localhost --post 27017`
+ 数据库内容导出为BSON文件
> `mongorestore -h localhost --port 27017 dump`
+ 如果说是导入到一个已经存在数据库里，那么使用 `mongorestore -h localhost --port 271707 --drop /path/to/you/dump`, 还有一种是给予数据文件的备份，但是这种的话快虽快，但是却要锁定数据库。
csv 数据一共是 2.9G 导入到数据库中一共是 15.946GB，大概花费了9分钟左右，而且数据一共是1400+万条左右，并没有宣称地2000万，也可能是下的不全。对于我这个临时装的系统，直接占去了将近1/3的空间，不过总体来讲还是比较满意。

之前在windows下导入时，仅仅导入了200W不到的数据就花费了很长时间，最后由于没能跳过一个错误数据还终止了。不过对于错误数据，直接sed替换下就行了。windows肯定干不了吧。

导入的过程中出现的错误数据会自动跳过，这个好。

# 数据库

>  `db.account.aggregate([{ $group: {_id: {$month:"$createdAt"},all:{ $sum: 1 }}}]);`

+ 在mongo里面，获取当月新注册的用户。关键字还可以是`$year,$day`等，$createdAt是你自己插入数据记录的标准时间

> ` $mongod --config /path/file/to/you/mongo.config	`

+ mongo.config文件里面包含了log路径,db路径，还可以添加其他设置。之前win7升级win10，mongo的环境变量就没了。懒得添加，就写了批处理，要提的是，可以是.bat也可以.cmd,在脚本里面用start的话可以打开新的cmd界面。

> `mongod --auth`

+ 开启身份验证的前提是创建了管理员用户,然后use admin, db.addUser('username','password'),




突然想起网易50亿的裤子，从mega下了快30G还是放弃了。电脑开了两天，破宿舍晚上又断网。唉，无奈还是删了。我又想起来之前看f4vk写的搭建社工库的教程。无力。
## Mongo Night
* 就像mongo in Action中的警告一样，对于大量数据，不要在部署之后再建立索引，而应该事先建立好索引。
* 当时突然想到要是把Solr和Mongo结合到一起会是怎么样，发现网上已经有了这方面的资料。
* 最好主从节点复制集至少三个
* 正确的分片很重要(索引也是)

ps:本来打算的是写成mongo morning to night,把基础知识记下来，后来发现其实没有必要。基本的增删查改没必要写,其他的也不少，我自己就做了8张A4纸的笔记。所以还是自己看看附件吧，下载下来看一遍是比较有用的。

## Resoures:	

*  [MongoDB in Action](/assets/MongoDB in Action.pdf)
* [Ruby and MongoDB Web Development](/assets/Ruby and MongoDB Web Development.pdf)
* [Mongo Doc](https://docs.mongodb.com/)


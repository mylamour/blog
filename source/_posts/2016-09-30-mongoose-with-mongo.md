---
layout: post
title: Mongooser Should Know ? 
categories: 一个实习生
tags: 实习笔记 全栈 Mongo
---


### Before

```js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('meow');
  }
});

```

You can see the above code in mongoosejs.com. And you should know, There is not only way to connect the mongo server. 

| Mongoose       |   Mongo
| ------------- |:-------------: 
| Schema         | Document Schema
| Model         | Collection



```js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var animalSchema = mongoose.Schema({ name: String });
var Cat = mongoose.model('Cat',animalSchema );

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('meow');
  }
});

```

Also, you have different ways to define your function, In Schema, or In the instance of model


### In my pratice, There is some problems

* findOneAndUpdata(condition,updata,function(err, data){})

> 
If i find the data , i will return the finded data, and Updata, So, you  can't through the data to judge which field was changed.

* when you use the method of updata(condition, udpata), what happend?

> 
first of all, it will be find the condition and if the conidition is existed, it would be updata, and return a Data, if not , also return a data. Like: `{ok:1,nModified:0,n:0}`, as you see, if you find, ok will be set 1, if you find and updata, the number of your updata is nModified, and n is matched number.But in mongo shell, it will return `{nMathced:5,nUpserted:0,nModified:3}`, So there also a problem, no matter what the number of filed was changed, it only dispaly `{ok:1,nModified:0,n:1}`. So , i still don't know the number of filed.

* find ObjectId,  __id

> 
var ObjectId = require('mongoose').Types.ObjectId;
when you use the find method , just like this: find({_id:ObjectId(youridvalue)})

* you can use insert in mongo shell , but not mongoose. you should use create to create a new document.
* save not only save, it contained updata, it the document was not found , it will be created, if not, it will update it.

<font color = "red" >注意异步，异步，异步。你在操作数据库的时候，如果你需要遍历，那么你这边遍历完了，那边可能还没有返回数据。所以，当返回的时候，res.json()的那个数据只是最后一次查询得到的数据，一定要设置flag去判断是不是全部查询并且可以返回了 </font>


#### Other
前几天同学要买乐视手机，让我也帮忙抢。等从他发给我的界面找到真实界面，花了一个多小时写了下面这个脚本，测试也测试了，然而还是没抢到。如果不是网速的原因，那我只能怀疑的是乐视在骗人，fuck。
吐槽: 抢购页面，点击立即秒杀，然后再跳到真正的购物页面，然后还他妈要点立即抢购，乐视好心机，每天的抢购页面的URL编号是固定规律改变的。像我这种找到正确秒杀页面，然后又提前两分钟放脚本等着的
都没有抢到，这活动的真实性不可靠。　最心酸的是，打开淘宝，发现官网的抢购价还没有淘宝的便宜。。。。。

```js

var Wait = $(".not_start");
var MiaoSha = $(".rush_now");

count = 0;
var IntervalTime = setInterval(
function(){
	var Time   = $("#timer>span").text();
	if(Wait.length != 2){
		if (Time =="00000000"  || Wait.style.display != "block" || MiaoSha.style.display != "none" ){
				MiaoSha.click();
				clearInterval(IntervalTime);
			}else{
				count ++;
				console.log("已抢：" + count + "次");
			}
		}else{

				if (Time =="00000000" || Wait[0].style.display != "block" || MiaoSha[0].style.display != "none" ){
				MiaoSha.click();
				clearInterval(IntervalTime);

			}else{
				count ++;
				console.log("已抢：" + count + "次");
			}

		}

	},10
)

```

#### Resources

* [MongooseJs](http://mongoosejs.com/)

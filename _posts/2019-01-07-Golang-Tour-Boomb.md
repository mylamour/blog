---
layout: post
title: golang也要耍一耍
categories: 全栈工程师
kerywords: golang 教程  golang tour burpforce demo project
tags: Golang
---

# 前言

去年就开始接触了下Golang，后来工作中也用不到就又全忘掉了。又比较嫌弃Golang的包管理方式，就弃置一旁了。转投rust怀抱，写了写小demo。然后现在又由于一些原因，开始重新学习了下golang, 本着Talk is cheap的原则，写了个小项目,toy项目。自觉用来教程还是可以的(仅仅适用于有编程经验的)。不过也恰恰说明了语言只是一个工具。真正要学好的还是算法，设计模式，明白一些编程思想。这里就不比较和其他语言的差异了，选择合适或者较为合适的语言去写对应的项目。

# 基础篇

跟着[Golang tour](https://tour.golang.org)先过一遍, golang中没有类，但是这不妨碍用结构体的方法作为变相类的实现。如果没记错，rust好像也是这么套路的。临时写了个demo,基础语法如下:

```golang

package main

import (
	"fmt"
)

type People struct {
	Name string				
	sex string
	age int
} 

func (person *People) Say(something string){
	fmt.Println(something)
}

func main(){

	notices := "This is variable string"
	var noticesagain string = "我还可以这样写"

	var haha string
	haha = "Another String"

	yoyoyo := make([]string, 3)
	fmt.Println("啥也没有", yoyoyo)

	lalalabytes := []byte(`
		我
		要
		跨
		行
	`)

	
	fmt.Println(lalalabytes)

	zhangsan := People{"Zhangsan", "male", 18}
	zhangsan.Say("我可真帅")
	fmt.Println(zhangsan.Name)
	fmt.Println(zhangsan.age)

	fmt.Println(notices, noticesagain, haha)

}

```

# 高级篇

高级一点点的是指针和引用了，还有Map, 接口, Slices, 协程，回调函数了。 你需要通过golang tour网页，或者书本系统的学习一下。这些算是比较高级一点的用法了。 下面是一些高级用法的初级示例。代码摘自我的github上学习golang的项目[boomb](https://github.com/mylamour/boomb)

```golang

package models

type Try struct {
	Target string	// ip or hostname
	Port string
	Protocal string	// http ssh and what ever
	Data *Boomb		// burp force auth ticket for try
	Status bool		// sucessful or not
}

type Boomb struct {
	Username string
	Password string
}

```
基本的结构体设置

```golang

package burp

func HTTPBrust(try *models.Try) *models.Try{
	//Basic Auth Brust
	client := &http.Client{}
	req, err := http.NewRequest("GET", try.Protocal + "://" + try.Target + ":" + try.Port , nil)
	req.SetBasicAuth(try.Data.Username, try.Data.Password)
	resp, err := client.Do(req)
	if err != nil{
		log.Fatal(err)
	}

	if resp.StatusCode == 200 {
		try.Status = true
		return try
	}

	return nil
}

```

```golang
package main

func Fire(fire func(*models.Try) *models.Try, trys []*models.Try) *models.Boomb {

	res := make(chan *models.Try)

	go func() {
		for _, try := range trys {
			res <- fire(try)
		}
	}()

	select {
		case result := <- res:
			if result != nil && result.Status {
				fmt.Println("[Target Cracked] \nusername:password = ", result.Data.Username, ":", result.Data.Password)
				return &models.Boomb{result.Data.Username, result.Data.Password}
			}
	}

	return nil
}


Fire(HTTPBrust, trys)

```

可以看出，Fire接受函数作为参数，并用协程的方式调用，且将结果存到channel里面。如果能看懂上面的代码，说明channel, callback, pointer, struct都理解的差不多了。


# 包管理工具之使用dep

把项目放在goapth下面，一般在`~/go/src/`下面，然后在项目下运行`dep init`, 之后就由dep接管该项目的包管理了。当前目录下会多出`vendor`目录，以及`Gopkg.lock`,`Gopkg.toml`文件。然后运行`dep ensure`下载依赖包到本地，到当前项目下。使用以上命令的时候，加上-v可以获得更加详细的信息`dep ensure -v`。增加新的依赖则需要使用`dep ensure add xxxxx`
Gopkg.toml文件是dep的配置文件

```toml

required = ["github.com/go-redis/redis","github.com/mylamour/boomb"]
ignored = ["golang.org/x/crypto/ssh"]


[metadata]
homepage = "https://github.com/myalmour/boomb"
license = "MIT"
user = "mylamour"
email = "mylamour@163.com"


[prune]
  go-tests = true
  unused-packages = true

```

require字段的是一定会在ensure的时候拉取到vendor里面的。但是注意托管到代码管理平台的时候，不要推送上去。


# 其他

* 使用Makefile帮助管理工程命令
* Go build时候使用`-ldflags="-s -w" `来减小生成的二进制大小
* `https_proxy=127.0.0.1:1080 go get xxxx`可以解决部分的包安装问题
* 一个好的ide可以解决许多麻烦


# 资源

* [Tour of golang](https://tour.golang.org)
* [boomb](https://github.com/mylamour/boomb)
* [dep](https://github.com/golang/dep)
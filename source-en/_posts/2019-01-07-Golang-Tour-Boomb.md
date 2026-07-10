---
layout: post
title: Time to Play Around with Golang
categories: Security Engineer
kerywords: golang tutorial golang tour burpforce demo project
tags: Security Development
translated: true
---

# Intro

I started poking at Golang last year, but since I never needed it at work, I forgot everything pretty quickly. Also wasn't a big fan of Golang's package management, so I shelved it and switched to Rust — wrote a few small demos. Then for various reasons I picked Golang back up and started learning again. True to the "talk is cheap" principle, I built a small toy project. I think it works well enough as a tutorial (for people who already have some programming experience). It also just goes to show that a language is really just a tool. What actually matters is algorithms, design patterns, and programming thinking. I'm not going to compare it against other languages here — just pick the right (or good enough) tool for the job.

# 1. Basics

Start by running through [Golang tour](https://tour.golang.org). Golang doesn't have classes, but that doesn't stop you from using struct methods as a rough equivalent — if I recall correctly, Rust does the same thing. Here's a quick demo covering the basic syntax:

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
	var noticesagain string = "I can also declare it like this"

	var haha string
	haha = "Another String"

	yoyoyo := make([]string, 3)
	fmt.Println("nothing here", yoyoyo)

	lalalabytes := []byte(`
		multi
		line
		string
		here
	`)

	
	fmt.Println(lalalabytes)

	zhangsan := People{"Zhangsan", "male", 18}
	zhangsan.Say("I'm pretty handsome")
	fmt.Println(zhangsan.Name)
	fmt.Println(zhangsan.age)

	fmt.Println(notices, noticesagain, haha)

}

```

# 2. Advanced

The "slightly more advanced" stuff includes pointers, references, Map, interfaces, Slices, goroutines, and callbacks. You'll want to go through the Golang tour or a book to learn these systematically — they're considered the more advanced usage. Below are some beginner-level examples of advanced features, taken from my Golang learning project [boomb](https://github.com/mylamour/boomb) on GitHub.

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
Basic struct definition.

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

As you can see, `Fire` takes a function as a parameter and calls it via a goroutine, storing the results in a channel. If you can follow the code above, you've got a solid grasp of channels, callbacks, pointers, and structs.


# 3. Package Management with dep

Put your project under `$GOPATH`, typically `~/go/src/`, then run `dep init` inside the project directory. After that, dep takes over package management. You'll see a new `vendor` directory along with `Gopkg.lock` and `Gopkg.toml` files. Run `dep ensure` to download dependencies locally into the current project. Add `-v` to any of these commands for more verbose output: `dep ensure -v`. To add a new dependency, use `dep ensure add xxxxx`.

`Gopkg.toml` is dep's config file:

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

Packages listed in `required` will always be pulled into `vendor` during `ensure`. Just make sure you don't push the `vendor` directory when committing to version control.


# 4. Misc

* Use a Makefile to manage project commands
* Add `-ldflags="-s -w"` during `go build` to reduce binary size
* `https_proxy=127.0.0.1:1080 go get xxxx` can solve some package installation issues
* A good IDE saves a ton of headaches


# Resources

* [Tour of golang](https://tour.golang.org)
* [boomb](https://github.com/mylamour/boomb)
* [dep](https://github.com/golang/dep)

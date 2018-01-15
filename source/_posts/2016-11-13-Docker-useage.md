---
layout: post
title: Docker for daily use
categories: HowTo
tags: 学习笔记
---


```bash
$ docker run -i -t --name alias_container_name images_name 
$ docker attach container_id
```

### someUser don't need root  

`sudo usermod -aG docker someUser `

### stop docker container

`$ docker stop container_id`

### export single file from runing container

```bash
$ docker cp name.txt container_name:/name.txt
$ docker cp container_name:/name.txt name.txt
```

###  delete force or not

```bash
$ docker rm container
$ docker rmi images
$ dcoker rmi -f images | docker rm -f container_id
```

###  remove all stoped container

`$ docker rm $(docker ps -a -q)`

###  kill containers and remove them:

`$ docker rm $(docker kill $(docker ps -aq))`

### remove all images 

`$ docker rmi $(docker images -qf "dangling=true")`

`docker rmi $(docker images | grep -v 'ubuntu\|my-image' | awk {'print $3'})`

### mount the directory to docker 

`$ docker run -d P --name mnistDemo -v .:/mnistDemo caffe:latest /bin/bash`

###  link container
`docker run -i -t --name container1 --net=my-network --net-alias=container1 ubuntu:trusty /bin/bash`

### docker expose  port
`$ docker run -d -p 80:80 my_image service nginx start`


References:

* [how-is-docker-different-from-a-normal-virtual-machine](http://stackoverflow.com/questions/16047306/how-is-docker-different-from-a-normal-virtual-machine)

* [docker-cant-connect-to-docker-daemon](http://stackoverflow.com/questions/21871479/docker-cant-connect-to-docker-daemon)

* [how-to-create-a-bidirectional-link-between-containers](http://stackoverflow.com/questions/25324860/how-to-create-a-bidirectional-link-between-containers)

* [docker build](https://docs.docker.com/engine/reference/commandline/build/)

* [docker commit](https://docs.docker.com/engine/reference/commandline/commit/)

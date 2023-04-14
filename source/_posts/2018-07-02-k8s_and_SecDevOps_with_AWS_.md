---
layout: post
title: k8s and SecDevOps with AWS 
categories: 安全工程师
kerywords: k8s 安全运维
tags: k8s 安全运维 AWS
---

# 前言
这不是一篇基础教程。 
先决条件：
* docker : 容器
* k8s :  微服务容器平台
* kops :  自动化在aws上构建k8s
* helm :  k8s包管理器
* istio :  微服务管理平台
* datadog : 流量，日志收集分析平台(云) 

完整流程：
使用 Kops 在 AWS上构建高可用(同一个可用区内跨region构建多主节点)k8s集群并允许insecureRegistry，然后注入istio，以sidecar方式收集pod内容器流量日志以供其他工具分析监控。k8s从私有镜像拉取 采用datadog对整个集群进行监控。k8s从私有镜像拉取,然后采用helm进行管理k8s的pod,和services发布。

奔向k8s的新架构如图所示，图由[visual paradigm](https://online.visual-paradigm.com/)(在线工具)绘制。至于为什么选择k8s，好处就不用多说了。文档很多。而且以目前这种操作，可以说落实推动了DevOps。假如开发也很了解k8s的话，可以直接控制自己的版本发布，配置自己的Configmap然后推送到相应的deployment或者暴露出Services。可以说是最好不过了，也是真正意义上的开发即运维。

![default](https://img.iami.xyz/images/42153384-8a438f66-7e15-11e8-95a8-b0ef85c5e0e9.png)

# 安装及配置k8s集群
首先先把一个域名NS记录解析到AWS上，然后配置一个s3 存储桶用于存储kops启动过程中的状态。然后开始创建集群。

step 1 : 创建集群
```bash
$ kops create cluster \
    --node-count 3 \
    --zones us-east-2a,us-east-2b,us-east-2c \
    --master-zones us-east-2a,us-east-2b,us-east-2c \
    --node-size t2.medium \
    --master-size t2.medium \
    --topology private \
    --networking kopeio-vxlan \
    --ssh-public-key ~/.ssh/id_rsa.pub \
    useast1.xxx.xxx.xxx
```

step 2 : 编辑集群，使允许`InsecureRegistry`,
编辑前需要在当前终端设置环境变量`export KOPS_STATE_STORE=s3://xxx.xxxx.xxx`
```
$ kops edit cluster --name api.xxx.xxx.xxx
```
在配置文件中spec下添加，添加之后像下面这样:
```
spec: 
   docker:
     insecureRegistry: xxxxxxxx:5000
     logDriver: json-file
```
如果需要更新节点，如果设置了`autoscaling``即可，否则可以手动编辑`kops edit ig node`然后设置max, min即可


step 3 : 更新集群

```
$ kops update cluster xxxx.xxxx.xxxx.xxx --yes
$ kops rolling-update cluster --yes
```
此时你的集群就可以从私有hub上拉取镜像了,但是注意安全组允许该端口开放。

step N: 安装UI插件，以及开启`tiller`供`helm`使用

`tiller`安装

```
$ kubectl create serviceaccount --namespace kube-system tiller  
$ kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
$ kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'

```

`dashboard`安装
```
$ kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
```
# 常规使用

## 访问服务
访问`dashboard ui`可以直接通过 `kubectl proxy`进行访问，访问的token获取需要通过`kops get secrets admin -oplaintext`获得。

```
$ kubectl port-forward svc/xxxxx yourport:servicespord
$ kubectl port-forward pod/xxxxx yourport:servicespord
```

还可以通过暴露服务的方式进行访问，暴露的形式有两种，一种是`loadbalance`, 一种是`nodeport`,暴露的话通过`kubectl expose service ` 即可，例如:`kubectl expose deployment cloying-chicken-grafana --type=LoadBalancer  --name testgrafa --port 80`， 然后就会看到这个pod已经可以透过elb访问了。当然也可以直接通过URL去访问，例如，同样是上面的服务，可以通过`https://xxx.xxxx.xxx.xxx.shop/api/v1/namespaces/default/services/cloying-chicken-grafana:80/proxy/login` 去访问。

## helm 小记
几个有用的helm 的repo， `helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/`, `helm repo add coreos https://s3-eu-west-1.amazonaws.com/coreos-charts/stable`.掌握了本地的chart 工程使用才是更好的方式。
helm就像是Ubuntu的apt，非常好用。


# 后记
踩了快1个月的坑，各种坑。架构暂时done. 日志分析和WAF主要依靠的是服务。当然，还是那句话买服务谁都会，但是应该学习到本质才行。To be !

# Resources
* [AWS 架构绘制工具](https://online.visual-paradigm.com/)
* [kops HA](https://github.com/kubernetes/kops/blob/master/docs/high_availability.md)
* [搭建私有docker hub](https://gist.github.com/mylamour/dbc63d1901a39e084c500aa9747ea40e)
---
layout: post
title: K8S and SecDevOps on AWS
categories: Security Engineer
kerywords: k8s security ops
tags: AWS basic-security
translated: true
---

# Intro

This is not a beginner's tutorial.

Prerequisites:
* docker : containers
* k8s : microservices container platform
* kops : automates building k8s on AWS
* helm : k8s package manager
* istio : microservices management platform
* datadog : traffic/log collection and analytics platform (cloud)

Full workflow:
Use Kops to build a highly available k8s cluster on AWS (multi-master nodes across regions within the same availability zone) with insecureRegistry enabled, then inject istio to collect container traffic logs inside pods via sidecar for analysis and monitoring by other tools. k8s pulls from a private registry, and datadog monitors the entire cluster. Helm manages pod and service deployments.

The new k8s architecture is shown below — diagram drawn with [visual paradigm](https://online.visual-paradigm.com/) (online tool). As for why k8s, the benefits are well-documented everywhere. And with this setup, you can genuinely say DevOps has been put into practice. If developers are also familiar with k8s, they can directly control their own release versions, configure their own Configmaps, and push to the corresponding deployment or expose Services. Honestly it doesn't get much better than that — this is dev-as-ops in the truest sense.

![default](https://img.iami.xyz/images/42153384-8a438f66-7e15-11e8-95a8-b0ef85c5e0e9.png)

# Installing and Configuring the k8s Cluster

First, point a domain's NS records to AWS, then set up an S3 bucket to store kops state during startup. Then start creating the cluster.

step 1: Create the cluster
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

step 2: Edit the cluster to enable `InsecureRegistry`.
Before editing, set the env var in your current terminal: `export KOPS_STATE_STORE=s3://xxx.xxxx.xxx`
```
$ kops edit cluster --name api.xxx.xxx.xxx
```
Add the following under `spec` in the config file, so it looks like this:
```
spec: 
   docker:
     insecureRegistry: xxxxxxxx:5000
     logDriver: json-file
```
If you need to update nodes — if `autoscaling` is configured you're good, otherwise manually edit `kops edit ig node` and set max/min.


step 3: Update the cluster

```
$ kops update cluster xxxx.xxxx.xxxx.xxx --yes
$ kops rolling-update cluster --yes
```
At this point your cluster can pull images from your private hub — just make sure the security group allows that port.

step N: Install the UI plugin and enable `tiller` for `helm`

Install `tiller`:

```
$ kubectl create serviceaccount --namespace kube-system tiller  
$ kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
$ kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'

```

Install `dashboard`:
```
$ kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
```

# Day-to-Day Usage

## Accessing Services

You can access the `dashboard ui` directly via `kubectl proxy`. To get the access token, run `kops get secrets admin -oplaintext`.

```
$ kubectl port-forward svc/xxxxx yourport:servicespord
$ kubectl port-forward pod/xxxxx yourport:servicespord
```

You can also expose services for access. There are two ways: `loadbalancer` or `nodeport`. Use `kubectl expose service` to do it — for example: `kubectl expose deployment cloying-chicken-grafana --type=LoadBalancer --name testgrafa --port 80`. After that you'll see the pod is accessible through ELB. You can also hit it directly via URL — for the same service above, something like `https://xxx.xxxx.xxx.xxx.shop/api/v1/namespaces/default/services/cloying-chicken-grafana:80/proxy/login`.

## Quick Notes on helm

A few useful helm repos: `helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/`, `helm repo add coreos https://s3-eu-west-1.amazonaws.com/coreos-charts/stable`. That said, getting comfortable with local chart projects is the better long-term approach. helm is basically apt for Ubuntu — super handy.


# Afterword

Spent nearly a month bumping into every gotcha imaginable. Architecture is done for now. Log analysis and WAF mostly rely on managed services. But as always — anyone can buy a service, the real point is to understand what's happening under the hood. To be!

# Resources
* [AWS Architecture Drawing Tool](https://online.visual-paradigm.com/)
* [kops HA](https://github.com/kubernetes/kops/blob/master/docs/high_availability.md)
* [Setting Up a Private Docker Hub](https://gist.github.com/mylamour/dbc63d1901a39e084c500aa9747ea40e)

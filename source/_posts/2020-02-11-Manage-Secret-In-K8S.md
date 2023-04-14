---
layout: post
title: Talking About K8S Secret Manager 
categories: 安全工程师
kerywords: 企业安全 互联网企业安全 安全架构 Cloud K8s 云安全 K8S Secret
tags: 安全架构
---

# Intro
In the last two weeks, i was trying to found a new way to save the secret securely. as you know, k8s is an open-source system for automating deployment, scaling, and management of containerized applications. As part of CNCF. it's necessary to put some energy into security design. In fact, k8s's security defend  is not good enough. For example. k8s only encode  the secret as base64. And In the early days, etcd's security was not valued.  When we get back to k8s's secret management solution. After a period of research,  i found some different ways to build the secret manager solutions. And after reselection, we choice the following four kinds type:

1. vault on k8s  (Already experimented)
2. vault with cert-manager on k8s (Already experimented)
3. aws secret manager on k8s (No experiment)
4. kubseal on k8s (Already experimented)

>  k8s cluster in alibaba cloud with 3 master 4 slave. 

# Some background knowledge
## k8s & secret 
We avoid to deep into it. Because this blog should be focused on secret solutions.

### Architecture & WorkFlow
Firstly, following the picture to have a overview of k8s architecture. 

![Screenshot from 2020-02-11 14-51-48](https://img.iami.xyz/images/74216069-34c50800-4cde-11ea-844e-aeff136479cd.png)

Classically, k8s was deployed as Master/Slave mode. every node can hold on different pod, but pod can't deployed over different pod. and every container was only single one process. In any node, there was three part on it. `Kube-Proxy`, `Kubelet`, And Container Runtime. Most time. it was Docker.

And k8s was totally controlled over REST API. 

As for Secret. it can be a token, DB password,  HTTPS Cert and so on. At least, A secret manage need those function:

* Key Store
* Key Rotation
* Key Share
* Seal/UnSeal
* Authentication/Authorization

when you build a application based on k8s.  Configuration was need divide  to two part. Plaintext with k8s `ConfigMap`, ciphertext with `Secret`.  Now we look at  the workflow.

![Screenshot from 2020-02-11 14-56-23](https://img.iami.xyz/images/74216239-b61c9a80-4cde-11ea-9547-0bb58f2de4e3.png)

Controller can watch the state of any pods. Every change was deployed through those parts. 
Master Node:  Deloyment Controller -> ReplicaSet Controller -> Scheduler Assign pod to Node 
Slave Node: Tell Docker to run Container

### Access 
1. Normal User
K8s Support access it from outside with 3 ways(ExternalName was specially):

*  ClusterIP (As IAAS,  cloud would provide your external IP or elastic IP)
* LoadBalancer ( As IAAS, cloud would provide your load balance from cloud product)  
* NodePort ( Services did not need to a signal external ip, you can access it with IP:PORT)

Also, you should know about routemap, APM, log collections and so on.

2. Ops
When you access it from inside. Just with `kubectl proxy` and subcommand.

* `kubectl proxy` support you to view the k8s dashboard. when you try to access  it `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login`, it need to 
token with ` kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')`

* `kubectl portforwad 8080:8080`, this command allow you to view the inside service in your local computer. Also need to attention with `namespace` (default or not? current context ?) & `services`
For example: `kubectl port-forward vault-xxxxxx-xxxxxx 8200` to view vault dashborad.  

## Peripheral knowledge

* `helm`  useage (helm3 was i removal of Tiller)
* `oh-my-zsh` useage (enable kubectl & helm plugin was helpful)
* `isito` was can help you to control your k8s resources. (look like a control control plane)

## vault

Vault is created by hashicorp, this company make lot of changes in devops. Such as vagrant, terraform, packer. I like it. So, let's talk about vault.

![image](https://img.iami.xyz/images/74218569-5970ae00-4ce5-11ea-816c-2ad08751a2a7.png) (This image from vault docs)

In one word, all you need is  in here. PKI certificate, SSH certificate, Cross region, Cross Cloud, Cross Datacenter and so on. 

## cert manager

Cert-manager is a native Kubernetes certificate management **controller**. it mainly relying on `Issuers`, and `ClusterIssuers`. Firstly, look at this architecture image.
![image](https://cert-manager.io/images/high-level-overview.svg)

Different issuers provide different seal/unseal ways for secret. Except self sign, All other was need to configured with custom service. it support these types:

* SelfSigned
* CA
* Vault
* Venafi
* External
* ACME

In advance, you can use ACME mode, but it's not necessary. 

## aws  secret manager

![image](https://img.iami.xyz/images/74219866-f84ad980-4ce8-11ea-87f1-f9aa58ad74cd.png)

Due to it's not enough resources, also compared to vault. So i decide not to do this experiment. But in another side, we can found that was be used in [Godadday](https://github.com/godaddy/kubernetes-external-secrets)

## kubesal

It's design to encrypt your Secret into a SealedSecret, which is safe to store - **even to a public repository**. It's was mainly with two parts. Client side & Server side. After you install, you can encrypt it with local part, and decrypt with server part , also It's still a **controller** in k8s.

Checkout this image
![image](https://img.iami.xyz/images/74219612-457a7b80-4ce8-11ea-9c08-324d04cd7ea9.png)

# Secret In Actions

## cert-manager
Step1: install

* with kubectl in k8s

```bash

kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.13.0/cert-manager.yaml

```

* with helm in k8s

```bash

helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install --name cert-manager --namespace cert-manager --version v0.13.0 jetstack/cert-manager

```

Please noticed: Official demo was Outdated。

Step2:  Issuers with selfsigned

if you want sign it with other issuers, please must sure it was exists. for example, if you use it with vault, must install `vault-helm` (vault agent on server)





## vault
![vault-k8s-auth-workflow](https://img.iami.xyz/images/74220259-0f3dfb80-4cea-11ea-9c8b-2753d4116ad2.png)

step 1: install vault with helm

* vault-helm( vault agent on k8s)

```bash
git clone https://github.com/hashicorp/vault-helm && cd vault-helm
helm install ./vault-helm
```
Please check this [tutorial](https://learn.hashicorp.com/vault/identity-access-management/vault-agent-k8s)

* kubernets-vault (k8s vault controller)
there was two different ways:

![image](https://img.iami.xyz/images/74220910-cab35f80-4ceb-11ea-8b89-c35ee50ddb79.png)
Also i following this [Quick start](https://github.com/Boostport/kubernetes-vault/blob/master/deployments/quick-start/README.md) to learn it:

 ![Screenshot from 2020-02-02 14-00-46](https://img.iami.xyz/images/74220470-a86d1200-4cea-11ea-9533-21d346d81f63.png)

## kubesal with k8s

please check the background part to learn the workflow. 

Step1: install

* client
```bash
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.9.7/kubeseal-linux-amd64 -O kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
```

* server
`kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.9.7/controller.yaml`

Step2: useage

```bash
i➜  kubeseal-guides  ᐅ  echo -n bar | kubectl create secret generic mysecret --dry-run --from-file=foo=/dev/stdin -o json >mysecret.json

i➜  kubeseal-guides  ᐅ  kubeseal < mysecret.json >mysealedsecret.json
i➜  kubeseal-guides  ᐅ

i➜  kubeseal-guides  ᐅ  kubectl apply -f mysealedsecret.json
sealedsecret.bitnami.com/mysecret created
i➜  kubeseal-guides  ᐅ  kubectl get secrets mysecret.json
Error from server (NotFound): secrets "mysecret.json" not found
i➜  kubeseal-guides  ᐅ  kubectl get secrets mysecret
Error from server (NotFound): secrets "mysecret" not found
i➜  kubeseal-guides  ᐅ  kubectl get secrets mysecret -n kube-system
NAME       TYPE     DATA   AGE
mysecret   Opaque   1      21s
```
Before encrypt:
mysecret.json
```json
{
    "kind": "Secret",
    "apiVersion": "v1",
    "metadata": {
        "name": "mysecret",
        "creationTimestamp": null
    },
    "data": {
        "foo": "YmFy"
    }
}
```

After Encrypt:
```
{
  "kind": "SealedSecret",
  "apiVersion": "bitnami.com/v1alpha1",
  "metadata": {
    "name": "mysecret",
    "namespace": "default",
    "creationTimestamp": null
  },
  "spec": {
    "template": {
      "metadata": {
        "name": "mysecret",
        "namespace": "default",
        "creationTimestamp": null
      }
    },
    "encryptedData": {
      "foo": "AgAao2yYWSK7bN/Ll6NlsyESPhJ3ZnPLkikGtd3+y9oJ+p5PuJaPSWAclxsdLjX5nxucdLoEWa53IktzH0PbeWyyyyyyyyyyyyyyyyyyyyyyU0AA5txJX5QjVkCNA9vxIL7XeqLVyi/eno7oEEdA2BXySAK5a6Q3k3oTJ0uTiPJZOYFvsFeWpz2D4qNuKH9h0LqF3vqJVSmZF4QWdYEA1GndEJRAVzxP8V8HT0unss81w3yPt/bAmeunN4AyyyyyyyyyyyyyyyyyyyyyyyyyWadQ5h0LogC+vbBLKxuJzTXFzVRAzYbg6hbGJTZWQu0isSmLJZrwVKiyF54UIPWh4EnTbim/PLrU08CnuLhgGToeA24uwm/5dmmDnC2BvvQyeFi77fj4uLnJMx5LYw5wPYft0nCkowRJmhuu2cqUviUQ8FArAHc6xQOLKIjt5tojc2BNiIY7aKLzz9VSWVvcID7XfWRkdonYQbfBbGShZKdKCxxxxxxxxxxxxxxxxxxxxxxxxxx="
    }
  },
  "status": {
    
  }
}

```

In this process, if you found it can not fetch ceecertificate, may be you need to exposee the service with `kubectl expose service -n kube-system sealed-secrets-controller --type=ClusterIP`


# Conclusion

Any one of those solutions, You need provide secret manager ability, then add in your deployment or patch it.  No matter what about Cloud Security or Cloud Native Security, It necessary to implement the principle of security by default, zero trust and so on. Due to some reason, i was unable to provide screenshots of all experiments. but I hope you to do it by yourself what all the experiments mentioned above. 
At the end of this blog, I found a wonderful Chinese translation：

有人住高楼，有人在深沟，有人光万丈，有人一身锈，世人万千种，浮云莫去求，斯人若彩虹，遇上方知有。——《怦然心动》

> Some of us get dipped in flat, some in satin, some in gloss. But every once in a while you find someone who's iridescent, and when you do, nothing will ever compare.

# Resources
* [K8S Architecture](https://kubernetes.io/docs/concepts/architecture/)
* [Vault Architeture](https://www.vaultproject.io/docs/internals/architecture/)
* [Vault VS other software](https://www.vaultproject.io/docs/vs/)
* [Cert-Manager Docs](https://cert-manager.io/docs/)
* [Managing secrets in k8s](https://www.weave.works/blog/managing-secrets-in-kubernetes)
* [Godadday](https://github.com/godaddy/kubernetes-external-secrets)
* [isito](https://istio.io/docs/concepts/what-is-istio/)
* [Injecting Vault Secrets Into Kubernetes Pods via a Sidecar](https://www.hashicorp.com/blog/injecting-vault-secrets-into-kubernetes-pods-via-a-sidecar/)
* [vault-k8s](https://github.com/hashicorp/vault-helm)
* [kubernetes-vault](https://github.com/Boostport/kubernetes-vault)
* [vault on k8s](https://www.vaultproject.io/docs/platform/k8s/)
* [Vault agent k8s](https://learn.hashicorp.com/vault/identity-access-management/vault-agent-k8s)
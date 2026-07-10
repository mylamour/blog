---
layout: post
title: Talking About K8S Secret Manager 
categories: Security Engineer
kerywords: 企业安全 互联网企业安全 安全架构 Cloud K8s 云安全 K8S Secret
tags: Security Architecture
translated: true
---

# Intro

Over the past two weeks, I've been digging into how to store secrets securely. As you probably know, Kubernetes is an open-source system for automating deployment, scaling, and management of containerized applications — a core part of the CNCF ecosystem. Security design is definitely something worth putting real effort into here. Truth is, Kubernetes' built-in security isn't great. For instance, it only base64-encodes Secrets (that's encoding, not encryption), and in the early days nobody really cared about securing etcd either.

So I went and researched Kubernetes secret management solutions. After going through the options, I narrowed it down to four:

1. Vault on Kubernetes (already tested)
2. Vault with cert-manager on Kubernetes (already tested)
3. AWS Secret Manager on Kubernetes (not tested)
4. Kubeseal on Kubernetes (already tested)

> Kubernetes cluster on Alibaba Cloud: 3 masters, 4 workers.

# Some Background Knowledge

## Kubernetes & Secret

I'll keep this brief since this post is focused on secret management solutions, not a Kubernetes deep-dive.

### Architecture & Workflow

First, here's an overview of the Kubernetes architecture.

![Screenshot from 2020-02-11 14-51-48](https://img.iami.xyz/images/74216069-34c50800-4cde-11ea-844e-aeff136479cd.png)

The classic Kubernetes setup is Master/Worker mode. Each node can run different pods, but a pod can't span multiple nodes. Every container runs a single process. On each node you've got three components: `Kube-Proxy`, `Kubelet`, and a Container Runtime — most of the time that's Docker.

Kubernetes is entirely controlled via REST API.

As for Secrets — they can be tokens, DB passwords, HTTPS certs, and so on. A proper secret manager needs at least these capabilities:

* Key Store
* Key Rotation
* Key Sharing
* Seal/Unseal
* Authentication/Authorization

When building an application on Kubernetes, configuration should be split into two parts: plaintext stuff goes into `ConfigMap`, sensitive stuff goes into `Secret`. Here's the workflow:

![Screenshot from 2020-02-11 14-56-23](https://img.iami.xyz/images/74216239-b61c9a80-4cde-11ea-9547-0bb58f2de4e3.png)

The Controller watches the state of all pods. Every change flows through these parts:
- Master Node: Deployment Controller → ReplicaSet Controller → Scheduler assigns pod to node
- Worker Node: tells Docker to run the container

### Access

**1. External Users**

Kubernetes supports three ways to expose services externally (ExternalName is a special case):

* ClusterIP — the cloud (IAAS layer) provides an external or elastic IP
* LoadBalancer — the cloud provides a load balancer from its product offerings
* NodePort — no dedicated external IP needed; access via IP:PORT directly

You'll also want to know about routing maps, APM, log collection, etc.

**2. Ops**

For internal access, use `kubectl proxy` and its subcommands.

* `kubectl proxy` lets you view the Kubernetes dashboard. When you hit `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login`, you'll need a token — get it with: `kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')`

* `kubectl port-forward 8080:8080` — lets you access an internal service from your local machine. Pay attention to `namespace` (is it default? what's the current context?) and `services`. Example: `kubectl port-forward vault-xxxxxx-xxxxxx 8200` to access the Vault dashboard.

## Peripheral Knowledge

* `helm` usage (helm3 removed Tiller)
* `oh-my-zsh` usage (enabling the kubectl & helm plugins is really helpful)
* `istio` — helps you control Kubernetes resources, basically an extra control plane

## Vault

Vault is made by HashiCorp — a company that's made a huge impact on DevOps with tools like Vagrant, Terraform, and Packer. Big fan. Let's talk about Vault.

![image](https://img.iami.xyz/images/74218569-5970ae00-4ce5-11ea-816c-2ad08751a2a7.png) *(image from Vault docs)*

In short: it handles everything. PKI certificates, SSH certificates, cross-region, cross-cloud, cross-datacenter — all of it.

## cert-manager

cert-manager is a native Kubernetes certificate management **controller**. It mainly works through `Issuers` and `ClusterIssuers`. Here's the architecture:

![image](https://cert-manager.io/images/high-level-overview.svg)

Different issuers provide different seal/unseal mechanisms. Except for self-signed, all others need to be configured with an external service. Supported types:

* SelfSigned
* CA
* Vault
* Venafi
* External
* ACME

You can use ACME mode, but it's not required here.

## AWS Secret Manager

![image](https://img.iami.xyz/images/74219866-f84ad980-4ce8-11ea-87f1-f9aa58ad74cd.png)

Didn't have enough resources to test this one, and compared to Vault it's less feature-rich, so I skipped the experiment. That said, there's real-world usage out there — [GoDaddy uses it](https://github.com/godaddy/kubernetes-external-secrets).

## Kubeseal

Kubeseal is designed to encrypt your Secret into a SealedSecret, which is safe to store — **even in a public repository**. It has two parts: a client side and a server side. After installation, you encrypt locally with the client, and the server (which is a **controller** inside Kubernetes) handles decryption.

Here's how it looks:

![image](https://img.iami.xyz/images/74219612-457a7b80-4ce8-11ea-9c08-324d04cd7ea9.png)

# Secret In Actions

## cert-manager

**Step 1: Install**

* With kubectl:

```bash
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.13.0/cert-manager.yaml
```

* With helm:

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install --name cert-manager --namespace cert-manager --version v0.13.0 jetstack/cert-manager
```

Note: the official demo is outdated.

**Step 2: Issuers with SelfSigned**

If you want to use a different issuer, make sure it's already installed. For example, if you're using Vault as the issuer, you need to install `vault-helm` (the Vault agent server) first.

## Vault

![vault-k8s-auth-workflow](https://img.iami.xyz/images/74220259-0f3dfb80-4cea-11ea-9c8b-2753d4116ad2.png)

**Step 1: Install Vault with helm**

* vault-helm (Vault agent on Kubernetes):

```bash
git clone https://github.com/hashicorp/vault-helm && cd vault-helm
helm install ./vault-helm
```

Check out this [tutorial](https://learn.hashicorp.com/vault/identity-access-management/vault-agent-k8s).

* kubernetes-vault (Kubernetes Vault controller) — there are two approaches:

![image](https://img.iami.xyz/images/74220910-cab35f80-4ceb-11ea-8b89-c35ee50ddb79.png)

I followed this [Quick Start](https://github.com/Boostport/kubernetes-vault/blob/master/deployments/quick-start/README.md) to learn it:

![Screenshot from 2020-02-02 14-00-46](https://img.iami.xyz/images/74220470-a86d1200-4cea-11ea-9533-21d346d81f63.png)

## Kubeseal with Kubernetes

Check the background section above for the workflow.

**Step 1: Install**

* Client:
```bash
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.9.7/kubeseal-linux-amd64 -O kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
```

* Server:
```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.9.7/controller.yaml
```

**Step 2: Usage**

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

Before encryption — `mysecret.json`:
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

After encryption:
```json
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

One thing to watch out for: if you can't fetch the certificate, you may need to expose the service with `kubectl expose service -n kube-system sealed-secrets-controller --type=ClusterIP`.

# Conclusion

Whichever solution you pick, you need to wire it into your deployment or patch it in. Whether it's Cloud Security or Cloud Native Security, security-by-default and zero-trust principles are non-negotiable. Due to some constraints, I couldn't include screenshots of every experiment — but I'd encourage you to run through them yourself.

Leaving off with a Chinese poem I love, and its translation:

有人住高楼，有人在深沟，有人光万丈，有人一身锈，世人万千种，浮云莫去求，斯人若彩虹，遇上方知有。——《怦然心动》

> Some of us get dipped in flat, some in satin, some in gloss. But every once in a while you find someone who's iridescent, and when you do, nothing will ever compare.

# Resources
* [K8S Architecture](https://kubernetes.io/docs/concepts/architecture/)
* [Vault Architecture](https://www.vaultproject.io/docs/internals/architecture/)
* [Vault VS other software](https://www.vaultproject.io/docs/vs/)
* [Cert-Manager Docs](https://cert-manager.io/docs/)
* [Managing secrets in k8s](https://www.weave.works/blog/managing-secrets-in-kubernetes)
* [GoDaddy](https://github.com/godaddy/kubernetes-external-secrets)
* [Istio](https://istio.io/docs/concepts/what-is-istio/)
* [Injecting Vault Secrets Into Kubernetes Pods via a Sidecar](https://www.hashicorp.com/blog/injecting-vault-secrets-into-kubernetes-pods-via-a-sidecar/)
* [vault-k8s](https://github.com/hashicorp/vault-helm)
* [kubernetes-vault](https://github.com/Boostport/kubernetes-vault)
* [Vault on k8s](https://www.vaultproject.io/docs/platform/k8s/)
* [Vault agent k8s](https://learn.hashicorp.com/vault/identity-access-management/vault-agent-k8s)

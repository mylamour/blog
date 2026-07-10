---
layout: post
title: Building Redis Cluster with Ansible
categories: Security Engineer
kerywords: Ansible Redis DigitalOcean
tags: Tools
translated: true
---

#### 0x00: Preface - Just Rambling

I tried writing a doc for Vultr about "how to build a redis cluster in vultr" before, but it got rejected due to grammar issues. Never bothered translating it back for my own blog. So let me clean it up now. Actually, all this was just to set up a distributed `pyspider`.

#### 0x01: What Is What

I'm using `ansible` because latern recommended it. I transitioned from `vagrant`. Both are based on `ssh`. Installation is simple: `pip install ansible`.

`redis` - you've used it, right? Caching and queues are the most common use cases.

1. Create a dedicated `ansible` user. Remember to create the home directory when you create the user, otherwise it's a huge pain. I tried for ages and kept getting permission denied, then realized I didn't create the home directory when adding the user. I won't go into the host setup details for now - use `ssh` keys to batch-create machines, or use one as a template.

2. When connecting to slave nodes, since you need the ansible password, the first time will require verifying the ssh fingerprint. For convenience, you can use a `playbook`:

```ansible
#!/usr/bin/env ansible-playbook
---
- name: accept ssh fingerprint automatically for the first time
  hosts: all
  connection: local
  gather_facts: False

  tasks:
    - name: "check if known_hosts contains server's fingerprint"
      command: ssh-keygen -F {{ inventory_hostname }}
      register: keygen
      failed_when: keygen.stderr != ''
      changed_when: False

    - name: fetch remote ssh key
      command: ssh-keyscan -T5 {{ inventory_hostname }}
      register: keyscan
      failed_when: keyscan.rc != 0 or keyscan.stdout == ''
      changed_when: False
      when: keygen.rc == 1

    - name: add ssh-key to local known_hosts
      lineinfile:
        name: ~/.ssh/known_hosts
        create: yes
        line: "{{ item }}"
      when: keygen.rc == 1
      with_items: '{{ keyscan.stdout_lines|default([]) }}'
```
You can see the header is `#!/usr/bin/env ansible-playbook`, which means you can save this as a shell script and execute it directly. Or you can save it as a plain text file and run it with `ansible-playbook`.

After running this, all fingerprints will be added to the local machine. The host config is in `/etc/ansible/hosts`, then you can execute the corresponding controls.

```bash
root@master:~# ansible -i /etc/ansible/hosts slave -m ping --ask-pass -u ansible
SSH password: 
45.76.222.2xx | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
45.76.197.1xx | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
root@master:~# ansible -i /etc/ansible/hosts slave -m shell -a 'date' --ask-pass -u ansible
SSH password: 
45.76.197.1xx | SUCCESS | rc=0 >>
Fri Aug 11 07:12:43 UTC 2017

45.76.222.2xx | SUCCESS | rc=0 >>
Fri Aug 11 07:12:43 UTC 2017

```
If you write the username and password in the host file, you don't need to enter them in the command line. Config file looks like this:

```
[defaults]
host_key_checking=false

[all:vars]
ansible_connection=ssh
ansible_ssh_user=ansible
ansible_ssh_pass=test

#hosts
[slave]
45.76.197.1xx
45.76.222.2xx
```
For executing via `ansible` command line, check the linked resources. A lot of `ansible` tutorials online skip over some stuff. You'll figure it out when you practice yourself.

`ansible -i inventory/production web -m shell -a 'date' --ask-pass -uuser`

#### 0x02: Afterthought - Other Stuff

When I said I had no requirements for finding a place, I actually did have requirements - a normal environment. Clean and quiet. Normal indoor air quality, not formaldehyde so strong it stings your nose, not so noisy you need earplugs to sleep. Toilet and kitchen not so filthy that even after you clean them, they get dirty again immediately. That's it. Such normal things. Turns out those seemingly normal things require so much effort behind the scenes. Tech sharing sessions are the same.

When I said I had no requirements for finding a job, I actually did have requirements - hoping for growth. Sigh, a lot of things have become unpredictable.


#### Resources:

* [Ansible Simple Tutorial](https://blog.goquxiao.com/posts/2015/09/01/ansible-simple-tutorial/)
* [pyspider集群部署](https://imlonghao.com/10.html)



Original English draft below:
> For setting up a mongo cluster, it's pretty similar, just watch the syntax. For example in mongo: `bind = [127.0.0.1, 10.99.0.11]`

We use three machines. Two of them were set as slaves. 

### Step 1: Install Redis In Ubuntu 16.04 
It can be easily installed by `apt-get`. And in Vultr, you can add it into StartupScripts, just add this line:

        #!bin/bash
        apt install -y redis-server

Just directly deploy 3 instances. When the server is running, redis-server will also be running. If you don't know how to edit startup scripts, you can just log into your instance and type `apt install -y redis-server`. When installation is finished, you'll have a redis server instance.

Note:

 * For security, you need to enable the private network and shouldn't expose it to the public network.

### Step 2: Configure your private network 
When you enable private network and deploy the instance, you'll find the private network address in the Instance settings in the control panel. But the private network won't work until you configure it. So we need to edit the network interface. In Ubuntu, you can do something like this:
       `vim /etc/network/interface`

Then add this line. In this example, my private network address is `10.99.0.11`, you need to change it to your private IP address. Same for the other instances.

        auto ens7
        iface ens7 inet static
               address 10.99.0.11
               netmask 255.255.0.0
               mtu 1450
 
After changing `/etc/network/interface`, we need to restart the network services: 
`ifup ens7 `

Note:

* Use `service ssh start`, and you can use ssh with the private network address to connect to your slave machines.

### Step 3: Configure Redis Cluster 

After step 1 and step 2, we already have a private network and three redis servers. Now we need to connect them as a distributed cluster.

Now, we begin to configure our redis server. The conf file is located at `/etc/redis/redis.conf`. First, we need to change the `redis bind`. You need to use the private network address as the bind. You need to bind it in each instance: `bind 10.99.0.10` or `bind 10.99.0.11` or `bind 10.99.0.12`. In this example, `10.99.0.10` is considered the master, `10.99.0.11` and `10.99.0.12` are set as slaves. The next step is important - tell the slave redis the master redis address and port. So we need to edit the conf file:

* In 10.99.0.11 /etc/redis/redis.conf:

        slaveof 10.99.0.10 6379

* In 10.99.0.12 /etc/redis/redis.conf:

        slaveof 10.99.0.10 6379

Barring accidents, when you finish this setup, the redis server configuration is complete. And you'll have a simple redis cluster. When you restart your service with `service redis-server restart`, it should work correctly.

And in the slave machines, use `redis-cli -h 10.99.0.10 -p 6379` to connect to the master redis. To get more info, just type `INFO`, and redis will tell you more.

Note:

* For security, you need to edit the redis conf and enable password authorization: `requirepass yourpass`. Therefore you need to edit the slave conf with `masterauth <master-password>`

> * In 10.99.0.10 /etc/redis/redis.conf:
         `requirepass wohaha`
* In 10.99.0.11 /etc/redis/redis.conf: 
         `masterauth wohaha`
* In 10.99.0.12 /etc/redis/redis.conf:
         `masterauth wohaha`

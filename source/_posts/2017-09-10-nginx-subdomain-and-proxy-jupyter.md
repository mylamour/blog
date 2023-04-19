---
layout: post
title: Nginx SubDomain and Proxypass Jupyter notebook
categories: 安全工程师
keywords: Jupyter Nginx Proxy
tags: 工具
---

It was being executed it in my DigitOcean Machine Learning AI Droplet.

Firstly, Parser a domain name to your vps, (add A record, also your subdomain). Now we edit the config file in our configure file. locate at in `/etc/nginx/conf.d/yourselfdomain.conf`

for example , in my subdomain, i edit the file `/etc/nginx/conf.d/mldl.conf`, and change it to:

> 

```bash
server {
    listen 80;
    server_name irc.mldl.site;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

Note:Jupyter token was being writted in `~/.bashrc`, and was runing as service(also allow root acces),if your want stop it, and run it on yourself directory.Just follow the step:

step 1:
> `systemctl stop jupyter.service`

step 2:
> `jupyter-notebook --NotebookApp.token=2bab1e75-22c8-4328-b791-83a39a7170a7 --no-browser --port 8080 --ip=0.0.0.0`

> if you need to allow root access,

> `jupyter-notebook --NotebookApp.token=2bab1e75-22c8-4328-b791-83a39a7170a7 --no-browser --port 8080 --ip=0.0.0.0 --allow-root`

But there was a problem, Jupyter use the ajax as a response. Nginx use proxy head to solve the cross domain problem. Now, the new configure file looke like this:

```
server {
    listen 80;
    server_name jupyter.mldl.site;

    location / {
        proxy_pass http://localhost:8080;
        add_header Access-Control-Allow-Origin: *;
        proxy_set_header X-Real_IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;

        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

```

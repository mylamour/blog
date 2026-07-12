---
layout: post
title: Nginx SubDomain and Proxypass Jupyter notebook
categories: Security Engineer
kerywords: Jupyter Nginx Proxy
tags: Tools
translated: true
---

I ran this on a DigitalOcean Machine Learning AI Droplet.

First, point a domain name and subdomain to your VPS by adding the appropriate A records. Then create an Nginx configuration file under `/etc/nginx/conf.d/`, for example `/etc/nginx/conf.d/yourselfdomain.conf`.

For my subdomain, I edited `/etc/nginx/conf.d/mldl.conf` as follows:

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

Note: The Jupyter token was stored in `~/.bashrc`, and Jupyter was running as a service with root access enabled. To stop the service and run it from your own directory, follow these steps:

Step 1:
> `systemctl stop jupyter.service`

Step 2:
> `jupyter-notebook --NotebookApp.token=2bab1e75-22c8-4328-b791-83a39a7170a7 --no-browser --port 8080 --ip=0.0.0.0`

> If you need to allow root access:

> `jupyter-notebook --NotebookApp.token=2bab1e75-22c8-4328-b791-83a39a7170a7 --no-browser --port 8080 --ip=0.0.0.0 --allow-root`

The issue was that Jupyter uses AJAX responses. Nginx serves as the reverse proxy and forwards the required request and WebSocket headers, while `Access-Control-Allow-Origin` enables the browser's cross-origin response sharing. The resulting configuration looked like this:

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

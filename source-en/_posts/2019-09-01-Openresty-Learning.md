---
layout: post
title: Getting Started with Openresty
categories: Security Engineer
kerywords: Openresty
tags: Tools
translated: true
---

# Getting Started with Openresty

All the following practices were completed on CentOS.

## Installation

![image](https://img.iami.xyz/images/64002257-2781db80-caf9-11e9-80e6-60e7124d0318.png)

1. Edit the configuration file

![image](https://img.iami.xyz/images/64002418-87788200-caf9-11e9-9c7d-ac60bcb4329f.png)

Configuration file content:
```nginx
worker_processes  1;
error_log logs/error.log;
events {
    worker_connections 1024;
}
http {
    server {
        listen 4996;
        location / {
            default_type text/html;
            content_by_lua_block {
                ngx.say("I am here")
            }
        }
    }
}
```

2. Add to environment variables

![image](https://img.iami.xyz/images/64002483-af67e580-caf9-11e9-9e1c-5ba1049e3f2f.png)

I'm using `source ~/.zshrc` here, just use your own shell config file.

![image](https://img.iami.xyz/images/64002707-361cc280-cafa-11e9-8c25-916998626a09.png)


3. Let's use `http_load` for a quick load test

```shell
wget -c http://soft.kwx.gd/tools/http_load-12mar2006.tar.gz
tar -xz http_load-12mar2006.tar.gz
cd http_load-12mar2006
make
echo http://127.0.0.1:4996 > url
./http_load -p 20 -s 5 url
```

![image](https://img.iami.xyz/images/64003697-52216383-cafc-11e9-9361-b34f11a922a1.png)


## Example 1: Openresty Log Response

![image](https://img.iami.xyz/images/64093843-57272280-cd49-11e9-8d1d-b1b6bb3acac2.png)

Let's take a look at `conf/logresponse.conf`

```nginx

worker_processes  1;
error_log logs/error.log;
events {
    worker_connections 1024;
}
http {
    log_format log_req_resp '$remote_addr - $remote_user [$time_local] '
        '"$request" $status $body_bytes_sent '
        '"$http_referer" "$http_user_agent" $request_time req_body:"$request_body" resp_body:"$resp_body"';

    server {
        listen 4996;
        access_log logs/access.log log_req_resp;

        lua_need_request_body on;

        set $resp_body "";
        body_filter_by_lua '
            local resp_body = string.sub(ngx.arg[1], 1, 1000)
            ngx.ctx.buffered = (ngx.ctx.buffered or "") .. resp_body
            if ngx.arg[2] then
                ngx.var.resp_body = ngx.ctx.buffered
            end
        ';

        location / {
            echo "I am here!! Log ME Now";
        }
    }
}

```

## Example 2: Openresty with Redis


![image](https://img.iami.xyz/images/64104220-5e5b2a00-cd63-11e9-9bdc-84aa9de647a0.png)




```nginx


user root root;
worker_processes  2;

error_log logs/error.log;
events {
    worker_connections 1024;
}

http {
    server {
        listen 4996;
        location /by_lua_file {
            default_type text/html;
            content_by_lua_file conf/lua/iamhere.lua;
        }

        location /with_redis {
            content_by_lua_file conf/lua/redis.lua;
        }

    }
}
```

Other use cases include creating canary release environments and dynamic routing.

## Example 3: Openresty with lua-aho-corasick

First install the dependency `yum install lua-devel`, then `git clone https://github.com/cloudflare/lua-aho-corasick && make && make install`

![image](https://img.iami.xyz/images/64106368-91072180-cd67-11e9-8618-5a93261c8471.png)

After installation, configure the files and write your logic in the Lua script.

```nginx

user root root;
worker_processes  2;

error_log logs/error.log;
events {
    worker_connections 1024;
}

http {
    server {
        listen 4996;

        location /with_aho {
            content_by_lua_file conf/lua/aho_corasick.lua;
        }

    }
}

```

You can combine this with Redis to store some rules and use the aho-corasick algorithm for matching. Done.

```lua
local ac = require "ahocorasick"

local dict = {"string1", "string", "etc"}
local acinst = ac.create(dict)
local r = ac.match(acinst, "etc")

ngx.say("match result: ", r)

```

![image](https://img.iami.xyz/images/64106991-ebed4880-cd68-11e9-90da-252a3d7c8ef0.png)

> After reading this, do you understand what else Openresty can do?


# Troubleshooting

![image](https://img.iami.xyz/images/64088187-d3147100-cd2f-11e9-93a6-6e82a2b1d079.png)

Besides `content_by_lua_file`, there are also these:

```nginx
location /lua {
    rewrite_by_lua_file /path/to/rewrite.lua;
    access_by_lua_file /path/to/access.lua;
    content_by_lua_file /path/to/content.lua;
}

```

1. File permission issues

* 755
* user root root; (not a good choice, you should use your own group instead of root)

2. Path completion issues

* Check the error log in time and verify the path is correct.

![image](https://img.iami.xyz/images/64088127-8fba0280-cd2f-11e9-8e4b-3ff9307d87b1.png)


# Resources

* [API Gateway with Lua And Nginx](https://yos.io/2016/01/28/building-an-api-gateway-with-lua-and-nginx/)
* [Log Respnose](https://serverfault.com/questions/361556/is-it-possible-to-log-the-response-data-in-nginx-access-log)
* [dynamic-routing-based-on-redis](https://openresty.org/en/dynamic-routing-based-on-redis.html)
* [lua-aho-corasick](https://github.com/cloudflare/lua-aho-corasick)

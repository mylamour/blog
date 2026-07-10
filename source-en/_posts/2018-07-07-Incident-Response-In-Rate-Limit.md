---
layout: post
title: Thoughts on Content Security and an Anti-Spam Registration Incident Response
categories: Security Engineer
kerywords: Content Security Anti-Crawling Business Security
tags: Crawlers and Anti-Crawlers
translated: true
---

This is a mind map I drew earlier for Jike's Anti-Spam system, focused on Content Security:

![anti-spam risk management](https://img.iami.xyz/images/42406784-1b72ad54-81e1-11e8-898d-dcf520f8dbfd.png)

Every layer of blocking is just another mitigation measure against threats — you keep stacking them until nothing can get through.


# Anti-Spam Registration

Recently the company saw a wave of spam account registrations, most likely people trying to farm points for rewards. These accounts would automatically interact with other APIs once registered. A solid defense should include comparing registration emails against known bad-actor email databases, maintaining a blocklist of disposable/temporary email services, and refusing registrations from those. On top of that, you need Rate Limiting and blocking mechanisms on the registration endpoint. That's roughly what it takes to deal with spam registrations effectively.

* Splunk, nginx access log
* Web service architecture: Front -> CDN -> WAF1 -> WAF2 -> nginx reverse proxy -> WebServer

**The IP blocking trap**: First time I tried blocking IPs it immediately stopped all traffic — turns out I'd blocked WAF2's own IP. After adding WAF2 as a trusted source IP, I noticed one particular IP kept showing up. Blocked it, and it turned out to be a CDN IP, meaning the CDN's config (supposed to pass real client IPs into WAF1) wasn't actually working. Ended up going straight to nginx for dynamic IP-based Rate Limiting: ban for 30 minutes if more than 6 registration attempts per minute.

Getting the real source IP:
```nginx
set_real_ip_from 47.89.7.0/24;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

First step was importing the logs into Splunk for analysis (all IPs below are Alibaba WAF IPs) — you can see the initial view doesn't tell you much:

![lalpbbcc1ge1nf3nbfrncfw_2556_1114](https://img.iami.xyz/images/42406795-816fb7e6-81e1-11e8-9dd1-f7c034fca9c6.png)

After blocking, traffic from those IPs drops to basically zero almost instantly:

![lalpbbcc1ge2svtnblfnczg_2456_1207](https://img.iami.xyz/images/42406799-89b5632e-81e1-11e8-809e-8a5c11dd63a9.png)

Then build fields to query which email addresses registered that day. Submit the list to the backend team to flag those accounts in the admin system — not delete them, just flag or suspend them.

![lalpbbcc1gifcibnamxnbdc_1079_613](https://img.iami.xyz/images/42406809-e035d2a6-81e1-11e8-8258-3c1b63d82004.png)
![lalpbbcc1gikpvnna53nckk_2217_925](https://img.iami.xyz/images/42406811-e18e5ed4-81e1-11e8-84f2-565fb9d8c3aa.png)

# Note

Splunk is great — way more comfortable than ELK. The auto-generated regex matching feature is especially powerful, though you still need to tweak the regex yourself.

Pushing SDL (Security Development Lifecycle) is absolutely necessary. During this incident response, I discovered that some log collector was actually logging user passwords. Ridiculous. But honestly, the feeling I got was: technology is manageable, people are the hard part. That's a whole other topic. Probably need to pick up some management knowledge too.

This whole incident response took about 30 minutes. The key to solving problems fast is having the right mental model — once you do, finding the root cause and fixing it becomes much easier.

# Follow-up

For CDN access control: since the CDN provider (ChinaNetCenter/Wangsu) does its interception in-process on individual nodes, if a single node's traffic doesn't hit the threshold, it still gets through. So effectively a threshold of 6 can let through 60+ requests — way too much error margin. Contacted them and they couldn't fix it either. Ended up implementing Rate Limiting at the nginx layer.

First, set `limit_req_zone` in the `http` block of `nginx.conf`. I'm doing this for API Rate Limiting, so I'll skip other approaches for now.

```nginx
http {
   ...
   limit_req_zone "$binary_remote_addr$request_uri" zone=api_email:30m rate=6r/m;
   ...
}
```

Note: `limit_req_zone $request_uri zone=api_email:30m rate=6r/m;` limits by URL, but it applies globally — so you need to make sure every unique request is limited correctly, or you'll accidentally throttle things you don't want to.



* Note: One weird thing — putting this in `nginx.conf` didn't work, but putting it directly in the individual location config file did.



The specific config:
``` nginx
  location /api/v1/xxxx/yyyy/email/ {
     limit_req zone=api_email;
     set_real_ip_from 0.0.0.0/0;
     real_ip_header    X-Forwarded-For;
     real_ip_recursive on;
```

Then hit an issue where the CAPTCHA page wasn't loading, so added CORS config:

```nginx
set $cors '';
if ($http_origin ~ '^https?://(localhost|www\.btcc\.com|m\.btcc\.com)') {
  set $cors 'true';
}

if ($cors = 'true') {
  add_header 'Access-Control-Allow-Origin' "$http_origin" always;
  add_header 'Access-Control-Allow-Credentials' 'true' always;
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
  add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
  add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
}

```

Full config file:

![image](https://img.iami.xyz/images/42438569-f2301b6c-8392-11e8-872f-7c4c80d58809.png)


After testing, the config works — every 6 requests gets blocked. You should also configure a custom return status code since the default is 503. The frontend needs a friendlier status code to work with.

Debugging these kinds of issues is where real skills show — figuring out why a config isn't taking effect, why duplicate headers cause errors, how to spot it, how to fix it. 👀
![lalpauor5jryy-7nbnbnchq_2580_1654](https://img.iami.xyz/images/47093786-7c5b9100-d25c-11e8-88fa-f97c50b980a2.png)

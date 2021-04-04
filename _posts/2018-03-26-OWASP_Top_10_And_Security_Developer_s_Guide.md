---
layout: post
title: OWASP Top 10 And Security Developer's Guide
categories: 安全工程师
kerywords: OWASPTop10
tags: 安全研发
---

![image](https://user-images.githubusercontent.com/12653147/38121820-270e056c-3404-11e8-80b9-6567dab571ba.png)

这是一份OWASP TOP10变更对比，不过注入始终是NO.1,多出来个XXE,把错误配置，和授权绕过排名提高关注。 作为第一次阅读OWASP 的白皮书，除了系统化一下整个概念流程之后，个人觉得比较好的是最后的几个提问,比较值得思考(不要自己看着什么就是是是，要想一想):
* What’s Next for Developers
* What’s Next for Security Testers
* What’s Next for Organizations
* What’s Next for Application Managers

![image](https://user-images.githubusercontent.com/12653147/38122994-4253bd6a-340b-11e8-8f39-fe8493c5cae2.png)
![image](https://user-images.githubusercontent.com/12653147/38123022-65b0a53e-340b-11e8-9455-c525ab909f10.png)

而我自己主要作为一个安全研发,和web渗透测试，比较关注前两个问题。

# What’s Next for Developers
* Application Security Requirements
* Application Security Architecture
* Standard Security Controls
* Secure Development Lifecycle
> 一个贯穿软件开发始终生命周期中的安全控制
* Application Security Education
> 好的安全开发技能，更能在渗透中起到作用。了解问题的根本点。还可以自己写安全工具。


# What’s Next for Security Testers
* Understand Threat model
> 目前在读威胁建模一书。
* Understand SDLC
* Testing Strategies
* Achieving Currency and Coverage
* Clearly Communicate Findings
> 距离全自动化，和智能化自动攻击还差很远


# RISK计算
![image](https://user-images.githubusercontent.com/12653147/38122656-d8bbc836-3408-11e8-8947-acc25089197c.png)
![image](https://user-images.githubusercontent.com/12653147/38122694-0d9a232c-3409-11e8-95c7-072810f7d4c1.png)

# Other
前期搞日站技术，和机器学习技术。后期搞SDL，安全架构，。  美亚，绿盟，启明星辰的股票都在涨啊...只能看看模拟盈亏ing.### [The Security Checklist](https://github.com/FallibleInc/security-guide-for-developers)
> 包含了设计原则，配置，从开发到部署，一系列的web端服务端客户端的安全检查列表
##### AUTHENTICATION SYSTEMS (Signup/Signin/2 Factor/Password reset) 
- [x] Use HTTPS everywhere.
> 但是有ssltrip和sslsplit
- [ ] Store password hashes using `Bcrypt` (no salt necessary - `Bcrypt` does it for you).
> 目前看来是无解的吧？Bcrypt无解？
- [ ] Destroy the session identifier after `logout`.  
> 确定一个用户Session对应唯一ID,设置过期时间
- [ ] Destroy all active sessions on reset password (or offer to).  
> 登录注册重置确认邮件，总之确认唯一session,就是用户现在的有效session
> But MITM, And Phising OK?
- [ ] Must have the `state` parameter in OAuth2.
> 框架虽然都完善了这些个功能，但是开发者不一定使用，还要记得callback的redirect_uti校验是否允许，否则会导致泄露
- [ ] No open redirects after successful login or in any other intermediate redirects.
- [ ] When parsing Signup/Login input, sanitize for javascript://, data://, CRLF characters. 
> 有序列化就需要反序列化，不在序列化的过程中出现漏洞，就有可能在反序列化的过程中出现漏洞。那么多库，不可能没有问题。
- [ ] Set secure, httpOnly cookies.
> Chrome Plugin get it
- [ ] In Mobile `OTP` based mobile verification, do not send the OTP back in the response when `generate OTP` or `Resend OTP`  API is called.
> 避免本地校验和硬编码,OTP(One Time Password)

- [ ] Limit attempts to `Login`, `Verify OTP`, `Resend OTP` and `generate OTP` APIs for a particular user. Have an exponential backoff set or/and something like a captcha based challenge.
> 有的验证码绑定一个session....可怕不，手机验证码不要只有数字，可以在几分钟内暴力猜出来

- [ ] Check for randomness of reset password token in the emailed link or SMS.
- [ ] Set an expiration on the reset password token for a reasonable period.
- [ ] Expire the reset token after it has been successfully used.


##### USER DATA & AUTHORIZATION
- [ ] Any resource access like, `my cart`, `my history` should check the logged in user's ownership of the resource using session id.
> 见过一个写的代码居然把用户密码作为cookie存储本地,真是气人
- [ ] Serially iterable resource id should be avoided. Use `/me/orders` instead of `/user/37153/orders`. This acts as a sanity check in case you forgot to check for authorization token. 
> 防暴力猜解
- [ ] `Edit email/phone number` feature should be accompanied by a verification email to the owner of the account. 
> 还要在后端验证提交的数据格式是不是邮箱格式，手机格式，一切对服务器来说是输入的地方就有危险，不要依靠前端的过滤。
- [ ] Any upload feature should sanitize the filename provided by the user. Also, for generally reasons apart from security, upload to something like S3 (and post-process using lambda) and not your own server capable of executing code.  
- [ ] `Profile photo upload` feature should sanitize all the `EXIF` tags also if not required.
> 图片马。`IDATA CHUNCK`里面可以写php webshell,图像上传是任何一个网站都具有的功能，但是校验不好就坏了，记得要二次渲染。
- [ ] For user ids and other ids, use [RFC compliant ](http://www.ietf.org/rfc/rfc4122.txt) `UUID` instead of integers. You can find an implementation for this for your language on Github.
- [ ] [JWT](https://www.jianshu.com/p/576dbf44b2ae) are awesome. Use them if required for your single page app/APIs.
> 暂时不是很懂

##### ANDROID / IOS APP
- [ ] `salt` from payment gateways should not be hardcoded.
- [ ] `secret` / `auth token` from 3rd party SDK's should not be hardcoded.
- [ ] API calls intended to be done `server to server` should not be done from the app.
- [ ] In Android, all the granted  [permissions](https://developer.android.com/guide/topics/security/permissions.html) should be carefully evaluated.
- [ ] On iOS, store sensitive information (authentication tokens, API keys, etc.) in the system keychain. Do __not__ store this kind of information in the user defaults.
- [ ] [Certificate pinning](https://en.wikipedia.org/wiki/HTTP_Public_Key_Pinning) is highly recommended.


##### SECURITY HEADERS & CONFIGURATIONS
- [ ] `Add` [CSP](https://en.wikipedia.org/wiki/Content_Security_Policy) header to mitigate XSS and data injection attacks. This is important.
> 至关重要
- [ ] `Add` [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) header to prevent cross site request forgery. Also add [SameSite](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00) attributes on cookies.
- [ ] `Add` [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) header to prevent SSL stripping attack.
- [ ] `Add` your domain to the [HSTS Preload List](https://hstspreload.org/)
- [ ] `Add` [X-Frame-Options](https://en.wikipedia.org/wiki/Clickjacking#X-Frame-Options) to protect against Clickjacking.
- [ ] `Add` [X-XSS-Protection](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#X-XSS-Protection) header to mitigate XSS attacks.
- [ ] Update DNS records to add [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework) record to mitigate spam and phishing attacks.
- [ ] Add [subresource integrity checks](https://en.wikipedia.org/wiki/Subresource_Integrity) if loading your JavaScript libraries from a third party CDN. For extra security, add the [require-sri-for](https://w3c.github.io/webappsec-subresource-integrity/#parse-require-sri-for) CSP-directive so you don't load resources that don't have an SRI sat.  
- [ ] Use random CSRF tokens and expose business logic APIs as HTTP POST requests. Do not expose CSRF tokens over HTTP for example in an initial request upgrade phase.
- [ ] Do not use critical data or tokens in GET request parameters. Exposure of server logs or a machine/stack processing them would expose user data in turn.  
  
  
##### SANITIZATION OF INPUT
> 有进就有出,有序列化就需要反序列化
- [ ] `Sanitize` all user inputs or any input parameters exposed to user to prevent [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting).
- [ ] Always use parameterized queries to prevent [SQL Injection](https://en.wikipedia.org/wiki/SQL_injection).  
- [ ] Sanitize user input if using it directly for functionalities like CSV import.
- [ ] `Sanitize` user input for special cases like robots.txt as profile names in case you are using a url pattern like coolcorp.io/username. 
- [ ] Do not hand code or build JSON by string concatenation ever, no matter how small the object is. Use your language defined libraries or framework.
- [ ] Sanitize inputs that take some sort of URLs to prevent [SSRF](https://docs.google.com/document/d/1v1TkWZtrhzRLy0bYXBcdLUedXGb9njTNIJXa3u9akHM/edit#heading=h.t4tsk5ixehdd).
- [ ] Sanitize Outputs before displaying to users.

##### OPERATIONS
- [ ] If you are small and inexperienced, evaluate using AWS elasticbeanstalk or a PaaS to run your code.
> 创业企业都喜欢用云，但是安全意识不足，又很容易出问题。
- [ ] Use a decent provisioning script to create VMs in the cloud.
- [ ] Check for machines with unwanted publicly `open ports`.
> 如无必要，白名单端口放行。
- [ ] Check for no/default passwords for `databases` especially MongoDB & Redis.
> 不要暴露在外网，也不要把密码写在纸上贴在电脑前。。。
- [ ] Use SSH to access your machines; do not setup a password, use SSH key-based authentication instead.
> 有一份awsome ssh config是比较安全的配置，可以搜索一下
- [ ] Install updates timely to act upon zero day vulnerabilities like Heartbleed, Shellshock.
> 及时更新，打补丁。做好应急响应，要有Plan B.确保发生事情时按原计划进行。不慌不忙，尽快溯源。
- [ ] Modify server config to use TLS 1.2 for HTTPS and disable all other schemes. (The tradeoff is good.)
- [ ] Do not leave the DEBUG mode on. In some frameworks, DEBUG mode can give access full-fledged REPL or shells or expose critical data in error messages stacktraces.
> 开debug报错会泄露敏感信息，做好异常处理的同时，线上永远不要开debug 
- [ ] Be prepared for bad actors & DDOS - use a hosting service that has DDOS mitigation.
- [ ] Set up monitoring for your systems, and log stuff (use [New Relic](https://newrelic.com/) or something like that).
> log everthing you can log, store it, backup it . analysis it.
- [ ] If developing for enterprise customers, adhere to compliance requirements. If AWS S3, consider using the feature to [encrypt data](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html). If using AWS EC2, consider using the feature to use encrypted volumes (even boot volumes can be encrypted now).
> burp插件商店里有aws安全检查

##### PEOPLE
> 权限分级，异常监控。
- [ ] Set up an email (e.g. security@coolcorp.io) and a page for security researchers to report vulnerabilities.
- [ ] Depending on what you are making, limit access to your user databases.
- [ ] Be polite to bug reporters.
- [ ] Have your code review done by a fellow developer from a secure coding perspective. (More eyes)
- [ ] In case of a hack or data breach, check previous logs for data access, ask people to change passwords. You might require an audit by external agencies depending on where you are incorporated.  
- [ ] Set up [Netflix's Scumblr](https://github.com/Netflix/Scumblr) to hear about talks about your organization on social platforms and Google search.
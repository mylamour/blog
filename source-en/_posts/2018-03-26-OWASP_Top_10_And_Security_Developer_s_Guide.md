---
layout: post
title: OWASP Top 10 and the Security Developer's Guide
categories: Security Engineer
kerywords: OWASPTop10
tags: Secure Development
translated: true
---

![image](https://img.iami.xyz/images/38121820-270e056c-3404-11e8-80b9-6567dab571ba.png)

This is a comparison of changes in OWASP Top 10. Injection is still No.1, XXE is new to the list, and misconfiguration and authorization bypass got bumped up in priority. Reading the OWASP whitepaper for the first time — beyond just getting a systematic feel for the whole concept flow — what I found most valuable were the questions at the end. Worth actually thinking through (don't just skim and nod, really think):

* What's Next for Developers
* What's Next for Security Testers
* What's Next for Organizations
* What's Next for Application Managers

![image](https://img.iami.xyz/images/38122994-4253bd6a-340b-11e8-8f39-fe8493c5cae2.png)
![image](https://img.iami.xyz/images/38123022-65b0a53e-340b-11e8-9455-c525ab909f10.png)

As someone who focuses on secure development and web penetration testing, I mostly care about the first two questions.

# What's Next for Developers
* Application Security Requirements
* Application Security Architecture
* Standard Security Controls
* Secure Development Lifecycle
> Security controls that run through the entire software development lifecycle
* Application Security Education
> Good secure development skills actually make you better at pen testing too. You understand the root cause of issues. And you can write your own security tools.


# What's Next for Security Testers
* Understand Threat model
> Currently reading the threat modeling book.
* Understand SDLC
* Testing Strategies
* Achieving Currency and Coverage
* Clearly Communicate Findings
> Full automation and intelligent automated attacks are still a long way off.


# RISK Calculation
![image](https://img.iami.xyz/images/38122656-d8bbc836-3408-11e8-8947-acc25089197c.png)
![image](https://img.iami.xyz/images/38122694-0d9a232c-3409-11e8-95c7-072810f7d4c1.png)

# Other
Early days: Japanese site techniques and machine learning. Later: SDL, security architecture. Meiya, NSFOCUS, Venustech stocks are all going up... just watching on a simulated P&L for now.

### [The Security Checklist](https://github.com/FallibleInc/security-guide-for-developers)
> Covers design principles, configuration, and a full security checklist from development through deployment — web, server, and client side.

##### AUTHENTICATION SYSTEMS (Signup/Signin/2 Factor/Password reset) 
- [x] Use HTTPS everywhere.
> But there's still sslstrip and sslsplit.
- [ ] Store password hashes using `Bcrypt` (no salt necessary - `Bcrypt` does it for you).
> Seems unbreakable right? Is Bcrypt really bulletproof?
- [ ] Destroy the session identifier after `logout`.  
> Make sure each user's session maps to a unique ID, and set an expiration time.
- [ ] Destroy all active sessions on reset password (or offer to).  
> Registration, login, password reset confirmation emails — basically make sure there's always one valid session per user at any given time.
> But MITM and phishing are still viable?
- [ ] Must have the `state` parameter in OAuth2.
> Frameworks generally implement these features, but developers don't always use them. Also remember to validate whether the `redirect_uri` in the callback is on the allowlist — otherwise it can lead to token leaks.
- [ ] No open redirects after successful login or in any other intermediate redirects.
- [ ] When parsing Signup/Login input, sanitize for javascript://, data://, CRLF characters. 
> Where there's serialization, there's deserialization. If you don't get hit during serialization, you might get hit during deserialization. With so many libraries out there, none of them are perfect.
- [ ] Set secure, httpOnly cookies.
> Chrome extensions can still grab these.
- [ ] In Mobile `OTP` based mobile verification, do not send the OTP back in the response when `generate OTP` or `Resend OTP`  API is called.
> Avoid client-side validation and hardcoding. OTP = One Time Password.

- [ ] Limit attempts to `Login`, `Verify OTP`, `Resend OTP` and `generate OTP` APIs for a particular user. Have an exponential backoff set or/and something like a captcha based challenge.
> Some captchas are tied to a session... yikes. SMS verification codes shouldn't be numeric-only — they can be brute-forced in minutes.

- [ ] Check for randomness of reset password token in the emailed link or SMS.
- [ ] Set an expiration on the reset password token for a reasonable period.
- [ ] Expire the reset token after it has been successfully used.


##### USER DATA & AUTHORIZATION
- [ ] Any resource access like, `my cart`, `my history` should check the logged in user's ownership of the resource using session id.
> I once saw code that stored the user's password in a cookie on the client side. Unbelievable.
- [ ] Serially iterable resource id should be avoided. Use `/me/orders` instead of `/user/37153/orders`. This acts as a sanity check in case you forgot to check for authorization token. 
> Prevents brute-force enumeration.
- [ ] `Edit email/phone number` feature should be accompanied by a verification email to the owner of the account. 
> Also validate the format server-side — make sure it's actually an email or phone number format. Everything that comes into the server is input, and input is dangerous. Don't rely on frontend validation alone.
- [ ] Any upload feature should sanitize the filename provided by the user. Also, for generally reasons apart from security, upload to something like S3 (and post-process using lambda) and not your own server capable of executing code.  
- [ ] `Profile photo upload` feature should sanitize all the `EXIF` tags also if not required.
> Image shells. You can embed a PHP webshell in the `IDAT CHUNK`. Image upload is a feature on pretty much every site, but if validation is loose it's game over. Remember to re-render uploaded images.
- [ ] For user ids and other ids, use [RFC compliant ](http://www.ietf.org/rfc/rfc4122.txt) `UUID` instead of integers. You can find an implementation for this for your language on Github.
- [ ] [JWT](https://www.jianshu.com/p/576dbf44b2ae) are awesome. Use them if required for your single page app/APIs.
> Still getting my head around these.

##### ANDROID / IOS APP
- [ ] `salt` from payment gateways should not be hardcoded.
- [ ] `secret` / `auth token` from 3rd party SDK's should not be hardcoded.
- [ ] API calls intended to be done `server to server` should not be done from the app.
- [ ] In Android, all the granted  [permissions](https://developer.android.com/guide/topics/security/permissions.html) should be carefully evaluated.
- [ ] On iOS, store sensitive information (authentication tokens, API keys, etc.) in the system keychain. Do __not__ store this kind of information in the user defaults.
- [ ] [Certificate pinning](https://en.wikipedia.org/wiki/HTTP_Public_Key_Pinning) is highly recommended.


##### SECURITY HEADERS & CONFIGURATIONS
- [ ] `Add` [CSP](https://en.wikipedia.org/wiki/Content_Security_Policy) header to mitigate XSS and data injection attacks. This is important.
> Seriously important.
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
> Where there's input, there's output. Where there's serialization, there's deserialization.
- [ ] `Sanitize` all user inputs or any input parameters exposed to user to prevent [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting).
- [ ] Always use parameterized queries to prevent [SQL Injection](https://en.wikipedia.org/wiki/SQL_injection).  
- [ ] Sanitize user input if using it directly for functionalities like CSV import.
- [ ] `Sanitize` user input for special cases like robots.txt as profile names in case you are using a url pattern like coolcorp.io/username. 
- [ ] Do not hand code or build JSON by string concatenation ever, no matter how small the object is. Use your language defined libraries or framework.
- [ ] Sanitize inputs that take some sort of URLs to prevent [SSRF](https://docs.google.com/document/d/1v1TkWZtrhzRLy0bYXBcdLUedXGb9njTNIJXa3u9akHM/edit#heading=h.t4tsk5ixehdd).
- [ ] Sanitize Outputs before displaying to users.

##### OPERATIONS
- [ ] If you are small and inexperienced, evaluate using AWS elasticbeanstalk or a PaaS to run your code.
> Startups love the cloud, but security awareness is often lacking — easy to run into trouble.
- [ ] Use a decent provisioning script to create VMs in the cloud.
- [ ] Check for machines with unwanted publicly `open ports`.
> Whitelist-only port access. If it doesn't need to be open, close it.
- [ ] Check for no/default passwords for `databases` especially MongoDB & Redis.
> Don't expose them to the public internet. And don't write the password on a sticky note taped to your monitor...
- [ ] Use SSH to access your machines; do not setup a password, use SSH key-based authentication instead.
> There are some great hardened SSH config examples out there — worth searching for.
- [ ] Install updates timely to act upon zero day vulnerabilities like Heartbleed, Shellshock.
> Patch promptly. Have a solid incident response plan — a Plan B. When something goes wrong, stay calm, follow the plan, and trace the source ASAP.
- [ ] Modify server config to use TLS 1.2 for HTTPS and disable all other schemes. (The tradeoff is good.)
- [ ] Do not leave the DEBUG mode on. In some frameworks, DEBUG mode can give access full-fledged REPL or shells or expose critical data in error messages stacktraces.
> Debug mode leaks sensitive info in error messages. Handle exceptions properly, and never leave debug on in production.
- [ ] Be prepared for bad actors & DDOS - use a hosting service that has DDOS mitigation.
- [ ] Set up monitoring for your systems, and log stuff (use [New Relic](https://newrelic.com/) or something like that).
> Log everything you can log, store it, back it up, analyze it.
- [ ] If developing for enterprise customers, adhere to compliance requirements. If AWS S3, consider using the feature to [encrypt data](http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html). If using AWS EC2, consider using the feature to use encrypted volumes (even boot volumes can be encrypted now).
> Burp's extension store has an AWS security checker plugin.

##### PEOPLE
> Tiered permissions, anomaly monitoring.
- [ ] Set up an email (e.g. security@coolcorp.io) and a page for security researchers to report vulnerabilities.
- [ ] Depending on what you are making, limit access to your user databases.
- [ ] Be polite to bug reporters.
- [ ] Have your code review done by a fellow developer from a secure coding perspective. (More eyes)
- [ ] In case of a hack or data breach, check previous logs for data access, ask people to change passwords. You might require an audit by external agencies depending on where you are incorporated.  
- [ ] Set up [Netflix's Scumblr](https://github.com/Netflix/Scumblr) to hear about talks about your organization on social platforms and Google search.

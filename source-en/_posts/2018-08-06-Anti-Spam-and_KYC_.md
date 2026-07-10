---
layout: post
title: Anti-Spam (Registration / Login / KYC)
categories: Security Engineer
kerywords: anti-spam anti-scraping content security
tags: Security Development
translated: true
---

# Intro

As mentioned in the previous post, we can use BanIP and rate limiting, and of course API gateways can help with throttling too. But that's not what this post is about. What I want to talk about here is how to implement common yet not-so-easy-to-break defenses at the code level — to actually stop bot abuse and cheating. Let's think through a few more angles and see how to do this better.

# Starting with JavaScript AntiDebug

Generally speaking, there are a few techniques:

* Abnormal environment detection (we only want our code running in a real browser)
* Devtools detection
* Code integrity checks
* Data flow integrity checks
* Anti-emulation

I happened to be researching anti-debugging techniques a couple days ago and translated a post on it — details [here](http://telegra.ph/Javascirpt-Anti-Debugging-08-02)


# Design and Verification

![image](https://img.iami.xyz/images/43710367-056d7a10-99a2-11e8-8171-7772585ec438.png)

POC validation (ignore the field names...). Of course the prerequisite is that the frontend also has solid anti-debugging and encryption in place.

![image](https://img.iami.xyz/images/43710903-9e83148e-99a3-11e8-9713-9dc6ce5ae0c6.png)


![image](https://img.iami.xyz/images/43710859-74e025ea-99a3-11e8-9e71-6878a439735c.png)

Even after integrating both frontend and backend, you still can't completely block attacks — given enough time, an attacker can probably still break through. So how do you detect script cheating in later stages? That's where user behavior analysis comes in.

# User Behavior Analysis

Simple mouse movement tracking, combined with event logging — clicks, focus on input fields, typing, etc. — serialize all of that and run classification on it. Right now I'm collecting user behavior logs in the test environment, shipping them to S3 for later analysis.

Fields being tracked:
* Mouse trajectory
* Click events
* Input events: duration
* Post-login behavior

Here's a simple snippet for recording coordinate trajectory:

```javascript

document.onmousemove = function(e){
  var pageCoords = "( " + e.pageX + ", " + e.pageY + " )";
  console.log(pageCoords);
};

```

A slicker approach:

```javascript

monitorEvents(document.body); // logs all events on the body

monitorEvents(document.body, 'mouse'); // logs mouse events on the body

monitorEvents(document.body.querySelectorAll('input')); // lo
```


# Other

- [ ] Collect behavior logs and use them for analysis
- [ ] Deep dive into JavaScript encryption and obfuscation

# References
* [JS AntiDebug Translation](http://telegra.ph/Javascirpt-Anti-Debugging-08-02)
* [Log all events fired by an element in jquery](https://stackoverflow.com/questions/7439570/how-do-you-log-all-events-fired-by-an-element-in-jquery)

ele mentioned a really nice trick during an interview: `record the timestamps of keystrokes`. The data volume I was originally collecting was getting a bit large.

<!-- ![image](https://img.iami.xyz/images/54924594-b2a5e680-4f47-11e9-8827-ba8245245ca2.png) -->

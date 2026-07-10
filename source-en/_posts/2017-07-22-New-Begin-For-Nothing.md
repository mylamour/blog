---
layout: post
title: "New Start: Webshell Detection"
categories: Security Engineer
keywords: Webshell Detection Machine Learning
tags: Intrusion Detection and Counter-Intrusion Security R&D
translated: true
---

#### A New Start

Started a new job on June 25th, life is slowly getting back on track. Not bad, not great either. The company set me up with a new machine — I assembled it myself from scratch, spreading thermal paste on the CPU, screwing in every single screw, burning an OS image and watching it boot up. I imagined myself like that brand new machine: starting to spin up at full speed, filling myself back up.

#### Where to Begin

The software I'm working on right now has a module called Webshell detection. Webshell doesn't really need an introduction — it's the kind of stuff you'd use to compromise a site, and my blog has never really covered that side of things. Let's not go down that rabbit hole. For now, just think of a Webshell as malicious code. So this is essentially malicious code detection.

Depending on what you're targeting, there are three main categories of detection methods:

* Log-based detection
* Traffic-based detection
* Behavior-based detection

Honestly, after looking around online, there's not a lot out there. The few blog posts that exist mostly talk high-level about methodologies and architectures, with nothing that actually looks like a solid implementation. That said, for ASP, JSP, and PHP specifically, there are a few decent tools. In terms of methods, I think you can break them down into three categories (keep in mind — these methods can apply to different targets. Traffic monitoring can use them, so can log analysis. In theory it all depends on your design):

1. File similarity-based (fuzzy hash)
2. Code signature-based (YARA rule matching)
3. Machine learning-based (technically statistical ML — a lot of people use Naive Bayes and SVM for malware classification. SVM is a solid industrial-grade algorithm, no question, but sample quality is a real concern, and you can run into issues with feature selection and tokenization too)


#### How to Actually Detect

Here's a quick rundown of all three approaches.

* **File similarity: using `ssdeep`**

File similarity detection is basically built on [fuzzy hash algorithms](http://blog.csdn.net/cwqbuptcwqbupt/article/details/7591818).

> A weak hash algorithm plus a chunk size for splitting. A strong hash algorithm to compute a hash per chunk. A compression mapping to shorten each chunk's hash. A comparison algorithm to compute similarity between two fuzzy hash values.

In short: split the file into chunks, hash each chunk, then combine and rehash. The linked article goes into a lot of detail on how the algorithm works — worth reading. Here's how to use `ssdeep`. To check file similarity with ssdeep, you first need to export the signatures of your existing files.

```bash

$ find ./php -type f -exec ssdeep -t 80 -bm php.ssdeep {} \; 
$ ssdeep -bsm  php.ssdeep  -r ./php -t 80 -c
# Both of these do the same thing: validate all files in a folder against signatures.

$ ssdeep -r *  					
# Or just ssdeep * to dump signatures for everything in the current folder. Redirect to a file if you want to save them.


```
Those are the options you'll actually use day-to-day. Everything else is pretty straightforward.


* **Code signatures: using `yara`**

Code signatures are based on the idea that malicious code and normal code have different purposes, so you can make judgments based on what kind of code is in the file. For example, legitimate PHP code normally won't have big blocks of base64-encoded content, and it definitely won't be packed with `eval` and `preg_replace` calls. So you can match against known dangerous keywords and patterns to detect Webshells. The downside is that generic rules will inevitably produce a lot of false positives. YARA is an open source pattern matching engine from Google — it can match against text content for detection purposes. And it's not just text: it can also do pattern matching on binary files, and even match against values in memory. It's a seriously impressive open source tool. The simplest command-line usage is something like `yara -r ./xxx/rule/xxx.yar /target/directory`. Here's a quick look at a simple PHP YARA rule:

```
rule DangerousPhp
{
    strings:
        $system = "system" fullword nocase  // localroot bruteforcers have a lot of this

        $ = "array_filter" fullword nocase
        $ = "assert" fullword nocase
        $ = "backticks" fullword nocase
        $ = "call_user_func" fullword nocase
        $ = "eval" fullword nocase
        $ = "exec" fullword nocase
        $ = "fpassthru" fullword nocase
        $ = "fsockopen" fullword nocase
        $ = "function_exists" fullword nocase
        $ = "getmygid" fullword nocase
        $ = "shmop_open" fullword nocase
        $ = "mb_ereg_replace_callback" fullword nocase
        $ = "passthru" fullword nocase
}

```
From this rule (taken from [php-malware-finder](https://github.com/nbs-system/php-malware-finder/blob/master/php-malware-finder/php.yar)), you can see it matches keywords like `eval`, `exec`, `assert` case-insensitively — any hit flags the file as a dangerous PHP file. Again, this approach has a high false positive rate, so you need a whitelist filter. Compute md5 or sha1 hashes of known clean files, store them in a whitelist, and filter against that. Stuff like WordPress, Joomla, Discuz, etc. Rule syntax [follows the docs](http://yara.readthedocs.io/en/v3.6.0/writingrules.html) — it's C-like and pretty readable. You can also use publicly available Webshell YARA signature databases to improve accuracy. YARA is definitely something worth learning properly.



* **Machine learning approach**

And of course, last but not least — ML. The mainstream approach right now is statistical machine learning. For text classification specifically, Naive Bayes is popular, and some people are doing it with SVM too. Naive Bayes is built on Bayes' theorem — you compute prior and posterior probabilities, basically asking: given that event A happened, what's the probability of event B? Once you understand the algorithm, the engineering side is easy since there are libraries for everything. But we actually didn't go with Naive Bayes here. Instead we used a [CNN-based binary text classification model](https://github.com/dennybritz/cnn-text-classification-tf). You can check the paper for the network design details. The model takes labeled text line by line, preprocesses it and feeds it into the first layer — the layer dimensions are based on the longest token length in the line as the width, and the number of tokens as the height, mapping each line to a 2D vector. Then it does feature extraction per line and selects features across all lines. This is actually built on word2vec. I had originally planned to use word2vec myself, and after learning about TF-IDF and n-gram, I randomly searched to see if there was anything that could do text classification directly. Found this project, huge thanks to the author. There were some issues along the way — like text files not loading properly — but we eventually got a pretty good result out of it. The downside is that the 2D vector approach is memory-hungry. If your text is even slightly long, it'll absolutely blow up your RAM. I ran it on a server and after loading the samples it was using around 40GB of memory. On my local machine it just crashed outright.

Compared to ssdeep and yara, this approach has the highest accuracy, and it can also correctly classify small files that ssdeep can't handle.

#### Wrap-Up

All three methods can be applied to different detection targets. If you're doing traffic interception, collect a batch of malicious request samples, then decide whether to go with similarity matching, rule hits, or machine learning. All viable options. For real-time detection, you can put a middleware in front of your web service that routes uploaded file requests through the Webshell detection middleware. Deploy it as a standalone microservice, split it out vertically from the main service, and keep maintenance overhead as low as possible.

Overall, the results were solid. But YARA and ssdeep have some platform dependencies, which makes moving to Windows a bit of a headache.

#### Issues Encountered and Outstanding Questions

* ssdeep can't generate valid signatures for very small files
* YARA can match a single file against multiple rules
* Training data was limited during the ML phase
* Whitelists and rules should be maintained by a dedicated person
* Could you use a GAN network to automatically learn and generate attack code?


#### Resources
* [php malware finder](https://github.com/nbs-system/php-malware-finder)
* [yara](https://github.com/VirusTotal/yara)
* [yarGen rule](https://github.com/Neo23x0/yarGen)
* [Shell-Detector](https://github.com/emposha/Shell-Detector)
* [CNN Text Classification](https://github.com/dennybritz/cnn-text-classification-tf)
* [CNN Text Classification Paper](https://arxiv.org/abs/1408.5882v2)
* [ssdeep](http://ssdeep.sourceforge.net/)
* [Fuzzy Hash Algorithm](http://blog.csdn.net/cwqbuptcwqbupt/article/details/7591818)
* [webshell](https://github.com/tennc/webshell)
* [webshell-sample](https://github.com/ysrc/webshell-sample)
* [fuzzdb](https://github.com/fuzzdb-project/fuzzdb)

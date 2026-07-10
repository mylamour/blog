---
layout: post
title:  Writing YARA Modules and Cross-Platform Compilation with GYP
categories: Security Engineer
kerywords:  Yara 安全研发
tags: Intrusion Detection Tools Security Development
translated: true
---

## Preface

First, big thanks to my buddy Li Wei, and also to our new C/C++ guy — between them they helped me squash quite a few bugs. I hadn't touched C/C++ for a long time, but when it came time to write a YARA module, I had no choice but to pick it back up and grind through a week of C/C++.

### Static Compilation and GYP

#### Static Compilation

What even is static compilation? Generally speaking, a statically compiled binary is self-contained — it doesn't depend on external libraries at runtime, though the resulting file is larger. The usual way is to pass `--static` to gcc, but that turned out not to work here. Adding it to `-cflags` didn't help either.

#### GYP

GYP is a pain — it only supports Python 2.7. Lucky for me, both my Ubuntu and Windows machines have conda, so I just created an env with `conda create --name gypcom python=27`. GYP is a build system designed for large cross-platform projects. It can generate Visual Studio project files, Makefiles, Xcode project files, and so on. So far I've only used it to build YARA and ssdeep.

> 'includes': A list of of other files that will be included in this file. By convention, included files have the suffix .gypi (gyp include).

`gyp -I common.gypi -D target_arch=x86 --depth=. yara,gyp`

* common.gypi
* yara.gyp

GYP syntax is pretty flexible — you can use `[]` and `{}` nested freely to express the build hierarchy.

```
{
    'targets': [
    {
      'target_name': 'libyara',
      'type': 'static_library',

      "dependencies": [
        'openssl/openssl.gyp:openssl',
        'jansson/jansson.gyp:jansson',
      ],

      'sources': [
        '../libyara/ahocorasick.c',
        '../libyara/arena.c',
        '....'    #omitting a bunch more

      ],

      'defines': [
        'CUCKOO_MODULE',
        'HASH_MODULE',
        'FUZZYHASH_MODULE',
        'USE_NO_PROC',
        'HAVE_LIBCRYPTO',
      ],

      'include_dirs': [
        '../libyara/include',
        '../libyara',
        '../libyara/proc',
        './jansson/include',
        './openssl/openssl/include',
        '../libyara/modules/ssdeep',
      ],

      'conditions': [
        ['OS=="linux"', {
			'sources':['../libyara/proc/openbsd'],
            'libraries': ['-ldl'],
        }],
        ['OS=="win"', {
			'sources':['getopt.c','getopt.h']
        }]
      ],
    },
    {
      'target_name': 'yara',
      'type': 'executable',

      'dependencies': [
        ':libyara',
      ],

      'include_dirs': [
        '../libyara/include',
      ],

      'conditions': [
        ['OS=="linux"', {
            'libraries': ['-ldl'],
        }],
        ['OS=="win"', {
        }]
      ],

      'sources': [
        '../args.c',
        '../threading.c',
        '../yara.c',
      ],

      'msvs_settings': {
        'VCLinkerTool': {
          'AdditionalDependencies': [
            'crypt32.lib',
            'Advapi32.lib',
            'ws2_32.lib',
          ]
        }
      },
    },
    {
      'target_name': 'yarac',
      'type': 'executable',

      'dependencies': [
        ':libyara',
      ],

      'conditions': [
          ['OS=="linux"', {
              'libraries': ['-ldl'],
          }],
          ['OS=="win"', {
          }]
      ],

      'include_dirs': [
        '../libyara/include',
      ],

      'sources': [
        '../args.c',
        '../yarac.c',
      ],

      'msvs_settings': {
        'VCLinkerTool': {
          'AdditionalDependencies': [
            'crypt32.lib',
            'Advapi32.lib',
            'ws2_32.lib',
          ]
        }
      },
    }
  ]
}

    
```

### Writing ssdeep as a YARA Module

#### ssdeep and Fuzzy Hashing

ssdeep is the classic fuzzy hash implementation. After looking around, there's really just ssdeep plus bindings in various languages. Li Wei kept telling me to rewrite it from scratch, but I never did — honestly, it's not that easy to write.

#### YARA Modules

YARA uses macros heavily. Macros are great for controlling code modules and platform-specific headers. From a workflow standpoint, writing a module basically goes like this: define input parameters → read data blocks → parse in the module → return. Let's look at a rule from the built-in `hash` module:

```
  hash.sha1(0, filesize) == "7d564f9b4be82f140438a8c5b701e52d7b7315ba" 
```

So the key things to handle are:

* Define the parameters the rule needs when parsing
* Grab the memory block holding the file data
* Write your module functions, return a result, and compare against the pre-written rule

The corresponding functions are:

* `integer_argument(1)` — 1, 2, 3 are argument positions; in `hash.sha1(0, filesize)` above, `0` is argument 1, `filesize` is argument 2
* `string_argument(2)`
* `scan_context()`
* `first_memory_block(context)`
* `define_function`
* `return_integer`

Reading through the ssdeep source, the key interface is all in `fuzzy.h` — it can fuzzy-hash files directly or hash a buffer, and compare results either way.

So the rule I had in mind was: take the file size to fetch its content, compare it against a known fuzzy hash value, and get a similarity score (YARA will automatically scan hidden files too). Something like:

```
fuzzyhash.fuzzyhash(o,filesize,"fuuny:hash:value") > 80
```

The implementation looks like this:

```c
define_function(data_bufferfuzzyhash){

    // computer a sha256 as key to find the fhashdiff
    unsigned char digest[YR_SHA256_LEN];
    char digest_ascii[YR_SHA256_LEN * 2 + 1];
    char *cached_ascii_digest;

    char * fuzzyhashstring;
    fuzzyhashstring = (char *)malloc(FUZZY_MAX_RESULT);

    int64_t arg_offset = integer_argument(1);   // offset where to start
    int64_t arg_length = integer_argument(2);   // length of bytes we want hash on
    char *flag = string_argument(3);            // already known flag in yara rules , computer by ssdeep

    int64_t offset = arg_offset;
    int64_t length = arg_length;

    YR_SCAN_CONTEXT* context = scan_context();
    YR_MEMORY_BLOCK* block = first_memory_block(context);
    YR_MEMORY_BLOCK_ITERATOR *iterator = context->iterator;

    foreach_memory_block(iterator, block){

        
        uint8_t *block_data;
        block_data = block->fetch_data(block);

        if(block_data != NULL){
 
            int fhashdiff;
            fuzzyhash_get_from_cache(module(), "fuzzyhash", arg_offset, arg_length,fuzzyhashstring,fhashdiff);
 
            if(fhashdiff){
                free(fuzzyhashstring);
                return_integer(fhashdiff);
            }else{
                char *buff = (unsigned char*)(block_data);
                uint32_t data_len = strlen(buff);

                int status = fuzzy_hash_buf(buff, data_len, fuzzyhashstring);
                
                if(status){
                    return EXIT_FAILURE;
                }else{
                    fhashdiff = fuzzy_compare(fuzzyhashstring,flag);
                    if ( -1 == fhashdiff){
                        return EXIT_FAILURE;
                    }else{
                        if (fhashdiff != 0 ){
                            int rs = fhashdiff;
                            fuzzyhash_digest_to_ascii(buff,digest_ascii,YR_SHA256_LEN);
                            FAIL_ON_ERROR(fuzzyhash_add_to_cache(
                                module(),"fuzzyhash", arg_offset,arg_length,fuzzyhashstring,rs,digest_ascii));
                        }

                        free(fuzzyhashstring);                        
                        return_integer(fhashdiff);

                    }                           
                }
            }

        }
    }
}

```

### Enabling the Magic Module

The Windows build didn't fully succeed — well, it compiled, but it's not a true standalone. It needs two DLLs alongside it: `magic1.dll` and `regex.dll`. On Linux you just need to link `-lmagic -lz` and you're done. The magic module is essentially the Linux `file` command — it uses MIME types to help identify file types. For example, you can run this in a target directory:

`find ./ -type f -exec file --mime {}  \; | awk -F ":" '{print $2}'`

to see the MIME info for everything. And if you don't want to enable the magic module, you can still do file type detection via hex strings — which is actually what the magic module is doing under the hood anyway.

### Performance Optimization and Hash Tables

#### Performance Optimization

Obviously, as the rule count grows and the number of files to scan increases, the scan count explodes to m×n. One way to handle this is a hash table — cache previous results and look them up instead of recomputing. This works well for the hash module: you just compute the hash of the block data, and since hash values are unique, you can stash and retrieve them directly. Fuzzy hashing is a different story though — the output is an actual similarity score, not a fixed hash. So you can only store the block data and its fuzzy hash, not the comparison result. That means turning "compute hash + compare" into "compute hash + look up" — which honestly didn't help that much in practice... (yeah, I'm bummed about it too)

#### Hash Table

uthash and yara_hash_table.

### Where Do YARA Rules Come From?

What kinds of rules are there? Beyond the common ones — `ip`, `dns`, `sha1`, `md5` (useful for allowlists and blocklists) — there's plain string matching. Inside a rule, beyond key string matches, you also have `meta` header info. Once you add a `description` field (not a keyword, you name it yourself), you can output it with `-m`. One gotcha: rules don't support non-ASCII, so even if you write Chinese characters in a rule, the terminal spits out octal — every three characters represent one Chinese character when decoded.

`private` and `global` — `private` means the match won't be printed to the terminal. `global` applies the rule everywhere, so `global private` gives you a global gate condition that stays silent. Say you want to scan a directory but only care about `php` and `asp` files, not images or Office documents (images can carry image-based backdoors — that's a topic for another time):

```
import "hash"
include "whitelist.yar"

global  private rule ISPHP {

    meta:
                descrption = "I am a Chinese comment that won't show up"
 
   strings:
               $php = /<\?[^x]/
               $yoyostring = "jiushigezifuchuan"
               $ = "daxiao dou xing " fullword nocase
               $hexstring = {12 34 54 43 }
               $fuzzyhexstring = { 12 32 23 ?? 32 }
               /*check the header with file*/


   condition:
              hash.sha1(0,filesize) == "wozheshigejiade sha1 hash" or 
              hash.md5(0,filesize) == "zhegeyeshijiade a" or

             $php and filesize < 5MB and not Iswhitelist

}

```

* Collect webshells, malware samples, etc. via honeypots or IDS, then build your own rules
* Malware Information Sharing Platform and Threat Sharing (really solid, very important — MISP for short; APT detection basically needs it, might write about it later)
* virustotal — they offer official rules
* Hunt for rules on GitHub (or malware samples for that matter); Pastebin works too
* clamAV 2 yara rules (there's a script in the virus analysis book, and ClamAV ships daily, weekly, and monthly updated DBs — though the database is large, so the resulting ruleset gets big)
* YarGen (data quality matters here; noisy input gives you noisy rules)


### YARA Ecosystem

* [Remote YARA scanning](https://github.com/aboutsecurity/rastrea2r)
* [YARA editor](https://github.com/Tigzy/yaraeditor)
* IOC scanner — a nice symbiotic relationship: you can use known YARA rules to scan unknown samples and discover new IOCs, then feed those samples back in to keep improving your rules.

### Closing Thoughts

YARA is fundamentally a powerful string-matching engine — using it for detection is just one small application of that matching capability in the security space. You could just as easily apply YARA rules to Pastebin crawl data to pull out interesting content. Of course, rule quality dictates how well it actually works on your targets — rules decide everything (yeah, obvious, it's a rule-matching tool). But that doesn't mean there's no room to improve. For example, after writing PHP webshell detection rules, you'll find they catch webshells pretty well — but they'll also throw a ton of false positives against normal stuff like WordPress. So you need a whitelist. Problem is, WordPress across all versions has hundreds of thousands of files, meaning hundreds of thousands of whitelist entries, and the full whitelist isn't small (I forget exactly how many MBs). The practical solution: only whitelist what actually false-positives, and do it incrementally. Both approaches work. Using YARA with ssdeep is a solid technique, but it's definitely not the only one — plenty of other approaches out there. (Not exactly a groundbreaking observation, I know.)

### Reference

* [GYP Documentation](https://gyp.gsrc.io/docs/UserDocumentation.md/)
* [Ssdeep](https://ssdeep-project.github.io/ssdeep/index.html)
* [Linux 下用gcc编译](https://ixyzero.com/blog/archives/3602.html)
* [Yara编写模块](http://yara.readthedocs.io/en/v3.7.0/writingmodules.html)

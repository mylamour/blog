---
layout: post
title:  Yara模块编写与gyp的跨平台编译
categories: 安全工程师
kerywords:  Yara 安全研发
tags: 入侵检测与反入侵 工具 安全研发
---

## 前言

首先感谢我李伟大佬，然后还有我的新来的c/c++同事,帮助我解决了好几个bug. 虽然有很长一段时间不再写c/c++,然而面临为Yara写模块的时候，只能迫不得已的捡起来写了一周的c/c++。

### 静态编译和gyp

#### 静态编译

什么是静态编译呢？
一般来说，静态编译后可单独运行，不再依赖其他文件，但编译后的文件较大，使用gcc进行静态编译时 `--static`就行了，但是这个居然不行。`-cflags`里加了也不行。

#### gyp

坑爹的gyp只支持py2.7，还好我的`ubuntu`和`win`都有`conda`,就创建了一个`conda create --name gypcom python=27`. gyp是用来为大型项目构建跨平台编译的一套构建系统。可以生成`Visual Studio`项目文件，`Makefile`,`XCode`项目文件等等。目前来说，只用其进行了对`Yara`和`ssdeep`的构建。
> 'includes': A list of of other files that will be included in this file. By convention, included files have the suffix .gypi (gyp include).

`gyp -I common.gypi -D target_arch=x86 --depth=. yara,gyp`

* common.gypi
* yara.gyp

gyp的写法比较随意，可用[]和{}层叠嵌套。将层级间的属性写进去。

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
        '....'    #省略一大堆

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

### 把ssdeep编写为Yara模块

#### ssdeep 与fuzzyhash

ssdeep是fuzzyhash的经典实现，看来看去，就只有ssdeep和不同的语言binding，虽然被李伟说了好几次让重写，但是还是没写，也写不出来。没那么好写。

#### Yara模块

yara里面采用了大量的宏定义，宏定义可以很好的控制代码模块，以及不同平台所需要的头文件啊之类的，至于写模块，从流程上来讲应该是定义输入参数，然后读取数据块，模块进行解析，返回。 我们先来看一下一条`hash`模块的规则。

```
  hash.sha1(0, filesize) == "7d564f9b4be82f140438a8c5b701e52d7b7315ba" 
```

所以关键点的应该是，

* 定义规则解析时需要的参数
* 获取读取文件数据的内存块
* 编写自己的模块(就是一些函数)，返回结果，和预先编写的规则进行比较

对应的函数就有

* integer_argument(1)  , 1,2,3就是参数的位置，例如在上面的hash.sha1(0,filesize)里0就是第一个参数，2就是第二个参数
* string_argument(2)
* scan_context();
* first_memory_block(context);
* define_function
* return_integer

然后通过对`ssdeep`的阅读，可以看到关键接口都在`fuzzy.h`里，有对文件直接`fuzzyhash`然后比较，同时也可以对`buff`进行`fuzzyhash`，并比较。

所以预想的规则应该是通过输入文件的大小去获得其内容与已知的fuzzyhash值进行比较，得到一个阈值(Yara本身会自动扫描隐藏文件)。如下：

```
fuzzyhash.fuzzyhash(o,filesize,"fuuny:hash:value") > 80
```

代码如下:

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

### 开启magic模块

Windows版本的没编译通过，其实是通过，但是不是纯粹的standalone,需要带着两个dll, `magic1.dll和regex.dl`l ,Linux版本的只需要增加`-lmagic, -lz `链接. magic模块就是linux的file命令,通过mime辅助判断文件类型,例如,可以在目标文件夹运行:
`find ./ -type f -exec file --mime {}  \; | awk -F ":" '{print $2}' ` 即可查看MIME信息,当然在不开启magic模块的情况下,还可以通过hexstring进行判断,毕竟magic模块就是根据hexstring进行判断的.

### 性能优化和hashtable

#### 性能优化

很明显的，当规则数目增加，扫描文件数增加，扫描次数会骤增至m*n，此时，可以通过hsahtable对其优化，将之前的结果放到hashtbale里，然后通过查找hashtable来提高性能。但是这个方式对于hash模块可以，只需要计算其blockdata后的hash值，因为hash值唯一，所以可以直接放进去，查找。但是fuzzyhash则不然,因为输出的是一个具体比较后的数值，所以，只能通过计算blockdata和其fuzzyhash值，而不是存储比较后的值，以至于将计算hash和计算比较的过程变成了计算hash到查找这两个步骤，但是效果并不是很理想.....(我也很心塞啊...)

#### hashtable  

uthash 以及 yara_hash_table

### Yara规则从哪里来

规则有哪些，层面有哪些。除去这些通用的 `ip`, `dns`, `sha1`, `md5`(可以拿来做白名单和黑名单),就是更加通用的字符串匹配。在一个规则中，除了有关键字符串匹配之外，还有`meta`头信息。添加`descrption`(这个不是关键字，是自己添加的)字段信息之后，就能通过`-m`输出.但是规则并不支持费ASCII码，所以即便是在规则中写了汉字，输出的时候终端显示的是八进制，进制转换之后，以每三个字符为一组是一个汉字。
`private` 和 `global`,`private`是输出不会在终端显示。同时`global`是全局的，所以`global private`可以起到全局的关键判断，同时不会显示。例如你需要去扫描一个目录，但是你只想扫描`php`,`asp`,但是不想扫描图像文件或者office文件(图像文件也可能是图像马，针对如何避免图像马，回头再说)

```
import "hash"
include "whitelist.yar"

global  private rule ISPHP {

    meta:
                descrption = "我是汉字我不显示"
 
   strings:
               $php = /<\?[^x]/
               $yoyostring = "jiushigezifuchuan"
               $ = "daxiao dou xing " fullword nocase
               $hexstring = {12 34 54 43 }
               $fuzzyhexstring = { 12 32 23 ?? 32 }
               /*通过file 看一下头*/


   condition:
              hash.sha1(0,filesize) == "wozheshigejiade sha1 hash" or 
              hash.md5(0,filesize) == "zhegeyeshijiade a" or

             $php and filesize < 5MB and not Iswhitelist

}

```

* 收集`webshell`恶意软件等等，通过蜜罐网络或者IDS等等,然后自己构建规则
* Malware Information Sharing Platform and Threat Sharing (非常好，很重要，简称MISP, APT检测就需要其作为辅助，以后可能写一下)
* virustotal 官方提供
* 去github上收集规则，(也可以市恶意软件), Pastbin也行
* clamAV 2 yara rules (病毒分析这本书里有提供脚本，而且ClamAV提供的有日更新的db和周，月。但是，由于数据库很大，导致规则集也很大)
* YarGen (对数据的纯度有一定的要求，要不然就不行，规则会有噪音。)


### Yara周边

* [远程Yara扫描](https://github.com/aboutsecurity/rastrea2r)
* [Yara编辑器](https://github.com/Tigzy/yaraeditor)
* IOC 扫描器，相爱相杀，可以通过已知的Yara规则去扫描未知样本发现IOC，以及新的样本，同时这些样本又可以拿来继续补充进来。

### 后记

Yara本身是一个强大的字符串匹配利器,用于检测只是其匹配功能在安全领域上的一个小应用,例如还可以使用Yara规则对爬取pastbin后的数据进行抽取有兴趣的内容.当然Yara的规则质量,限定了其在目标上应用的质量.也就是说,规则决定一切(废话,这个本身就是规则匹配工具).但是并不意味着,这样就不能有所改进.例如,写完对php的webshell检测后,会发现其对webshell有很好的检测,但是对正常的如wordpress会存在大量的误报,所以需要增加白名单,但是,WordPress全版本有十几万个文件,也就意味着有十几万条记录进去,生成的全部白名单必然不小(具体几M忘了),所以可以在扫描后只添加误报的,也可以增量更新.都是可以的.虽然使用yara和ssdeep是一个非常有效的方式,但是这并不是唯一的方式,还有其他许多方式(这不是废话吗..)

### Reference

* [GYP Documentation](https://gyp.gsrc.io/docs/UserDocumentation.md/)
* [Ssdeep](https://ssdeep-project.github.io/ssdeep/index.html)
* [Linux 下用gcc编译](https://ixyzero.com/blog/archives/3602.html)
* [Yara编写模块](http://yara.readthedocs.io/en/v3.7.0/writingmodules.html)
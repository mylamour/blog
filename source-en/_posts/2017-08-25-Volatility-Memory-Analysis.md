---
layout: post
title: Memory Forensics, Password Extraction, and Using Volatility
categories: Security Engineer
keywords: memory forensics password extraction Volatility
tags: tools forensics
translated: true
---

#### Intro: Overview

This month I started using `Volatility` for memory forensics and password extraction. Along the way I also played around with `Lan Turtle` and `Leonarde`. `Leonarde` is basically just a keyboard emulator — pretty limited. `Lan Turtle`, on the other hand, is seriously powerful.

`Volatility` has a solid reputation, and the more I used it, the more impressed I was. Respect.

#### Step 1: Grab a Memory Image

Before you can analyze anything, you obviously need to get your hands on a memory image first.

* Windows

> Super easy — just use [dumpit.exe](https://github.com/mylamour/-_--Forensics-Tools/raw/master/utils/DumpIt.exe). For remote targets you can use `F-Response`. There are actually quite a few tools for Windows memory imaging, so I won't list them all here.

* Linux
> A bit more involved — you need `LIME`. You used to be able to use `dd`, but modern Linux kernels no longer allow `dd` to read more than 1MB of memory space.

```bash
$ git clone https://github.com/limetext/lime
$ cd src
$ make

....
  CC [M]  /home/mhl/Downloads/src/tcp.o
  CC [M]  /home/mhl/Downloads/src/disk.o
....
$ sudo insmod lime-4.10.0-30-generic.ko "path=/home/mour/ubuntu_test1704.lime format=lime"
```

#### Step 2: The Prerequisite — You Need a `profile`

Once you have the memory image, you're ready to start analyzing. But first you need a `profile`. A profile is basically the memory map and debug info compressed together, which Volatility reads to make sense of the image. Windows and Linux differ here: Windows profiles are portable — you can often reuse them across machines, which is why a few commonly-used versions get recommended around. Linux profiles are much stricter. They must match:

* CPU architecture
* Kernel version
* Distro version

The official [profile creation guide](https://github.com/volatilityfoundation/volatility/wiki/Linux) is out there, but it's a bit dated. There's a much easier way now.

1. Check your kernel version and install the matching `Header` files

> ![image](https://img.iami.xyz/images/volatility/0814jietu2.png)

2. Build the `dwarf` file

> This step used to be a huge pain in the original docs. But newer versions of `volatility` already ship a `makefile` script that handles the whole thing.

```bash
$ cd volatility/tools/linux
$ make
```

3. Merge the `System Map` file with the `dwarf` file

![image](https://img.iami.xyz/images/volatility/0814jietu1.png)

4. Put the `profile` in `volatility/volatility/plugins/overlays/`. One thing to watch out for: don't dump all your profiles in there at once. Only load what you need. Since Volatility loads all plugins on startup, having too many profiles will make it crawl.

#### Step 3: The Standard Playbook

Standard routine: scan the image to identify it (if you already know the OS, skip this and just specify the `profile` directly). Then run analysis using the appropriate `profile`. You can also load different plugins for different tasks.

* Check available profiles

> `python vol.py --info | grep Linux`

You can drop custom profiles into `volatility/plugins/overlays/`, then use the command above to find the profile name and use it.

1. Windows Platform

* Dump all DLLs from memory to local disk

> `python vol.py -f win7.vmem --profile=Win7SP1x64 dlldump -D dlls/`

* List Windows processes

> `python vol.py -f win7.vmem --profile=Win7SP1x64 pslist`

* View all network connections

> `python vol.py -f win7.vmem --profile=Win7SP1x64 netscan`

* View all handles

> `python vol.py -f win7.vmem --profile=Win7SP1x64 handles`

* Check command history
* Browse the registry, and so on

From the wiki you can see what Volatility supports. The areas I care most about (Windows-focused) are:

* Image Identification
* Processes and DLLs
* Process Memory
* Kernel Memory and Objects
* Networking
* Registry
* Crash Dumps, Hibernation, and Conversion
* File System
* Miscellaneous

Going through each one individually would take forever. One thing worth highlighting is `Volshell` — it's quite useful. Combined with `yara`, you can also scan memory for malware.

`volshell` gives you an interactive shell on the memory image. Anything you can do on the command line, you can do in the shell. Straight from the [docs](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference#volshell):

* List processes
* Switch into a process's context
* Display types of structures/objects
* Overlay a type over a given address
* Walk linked lists
* Disassemble code at a given address

#### Step 4: Extracting Passwords and Some Fun Tricks

Password extraction is the basics. Windows login passwords use `NTLMv1` or `NTLMv2`. Windows 7 and earlier use `NTLMv1`. You can generate the hash in Python like this:

```python
import hashlib,binascii
hash = hashlib.new('md4', "sad".encode('utf-16le')).digest()
print (binascii.hexlify(hash))
```

How to extract:
`$ python -f xxxx.vmem --profile=Win7SP1x64 hashdump`

A lot of old docs say you need to find the base address and then the offset before you can dump hashes. In practice, you don't need to do that.

If you have admin rights, you can also extract passwords directly using `mimikatz` (Windows). It works both interactively and as a one-liner (using the `log` option):
`mimikatz logs "privilege::debug";sekurlsa::logonpasswords`

Combine that with `Leonarde` and it sounds delightfully sneaky — though `Leonarde`'s virtual keyboard emulation has its share of issues. I followed [this article](http://www.freebuf.com/sectool/107242.html), tweaked the code a bit to get it working. No idea why the comment section was full of complaints — there were definitely some issues, but they were all fixable.

Extracting browser passwords:

> Get the browser process, dump the entire process space using the `vad` plugin, then analyze it or `grep` for keywords.

Actually the simplest way is just to use `WinHex` to search the memory image directly. `grep` works the same way.

Extracting passwords past a locked screen:

Using `Lan Turtle` — this thing is genuinely devious. It can bypass locked screens by exploiting a vulnerability in the `Responder` authentication mechanism. That said, the conditions are pretty specific: on Win7 at least, if the user has already selected a network location, it won't work. Wireless-only also doesn't work. But some of the demos on `hak5` show it working. The real value of `Lan Turtle` is stealth and internal network recon. I wouldn't recommend enabling `Quick Cred` directly — better to just reverse a `ssh` or `meterpreter` tunnel first, then enable `Responder` to do the poisoning later. Stay under the radar. Pick your timing. Also, this has nothing to do with Linux. I only got it working successfully on one Win10 machine.

#### Step 5: Malware Analysis and Rebuilding Binaries

VAD (Virtual Address Descriptor) is an important reference point in memory forensics.

* [Malware analysis](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference-Mal):
1. Command line plus `yara` to scan against rules
2. Main process analysis, extra DLL analysis, process injection analysis, network behavior, etc. All manual... You can also generate a `vadmap` graph that opens in `graphviz`.

* Rebuilding binaries
Honestly doesn't need its own section — the fancy name makes it sound more impressive than it is. It's basically just extracting a process, same as before. Use `vaddump`.

#### Not FAQ

* When capturing a memory image, you'll grab the entire host machine's image — including any running VMs. This is actually pretty common in the real world. So what do you do?

> Extract the VMware process address space first, then analyze the guest OS inside VMware using the appropriate profile.

![image](https://img.iami.xyz/images/volatility/0817jietu.png)

* Linux kernel 4.8+ uses randomized memory addresses (KASLR). Now what?

![image](https://img.iami.xyz/images/volatility/0818jietu.png)

* Files are scattered on disk but get loaded into a contiguous region in memory when executed. However, PE files are loaded into memory by the OS, so the memory mapping is slightly different. I haven't found good docs on exactly how they differ.

* `raw` vs `dmp` vs `vmem`

* Check whether the profile zip needs to include a directory structure inside. Mine worked without it, but the built-in profiles have one.

* `powershell.exe -command start-process powershell -verb runAs`

* `Rekall` is also a solid memory forensics framework worth checking out.

#### Conclusion

* [How to write a `volatility` plugin](https://github.com/iAbadia/Volatility-Plugin-Tutorial)

My trial period ended today and I'm moving on to a new project: Windows malware detection. I'm starting to notice some issues with the company. There's not much culture of technical exchange here. So me and another colleague decided to just organize something ourselves. In a way, this shows that the more "normal" something seems, the harder it actually is to make happen. You have to go through a lot of friction (or maybe get lucky) before something that feels natural and convenient can take shape. Things I used to think were completely ordinary turned out to be surprisingly hard to push through.

On a different note, there's a veteran at the company who comes in weekly to share. Apparently 20 years in internet tech, brought in by the boss as a distinguished guest. Used to lead teams at Venustech, impressive resume, and everyone thinks he's great. His C++ and Python are legitimately solid. But you know how it is — a big reputation doesn't always match the reality. Hard to say more. He's a decent person though.

#### Resources

* [LIME](https://github.com/504ensicsLabs/LiME)
* [F-Response](https://www.f-response.com/software/ee)
* [Volatility Wiki](https://github.com/volatilityfoundation/volatility/wiki/)
* [Volatility Malware Find](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference-Mal)
* [volatility simple tutorial](http://www.hackingarticles.in/volatility-an-advanced-memory-forensics-framework/)
* [Creating a profile](https://github.com/volatilityfoundation/volatility/wiki/Linux#creating-a-new-profile)
* [PEB]()
* [VAD: Understanding Virtual Address Descriptors](http://lilxam.tuxfamily.org/blog/?p=326&lang=en)
* [Managing Virtual Memory](https://msdn.microsoft.com/en-us/library/ms810627.aspx)
* [rainbow crack](http://project-rainbowcrack.com/)
* [Kernel Address Space Randomization in Linux or how I made Volatility bruteforce the page tables](https://bneuburg.github.io/volatility/kaslr/2017/04/26/KASLR1.html)
* [What is dwarfdump](http://wiki.dwarfstd.org/index.php?title=Libdwarf_And_Dwarfdump#What_is_dwarfdump)
* [LAN Turtle](https://lanturtle.com/)
* [-_--Forensics-Tools](https://github.com/mylamour/-_--Forensics-Tools/)
* [mimikatz](https://github.com/gentilkiwi/mimikatz)
* [mimikatz against virtual machine memory](http://carnal0wnage.attackresearch.com/2014/05/mimikatz-against-virtual-machine-memory.html)
* [Responder](https://github.com/SpiderLabs/Responder)
* [snagging-creds-from-locked-machines](https://room362.com/post/2016/snagging-creds-from-locked-machines/)

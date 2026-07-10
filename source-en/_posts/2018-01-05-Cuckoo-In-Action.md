---
layout: post
title: Cuckoo Sandbox Gotchas You Should Know
categories: Security Engineer
kerywords: Cuckoo Sandbox malware analysis Webshell detection dynamic analysis
tags: Intrusion Detection Tools
translated: true
---
### Installation
> There are quite a few gotchas — both installation and day-to-day usage are a pain. Keeping track of them here.

`pip install -U cuckoo`
> For screenshots install `pillow`, for packet capture install `tcpdump`, for memory analysis install `volatility`

### Basic Usage

```
cuckoo community                            # pull the community ruleset first
cuckoo submit --url http://malware.com
cuckoo web runserver                        # needs mongodb configured in reporting.conf
```
The web UI is pretty straightforward, nothing special to say about it.


* Config files live at `~/.cuckoo/conf` by default. The `cuckoo` directory is your workspace, i.e. your `$CWD`.

> * cuckoo.conf — main/global config
> * virtualbox.conf — VM settings: which VM to use, callback IP, port, etc. Use this if you're on VirtualBox; for VMware use vmware.conf, and so on for other hypervisors.
> * auxiliary.conf
> * reporting.conf — controls report output format. Also, Cuckoo can integrate with MISP — actually pretty useful.

* Directory layout:
> `.cuckoo/storage/analyses` stores post-analysis files, organized by task ID.
![2018-01-05 16-43-36](https://img.iami.xyz/images/34602426-a60bf966-f23a-11e7-9137-aabc50b4058f.png)


`report.json` stores the full report in JSON format — just feed it to YARA for matching. Having a Cuckoo module helps. Personally I don't think this approach works great for webshell detection. Even for other detection scenarios, it's still relying on its own built-in rules. Then again, a sandbox is supposed to do its own analysis.

* `$CWD` is a relatively new concept in Cuckoo — it's there to let you set up isolated workspaces.
* `$ROOT` is similar but not really used yet. It's meant to grant certain commands root privileges to Cuckoo — the idea is you'd create a dedicated `cuckoo` user first, then use this.


### Gotchas and Things to Watch Out For

* Don't trust error messages too much — they're not always accurate. The messages themselves say "possible", so even Cuckoo isn't sure. (Someone new pointed this out, and they were right.)

* Error 99 — create the host-only network adapter:
> 
```
VBoxManage hostonlyif create
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0
```

* Create the VM, start `Agent.py`, and verify host-guest connectivity. Take a snapshot at this point. Test whether you can create directories via `curl`. If it fails, the error won't tell you much — just something like `AnalysisManager.run`. Usually it's a permissions issue on the directory, so either fix the permissions or run `sudo python agent.py`.

* Remember to install a bunch of software on your guest VM — PDF reader, Office suite, whatever's needed to actually open the files you're submitting.

* Stick with Python 2.7, not Python 3. Even if you patch it to stop throwing errors, it still won't work right. (Probably hiding bugs somewhere that haven't surfaced yet.)

* `libcurl.so.4` issues — find where the library is and re-symlink it: `ln -s`

* Virtualbox Kernel driver not installed:
>
```
sudo dpkg-reconfigure virtualbox-dkms
sudo dpkg-reconfigure virtualbox
sudo modprobe vboxdrv
```
* Don't install MongoDB's Python driver manually — you might get bson version conflicts. The cleanest fix is to just create a fresh virtualenv.

* When debugging, first figure out whether it's a VM issue or a config issue.

* Test whether you can restore a snapshot from the command line:
> 
```bash
VBoxManage snapshot cuckoo1 restorecurrent
VBoxManage controlvm cuckoo1 poweroff
VBoxManage snapshot cuckoo1 take test1 --pause
```

* When enabling IP forwarding, check if ufw is running — disable it before configuring, and make sure port 2042 is allowed through.

* VirusTotal offers a free API key for Cuckoo — nice touch.

### Reference

* [Cuckoo Basic Deployment Guide](https://blog.pandashare.com/2017/09/01/cuckoo-sandbox.html)
* [Cuckoo Doc](http://docs.cuckoosandbox.org)
* [Cuckoo FAQ](http://docs.cuckoosandbox.org/en/latest/faq/)
* [Virtualbox Kernel driver not installed](https://askubuntu.com/questions/41118/virtualbox-kernel-driver-not-installed)

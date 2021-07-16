---
layout: post
title: Let's get start to fuzzing firefox browser with grizzly
categories: 安全工程师
kerywords: Fuzzing grizzly
tags: Fuzzing
---

[grizzly](https://github.com/MozillaSecurity/grizzly/) is cross platform browser fuzzing framework, when we read the introduction.  it was developed by Mozilla Security. In this blog, i will show you how to use it to start browser fuzzing. This tutorial was running on my `windows` computer

This is the finally status:

![image](https://user-images.githubusercontent.com/12653147/62222783-7fd49900-b3e6-11e9-97f5-fbb1fe0567dc.png)

So. let's beginning.

First, we need to follow [this](https://github.com/MozillaSecurity/grizzly/wiki/Getting-Started) instruction to install `grizzly`

* install grizzly

```bash
git clone https://github.com/MozillaSecurity/grizzly.git
python -m pip install -e grizzly --user
```

* install testcase reducer
```baash
git clone https://github.com/MozillaSecurity/lithium.git
python -m pip install -e lithium --user
```

* install firefox support
```bash
git clone https://github.com/MozillaSecurity/ffpuppet.git
python -m pip install -e ffpuppet --user
```
* download firefox build viaa fuzzfetch
```bash
git clone https://github.com/MozillaSecurity/fuzzfetch.git
python -m pip install -e fuzzfetch --user
python -m fuzzfetch -a -n firefox --fuzzing -o browsers/
```

* download prefs.js
```bash
wget -O ./browsers/prefs.js https://raw.githubusercontent.com/MozillaSecurity/fuzzdata/master/settings/firefox/prefs-default-e10s.js
```

![image](https://user-images.githubusercontent.com/12653147/62223561-bb239780-b3e7-11e9-8045-d48f19ef82e6.png)

Now, you can running it with `no-op` adapter, because there was only one adapter was being installed by default, also you have no choice to find new one. you must write it by yourself. So, we can run it firstly:
![image](https://user-images.githubusercontent.com/12653147/62224502-66811c00-b3e9-11e9-984c-500ab25325e7.png)

But if you want another adapter, what should i do ?

![image](https://user-images.githubusercontent.com/12653147/62224928-08a10400-b3ea-11e9-9aa7-bdc8be6deebe.png)

Now, you can see this example. it was create from [wiki](https://github.com/MozillaSecurity/grizzly/wiki/Writing-an-Adapter), but it not suitable to Windows. so let's change it.

* download domato (Dom fuzzer was developed by google project zero)

```bash
git clone --depth=1 https://github.com/googleprojectzero/domato
```

in this tutorial, i put in this place:

![image](https://user-images.githubusercontent.com/12653147/62225189-8a912d00-b3ea-11e9-8fa3-3b18bb0dfd6f.png)

Now, we need to modify the script  to make it suitable for windows. 
* `tempfile` can not used in windows
* `subprocess` was error `winError xx`
* windows path format
* environment problem

also, you need make sure you fuzz data was generator correctly. So you need time sleep.

```python
import os
import uuid
import random
import shutil
import subprocess
import tempfile
import time

from grizzly.common import Adapter, TestFile

DOMATO_PATH = "../../domato/generator.py"

class BasicExampleAdapter(Adapter):
    NAME = "basic"

    def setup(self, _):
        self.enable_harness()
        # create directory to temporarily store generated content
        self.fuzz["tmp"] = "./fuzztest{}".format(random.random()) #os.path.join('../../domato/','fuzz_gen{}'.format(str(uuid.uuid1()).split("-")[0]))   # tempfile.mkdtemp(prefix="fuzz_gen_")

        os.mkdir(self.fuzz['tmp'])
        
        if os.environ.get("FUZZTOOL"):
            run = "pythoh {}".format(os.environ["FUZZTOOL"])
        else:
            run = "pythoh {}".format(DOMATO_PATH)
        # command used to call fuzzer to generate output
        self.fuzz["cmd"] = [
            run,  # binary to call
            "--no_of_files", "1",
            "--output_dir", self.fuzz["tmp"]
        ]

        
    def generate(self, testcase, *_):
        # launch fuzzer to generate a single file
        # subprocess.check_output(self.fuzz["cmd"])
        # subprocess.Popen(self.fuzz["cmd"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE )

        # lookup the name of the newly generated file on disk

        os.system("python ../../domato/generator.py --no_of_files 10 --output_dir {}".format(self.fuzz["tmp"]))
        time.sleep(3)

        gen_file = os.path.join(self.fuzz["tmp"], os.listdir(self.fuzz["tmp"])[0])
        # create a TestFile from the generated file
        test_file = TestFile.from_file(gen_file, testcase.landing_page)
        # remove generated file now that the data has been added to a test file
        os.remove(gen_file)
        # add test file to the testcase
        testcase.add_file(test_file)

    def shutdown(self):
        # remove temporary working directory if needed
        if os.path.isdir(self.fuzz["tmp"]):
            shutil.rmtree(self.fuzz["tmp"], ignore_errors=True)
```

Now, you would found, it can be used correctly for custom fuzzer adapter. As you viewed as beginning. When i try to run this demo, it was caused about 2 days. Also there was another reason. for example. horriable network... So, next step, we should waiting and reading the source code. 



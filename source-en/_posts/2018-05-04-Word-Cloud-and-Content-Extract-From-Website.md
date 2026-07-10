---
layout: post
title: Automatic Content Extraction from Web Pages and Word Cloud Visualization
categories: Security Engineer
kerywords: web content extraction word cloud
tags: learning data mining
translated: true
---

Recently got a batch of data that needs analysis. The usual approach would be to parse and process it with bs4 to extract content. However, I'd heard about automatic web content extraction before, so I decided to give it a try. Using `CxExtractor` from [cx-extractor-python](https://github.com/chrislinan/cx-extractor-python)

The automatic web content extraction methods I know of are:

* Based on line block distribution
* Based on text density

The method tried in this post is based on line block distribution. [CxExtractor](https://github.com/chrislinan/cx-extractor-python/blob/master/CxExtractor.py)
![img](https://raw.githubusercontent.com/chrislinan/cx-extractor-python/master/img/2.png)

Read -> Extract -> Filter, that's it

```python
import re
import chardet
import requests

class CxExtractor:
    """cx-extractor implemented in Python"""

    __text = []
    # __threshold = 186
    __indexDistribution = []
    # __blocksWidth = 3

    def __init__(self, threshold=86, blocksWidth=3):
        self.__blocksWidth = blocksWidth
        self.__threshold = threshold

    def getText(self, content):
        if self.__text:
            self.__text = []
        lines = content.split('\n')
        for i in range(len(lines)):
            # lines[i] = lines[i].replace("\\n", "")
            if lines[i] == ' ' or lines[i] == '\n':
                lines[i] = ''
        self.__indexDistribution.clear()
        for i in range(0, len(lines) - self.__blocksWidth):
            wordsNum = 0
            for j in range(i, i + self.__blocksWidth):
                lines[j] = lines[j].replace("\\s", "")
                wordsNum += len(lines[j])
            self.__indexDistribution.append(wordsNum)
        start = -1
        end = -1
        boolstart = False
        boolend = False
        for i in range(len(self.__indexDistribution) - 1):
            if(self.__indexDistribution[i] > self.__threshold and (not boolstart)):
                if (self.__indexDistribution[i + 1] != 0 or self.__indexDistribution[i + 2] != 0 or self.__indexDistribution[i + 3] != 0):
                    boolstart = True
                    start = i
                    continue
            if (boolstart):
                if (self.__indexDistribution[i] == 0 or self.__indexDistribution[i + 1] == 0):
                    end = i
                    boolend = True
            tmp = []
            if(boolend):
                for ii in range(start, end + 1):
                    if(len(lines[ii]) < 5):
                        continue
                    tmp.append(lines[ii] + "\n")
                str = "".join(list(tmp))
                if ("Copyright" in str or "版权所有" in str):
                    continue
                self.__text.append(str)
                boolstart = boolend = False
        result = "".join(list(self.__text))
        return result

    def replaceCharEntity(self, htmlstr):
        CHAR_ENTITIES = {'nbsp': ' ', '160': ' ',
                         'lt': '<', '60': '<',
                         'gt': '>', '62': '>',
                         'amp': '&', '38': '&',
                         'quot': '"', '34': '"', }
        re_charEntity = re.compile(r'&#?(?P<name>\w+);')
        sz = re_charEntity.search(htmlstr)
        while sz:
            entity = sz.group()
            key = sz.group('name')
            try:
                htmlstr = re_charEntity.sub(CHAR_ENTITIES[key], htmlstr, 1)
                sz = re_charEntity.search(htmlstr)
            except KeyError:
                # Replace with empty string
                htmlstr = re_charEntity.sub('', htmlstr, 1)
                sz = re_charEntity.search(htmlstr)
        return htmlstr

    def getHtml(self, url):
        response = requests.get(url)
        encode_info = chardet.detect(response.content)
        response.encoding = encode_info['encoding']
        return response.text

    def readHtml(self, path, coding):
        page = open(path, encoding=coding)
        lines = page.readlines()
        s = ''
        for line in lines:
            s += line
        page.close()
        return s

    def filter_tags(self, htmlstr):
        re_nav = re.compile('<nav.+</nav>')
        re_cdata = re.compile('//<!\[CDATA\[.*//\]\]>', re.DOTALL)
        re_script = re.compile(
            '<\s*script[^>]*>.*?<\s*/\s*script\s*>', re.DOTALL | re.I)
        re_style = re.compile(
            '<\s*style[^>]*>.*?<\s*/\s*style\s*>', re.DOTALL | re.I)
        re_textarea = re.compile(
            '<\s*textarea[^>]*>.*?<\s*/\s*textarea\s*>', re.DOTALL | re.I)
        re_br = re.compile('<br\s*?/?>')
        re_h = re.compile('</?\w+.*?>', re.DOTALL)
        re_comment = re.compile('<!--.*?-->', re.DOTALL)
        re_space = re.compile(' +')
        s = re_cdata.sub('', htmlstr)
        s = re_nav.sub('', s)
        s = re_script.sub('', s)
        s = re_style.sub('', s)
        s = re_textarea.sub('', s)
        s = re_br.sub('', s)
        s = re_h.sub('', s)
        s = re_comment.sub('', s)
        s = re.sub('\\t', '', s)
        # s = re.sub(' ', '', s)
        s = re_space.sub(' ', s)
        s = self.replaceCharEntity(s)
        return s

```


You can click over to take a look, not hard to understand, and it's pretty simple to use in my scenario. However, the results weren't perfect for my use case. That's because the HTML here is in report format, and the extracted mobile data includes everything - WeChat chat records, deleted data, basically all the data. The report format is very structured, there's no so-called large main body, most of the data is very regular. So the results aren't 99% perfect, but they're already pretty good. Just need a bit more processing. Saved a lot of time.
![2018-05-04 11-24-49](https://img.iami.xyz/images/39628419-9dda3a56-4fdb-11e8-994b-fea32865ec9a.png)

```python
 import glob
 import codecs
 import queue
 import threading
 from CxExtractor import CxExtractor

 cx = CxExtractor(threshold=133)
 
 uqueue = queue.Queue()
 
 from bs4 import BeautifulSoup
 import lxml
 
 def parserfile(f):
     # f = open(fpath).read()
     with open(f, encoding='utf-16le') as c:
         content = c.read()

     soup = BeautifulSoup(content, 'lxml')
     texts = []
     for item in soup.select('.selfTable'):
         try:
             text = item.find_all('a')[0].text
             texts.append(text)
         except Exception as e:
             print(e)


     for item in soup.select('.OuterTable'):
         if item:
             for sub in item.find_all('td'):
                 texts.append(sub.text)
     return texts
 # parserfile(html)
 
 # with codecs.open(html,encoding="utf-16") as f:
 #     parserfile(f.read())
 
 # parserfile('../html/Contents0.html')
 # get('.OuterTable')
 htmls = glob.glob("../html/*.html")

 def parserfile_auto(htmlpath):
     html = cx.readHtml(htmlpath, coding='utf-16le')
     content = cx.filter_tags(html)
     s = cx.getText(content)
     return s
 
 import os
 for html in htmls:
     text = parserfile_auto(html)
     # text = parserfile(html)
     with open('./phone-text-auto/'+os.path.basename(html) + '.txt', 'w', encoding='utf-8') as textfile:
         # t = "\n".join(text)
         textfile.write(text)
```

After extracting the data, you can do word segmentation, keyword extraction, and then generate a word cloud for visualization. One issue here is that if you want to display Chinese characters, `wordcloud` can't do it by default - you need to specify the font path.

```python

 #coding:utf-8
 import matplotlib.pyplot as plt
 from wordcloud import WordCloud
 import jieba
 import re
 import jieba.analyse
 # jieba.load_userdict('./dict.ji')
 jieba.enable_parallel(4)
  
 with open('./zhongwen.txt', errors='ignore') as f:
     text_from_file_with_apath = f.read()
 
 def stopwordslist(filepath):
     stopwords = [line.strip() for line in open(
         filepath, 'r', encoding='utf-8').readlines()]
     return stopwords
 
 stopwords = stopwordslist('./dict.jieba')
 
 for i in stopwords:
     text_from_file_with_apath.replace(i, " ")
     jieba.add_word(i)
 
 font_path = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
 wordlist_after_jieba = jieba.cut(text_from_file_with_apath, cut_all=False)
 wl_space_split = " ".join(wordlist_after_jieba)
 
 my_wordcloud = WordCloud(font_path=font_path).generate(wl_space_split)
 tags = jieba.analyse.extract_tags(text_from_file_with_apath, topK=100)
 
 print(",".join(tags))
 
 plt.imshow(my_wordcloud)
 plt.axis("off")
 plt.show()
```

I won't post the word cloud image here. For association analysis, I think there are several areas worth exploring: anomaly detection, transaction record analysis, chat history analysis, and text topic modeling. Obviously, analyzing this kind of data reminded me of the Trump Twitter analysis in `neo4j`'s `sandbox` - there's a lot of similarity there.

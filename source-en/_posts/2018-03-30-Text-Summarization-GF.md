---
layout: post
title: Text Summarization
categories: Security Engineer
keywords: Extraction Summarization, FastText, PageRank, Rouge, NLP
kerywords: Extraction Summarization, FastText, PageRank, Rouge, NLP
tags: AI and Machine Learning Learning Data Mining
translated: true
---

# Intro

This post is mostly a practical take on how to generate summaries from text. Honestly, I had zero clue how it worked — you can just call a library and get results, but then you're completely at the mercy of whatever the third-party library does, with no room to tune things yourself. "What I cannot create, I do not understand" — so yeah, worth digging into. My understanding is pretty surface-level, so don't expect anything deep here.

# Survey Of Text Summarization

There are two main approaches (this post focuses on extractive). First is abstractive, second is extractive. Extractive just pulls out the sentences from the original text that seem important (what "important" means is up to you). Abstractive is fancier — it actually generates new text using paraphrasing, substitution, compression, etc. Extractive is more mature, but it has its problems: some extracted sentences end up way longer than average, some sentences lose their meaning without surrounding context, and debate-style content (opposing viewpoints) doesn't extract well either. Methods used in [extractive text summarization](https://pdfs.semanticscholar.org/7e30/d0c7aaaed7fa2d04fc8cc0fd3af8e24ca385.pdf) include:

* TF-IDF
* Cluster Based Model
* Graph theoretic approach
* Machine Learning approach
* LSA Method
* An approach to concept-obtained text summarization
* Neural networks 
* Automatic text summarization based on fuzzy logic 
* Text summarization using regression for estimating
feature weights 
* Multi-document extractive summarization 
* Query based extractive text summarization
* Multilingual Extractive Text summarization 

Also PageRank and TextRank both fit in here.

# NLP Basics

Let me just dump a bunch of NLP terms first: tokenization, tagging, training, keyword extraction, named entity recognition, text classification. These are all pretty basic, and each one has a bunch of ways to implement it — tokenization alone has N-gram, CRF analysis, and custom dictionary approaches. Most libraries already handle this for you. Take a look at [HanLP](https://github.com/hankcs/HanLP/)'s README and you'll get the picture. Below I'll cover TF-IDF and N-GRAM.


## [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)

Term Frequency-Inverse Document Frequency is actually pretty intuitive. What's "inverse document frequency"? Basically: words that show up less often get higher weight, words that show up everywhere get lower weight. You calculate term frequency, then inverse document frequency, then `TF-IDF = TF * IDF`, where `IDF = log(total documents in corpus / documents containing the term + 1)`. In Python's [sklearn library](http://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html) it's even simpler.

```python
# https://stackoverflow.com/questions/34449127/sklearn-tfidf-transformer-how-to-get-tf-idf-values-of-given-words-in-documen
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from scipy.sparse.csr import csr_matrix

tf = TfidfVectorizer(input='filename', analyzer='word', ngram_range=(1,6),
                     min_df = 0, stop_words = 'english', sublinear_tf=True)
tfidf_matrix =  tf.fit_transform(corpus)
```

## [N-GRAM](https://en.wikipedia.org/wiki/N-gram)
A picture is worth a thousand words — just look at the example on the wiki page and it'll click.
![n-gram-example](../image/NLP/n-gram-example.png)

# Word2vec, Doc2Vec, Sentence2Vec

## [Word Embedding](https://en.wikipedia.org/wiki/Word_embedding)

Here's a good explanation from Zhihu:
> Word embedding means finding a mapping or function that generates a representation in a new space — that representation is the word representation. In plain terms: you map words from space X into multi-dimensional vectors in space Y. Those vectors are "embedded" into space Y, one word per slot.

This is an important concept, way more than a sentence or two can cover — check the reference links for a proper deep dive.

## to vec

* word2vec uses two methods: skipgram and cbow. ![cbo_vs_skipgram](../image/NLP/cbo_vs_skipgram.png)
The difference is:

> The skipgram model learns to predict a target word thanks to a nearby word. On the other hand, the cbow model predicts the target word according to its context. 

* sentence2vec
```python
def sentence2vec(sentences):
    sentence = [cut_sentence(s) for s in sentences]
    vectorizer = CountVectorizer()
    transformer = TfidfTransformer()
    tfidf = transformer.fit_transform(vectorizer.fit_transform(sentence))
    weight = tfidf.toarray()
    return weight
```
* Also Doc2vec....

# PageRank And TextRank

PageRank is famous — I learned about it when writing crawlers. But applying it to text summarization was new to me.

## Cosine similarity Or NN

Cosine similarity — once you've converted words/sentences/docs into vectors, you can measure the angle between them to compute similarity. While messing around with fasttext I also found you can use KNN to compute similarity.

## PageRank And TextRank 

Since I was doing Chinese text summarization, the TextRank library I used was [TextRank4ZH](https://github.com/letiantian/TextRank4ZH). TextRank was just a quick test; the main approach was PageRank. Haven't found the specific paper yet so I'll skip the link for now. ![learn-note](../image/NLP/pg-note.jpg)

```python
# coding: utf-8
# textrank
import json
import re
import os
import sys
import codecs
from textrank4zh import TextRank4Keyword, TextRank4Sentence

trainfilepath = "./train_with_summ.txt"
result = []

def fenju2file(trainfilepath,outputdir):
    """
        Please make sure you dest dir was exists
    """
    count = 1

    with open(trainfilepath,encoding="utf-8") as f:
        for text in f.readlines():
            summarization = json.loads(text)['summarization']
            article = json.loads(text)['article']
            ouputfilepath = outputdir+str(count) 

            with open(ouputfilepath,'w',encoding="utf-8") as o:
                for juhao in re.findall('[一-龥].*?[。|！|？]',article):
                    o.writelines(juhao+'\n')
            count = count + 1

    print("PreProcess Done !\n")

def sumary(filename):
    text = codecs.open(filename, 'r', 'utf-8').read()
    tr4w = TextRank4Keyword()

    tr4w.analyze(text=text, lower=True, window=2)

    tr4s = TextRank4Sentence()
    tr4s.analyze(text=text, lower=True, source = 'all_filters')
    for item in tr4s.get_key_sentences(num=1):
        print("TextRank Summarization Is: ",item.sentence)

count = 1
with open(trainfilepath,encoding="utf-8") as f:
    for text in f.readlines():
        summarization = json.loads(text)['summarization']
        article = json.loads(text)['article']
        tmpfilepath = './output/'+str(count) 
        with open(tmpfilepath,'w',encoding="utf-8") as o:
            for juhao in re.findall('[一-龥].*?[。|！|？]',article):
                o.writelines(juhao+'\n')
        count = count + 1
        
        print("Origin Summarization : ",summarization)
        sumary(os.path.join('./output/',str(count)))
```

# In Action: FastText

## FastText Basic Useage

Installation is simple — just `make` it, and all the CLI commands have Python bindings.

* Train a model (supports skipgram or cbow, unsupervised learning, Word Representations)
> 
```bash
fasttext skipgram -input traningText -ouput trainedModel
fasttext cbow -input traningText -ouput trainedModel
```

```python
import fasttext
model = fasttext.skipgram('data.txt', 'model')
model = fasttext.cbow('data.txt', 'model')
```

* Output vectors (word vectors or sentence vectors)
> 
```bash
fasttext print-word-vectors trainedModel.bin < yourFile
fasttext print-sentence-vectors trainedModel.bin < yourFile
```

* Text classification (supervised learning)
> 
```bash
fasttext supervised -input train.txt -output model #(train.txt is a text file containing a training sentence per line along with the labels.)
fasttext supervised -input train.txt -output model -label '__label__' #(custom label prefix)
fasttext test model.bin test.txt k #(Top k classes)
fasttext predict model.bin test.txt k 
fasttext predict-prob model.bin test.txt k  # probability for each label
```


```
Envy➜  data : master ✘ :✭ ᐅ  head amazon_review_polarity.train 
__label__2 , black lawn mower cover , been searching for ever to get suitable cover and this is just perfect . did try making my own cover but was not successful . 
__label__2 , much better than expected , i have to admit i had very low expectations for this product . i couldn ' t really imagine a product ( short of a needle and thread ) that would fix a piece of fabric for under $10 . but , this kit did a pretty good job . it basically consists of some glue-type stuff that you spread in the hole and then you pour fabric shavings on top to blend it in . the kit comes with a bunch of different colors that you can mix to match the color of your fabric this being the trickiest part of the process . i happen to have dark charcoal colored seats , so the mix was pretty easy black and a little white . the finished product looks pretty good , not perfect , but really good for a $10 fix . 
__label__1 , don ' t blame lucasfilm . . , it bothers me how many star wars fans bash george lucas and lucasfilm for continually releasing the star wars movies in ' new ' editions . star wars is a franchise , and the films are a product . if you are stupid enough to buy these films over and over again , then do not complain if they try to sell you the same films every 2 years . you are creating demand for an old product . 
__label__1 , miata mx5 covercraft cover , the quality was fine however , it did not fit the seats as stated . it bulged in areas and unable to stretch enough to reach around the lower part of the seat . 
```

## FastText Pybinding

Don't `pip install fasttext` (that's the obvious move but it also needs `Cython` pre-installed via `pip install Cython`), and the pip version can't load fasttext's trained model files (model.bin). You need to install from source — inside the fasttext folder run `pip install .` (turns out the official docs had a guide all along, oops).

```python

from  fastText import load_model
def sen2vec_by_fasttext(sentences,model=load_model('./oh_no.bin')):
    """
    Args:
        sentences: A list of sentence from a document
        model:  Pre-Traning with fastText
    """
    senvecs = []
    for _ in sentences:
         senvecs.append(model.get_sentence_vector(_))
    senvecs = np.array(senvecs)
    return senvecs

```

# Rouge And Automatic Evaluation of Summaries 

Rouge is a tool for evaluating automatic summaries. Not going to dig into the evaluation methodology or internal mechanics — there's a paper linked below. Written in Perl, which makes installation a bit annoying, but once it's up it's fine.
> `cpan install XML::DOM`
> `export ROUGE_EVAL_HOME=/usr/local/ROUGE-1.5.4/data`
After installing, run the test file, then install the Python binding with `pip install pyrouge`. Write your generated summaries and the reference summaries into the specified files, then use the test code below.

```python
# coding:utf-8
from pyrouge import Rouge155
r = Rouge155('/home/angela/ROUGE')
r.system_dir = '../docs/system'
r.model_dir = '../docs/gold'
r.system_filename_pattern = 'system.(\d+).txt'
r.model_filename_pattern = 'gold.[A-Z].#ID#.txt'
output = r.convert_and_evaluate()
output_dict = r.output_to_dict(output)
```

# Other: 

* Show your GPU memory info
> `nvidia-smi -l 1` outputs info every 1 second.

* gensim is pretty handy

* How to implement a project of paper


# References
* [Text Summarization Techniques: A Brief Survey](https://arxiv.org/pdf/1707.02268.pdf)
* [A Survey of Text Summarization Extractive Techniques](https://pdfs.semanticscholar.org/7e30/d0c7aaaed7fa2d04fc8cc0fd3af8e24ca385.pdf)
* [文本摘要自动生成综述](https://juejin.im/post/5a2e1840f265da43062ab69f)
* [fasttext](https://github.com/facebookresearch/fastText)
* [fasttext python library document](https://pypi.python.org/pypi/fasttext)
* [fasttext Word representations](https://fasttext.cc/docs/en/unsupervised-tutorial.html)
* [Bag of Tricks for Efficient Text Classification](https://arxiv.org/pdf/1607.01759v2.pdf)
* [Enriching Word Vectors with Subword Information](https://arxiv.org/pdf/1607.04606v1.pdf)
* [抽取式文档摘要方法（一）](https://blog.csdn.net/qq_32458499/article/details/78659372)
* [抽取式文档摘要方法（二）](https://blog.csdn.net/qq_32458499/article/details/78664199)
* [All Our N-gram are Belong to You](https://research.googleblog.com/2006/08/all-our-n-gram-are-belong-to-you.html)
* [Python自然语言处理](https://www.amazon.cn/dp/B00L7IV7C4)
* [有谁可以解释下word embedding? 知乎](https://www.zhihu.com/question/32275069)
* [Vector Representations of Words](https://www.tensorflow.org/tutorials/word2vec)
* [Get Sentences vec from word2vec](https://stackoverflow.com/questions/29760935/how-to-get-vector-for-a-sentence-from-the-word2vec-of-tokens-in-sentence)
* [ROUGE: A Package for Automatic Evaluation of Summaries](http://www.aclweb.org/anthology/W04-1013)

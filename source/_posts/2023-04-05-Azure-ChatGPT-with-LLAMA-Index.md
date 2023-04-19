---
layout: post
title: 使用llama_index实现定制化ChatGPT
categories: 安全架构师
kerywords: 安全架构 企业安全 安全设计 Security Design 微服务安全 安全治理 安全验证 
tags: AI与机器学习
---

# 0x01 前言

在Azure开始提供OpenAI服务之初，公司的大佬就申请开通了相应的资源。我也趁此试用了更多的场景，一边用Azure的OAI，一边用官方的，对比其中的差异。看看是不是像售前所说的那样，是同一套模型，同一套API。同时也体验了New Bing，Google Bard， Vicuna之类的模型。感觉对于深度学习这一块的知识已经有点跟不上了。只能在应用和产品化方面下下心思了。

# 0x02 正文

之所以想去做定制化的ChatGPT，一是希望能够实现稍微有点自主智能的Bot， 不是去条件式回答，而是能够聚合语料库，知识库。例如：企业内的WIki，客服的案例库。过去都是将案例库设置条件访问，客户咨询按路径，加人工的方式。如果能够实现自助聚合这些知识，显然可以提升很大的效率。 二是希望能够在垂直领域进行应用，就像昨晚和宇哥讨论的，他认为GPT也能在数据安全领域得到一定的应用。对此深表赞同。如果想去做类似这些应用就需要涉及到自定义的训练。以下为相关教程，参考及资源见文章最后部分。

## 1. 前置条件
1. python3.10
2. 安装llama_index最新版 (`pip install llama_index`) ， 如果已经安装请使用`pip install --upgrade llama_index` 进行升级
> 如果出现`cannot import name 'BaseOutputParser' from 'langchain.schema'`  报错，请使用`pip install --upgrade langchain`升级至最新版本即可
3. Azure账号并开通了Azure的OpenAI 资源， 以下简称OAI
4. 使用OAI上部署以下模型(**注意deployment name不是model name，后面使用到的都是deployment name**):
> * GPT Model（开通默认就有gpt-35-turbo，gpt-4-32k需要申请）
> * text-davinci-003
> * text-embedding-ada-002
5. 你自己的知识库（Knowledge Base）

## 2. 训练代码得到新的Index

```python
import os
import openai
from langchain.llms import AzureOpenAI
from langchain.embeddings import OpenAIEmbeddings
from llama_index import LangchainEmbedding
from llama_index import (
    GPTSimpleVectorIndex,
    SimpleDirectoryReader, 
    LLMPredictor,
    PromptHelper,
    ServiceContext
)

openai.api_type = "azure"
openai.api_base = "https://xxxxxxxxx.openai.azure.com/"
openai.api_version = "2023-03-15-preview" 
os.environ["OPENAI_API_KEY"] = "xxxxx"
openai.api_key = os.getenv("OPENAI_API_KEY") # idiot !, if i don't use this ,it cannot be valiadtion

gptmodel = "<your deployment name>"   # model: gpt4
embeddingmodel = "<your deployment name>" # model : text-embedding-ada-002

train_dir = "./qa_datasets"  # high qulaity ciso conversations

llm = AzureOpenAI(deployment_name=gptmodel, model_kwargs={
    "api_key": openai.api_key,
    "api_base": openai.api_base,
    "api_type": openai.api_type,
    "api_version": openai.api_version,
})
llm_predictor = LLMPredictor(llm=llm)

embedding_llm = LangchainEmbedding(OpenAIEmbeddings(
    document_model_name=embeddingmodel,
    query_model_name=embeddingmodel
))

documents = SimpleDirectoryReader(train_dir).load_data()

max_input_size = 2048
# set number of output tokens
num_output = 1024
# set maximum chunk overlap
max_chunk_overlap = 20

prompt_helper = PromptHelper(max_input_size, num_output, max_chunk_overlap)

service_context = ServiceContext.from_defaults(
    llm_predictor=llm_predictor,
    embed_model=embedding_llm,
    prompt_helper=prompt_helper
)

index = GPTSimpleVectorIndex.from_documents(documents, service_context=service_context)
index.save_to_disk('ciso.index_hq_gpt4')
print("Save to localpath")

```

## 3. 使用新的index进行会话

```python

import os
import json
import openai
from langchain.llms import AzureOpenAI
from langchain.embeddings import OpenAIEmbeddings
from llama_index import LangchainEmbedding
from llama_index import (
    GPTSimpleVectorIndex,
    SimpleDirectoryReader, 
    LLMPredictor,
    PromptHelper,
    ServiceContext
)

openai.api_type = "azure"
openai.api_base = "https://xxxxxxxx.openai.azure.com/"
openai.api_version = "2023-03-15-preview"
os.environ["OPENAI_API_KEY"] = "xxxxxxxx"
openai.api_key = os.getenv("OPENAI_API_KEY") 

gptmodel = "<deployment name>"  #gpt-4-32k not work, use text-davinci-003
embeddingmodel = "<deployment name>" #text-embedding-ada-002

llm = AzureOpenAI(deployment_name=gptmodel, model_kwargs={
    "api_key": openai.api_key,
    "api_base": openai.api_base,
    "api_type": openai.api_type,
    "api_version": openai.api_version,
})
llm_predictor = LLMPredictor(llm=llm)
embedding_llm = LangchainEmbedding(OpenAIEmbeddings(
    document_model_name=embeddingmodel,
    query_model_name=embeddingmodel
))
max_input_size = 500
# set number of output tokens
num_output = 48
# set maximum chunk overlap
max_chunk_overlap = 20

prompt_helper = PromptHelper(max_input_size, num_output, max_chunk_overlap)

service_context = ServiceContext.from_defaults(
    llm_predictor=llm_predictor,
    embed_model=embedding_llm,
    prompt_helper=prompt_helper
)

index = GPTSimpleVectorIndex.load_from_disk('./ciso.index_hq_gpt4',service_context=service_context)

query = 'what do you think should be the first thing to do as a ciso?'

print('query was:', query)
print('answer was:', answer)
```

## 4. 结果

我这里使用了47篇CISO的对话进行的训练，对比`GPT3.5`, `GPT4`，和`copilothub`, 结果如下：

GPT3.5
![Screenshot 2023-04-05 at 08 37 33](https://img.iami.xyz/images/230071345-a0a5131f-9a26-4bd5-9a6c-ac0baba864a0.png)

GPT 4
![Screenshot 2023-04-05 at 09 50 12](https://img.iami.xyz/images/230071306-86b7c91c-8a01-4448-89b2-51ebdd494c53.png)

Copilothub(仅能提供5篇
![Screenshot 2023-04-05 at 19 48 16](https://img.iami.xyz/images/230071494-6f942753-e57f-493b-a916-01d66ea60171.png)

自己训练的
![llama_index_trainng](https://img.iami.xyz/images/230071224-6eed1655-7f17-498c-8cc1-4c9548dcbf36.png)

当然在这里其实我开始怀疑时build executive team重要，还是identify risk重要了。不过对于自我启发而言，其实已经够用了。算是仁者见仁，智者见智吧。如果想要做的更好，肯定是需要更高质量的数据。如果能把某些群体的知识聚集到一起，那么对于帮助新人入门来说是非常有益的，让知识不再局限。

# 0x03 总结

前两天问一个英语专业的学生去翻译了一段译文，看了看效果和GPT35稍有差距，今天对比了下GPT4，发现差距就更大了。再次感到不学习就容易被淘汰。在未来，人人都应该能熟练掌握Prompt，有时候它可能用在生产环境不是那么严谨，但对于自我启发还是可以的。

针对Azure的OAI来说，由于官方限制了subscription内的实例，导致目前只能作为demo使用。部署的单个instance不能很好的承载较高的qps，（我没有进行压测，但是周末拿来做自动化翻译的时候，发现很快就报错了）。未来生产化的场景，一定是需要集群的。

相信AI的能力，同时作为安全工程师，也要尝试去发现安全问题。知道没有安全的系统。下图为GPT4在处理上帝模式的Prompt，可以看到已经失效了 ![Screenshot 2023-04-05 at 20 07 39](https://img.iami.xyz/images/230075718-a0552135-329b-46f0-8c2e-b7431d1a435d.png)。 试想在使用GPT的时候被插入“提权”（暂且称其为提权）的Prompt，输出一些暴恐数据。同时针对自有数据怎么样存储，怎么删除也是问题，毕竟现在模型不支持私有化（好像就算私有化，普通玩家算力也吃不消）。 另外相关的平台也难免出现其他安全问题，比如上次ChatGPT官方聊天记录出错的问题。涉及到信息泄漏。以及这两天三星芯片事件也风风火火。这个在使用OAI的api时尤其明显（两周前遇到调用Completion时出现乱七八糟的回复）。类似的，早上看到Copilothgub平台，用起来体验还是蛮不错的。但是目前不能注销账户，仅支持设置Public的Bot也是有很大问题的，顺带测了下bypass模式，看起来背后依旧是3.5模型，没法过滤一些prompt。


最近把ChatGPT的很多玩法都测了一遍（完整列表见[此处](https://img.iami.xyz/images/230067233-86797fed-9836-482f-8960-a8fd190e4870.jpg))，上周末也撸了个GPT版本的Code Review。当然毫无疑问，结果是取决于Prompt的质量的。这是做Code Review，Code Translation和Log Analysis的示例（该录屏为3.5模型）。
[crdemo](https://img.iami.xyz/images/230074306-cebe9ac6-9b42-470d-a6da-ac0dc3b8feee.mp4)

# 0x04 资源
* https://betterprogramming.pub/how-to-build-your-own-custom-chatgpt-with-custom-knowledge-base-4e61ad82427e 
* https://github.com/jerryjliu/llama_index
* https://oai.azure.com
* https://app.copilothub.co
* https://github.com/timothymugayi/mychatbot

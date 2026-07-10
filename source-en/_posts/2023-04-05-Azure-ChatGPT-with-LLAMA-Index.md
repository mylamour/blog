---
layout: post
title: How to Build a Customized ChatGPT
categories: Security Architect
kerywords: Security Architecture Enterprise Security Security Design Microservice Security Security Governance
tags: AI & Machine Learning
translated: true
---

# 0x01 Intro

When Azure first started offering OpenAI services, the big boss at my company jumped on it and got the resources set up. I took the opportunity to try out more use cases — running Azure OAI side by side with the official OpenAI API to see how they actually compare. All the sales pitches said it's the same models, same API. Wanted to see for myself. Along the way I also played with New Bing, Google Bard, Vicuna, and a few others. Honestly, my deep learning fundamentals are starting to feel a bit rusty. I've decided to just focus on the application and productization side of things.

# 0x02 Main Content

The reason I wanted to build a customized ChatGPT is twofold. First, I wanted a bot with a bit of actual autonomous intelligence — not just conditional response trees, but something that can aggregate a corpus and knowledge base. Think: an internal company Wiki, or a customer service case library. In the past, those were all set up as gated resources with manual routing and human agents. If you can make that knowledge self-serve and queryable, the efficiency gains are huge. Second, I wanted to explore vertical domain applications. Just like the conversation I had with my friend Yu last night — he thinks GPT can get solid traction in the data security space. Totally agree. But to build something like that, you need to get into custom training. Below is the tutorial. References and resources are at the end.

## 1. Prerequisites
1. python3.10
2. Install the latest version of llama_index (`pip install llama_index`). If already installed, upgrade with `pip install --upgrade llama_index`
> If you hit `cannot import name 'BaseOutputParser' from 'langchain.schema'`, just run `pip install --upgrade langchain` to get the latest version
3. An Azure account with Azure OpenAI resources provisioned (referred to as OAI below)
4. Deploy the following models in OAI (**note: the deployment name is NOT the model name — everything below refers to deployment names**):
> * GPT Model (gpt-35-turbo comes by default; gpt-4-32k requires a separate request)
> * text-davinci-003
> * text-embedding-ada-002
5. Your own Knowledge Base

## 2. Training Code to Build a New Index

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

## 3. Query Using the New Index

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

## 4. Results

I trained on 47 CISO conversations and compared the results across GPT3.5, GPT4, and Copilothub:

GPT3.5
![Screenshot 2023-04-05 at 08 37 33](https://img.iami.xyz/images/230071345-a0a5131f-9a26-4bd5-9a6c-ac0baba864a0.png)

GPT 4
![Screenshot 2023-04-05 at 09 50 12](https://img.iami.xyz/images/230071306-86b7c91c-8a01-4448-89b2-51ebdd494c53.png)

Copilothub (limited to 5 docs)
![Screenshot 2023-04-05 at 19 48 16](https://img.iami.xyz/images/230071494-6f942753-e57f-493b-a916-01d66ea60171.png)

Self-trained
![llama_index_trainng](https://img.iami.xyz/images/230071224-6eed1655-7f17-498c-8cc1-4c9548dcbf36.png)

At this point I actually started second-guessing myself on whether "build the executive team" matters more or "identify risks" does. But honestly, for self-learning purposes it's already plenty useful. Different people will draw different conclusions. If you want better results, you obviously need higher quality data. If you could aggregate the knowledge of certain expert communities, it would be incredibly valuable for onboarding newcomers — knowledge no longer trapped behind individual heads.

# 0x03 Wrap-up

A couple days ago I asked an English major student to translate a passage for me, and compared it against GPT-3.5 — the gap was noticeable. Then I compared it to GPT-4 and the gap got even bigger. That hit different. If you stop learning, you fall behind, full stop. Going forward, everyone should probably get comfortable with Prompt engineering. It might not be production-grade rigorous, but for self-directed learning it absolutely works.

On the Azure OAI side: because of subscription-level instance limits on the official side, right now it's really only suitable for demos. A single deployed instance doesn't handle high QPS well — I didn't formally stress test it, but when I tried to use it for automated translations over the weekend it started throwing errors pretty fast. For real production scenarios, you'd need a cluster.

Believe in AI's capabilities, but as a security engineer, you also have to look for the attack surface. No system is secure. Here's GPT-4 handling a "god mode" prompt — as you can see, it's already ineffective:
![Screenshot 2023-04-05 at 20 07 39](https://img.iami.xyz/images/230075718-a0552135-329b-46f0-8c2e-b7431d1a435d.png)

Think about it: if someone injects a "privilege escalation" prompt (let's call it that for now) while you're using GPT, it could output harmful content. And how do you store or delete your own data? That's a real question — current models don't support full private deployment (and even if they did, the compute requirements would be out of reach for most regular players). There are also inevitable platform-level security issues, like the ChatGPT chat history leak incident. And the Samsung chip leak case that's been all over the news lately. This is especially visible when using the OAI API — two weeks ago I hit some totally garbled completions out of nowhere. Similarly, Copilothub looks pretty polished UX-wise, but not being able to delete your account and only supporting public bots is a big problem. I also tested the bypass mode — looks like it's still GPT-3.5 under the hood and can't filter certain prompts.

I've been going through a lot of ChatGPT use cases lately (full list [here](https://img.iami.xyz/images/230067233-86797fed-9836-482f-8960-a8fd190e4870.jpg)). Last weekend I also hacked together a GPT-powered Code Review tool. Needless to say, the quality of the output depends entirely on the quality of the prompt. Here's a demo showing Code Review, Code Translation, and Log Analysis (this recording uses the 3.5 model):
[crdemo](https://img.iami.xyz/images/230074306-cebe9ac6-9b42-470d-a6da-ac0dc3b8feee.mp4)

# 0x04 Resources
* https://betterprogramming.pub/how-to-build-your-own-custom-chatgpt-with-custom-knowledge-base-4e61ad82427e 
* https://github.com/jerryjliu/llama_index
* https://oai.azure.com
* https://app.copilothub.co
* https://github.com/timothymugayi/mychatbot

---
layout: post
title: A Brief Introduction to Privacy Computing and Data Security
categories: Security Architect
keywords: data security privacy computing secure multi-party computation oblivious transfer garbled circuit secret sharing homomorphic encryption differential privacy
tags: Security Architecture Data Security
translated: true
---

# 0x00 Preface

This article mainly introduces the basics of privacy computing (content from study notes) and its applications in data security. The classification of privacy computing here references the book "Privacy Computing". It's divided into two main blocks: one is privacy encryption computing based on traditional cryptography, and the other is privacy-preserving computing based on probability theory and information theory (some are based on software-hardware system design). Actually, something like Federated Learning is more about applying privacy encryption computing to the machine learning and deep learning process. This article is just a starting point - readers should study each detail on their own.

# 0x01 Privacy Computing Basics

![image](https://img.iami.xyz/images/172346526-5549fe69-b2ae-4600-86fc-eca51d2c421b.png)

Following the mind map, I'll introduce one scenario per section. Correspondingly, I'll draw a sequence diagram (unless otherwise stated, all diagrams are original - please credit the source if reposting) to introduce the general process, with some demos attached. The Differential Privacy section will be skipped for now.

## 1. Secure Multi-Party Computation

As the name suggests, it ensures that multiple participants can conduct secure interactions and computations. Common technologies include Oblivious Transfer, Garbled Circuits, Secret Sharing, etc.

### 1.1 Oblivious Transfer (OT)

![image](https://img.iami.xyz/images/172567919-55f01a5f-b46b-47c4-b6c9-71ef5d373934.png)

Following the book, I made a diagram and simulated the whole process.

```bash
RUNPATH="$(
    cd -- "$(dirname "$0")" >/dev/null 2>&1
    pwd -P
)"
echo "$RUNPATH"

rm -rf recv send
mkdir -p recv/keys/ send/texts/ send/keys/
b=5 # select Message at No.5

# Receiver
cd recv/keys
for i in $(seq 9); do
    echo "Generate $i Keypairs"
    openssl genrsa | openssl rsa -pubout >$i.pub
    if [ $i == $b ]; then
        openssl genrsa -out sk && openssl rsa -in sk -pubout -out $i.pub
    fi
    cp $i.pub $RUNPATH/send/keys/
done

# Sender

cd $RUNPATH/send/

for i in $(seq 9); do
    echo "TEST$i" >texts/$i.text
    openssl pkeyutl -encrypt -inkey keys/$i.pub -pubin -in texts/$i.text -out $i.enc
    mv $i.enc $RUNPATH/recv/
done

# Reciver
cd $RUNPATH/recv/
openssl pkeyutl -decrypt -in $b.enc -inkey keys/sk -out selected_text

echo "-----------------------------------------------------"
cat selected_text
echo "-----------------------------------------------------"
```

![image](https://img.iami.xyz/images/172568131-86fc3dba-ba4e-4dc3-83b8-e7a20aee219a.png)


### 1.2 Garbled Circuit (GC)

![image](https://img.iami.xyz/images/172749709-80f4a468-0f1f-42ab-9371-2b8e669aed2c.png)

This is an example using an AND gate. Because Bob can get both α and β keys, he can decrypt the corresponding ciphertext through iterative lookup table.

### 1.3 Secret Sharing (SS)

Secret Sharing mainly has two processes: distribution and recovery. I originally planned to introduce Shamir Secret Sharing based on Lagrange interpolation. But when I was organizing my notes, I found there's already a ready-made one - you can directly read [Secret Sharing Scheme](https://zhuanlan.zhihu.com/p/95362628) (ps: confused... the numbers in the example are all consistent with those in the book, suspicion of mutual plagiarism?). Also note, don't set 8 shares and then set a threshold of 1. While that's convenient for recovery, it's meaningless for joint participation.

### 1.4 Zero-Knowledge Proof (ZKP)

I first watched [Professor Li Yongle's video](https://www.youtube.com/watch?v=FuKEpOhiVPg) to get a general idea... Later I read some translations by Secbit Labs [Learning zk-SNARK from Zero series](https://secbit.io/blog/2019/12/25/learn-zk-snark-from-zero-part-one/) (highly recommended). But there's a problem here - part of the knowledge depends on homomorphism-related stuff...

## 2. Homomorphic Encryption (HE)

![image](https://img.iami.xyz/images/172783687-b3133db3-5239-4966-b830-58c37c0febe0.png)

Let's use an example to understand additive homomorphism. 5 -> 5^3, plaintext 3 ciphertext 5^3, multiply the ciphertext by 2, the ciphertext of 2 is 5^2, what we get is 5^3 x 5^2 = 5^(3+2) = 5^5, 5^5 is the ciphertext, decrypt it backwards 5^5 -> 5. By the way, Shamir's Secret Sharing also has additive homomorphic properties. The diagram below can better illustrate this process.

![image](https://img.iami.xyz/images/172784957-f17b19d2-fed6-446a-96be-5631828cb058.png)(Screenshot from Gentry's PPT)

The principles and properties are relatively easy to understand, but the specific implementation is a bit confusing. With my current knowledge level, I can't fully understand it yet. I can understand groups and rings, but died at lattices. (Lattice-based cryptography is currently mainly used to counter quantum computing attacks, e.g., CKKS. Traditional cryptography is no longer difficult for quantum computers to crack.) These foundations are much harder than learning machine learning and deep learning. Recommend watching [The Development History of Fully Homomorphic Encryption](https://www.bilibili.com/video/BV1rY411V7Ko). The table below introduces different types of homomorphic encryption and their implementations.

![image](https://img.iami.xyz/images/172780958-b237b0e8-f7b5-4c95-a4a9-1e940dd403ef.png)

But this doesn't stop me from using packages. Here I'm using [Microsoft SEAL](https://github.com/microsoft/SEAL) and its corresponding [python binding](https://github.com/Huelse/SEAL-Python).
The BGV demo code implementation can refer to the examples in the original repo.

![image](https://img.iami.xyz/images/172800849-526e9a21-743f-4eda-90c5-d2e724867dc4.png)


## 3. Federated Learning (FL)

It's relatively easier to understand with a machine learning background. Federated Learning is divided into Horizontal Federated Learning, Vertical Federated Learning, and Transfer Learning. The difference between horizontal and vertical is that in horizontal, different participants have different data samples but the same feature space and label space. While in vertical, participants have the same data samples but different feature spaces and label spaces. Combined with the previous multi-party computation knowledge, it's not hard to find that key parameters in the training process can be aggregated together. For example, gradient values during gradient descent, Loss values, etc. This can be achieved through Secret Sharing and Homomorphic Encryption. Of course, it can also be implemented through Differential Privacy. The diagram below introduces the training process of horizontal federated learning.

![image](https://img.iami.xyz/images/173265339-7f9f4bc2-ce33-4f21-a605-1fa56cd2937d.png)

Because each participant in horizontal federation has a complete local model, only local inference is needed during prediction. **However, even with local model prediction, we still need to ensure the privacy of samples to the model, i.e., allow the model holder to make predictions but not obtain plaintext data**. For example, in face recognition, after real-time face data, directly encrypt it, then the model performs calculations based on the ciphertext to complete verification. Also, there are already papers showing that original data can be inferred from the model and certain prediction process data, so we need to watch out for such attacks.

## 4. Trusted Execution Environment (TEE)

A computing solution with software-hardware collaboration, divided into REE and TEE environments. REE corresponds to the regular operating system, while TEE corresponds to separate hardware (separate page table/memory; if there's no separate hardware, memory encryption is needed) and separate OS (normally it's boot ROM -> boot Flash -> UEFI -> OS/Hypervisor; taking Arm TrustZone as an example, the TEE OS is located after boot Flash) for storing sensitive data like Keys, fingerprints, faces, and completing operations like encryption/decryption and signing/verification within the OS where TEE is located. Usually there are also physical defense mechanisms, for example, Samsung phones will directly blow the Knox fuse when flashed. Samsung's TEE is self-developed, but it was also leaked by Lapsus$. Hardware has higher difficulty and threshold. Common ones include Arm TrustZone (recommend reading TrustZone architecture design, see references), Intel SGX, AMD SEV. For TEE OS, there are some open-source solutions, such as [OP-TEE](https://optee.readthedocs.io/en/latest/general/index.html#https://optee.readthedocs.io/en/latest/general/index.html#), [Teaclave](https://teaclave.apache.org/)

Taking Arm TrustZone as an example, the interaction diagram is as follows. Image from the paper [On The Performance of ARM TrustZone](https://arxiv.org/pdf/1906.09799.pdf)

![image](https://img.iami.xyz/images/173270597-e4ce607d-dca5-47a9-b37c-435505033249.png)


## 5. Differential Privacy (DP)

The main principle is adding random noise to mask accurate query results. There are two implementation methods for continuous real-valued domains: Laplace noise method and Gaussian noise method. Some parts I can't quite understand, so I'll skip them for now. What needs attention is that we need to have an attacker's perspective. For example, if A wants to know B's income, they can first construct a set D(A, B), query the average income of D, then subtract A's own income to get B's income.

## 6. Others

Multi-signature related stuff also needs to be understood. The more famous ones are [Schnorr](https://ethfans.org/posts/how-schnorr-signatures-may-improve-bitcoin#render) and [BLS](https://ethfans.org/posts/bls-signatures-better-than-schnorr)


# 0x02 Privacy Computing and Data Security

In most cases, we can divide the roles in the data flow process into those shown in the diagram. However, usually the data user is likely also a data provider, whether providing to partners or government regulators. Similarly, the platform, service provider, and data user are quite possibly the same entity. Here I use a Venn diagram to represent the relationships between parties.
![image](https://img.iami.xyz/images/173302921-9581b414-58d0-4558-89df-02e0c4ec1d69.png)

## 1. Reducing Collection Scope and Improving Data Control Capability

From the diagram, we can see that the intersection between data providers and the platform means what data is provided. The intersection of all three - platform, provider, and user - means the portion of provided data that is actually used on the platform. It's not hard to see here that we should try to reduce the difference between providers and users, i.e., avoid collecting excessive information/data and only collect what's actually used. This requires platforms to comply with laws/industry regulations (regulation is always the first driver in the financial industry, though most of the time regulation lags behind many steps). Of course, as a data provider, you can protect yourself by increasing your control over data (first raise privacy awareness, then improve control capability). For example, rooted phones can use some plugins to prevent other unauthorized apps from obtaining permissions, or return fake data to apps. Common tools for Android OS are Xprivacy, MIUI has integrated Privacy function; iOS uses Differential Privacy to get group characteristics like the most popular Emoji expressions; or provide ciphertext data to service providers, etc.

## 2. Full-Link Security and Data In Use Security

![image](https://img.iami.xyz/images/173315112-05361713-ef2c-4a88-b3ca-1dbbac7d7022.png)

Full-link security construction is essential (including infrastructure to upper-layer applications, etc.). Besides, when data is at Rest and in Transit, we can mostly ensure logical security through cryptographic means, though we also need to consider software supply chain security (e.g., security of Crypto Library) and service design, etc. But for Data In Use scenarios, there hasn't been good protection all along. Here I'll briefly discuss the application of privacy computing in data usage scenarios (query, analysis, computation, etc.). One category is individual data, achieving data usability without visibility. The other category is for group data usage - how to ensure the computing process/results won't leak personal privacy.

a. **Data Usability Without Visibility**

![image](https://img.iami.xyz/images/173346848-f167abef-793b-487e-bd62-e2f3ea7f1677.png)

This category mainly applies TEE and Homomorphic Encryption related technologies. The former supports computing in a trusted (there's never absolute trust) environment, while the latter supports ciphertext computation. For example, storing fingerprints, faces, full-disk encryption keys and other data through TEE. When external applications need verification/authentication (such as payment, unlocking, etc.), they can only access the TEE environment by calling APIs, and encrypt/decrypt data within the TEE environment. Another example is the FIDO2 authentication process, where the Server sends a random Challenge value, which is signed by the private key in the TEE environment and sent back to the Server, then the Server performs verification, etc. Similarly for Homomorphic Encryption, ciphertext retrieval and cloud-based machine learning are relatively common scenarios. Take machine learning prediction as an example. Users encrypt the input, then upload the ciphertext to the server for prediction. The server performs encrypted inference, then returns the ciphertext result, and finally decrypts locally to get the plaintext result. Of course, these two can also be combined together to improve the protection of data security during use.

b. **Big Data Usability Without Visibility**

Mainly using Federated Computing and Differential Privacy as primary technologies. During training, original sample data is protected by masking sample data features or adding noise, but this doesn't affect statistical results on group data. During prediction, it can accept ciphertext data for prediction. Common scenarios include joint risk control, fraud identification, next word prediction, ad recommendations (no more big data price discrimination), etc.


# 0x03 Summary

From Secure Multi-Party Computation (1979) to proposing Differential Privacy, then to centralized computing (2006-2013), and currently Federated Learning (2018). As always, the concepts of these technologies were proposed long ago. But only in recent years have they been implemented. Now they are collectively called Privacy Computing. However, it should be noted that Data Privacy itself focuses on individuals, not data.

![image](https://img.iami.xyz/images/172346583-1b25b79f-06fd-48d0-983b-a6efa54bfda6.png)

Among these technologies, most rely on semi-honest servers and also have certain performance/efficiency issues. And some of the mathematical foundations are not fully comprehensible to me. But this doesn't prevent understanding new technologies and applying and implementing them. Before this, I thought for a long time about how to protect data during usage, looked up some TEE materials, but couldn't form a general picture in my mind. This time by systematically studying privacy computing books (though I've read quite a few related white papers before), only by understanding the principles can I better understand application scenarios. Besides, I suddenly realized that when I first studied machine learning, I mostly considered model data protection issues, but didn't think about how to protect sample data. It's truly endless learning.

ps: Recently binged the first 4 Mission Impossible movies, seeing so many impossible places handled by Ethan and his team. Although there's a certain protagonist halo, I have to admit: there's no absolutely secure system. No technology can guarantee that either.


# 0x04 References

* [Privacy Computing (Chen Kai, Yang Qiang)](https://item.jd.com/13604520.html)
* [A Practical Introduction to Secure Multi-Party Computation (translated by Liu Weiran)](https://item.jd.com/13302742.html)
* [Privacy Computing White Paper - CAICT](https://gw.alipayobjects.com/os/bmw-prod/73c5f163-d091-487a-bf5c-41841f546bc0.pdf)
* [The Development History of Fully Homomorphic Encryption](https://www.bilibili.com/video/BV1rY411V7Ko)
* [A Decade of Fully Homonorphic Encryption.pdf](https://github.com/mylamour/blog/files/8867450/A.Decade.of.Fully.Homonorphic.Encryption.pdf)
* [Introduction to Zero-Knowledge Proof](https://zhuanlan.zhihu.com/p/144847471)
* [How to Understand Lagrange Interpolation](https://www.zhihu.com/question/58333118)
* [Secret Sharing Scheme](https://zhuanlan.zhihu.com/p/95362628)
* [Learning zk-SNARK from Zero (Part 1)](https://secbit.io/blog/2019/12/25/learn-zk-snark-from-zero-part-one/)
* [Zero-Knowledge Proof Report Final Version.pdf](https://github.com/mylamour/blog/files/8866820/default.pdf)
* [Microsoft SEAL](https://github.com/microsoft/SEAL)
* [SEAL Python](https://github.com/Huelse/SEAL-Python)
* [BLS Signatures](https://ethfans.org/posts/bls-signatures-better-than-schnorr) 
* [Schnorr Signatures](https://ethfans.org/posts/how-schnorr-signatures-may-improve-bitcoin#render)
* [OP-TEE](https://optee.readthedocs.io/en/latest/general/index.html#https://optee.readthedocs.io/en/latest/general/index.html#)
* [Teaclave](https://teaclave.apache.org/)
* [Learn the architecture - TrustZone for AArch64](https://developer.arm.com/documentation/102418/latest/)
* [On The Performance of ARM TrustZone](https://arxiv.org/pdf/1906.09799.pdf)
* [Xandu](https://cloud.xanadu.ai/)
* [Differential Privacy Algorithm Basics](https://differential-privacy.cn/3-Basic-Techniques-and-Composition-Theorems/Composition-theorems/Laplace-versus-Gauss.html)
* [A Brief Introduction to Cryptographic Infrastructure](/applied-cryptography-and-crypto-infrastructure/)
* [A Brief Introduction to Data Security](/talk-about-data-security/)

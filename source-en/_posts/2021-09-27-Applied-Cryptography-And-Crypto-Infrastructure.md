---
layout: post
title: Applied Cryptography and Crypto Infrastructure
categories: Security Engineer
kerywords: Application Architecture Security Architecture Data Security Enterprise Security Architecture Architecture Design Business-Driven Cryptography Fundamentals
tags: Security Architecture Data Security
translated: true
---

# 0x00 Preface

Before diving into crypto infrastructure, I'll introduce some cryptography fundamentals. But I need to clarify upfront that I can only understand and apply these concepts - I'm no expert. So if there are any mistakes in this article, please point them out. If you only care about the practical experience of building crypto infrastructure, feel free to jump directly to section 0x02.

# 0x01 Cryptography Fundamentals

The cryptography basics in the following sections are mainly summarized from my reading notes of "Understanding Cryptography with Illustrations". The images in this section are from the original text. A friend told me this is a "holy book", which I think is a bit much - but it is indeed a good book, because it helps readers with weak math backgrounds quickly understand cryptography fundamentals.

## 1. Common Threats and Corresponding Cryptographic Technologies

![image](https://img.iami.xyz/images/134798799-f9e30f53-fe40-4e0e-b051-e92cbfb5fc47.png)

## 2. Basic Cryptographic Technologies and Common Sense

Basic cryptographic technologies are divided into six parts: Symmetric Cryptography, Asymmetric Cryptography, one-way hash functions, message authentication codes, digital signatures, and pseudo-random number generators.

![image](https://img.iami.xyz/images/134798322-444eb6ad-0e27-41c2-a56d-e18c0bf7b28a.png)
![image](https://img.iami.xyz/images/134807902-63539b95-919b-47b9-99d5-09c550051a12.png)

Most cryptographic technologies require keys, and there's a valuable principle here - **keys are equivalent to plaintext** (meaning if plaintext is worth $1M, then the key is also worth $1M).

Here are various different types of keys:
1. Symmetric cryptography keys vs public key cryptography keys
2. Message authentication code keys vs digital signature keys
3. Keys for ensuring confidentiality vs keys for authentication
4. Session keys vs master keys
5. Keys for encrypting content vs keys for encrypting keys
6. Password Based Encryption (PBE)

## 3. Symmetric Cryptography

Symmetric cryptography can be divided into two categories: stream ciphers and block ciphers. As the names suggest, stream ciphers encrypt each bit individually, while block ciphers encrypt blocks of plaintext. Block ciphers can only process a specific length of data (block) at a time. Below I'll mainly introduce block ciphers.

Symmetric cryptography encryption and decryption mainly rely on XOR operations on bits. Suppose the plaintext is 010101 and the key is 111111, then the XOR result ciphertext is 101010. Conversely, when decrypting the ciphertext, XOR it with the key to get 010101.

```bash
0 XOR 0 = 0
0 XOR 1 = 1
1 XOR 0 = 1
1 XOR 1 = 0
```

### 3.1 DES and 3DES

DES stands for Data Encryption Standard. It was adopted by FIPS in 1977, with the basic structure being a Feistel network/structure. It should not be used for existing or new encryption purposes now.

In a Feistel network, encryption and decryption can be implemented with exactly the same structure. The encryption steps are called rounds, and the number of rounds can be increased arbitrarily.

![image](https://img.iami.xyz/images/134833060-3c2f99b8-49bd-45aa-a32f-0bd7d3c46828.png)

DES is a 16-round Feistel network. That is, after each input-output, the left and right sides are swapped, and then a new subkey is used to perform XOR through the round function.
Here's a three-round Feistel network. Remember that DES has 16 rounds.
![image](https://img.iami.xyz/images/134833628-ca10112e-61bb-4f60-a722-c003644bd967.png)

3DES is obtained by repeating DES 3 times.
![image](https://img.iami.xyz/images/134833816-284a141d-2430-46e2-be27-6e495ccccd55.png)

But you can see that the 3DES encryption process is encrypt-decrypt (this step is for backward compatibility)-encrypt. If DES keys 1, 2, and 3 are the same, then 3DES is actually the same as DES. If 1, 2, and 3 use completely different keys, it's called DES-3DES. If 1 and 3 are the same and 2 is different, it's called DES-EDE2.

3DES is currently temporarily allowed, but should not be used for new purposes.

### 3.2 AES

AES stands for Advanced Encryption Standard, selected by NIST as a FIPS standard. I initially thought AES was just one algorithm, but actually AES was selected from a series of algorithms. Recruitment started in 1997 (5 finalists from 15 algorithms), and in 2000 the block cipher Rijndael was selected (by Belgian cryptographers Joan Daemen & Vincent Rijmen).

Rijndael also consists of multiple rounds, but uses an SPN structure instead of a Feistel network. It mainly consists of SubBytes (processing 16-byte blocks to obtain a substitution table S-Box with 256 values), ShiftRows (shifting rows of 4-byte units to the left according to certain rules, with different shift amounts for each row), MixColumns (bit operations on a 4-byte value), and AddRoundKey (XOR the output of MixColumns with the round key). Completing SubBytes->AddRoundKey is one round, and Rijndael structure needs to repeat 10-14 rounds. For decryption, the order is reversed: AddRoundKey -> InvMixColumns -> InvShiftRows -> InvSubBytes.

### 3.3 Comparison of Padding Modes

Block ciphers mean they can process specific lengths, so to handle arbitrary lengths, we need to iterate the block cipher. The iteration method is called a mode.

![image](https://img.iami.xyz/images/134799110-5701d4ca-0853-4ae5-b64d-3880ebe169e7.png)

Comparison of OFB mode and CTR mode
![image](https://img.iami.xyz/images/134799158-2b0e95ec-5dba-4587-b98b-43c991ccfa24.png)

Comparison of CFB mode and OFB mode
![image](https://img.iami.xyz/images/134799177-da302960-e91b-4330-bf58-1cb4db925cbb.png)

## 4. Asymmetric Cryptography

Also known as Public-Key Cryptography, it mainly relies on the principle that humans currently cannot quickly solve discrete logarithms.

![image](https://img.iami.xyz/images/134806868-a55de0d7-1ee1-4b30-8837-725ef4724ee6.png)

### 4.1 RSA
#### 4.1.1 RSA Encryption and Decryption

![image](https://img.iami.xyz/images/134799645-35816dcc-bdde-4027-8931-13e32816c66d.png)
![image](https://img.iami.xyz/images/134799695-b79a5327-b7c8-4277-8fc3-5b56b97fa1b2.png)

#### 4.1.2 Signing and Verification

![image](https://img.iami.xyz/images/134807630-4abf609a-ac62-410e-b621-375e8791e44f.png)

There are generally two forms: one is to directly sign the message, and the other is to sign the hash value of the message.
![image](https://img.iami.xyz/images/134806849-1e0dbc09-6d2b-403a-8368-3658c33e10fe.png)

### 4.2 ECC

ECC stands for Elliptic Curve Cryptography.

It mainly includes three aspects:
* Elliptic curve-based public key cryptography
* Elliptic curve-based digital signatures
* Elliptic curve-based key exchange

#### 4.2.1 DH Exchange

![image](https://img.iami.xyz/images/134837755-5945efe9-35e8-4dc6-a375-0db70582db14.png)

### 4.3 Applications and Attack Methods:

Applications:
* Public key certificates
* SSL/TLS

Attack methods:
* Man-in-the-middle attacks
* Attacks on one-way hash functions
* Attacking public key cryptography using digital signatures
* Potential forgery

### 4.4 Hybrid Cryptosystem

Simply put, it uses asymmetric cryptography to protect symmetric keys, and uses symmetric keys to encrypt and decrypt data.

Encryption
![image](https://img.iami.xyz/images/134837318-38e63b97-e096-44f6-b96b-2c2b01e5559b.png)

Decryption
![image](https://img.iami.xyz/images/134837450-bad8c2b7-6278-42b9-b10e-0338bf5a7f2a.png)


## 5. One-Way Hash Functions

One-way hash functions are also called message digest functions, hash functions, or hashing functions.
The input is called a message (also called pre-image), and the output is called a hash value (also called message digest or fingerprint).
> Can detect tampering, but cannot identify impersonation.

Characteristics:
1. Calculate a fixed-length hash value from a message of any length
2. Can quickly calculate the fixed-length hash value
3. Different messages produce different hash values (collision resistance)
4. One-way property

Applications:
* Detecting software tampering
* Password-based encryption
* Message authentication codes
* Digital signatures
* Pseudo-random number generators
* One-time passwords

Common one-way hash functions:
* MD4, MD5
* SHA-1, SHA-256, SHA-384, SHA-512
* RIPEMD-160
* SHA-3

## 6. Message Authentication Code

Message Authentication Code (MAC) takes any-length messages and a key shared between sender and receiver as input, and outputs fixed-length data, the MAC value.
> Can detect tampering and impersonation, but cannot provide proof to third parties or prevent repudiation.

### 6.1 Implementation Methods

1. Implementation using one-way hash functions
HMAC constructed using SHA1, SHA-224, SHA-256, SHA-384, SHA-512 are called HMAC-SHA1, HMAC-SHA-224, HMAC-SHA-256, HMAC-SHA-384, HMAC-SHA-512 respectively.
![image](https://img.iami.xyz/images/134801218-fd27c599-23ee-4253-a28e-88069b0b39ac.png)
2. Implementation using block ciphers
3. Other methods (stream ciphers, public key cryptography)

### 6.2 Applications and Attack Methods

Applications:
* SWIFT (refer to some sharing materials on electronic payment basics)
* IPsec
* SSL/TLS

Attack methods:
* Replay attacks
* Key guessing attacks

## 7. Pseudo-Random Number Generation

Random numbers are needed in many places: generating keys, key pairs, initialization vectors, nonces, and salts. But software cannot generate truly random numbers - all software-generated numbers are pseudo-random.

![image](https://img.iami.xyz/images/134837908-cd79566b-7e25-49ba-8ef1-8f308a470865.png)

There are several methods for generating pseudo-random numbers:
* Random methods
* Linear congruential method
* One-way hash function method
* Cryptographic method
* ANSI X9.17

## 8. PGP

Skipped, refer to PGP: Pretty Good Privacy - Garfinkel Simson

## 9. Information Security Common Sense About Cryptographic Systems

* Don't use secret cryptographic algorithms
* Using low-strength cryptography is more dangerous than not encrypting at all
* Any cipher will eventually be broken
* One-time pads are theoretically unbreakable, but in practice they are not used because they face key distribution problems, storage problems, reuse problems, synchronization problems, and generation problems.
* Salt is mainly used to defend against dictionary attacks

# 0x02 Crypto Infrastructure

Here I'll first introduce what features are needed for building general infrastructure, then add some details for each different type of facility. The diagram was drawn temporarily and includes different aspects involved in building a crypto infrastructure system. Below I'll briefly introduce the blocks in the diagram.

![image](https://img.iami.xyz/images/134858593-6409a2f4-4318-4988-982f-4ec3c71072cd.png) (drawn by author)


* Integration (Application/System)
    * Logging Management
    * Monitoring Management
    * Identity Management
    * Access Management 
    * etc...

* Optimization (Tech/Operation/...)
    * Workflow & Pipeline
    * Support Template 
    * HW/SW Performance 
    * Scenario
    * etc ...

* Customer Service (Application/User/...)
    * Support Service 
    * Self Service 



After knowing what points to consider when building certain solutions, let's look at what the general scope of crypto infrastructure looks like (drawn by author):

![image](https://img.iami.xyz/images/134870125-50c0bbcb-8a57-4155-a262-fe94643aebe3.png)

Taking PKI as an example (I previously summarized [an article about CA/RA](/what-hells-in-ca-and-ra/), and [another one about HSM](/what-hells-in-hsm/)), after determining the PKI construction plan, design the logical and physical architecture, including integration with other systems/services (logging, monitoring, permissions, HSM, etc.). After the system is deployed and provides services, continue building integration services, such as providing support templates, customer service, and providing certain SDKs for other systems/applications to call. Different certificates generated by different functional CAs are provided to different applications or users. For example, can certificates provided to employees for accessing internal systems be pushed to employees' laptops through MDM tools, as well as certificates on LBs for providing TLS services, and all places that need root certificates, etc. Try to optimize the repetitive work in daily operations.

Similarly, for HSM, KMS, or Secret Management, the approach is similar.

# 0x03 Summary

What you get on paper is superficial; you must practice to truly understand.

# 0x04 References

* [Why is discrete logarithm a hard problem](https://www.zhihu.com/question/26030513)
* [SM2 National Cryptography Algorithm/Elliptic Curve Cryptography ECC Mathematical Principles](https://www.jianshu.com/p/5b04b66a55a1)
* Understanding Cryptography with Illustrations
* Applied Cryptography
* Understanding Cryptography in Depth
* Commercial Cryptography Application Security Assessment White Paper
* PGP: Pretty Good Privacy - Garfinkel Simson


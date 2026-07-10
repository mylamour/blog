---
layout: post
title: "Applied Cryptography Operations: What Practitioners Must Know"
categories: Security Architect
kerywords: SM2 ECC curve ASN.1 applied cryptography ciphersuite HMAC HKDF encryption X509 certificate key management key block
tags: Security Operations
translated: true
description: A security architect's field guide to day-to-day cryptography operations — curves and SM2, ASN.1 and X.509, cipher suites, HMAC/HKDF, and key management pitfalls.
---

> A security architect's attempt to break down the knowledge you actually need in day-to-day cryptography operations — seeing the trees without losing the forest.

# 0x00 Why This Piece

Applied cryptography is one of those areas where the theory sits in textbooks, the primitives sit in well-tested libraries, and yet operations still manage to get it catastrophically wrong. Most of the failures I see in the field are not "we broke the math" — they are "we used the library wrong", "we let the key live too long", or "we designed our own scheme". This piece walks through the fundamentals you should have at the tip of your tongue, and then a candid list of the operational anti-patterns I've watched real financial institutions ship into production.

# 0x01 Fundamentals

The most common artifacts in day-to-day operations are certificates and private keys in DER, CER, and PEM format. What is actually encoded inside those files? All of them are ASN.1-encoded blobs following a specific data structure. On the other hand, the unpredictability that real randomness provides is what ultimately determines whether a key is safe or not.

1. Formats and encoding

![ASN.1 and cryptographic formats](https://img.iami.xyz/images/cryptography/asn.1_and_cryptographic_format.png)

ASN.1 is a family of encoding rules that turns a data structure — for certificates, the structure is defined by **X.509** — into a binary payload you can store or transmit. Depending on the use case, that ASN.1 blob is then wrapped in different container formats (DER, PEM, PKCS#7, PKCS#12, and friends), and toolchains convert between them all day long.

// A side note on the X-series standards: if you're curious, dig into how ITU-T, IETF, ISO, and IEEE actually collaborate. Look at how the sausage gets made — why we have ASN, RFC, and ISO standards side by side, how the responsibility for different domains is split, and how each body pushes adoption. As a very recent example, ITU-T Y.3830 (2024) is the latest recommendation on post-quantum cryptography (PQC).

2. From random numbers to elliptic curves

![From random number to cryptographic application](https://img.iami.xyz/images/cryptography/from_random_number_to_cryptographic_applicatoin.png)

Start with random number generation. In practice you deal with two flavors: **TRNG** (true random number generators, sometimes written HRNG for "hardware RNG") and **CSPRNG** (cryptographically secure pseudorandom number generators). An HSM (Hardware Security Module) ships with a TRNG block and provides genuine true randomness. Real randomness is the foundation of the entire key hierarchy — unpredictable true randomness is what you use for keys, IVs, nonces, and anything else that must not repeat. Outside HSMs, everyday hardware also exposes a CSPRNG, typically by reading various electrical-noise sources into an entropy pool and running a deterministic algorithm over it. But that all lives at the hardware and kernel layer. At the system layer, the OS wraps it behind a syscall or file (`/dev/urandom`, `getrandom(2)`, `BCryptGenRandom`, etc.). Language runtimes and SDKs then wrap those syscalls to give you cross-platform access. Common SDKs include OpenSSL (C/C++, with bindings for most languages), Tink (Java-family), Bouncy Castle (Java-family), and cryptography.io (Python). These SDKs implement the common primitives, expose the relevant mechanisms, and support certain cipher suites out of the box. Some go further and offer a pluggable provider model plus a minimal amount of key management.

![Primitive, mechanism, ciphersuite, and lifecycle management](https://img.iami.xyz/images/cryptography/cryptographic_primitive_mechansim_ciphersuite_and_application_and_lifecycle_management.png)

But under all of that, what actually matters is the math: curve equations, modular arithmetic, finite fields, and so on.

![How ECC works — ECDH and ECDSA](https://img.iami.xyz/images/cryptography/how_ecc_works_ecdh_ecdsa.png)

I've covered the common symmetric and public-key algorithms in an earlier piece (see [Applied Cryptography and Crypto Infrastructure](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure/)), but elliptic curves were missing there, so I put together this slide specifically to fill that gap.

RSA is based on the hardness of integer factorization; **ECC** (elliptic curve cryptography) is based on the discrete-log problem over an elliptic curve. The diagram uses the NIST **P-256** curve as its running example — I took the actual curve parameters and plotted them with matplotlib. You can't really "see" a curve over a prime field the way you can see one over the reals, but you can at least get some intuition. I'll skip the group construction and the specifics of point generation; look at the diagram. The two things worth zooming in on are **ECDH** and **ECDSA**. For ECDH: because scalar multiplication on the curve is commutative under the group law, `S = k_A · (k_B · G) = k_B · (k_A · G) = S'` — which means two parties can arrive at the same shared secret while only ever exchanging public points. That shared secret is then passed through a KDF to derive a symmetric key for the rest of the session. Worth noting: on a well-behaved curve, the public point `Q` is guaranteed to land on the curve. If it doesn't, you're either on a broken curve or being fed an invalid point — and both cases can be exploited (invalid-curve attacks). In operations, you don't need to prove any of this yourself; just use a well-known, publicly vetted library. Similarly for ECDSA: if the per-signature nonce `k` is not fresh randomness — worst case, reused or fixed — the private key leaks in one or two signatures. Look up the Sony PlayStation 3 case; it is the canonical example.

For international readers unfamiliar with the Chinese national standards: **SM2** is China's national elliptic-curve public-key algorithm (GM/T 0003, roughly analogous in intent to ECDSA/ECDH over a specific 256-bit prime curve). **SM3** is China's national cryptographic hash function (GM/T 0004, output size 256 bits, comparable to SHA-256). **SM4** is China's national symmetric block cipher (GM/T 0002, 128-bit block, 128-bit key, comparable to AES-128). You'll run into these constantly in any Chinese payments, PKI, or compliance context.

# 0x02 What Actually Goes Wrong in Operations

> ECDH solves the key-exchange problem, but it does nothing about the asymmetric security postures of the two parties actually operating the system. True randomness gives you unpredictability, but does not protect you from a plaintext leak somewhere in transit. The algorithm may be safe; the library implementing it may not be; the call sites in your own code definitely may not be; and human operations are their own class of unpredictability.

Over the last two years I've seen an alarming amount of what I can only call **Mickey Mouse Operations (MMO)** inside traditional financial institutions. Let me walk through the anti-patterns and the exact excuses I've heard from real teams.

Some Chinese-specific context for international readers, since it will surface in a few of the anecdotes: **cryptography compliance assessment** (`密评`) is a mandatory, regulator-driven audit of how commercial cryptography is designed, deployed, and operated inside critical information infrastructure. **Commercial cryptography retrofit** (`商密改造`) is the project of replacing legacy or foreign algorithms with SM-series national algorithms to satisfy that assessment. **MLPS** (`等保`, Multi-Level Protection Scheme) is the broader Chinese cybersecurity classified-protection regime that sits above it.

* **Don't design your own encryption algorithm — and don't roll your own crypto library either.**
  MMO: teams that design their own AK/SK scheme, then "encrypt" data by taking the last N characters of the SK and using that as a key.

* **The key is as valuable as the data it protects.** Treat storage, access, and audit accordingly.

* **Don't use a fixed IV.**
  MMO: "We standardized a fixed IV in the integration spec, so every connecting institution uses the same value. A per-message IV would add engineering cost."

* **Don't use the same key indefinitely — every key needs a lifecycle.**
  MMO: "Is there a hard regulation that forces rotation? Can we skip it? Can we file for an extension? Rotating keys impacts the business!"

* **Don't reuse the same key across business scenarios**, and similarly, don't reuse the same random value for two different purposes. Certificates should also be scoped by use case — a signing certificate and a data-encryption certificate should not be the same certificate.
  MMO: "Two keys is a hassle, one is enough, right?"

* **Don't stack keys under keys** outside of an actual hybrid-encryption scheme. There is no reason for one symmetric key to wrap another symmetric key several layers deep.
  MMO: key A is stored in cleartext to protect key B, key B is wrapped by a key inside tool C, and the key inside tool C is wrapped by the HSM's LMK. Congratulations — you have four rings to break and the outermost one is plaintext.

* **Compute the MAC over the ciphertext, not the plaintext.** In other words: encrypt-then-MAC, not MAC-then-encrypt. Modern AEAD modes (GCM, ChaCha20-Poly1305) do this correctly for you by design.
  MMO: "What's the difference? Whichever is easier. I want to MAC the plaintext first."

* **Don't store private keys in cleartext, and definitely don't store the password protecting a private key in cleartext.**
  MMO: "Just zip it with a password when transferring! The password? Oh, we keep it in the config file next to the key."

* **Don't store private keys on local disk. Put them in a dedicated KMS or HSM-backed vault.**
  MMO: "We made a folder locally and set the file permissions. Isn't that fine?"

* **Don't store the individual key shares (split components) of a private key in cleartext.**
  MMO: not only did they get the components in cleartext, they XORed them together and asked me to confirm the resulting cleartext key material matched theirs. (Internal monologue: how the hell would I know?)

* **Don't use weak curves, weak algorithms, or weak cipher suites.**
  MMO: "What is a cipher suite? We don't support GCM. Why upgrade? 3DES has been working fine, why AES? Is there a regulation banning 3DES?"

* **Don't skip certificate revocation checks (CRL / OCSP).**
  MMO: "I don't validate anything. Not the CRL, not even the certificate's own validity period. We're on a leased line!"

* **Don't just validate the issuing CA — validate the certificate's subject too** (SAN, EKU, name constraints, and whatever business-specific attributes matter).

* **Avoid self-signed certificates, and avoid issuing multi-year certificates.**
  MMO: "Can you issue us a 5-year TLS certificate? Why do we need a separate test certificate (issued by a test CA) for the test environment when production uses the production certificate?" (Internal monologue: so you separate test from production by which CA signs the cert? Really?)

* **Avoid wildcard certificates.**
  MMO: "One certificate to rule them all — easier to use, easier to manage. Cost saving, everyone loves it."

Other operational questions worth asking yourself:

* Should this key be protected by the LMK or by a KEK? How do you decide?
* How should you apply the **key block** format (ANSI X9.143 / TR-31) and choose the KBPK? How should the header fields (usage, mode of use, key version) be set?
* In a payment network, how do you actually run a rotation of the PIN key and the MAC key?
* Should there be a dedicated key custodian / key ceremony role separate from the storage role?
* Under what circumstances is it acceptable for an application to talk to the HSM directly?
* What do you do when the CFCA SDK's certificate-issuance flow does not support a passphrase on the generated private key? (**CFCA** is China Financial Certification Authority, the dominant CA for Chinese financial institutions.)
* Should the root CA be kept offline? What does "HA" (high availability) actually look like for a root or issuing CA?
* If the HSM only accepts a whitelisted set of client IPs, how do you design around that?
* If the HSM does not ship an SDK and only accepts raw TCP/IP command messages, what's the right design pattern for the **Encryption-as-a-Service** (EaaS) layer in front of it?
* What is the correct way to use GCM? Do you need to set the AAD (additional authenticated data)? Especially for encrypting the transaction message inside a payment flow — how do you use AAD well?
* Should the main site and the CDN have separate certificates for the same domain (two certs, one domain)?
* Should you deploy dual certificates for high availability?
* For a SaaS product exposed under an enterprise-internal domain, should the customer's internal PKI issue the certificate?
* **[Chinese-context]** In CFCA's dual-certificate scheme (a signing certificate plus an encryption certificate, both required for regulated business), what do you do when institution A supports it but institution B doesn't? What if the HSM doesn't expose a dual-CSR interface?
* **[Chinese-context]** How do you download a certificate when the CFCA CSP (Cryptographic Service Provider) is not available on your platform?
* **[Chinese-context]** How do you handle the dual-certificate bundle and the encrypted private key CFCA hands back to you?

# 0x03 Wrapping Up

This piece took ten days to prepare (10/09 – 10/19), most of which went into drawing the diagrams above. Digging through my TODO list, there were a couple of things I wanted to write down and didn't:

* The different MAC algorithms for integrity, and how they compare.
* Where and how the **key block** (TR-31 / ANSI X9.143) format actually gets applied in practice.

A lot of things — once you let them slide, you never end up writing them down. In the same draft folder I also found a piece from late July on how to design AI products; I've opened it several times, and I've never finished it, and what I have written I'm not happy with.

Back to this one. Over the past two years I've integrated with something like forty Chinese banks, card issuers, and acquiring institutions. Only one or two — maybe four or five, if I'm being generous — struck me as operating at a reasonable level. Traditional finance is a very easy place to coast: don't focus on the business, don't focus on the technology, and you end up focusing on all the wrong details. The line I hear most often is "I've never seen this before — is this correct?". Answering nonsense with nonsense only produces more nonsense. Mickey Mouse Operations and "financial-grade security" are fundamentally incompatible.

Finally — I've been trying to advocate for `Less Operation, More Efficiency`, and a second idea, `Architecture as Code, Architecture for Compliance`. This might be the first concept I've proposed independently since taking on an architect role? I went back through my earlier writing on SDLC, shift-left security, and defense-in-depth; and on my summaries of intrusion detection, key management, data security, and network and cloud security practice. I don't quite know where the next breakthrough for enterprise security actually lies. I shouldn't be feeling this jaded this fast — or am I just watching too much Mickey Mouse Operation? (Cue the music: a Chinese song called *Mei Chu Xi* ("No Backbone") — the lyric that fits is roughly "should have been calm and in control; now it's rushed, scrambling, falling over itself". A depressingly accurate description of the JV enterprises I've been dealing with.)

# References

* [Highly recommended — Matthew Green's blog: A Few Thoughts on Cryptographic Engineering](https://blog.cryptographyengineering.com/top-posts/)
* [A Warm Welcome to ASN.1 and DER (Let's Encrypt)](https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/)
* [ITU-T Standards Recommendations](http://itu.int/itu-t/recommendations/index.aspx)
* [ASN.1 Made Simple — What is ASN.1?](https://www.oss.com/asn1/resources/asn1-made-simple/introduction.html)
* [SM2 Curve reference](https://dissect.crocs.fi.muni.cz/curve/SM2)
* [Standard curve database](http://neuromancer.sk/std/methods/)
* [OIDs for Chinese national algorithms (SM series)](http://gmssl.org/docs/oid.html)
* [Object Identifier (OID) Repository](https://oid-base.com/)
* [Applied Cryptography and Crypto Infrastructure (previous post)](https://fz.cool/Applied-Cryptography-And-Crypto-Infrastructure)
* [Privacy Computing and Data Security (previous post)](https://fz.cool/Privacy-Computing-And-Data-Security/)
* [Desmos — visual math tool](https://www.desmos.com/calculator)
* [SafeCurves](http://safecurves.cr.yp.to/rigid.html)
* [OpenSSL Architecture](https://docs.openssl.org/master/OpenSSLStrategicArchitecture/#to-be-architecture)
* [Web Crypto API — getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
* [Dual_EC_DRBG (Wikipedia)](https://en.wikipedia.org/wiki/Dual_EC_DRBG)
* [The Many Flaws of Dual_EC_DRBG (Matthew Green)](https://blog.cryptographyengineering.com/2013/09/18/the-many-flaws-of-dualecdrbg/)

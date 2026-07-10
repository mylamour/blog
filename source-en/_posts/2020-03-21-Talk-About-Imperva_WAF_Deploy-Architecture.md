---
layout: post
title: A Quick Look at Imperva WAF Deployment Options
categories: Security Engineer
kerywords: Imperva WAF architecture design
tags: security operations security architecture legacy post
translated: true
---


<table class="tg">
  <tr>
    <th class="tg-c3ow" colspan="2">Deployment Model</th>
    <th class="tg-c3ow" colspan="4">X6510</th>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">Performance</td>
    <td class="tg-c3ow" colspan="4">Peak web traffic &lt;= 2G</td>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">Deployment Mode</td>
    <td class="tg-c3ow" colspan="2">Transparent Bridge</td>
    <td class="tg-c3ow" colspan="2">Reverse Proxy</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Deployment Position (see diagram)</td>
    <td class="tg-baqh" colspan="2">Inline, behind the firewall</td>
    <td class="tg-baqh" colspan="2">Parallel with F5 on the same switch</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Cabling Mode</td>
    <td class="tg-baqh" colspan="2">Dual-line (bridge, multi-in multi-out)</td>
    <td class="tg-baqh" colspan="2">Dual-line (multiple physical interfaces, multi-arm)</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Network Layer</td>
    <td class="tg-baqh" colspan="2">Layer 2</td>
    <td class="tg-baqh" colspan="2">Layer 3</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2" rowspan="2">Deployment Requirements</td>
    <td class="tg-baqh" colspan="2">Centralized network access point</td>
    <td class="tg-baqh" colspan="2">F5 needs extra config to load-balance across WAF instances</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Traffic must not exceed the single-device performance cap</td>
    <td class="tg-baqh" colspan="2">Need to catalog every app's access domain list first</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Topology Diagram</td>
    <td class="tg-baqh" colspan="2"><img src="https://img.iami.xyz/images/77225558-18ed3580-6bab-11ea-80c6-e2947e49fffd.png" alt="Image" width="496" height="296"></td>
    <td class="tg-baqh" colspan="2"><img src="https://img.iami.xyz/images/77225559-1be82600-6bab-11ea-9b04-b3a4dd60bee4.png" width="641" height="240"></td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Pros</td>
    <td class="tg-baqh" colspan="2">No changes to existing network topology<br>No need to know what apps sit behind it<br>Lower latency<br></td>
    <td class="tg-baqh" colspan="2">Easy to scale performance horizontally</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">Cons</td>
    <td class="tg-baqh" colspan="2">Hard to scale out</td>
    <td class="tg-baqh" colspan="2">Adds latency<br>Requires network topology changes<br></td>
  </tr>
  <tr>
    <td class="tg-baqh" rowspan="5">Scenarios</td>
    <td class="tg-baqh">Maintenance cost (security + ops)</td>
    <td class="tg-baqh" colspan="2">WAF config is simple and easy to maintain</td>
    <td class="tg-baqh" colspan="2">WAF config is more complex; automation via API helps a lot</td>
  </tr>
  <tr>
    <td class="tg-baqh">Non-Layer-7 traffic</td>
    <td class="tg-baqh" colspan="2">Passed through directly to backend without inspection</td>
    <td class="tg-baqh" colspan="2">All traffic passing through gets inspected, no exceptions</td>
  </tr>
  <tr>
    <td class="tg-baqh">Device failure / power loss</td>
    <td class="tg-baqh" colspan="2">Fail-open on power loss — backend services stay up</td>
    <td class="tg-baqh" colspan="2">No transparent failover; traffic shifts to other WAFs in the wafpool</td>
  </tr>
  <tr>
    <td class="tg-baqh">Firewall NAT to backend servers</td>
    <td class="tg-baqh" colspan="2">No impact; selective mapping works fine</td>
    <td class="tg-baqh" colspan="2">No impact; selective mapping works fine</td>
  </tr>
  <tr>
    <td class="tg-baqh">SSL offload</td>
    <td class="tg-baqh" colspan="2">WAF needs the app's SSL cert to decrypt HTTPS (hits performance; may need an SSL accelerator card)</td>
    <td class="tg-baqh" colspan="2">SSL is offloaded at F5; WAF only inspects plaintext HTTP traffic</td>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">Conclusion</td>
    <td class="tg-c3ow" colspan="4">Transparent bridge mode is the first pick; reverse proxy is the fallback. If you do go reverse proxy, dual-arm KRP + LoadBalance + dual-line single BL is the preferred setup.</td>
  </tr>
</table>

For reverse proxy mode alone, just the cabling options give you 3–4 different deployment variations. But I'll leave that rabbit hole for another time.

> Spent a whole day organizing stuff I've been learning at work lately. Still have a bunch left to sort through, but it suddenly started raining tonight. Wu Bai's "Bèi Dòng" is playing in the background — forget the tech for now. Time to chill. Dropping a flag here though.

Flag & ToDo:

* [ ] Lessons from the job and wisdom from the veterans
* [ ] Data security architecture reading notes
* [ ] Revisiting security architecture
* [ ] What does data security actually need?
* [ ] A quick take on KMS and HSM architecture
 

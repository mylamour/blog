---
layout: post
title: 浅谈Imperva WAF 的部署方案
categories: 安全工程师
kerywords: Imperva WAF 架构设计
tags: 安全运维 安全架构 
---


<table class="tg">
  <tr>
    <th class="tg-c3ow" colspan="2">部署型号</th>
    <th class="tg-c3ow" colspan="4">X6510</th>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">性能</td>
    <td class="tg-c3ow" colspan="4">峰值Web流量 &lt;= 2G</td>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">部署模式</td>
    <td class="tg-c3ow" colspan="2">透明网桥</td>
    <td class="tg-c3ow" colspan="2">反向代理</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">部署位置（详细参考示意图）</td>
    <td class="tg-baqh" colspan="2">串联在防火墙之后</td>
    <td class="tg-baqh" colspan="2">同F5并联在同一交换机</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">部线模式</td>
    <td class="tg-baqh" colspan="2">双线（网桥多进多出）</td>
    <td class="tg-baqh" colspan="2">双线（多物理接口，多臂）</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">网络模式</td>
    <td class="tg-baqh" colspan="2">二层</td>
    <td class="tg-baqh" colspan="2">三层</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2" rowspan="2">部署需求</td>
    <td class="tg-baqh" colspan="2">网络的集中接入点</td>
    <td class="tg-baqh" colspan="2">F5增加配置为WAF进行负载均衡</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">流量不超过单台设备的性能峰值</td>
    <td class="tg-baqh" colspan="2">需要梳理每个应用的访问域名清单</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">部署示意图</td>
    <td class="tg-baqh" colspan="2"><img src="https://user-images.githubusercontent.com/12653147/77225558-18ed3580-6bab-11ea-80c6-e2947e49fffd.png" alt="Image" width="496" height="296"></td>
    <td class="tg-baqh" colspan="2"><img src="https://user-images.githubusercontent.com/12653147/77225559-1be82600-6bab-11ea-9b04-b3a4dd60bee4.png" width="641" height="240"></td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">优点</td>
    <td class="tg-baqh" colspan="2">不需要更改现有的网络结构<br>不需要知道后端的应用类型<br>拥有较低的时延续<br></td>
    <td class="tg-baqh" colspan="2">易于性能扩展</td>
  </tr>
  <tr>
    <td class="tg-baqh" colspan="2">缺点</td>
    <td class="tg-baqh" colspan="2">不易扩展</td>
    <td class="tg-baqh" colspan="2">增加时延<br>改变网络结构<br></td>
  </tr>
  <tr>
    <td class="tg-baqh" rowspan="5">场景</td>
    <td class="tg-baqh">维护成本（安全，运维）</td>
    <td class="tg-baqh" colspan="2">WAF配置简单，易于维护</td>
    <td class="tg-baqh" colspan="2">WAF配置较复杂，可借助API实现自动化</td>
  </tr>
  <tr>
    <td class="tg-baqh">非7层应用流量</td>
    <td class="tg-baqh" colspan="2">不进行检测直接转发到后端服务器</td>
    <td class="tg-baqh" colspan="2">所有经过流量一定会进行检测</td>
  </tr>
  <tr>
    <td class="tg-baqh">宕机断电</td>
    <td class="tg-baqh" colspan="2">断电直通，不影响后面的正常服务</td>
    <td class="tg-baqh" colspan="2">无法透传，只能使用wafpool中的其他waf</td>
  </tr>
  <tr>
    <td class="tg-baqh">防火墙地址映射后端服务器</td>
    <td class="tg-baqh" colspan="2">无影响，均可选择性映射</td>
    <td class="tg-baqh" colspan="2">无影响，均可选择性映射</td>
  </tr>
  <tr>
    <td class="tg-baqh">SSL卸载</td>
    <td class="tg-baqh" colspan="2">WAF需要导入应用的SSL证书解密HTTPS (影响性能，可能需要ssl加速卡)</td>
    <td class="tg-baqh" colspan="2">SSL在F5上卸载，WAF仅检测明文HTTP流量</td>
  </tr>
  <tr>
    <td class="tg-c3ow" colspan="2">结论</td>
    <td class="tg-c3ow" colspan="4">优先推荐透明网桥部署模式，其次选择反向代理模式;  在反向代理模式下，优先选择 双臂_KRP+LoadBalance_双线接单BL</td>
  </tr>
</table>

其实针对反向代理的部署模式，单考虑接线情况就有3-4种部署方式。但是此处并不打算再做讨论了。

> 连续整理了一天关于最近工作中学习到的东西，虽然还有大部分在整理，但是晚上突然下起了雨，听着伍佰的《被动》，我还搞个蛋的技术。还是放松一下吧。记个Flag。

Flag & ToDo:

* [ ] 工作中的感悟和那些年大哥们的教导
* [ ] 数据安全架构阅读笔记
* [ ] 再谈安全架构
* [ ] 数据安全需要什么？
* [ ] 浅谈KMS及HSM架构
 

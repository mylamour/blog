---
layout: post
title: "A Late-Night Reflection: What Starting Up Taught Me"
description: "From personal projects to co-founding a startup—what have I learned?"
categories: CTO
tags: [Security Architecture, AI Software Engineering, Agentic SDLC, AI Coding, Frontend, Vibe Coding, Entrepreneurship, Growth]
keywords: [Product, Architecture, Design, Agent, Agentic, Security Products, Security Architecture, Startup Experience, Lessons Learned]
translated: true
---

<!-- Starting Point → Customers → Product → Value Chain & Team → Outcome → Open Questions. **Facts**, **judgments at the time**, **current assessments**, and **future actions**. Perspectives for reflection: Investors, channel partners, customers, teammates, and outside observers. -->

> Why did I believe in it back then?

Q1: Why did I decide to start a business?

A: I thought the timing was right in three ways. In the real world, though, what any one person "thinks" depends on their own knowledge and what they have seen. Those thoughts are only the pieces of a point of view.

* **Personal experience:** I believed I had accumulated real practices in enterprise security, across architecture, engineering, operations, and neighboring fields such as data security, software engineering, and the SDLC. From trying to use AI over the past few years, I also found that large models could amplify the results of that earlier work and lower the cost at the same time. As more attacks appear, response and defense have to get faster. More companies should be able to stand up real security capability at a lower cost by using AI. By then, the Agentic SOC project had also taken shape beyond a side project.
* **Model progress:** Models keep getting stronger. Benchmarks show the same shift, from a focus on knowledge toward interaction, and in form from compressible tasks toward incompressible ones: model-based QA, then model-based conversation, then model-based reasoning, then model plus harness.
* **Market and sales:** The founder believed he already had sales channels, and customers who were ready to buy or close to signing. The product could be commercialized and sold. As co-founder, I had worked with him for years, and I trusted that relationship completely.

Q2. Which judgment about "the timing is right" turned out to be wrong?

A: The read on customer relationships and sales channels. We had a target list, and almost none of them closed. Some chose WorkBuddy, some chose a cheaper RPA tool, and some chose n8n. Sales had misjudged the targets. Trust passed along the chain, from sales to the founder to me, and amplified that misjudgment.

Q3: How was that claim about channels supposed to be checked? Was it?

A: One customer did sign for the product we had built ourselves. Beyond that, it never occurred to us to check the other leads. We trusted the years of working with the founder.

> Who is buying, and what are they actually buying?

Q4: What are customers actually buying?

A: That takes a chain of questions. Did we pick the right customers? If they have no money, they will not buy. If they have money, is any of it a security budget? If there is a security budget, what is it paying for: person-days, a relationship, compliance, or just something to show the boss? And how far is the price they actually pay from the list price? In practice, some customers were buying n8n person-days. Some only ran a POC. Some wanted to do AI inside Splunk. Some wanted n8n for workflows. Toward anything truly agentic, they stayed conservative, or they simply did not know how to use it. We had not picked the right customers.

We wanted to sell an Agentic SOC. What they wanted to buy was n8n person-days. We were selling AI pentest. What they wanted was an agent treated as the service of a fully intelligent senior security expert.

<!-- How wide is the gap between what we were selling and what customers were actually buying? -->

Q5: Who did we lose to? Who is the real competitor?

A: **POCs that stopped.** Some stopped because a competitor quoted far below the market. Some stopped because the customer did not know how to use the platform, or expected too much of AI: one sentence to an agent should be enough for anything, and they still did not know what an agent is. Some only wanted to see a demo and play with a POC. During delivery, tokens can be spun up with one click on SaaS, but some customers hit a wall asking for resources on a private deployment. Running every component on one or two machines, and keeping it stable, is not realistic.

**Deals we lost.** Some were paused because the organization was restructured. Some were dropped because the company changed strategy and started pushing WorkBuddy.

If your own house is rattling, how do you walk a steady line? Customers also wanted more compliance certifications for the platform.

When I look for the **real competitor**, I start with our own problems:

* Building got faster in the agent era, but you still cannot implement every request from every customer. Keep only what fits the platform's long-term direction. Otherwise **uncontrolled requirements** just create rework. Knowing how to amplify what agents can do is also not a reason to open several product lines early. That is **waste from technical overconfidence**, especially when the organization has not changed with it. The original design had FDEs, forward deployed engineers, using a coding agent to build small customer-specific features on a version branch. That turned out to be impossible. We also started an LLM gateway and a contract protocol too early, trying to make agents controllable before we needed to.
* Distribution and competition cannot rest on favors and kickbacks alone. Those arrangements are less solid than people think. The habit even reaches sales and makes them dishonest: inflate how important a customer is, so more engineering time gets pointed their way. Short-term thinking about favors can leave a founder unable to tell what matters more, and it cuts into the iteration cycle. We spent too much effort on AI pentest for WeChat mini programs, and the customer still took a competitor's RPA proposal at a very low price.

Beyond that:

* A more capable model, and one that is less restricted, is the core of an Agentic Security Platform. Cost and whether the model is actually available matter most. When a model is tightly bound by ethical limits, running an Agentic SOC and also closing the loop with AI pentest becomes close to impossible.
* Buyers are restrained about using agents. Some customers copied their expectations for agent control straight from the specifications in [OWASP/APTS](https://github.com/OWASP/APTS/) and wanted the platform's agents to reach that bar.
* On how users think: acceptance of AI is only part of it. Some customers barely trust AI and want everything under their control. Some expect far too much, and want every task done by an agent, ideally in one sentence or one click, with no configuration at all. What they expect is often unsupported by anything they actually have. They want the agent to follow the company's own rules, but those rules were never written down as an SOP. How is the agent supposed to know rules that exist only "inside the company"?

> What product are you actually selling?

Q6: If a general-purpose coding agent can already do the work, why build your own?

A: Three reasons: working as a team, compounding data, and fitting into the enterprise infrastructure underneath, including compliance. A general-purpose coding agent is not built for a team. Work inside a company cannot live on a single desktop client. For compliance, the platform also needs proper support for business customers: key management, data security, RBAC, segregation of duties, audit logs, and SSO, integrated with the enterprise infrastructure. Reusable knowledge and reusable results, the compounding of data, are things a general-purpose coding agent cannot do. One person cannot finish an alert analysis on their own machine and then have a colleague log into that machine to continue the conversation. What I wanted was a browser-based architecture plus an IM conversation: keep talking, investigate the incident, get progress in IM, reuse the session, and ask follow-up questions in the same thread.

None of the three is absolute. Most of the POC customers I met had no solid documentation system and no model platform. What they did have was the high-compliance base common in traditional finance: permissions, authentication, logging, and the rest of that infrastructure. Even that did not give them much compounding of data.

Q7: Does your product have a moat?

A: A moat can sit in the product, the technology, sales, the market, delivery, or support, and in all of them together. A moat dug in one place gets deeper only when the other places go deep with it. Three areas kept coming back:

* **Data engineering.** Large-scale RAG, a three-tier memory, making the agent more capable, mechanisms against hallucination, and replaying the agent's runs through a data lake.
* **Product features.** Looking back, these mostly do not count. IM notifications, IM chat, scheduled jobs, playbook learning: even shipping them before anyone else does not make a moat. Architectural change counts for more. A Governed Mission Control so the agent's runtime is more controllable, and the move from a single agent plus MCP to a combination of agents.
* **Closed-loop scenarios.** AI pentest, security analysis of code, and handling SOC alerts, with data engineering to standardize the data so the scenario actually closes. Continuous iteration between a cyber range and the AI pentest agent then deepens how well that agent finds vulnerabilities in one enterprise's environment.

Together that may be part of a moat. The real moat is more likely to sit in the platform's knowledge layer and in what the model itself can do. The model is the real competitor. When you are applying it, do not treat it as one.

Q8: How do you choose among new technology and buzzwords?

A: Coining buzzwords in engineering, and chasing fashion, does not help. In the AI era, new terms and new tricks arrive in a flood. Chasing every hot topic is a way to fail. Pay more attention to where your own product sits, and to whether you have the resources to make its advantages stronger. If the focus is an Agentic Security Platform, do not go deep on model tuning. There is no need to chase buzzwords such as Jev, AI-assisted SDLC, or harness. Choose what fits the platform and what can accumulate over a long time. Chasing the new term, or the new technique, rarely ends well. A founder hears "ontology" and asks what our ontology is. He hears "Jev" and asks whether it shows up in SOC scenarios. Stay with the groundwork and the practice you actually need, and you usually find you had already done the thing before the word appeared, in product features and in engineering. We were building an Agentic SDLC before Company A had published on it. When we started on Agentic SOC, most of what was around was still n8n, or an agent plus MCP.

> Who builds it, and who sells it?

Q9: What matters besides the product?

A: Every link in the chain is a variable, from gathering requirements to implementing them with vibe coding, from end-to-end tests to a release, from the user guide to delivery and deployment. None of them can be skipped. A small detail can decide whether it works. I used to think one part mattered more. Now I think all of them do, while still seeing which one matters most at the moment.

Sometimes a customer wants LDAP when you already support OIDC. Product and sales have to influence that choice, and engineering has to decide whether to build it. The team also has to keep information visible and volunteer what it finds. An SSO IdP configuration that keeps failing may turn out to be the customer's standard configuration server, which cannot resolve the target address. Under that, DNS does not connect. The network and name resolution are both broken, and the platform's base URL and the default OIDC algorithm may be wrong too. Ordinary delivery will only say it does not work, the script will not bring it up. Collecting logs, knowing how to trace the problem, and being able to propose something that fits the customer's environment matter more than the implementation itself. Or a customer has no model of their own, or their model gateway rotates its key every 30 minutes, while a platform job such as an AI pentest needs longer than that. The job gets cut off. A fast fix is a script that sits in front as a transparent proxy and rotates the key. A better fix is to rotate and read the gateway key automatically. There are other temporary fixes as well.

If those details are not in hand, opening your mouth to say "leave it to fate" is irresponsible. Make what can be controlled actually controlled, then wait quietly for what cannot. That is doing your part before you leave the rest. If your part is unfinished, fate is an empty word. A target customer's change of strategy, or a change of organization, can be the part you cannot control. Treat every link seriously. No single part outranks the others. Taking the work seriously is what matters most.

Q10: Do exchanges of interest in sales last?

A: The phrase I heard most while starting this company was "exchange of interests." An exchange has a trade in it, and a trade means something changes. What keeps changing cannot stay fixed, and it cannot last. There are no permanent friends and no permanent enemies. Business itself is an exchange of interests. The problem is not the exchange. The problem is whether anything of value is exchanged: the value of the product, or personal favors, under-the-table gifts, and cash back.

Winning a market means making a better product and offering better service, not a simple transfer of favors. Otherwise the company cannot last. That is especially true when the customer does not know what they need, sales does not know which scenarios it can actually solve, and delivery does not know how the product is used. A relationship that is nothing but an exchange of interests, and not an exchange of product value, is a rote, box-ticking ritual.

Shared conviction and a shared aim are what let a venture last, not the passing of favors back and forth.

Q11: Can super-individuals make a super-team?

A: My instinctive answer: if a super-team means a large organization, super-individuals will have a hard time forming one. Agents can turn a person into a super-individual, a 10x engineer or a 20x engineer. Putting those people in one room does not create a super-team. It tends to lower the quality of the team, overlap the work, and fork the way results get checked. That 10x is also local. An agent can let one engineer, or a small team, produce ten times as much. A company is a chain: engineering, delivery, pre-sales, sales, and business. Speeding up engineering does not speed up the chain. The pace is set by the slowest link. Being ahead also does not mean there is a return. When customers are buying person-days of n8n workflow work, they are more likely to ask how you are better than n8n. Some only want to keep using the Splunk they already have. Without a return, a super-team does not get enough to feed on.

I still hope the shape of a team changes before long. A data expert, a full-stack developer for agents, a platform security expert, and a product expert: each one already a team inside their own field, then combined, and working with agents to multiply the effect again.

> How did it stop, and why?

Q12: The first time it felt like it would not work

A: The first time was when everyone wanted everything packed into the platform. A vulnerability-management solution. A pentest solution for mini programs. They wanted the platform to support it directly. Even then, I thought I could still hold the technical direction and where we spent our effort. A later moment was the platform's knowledge layer, and how much we ourselves were actually using the platform. We spent too long picking apart the strengths of coding agents, and we lost sight of the fact that we were building our own product. After DSH appeared, everyone talked about how good DSH was, and nobody checked it on the same tasks we were doing. We later corrected that shallow view, and a deal closed afterward. I still cannot say whether that deal came from the product or from a personal favor.

Q13: Too early, or too slow?

A: We started early, but the head start was crushed by the model labs and the big companies. We did not have enough resources for the market or for delivery.

Q14: Why did it fail? What are the lessons?

A: Unfortunately, it failed. A failure is a failure. // Being open and aboveboard is a first-rate quality. The only way there is sincerity.

The account the founder gave me was that the investors ran into trouble and pulled the funding. The more objective account is that they never completed the agreed year of continued investment, and they expanded the cost bills beyond the original scope. Business is business.

Said without courtesy: not someone worth making plans with. The less courteous question is the one I have to ask myself: **if the investors had funded the full year as agreed, what would the company have looked like a year later?** Even with that full year of funding, there were still a lot of problems.

A few lessons:

* Decisions have to land in a written contract. Never trust a bare verbal promise.
* Someone who only puts the table together is not suited to building a company.
* Part of distribution has to stay in your own hands. If the customers come through resellers, then those customers are not yours.

The same question comes back: **of the contract, the channels, and the person who only puts the table together, which of these did we already know before we started? If we already knew, what we lacked was not knowledge. What was it?**

On the product and on delivery:

* The cost of using the product makes delivery harder. Most users still think a model can do anything for them. Many have no idea what an agent is. Driven by compliance, and given what these systems cost, a security team has a learning curve before it can use an Agentic Security Platform. The delivery team has that learning curve too.
* Do not get stuck on small advantages. Delivery teams get used to pointing at one strength of this open-source product and another strength of that one. So what? That does not mean the company makes money from it. It is also the wrong reason to compare tools, if you never learn them deeply or close a feedback loop. The better question is how to develop our own platform until it is worth more.
* Do not design and build for one potential POC customer's special request, even when the request is only a demo flow. The customer probably does not understand what they asked for. A request in that shape is also a sign the deal will be hard to close. Sales has almost certainly inflated it. And writing the code, fixing the bugs, and later deleting the feature all spend tokens.

On the team:

* A team needs confidence, and it needs success in the ordinary sense: a place in a competition, prize money, a closed deal. The leader has to supply a stronger conviction. When there is no leader above the leader, that conviction matters even more, together with judgments that come from your own experience.
* Stay serious, and keep information visible. A sound sense of what matters will carry you further.
* If you demand expertise and the ability to learn from some teams, while letting others stay a slapdash operation because you cannot hold them to a standard, they never grow, and the failure comes faster.

Last of all, accept uncertainty. How things unfold is full of it: the work, the deals, how the team fits together. See the uncertainty, work on it, and accept it too.

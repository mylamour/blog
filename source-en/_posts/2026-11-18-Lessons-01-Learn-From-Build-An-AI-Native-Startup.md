---
layout: post
title: What I’ve Learned from Starting a Business
description: "From personal projects to co-founding a startup—what have I learned?"
categories: CTO
tags: [Security Architecture, AI Software Engineering, Agentic SDLC, AI Coding, Frontend, Vibe Coding, Entrepreneurship, Growth]
keywords: [Product, Architecture, Design, Agent, Agentic, Security Products, Security Architecture, Startup Experience, Lessons Learned]
translated: true
---

<!-- Starting Point → Customers → Product → Value Chain & Team → Outcome → Open Questions. **Facts**, **judgments at the time**, **current assessments**, and **future actions**. Perspectives for reflection: Investors, channel partners, customers, teammates, and outside observers. -->

> Why did I believe in it back then?

Q1: Why did I decide to start a business?

A: I believed the timing was right across three key areas. In the physical world, however, what one person "believes" is shaped by their own unique cognition and experience—these are merely individual points of view.

*   **Personal Experience:** I felt I had accumulated best practices in enterprise security—spanning architecture design, engineering, operations, and various technical domains (data security, software engineering, SDLC, etc.). Furthermore, through my experiments with AI over the past few years, I realized that large models could amplify the impact of existing enterprise security efforts while simultaneously reducing costs. In the AI ​​era, as the nature of attacks evolves, our response and defense mechanisms must also evolve. I believed it should be possible for more enterprises to build robust security capabilities at a lower cost by leveraging AI. Additionally, my "Agentic SOC" project had matured from a side project into a more concrete offering.
*   **Model Development:** AI models have grown increasingly powerful. Looking at benchmarks, there has been a clear shift—moving from a focus on static knowledge toward interactive capabilities (evolving from "compressible" to "incompressible" tasks). The progression has moved from Model-Based QA to Model-Based Conversation, then to Model-Based Reasoning, and finally to the integration of Models + Harnesses.
*   **Market & Sales:** As a founder, I believed I had access to established sales channels and a pipeline of potential customers ready to buy or expressing clear intent to purchase. This product suite could be commercialized and sold. As a co-founder, I had a long history of working with the other founder, and I placed complete trust in that relationship.

Q2. Which assessment of "the right timing" turned out to be wrong?

A: The assessment of customer relationships and sales channels was flawed. Although we had a list of target clients, almost none of them converted into actual sales. Some chose WorkBuddy, others opted for cheaper RPA solutions, and some went with N8N. This indicates that our sales team misjudged the target clients—an error that was compounded by the trust-based dynamic between the sales team, the founder, and myself.

Q3. How was the assumption regarding sales channels supposed to be validated? Was it actually validated?

A: We did secure one client through a project we developed in-house, but beyond that, we failed to validate other potential leads—relying instead on the long-standing partnership with the founder.

> Who is buying, and what are they actually purchasing?

Q4: What are the clients really buying?

A: This requires a series of follow-up questions: Did we identify the right target audience? If a client lacks the funds, they won’t buy the product. If they do have the budget, is it specifically allocated for security? If there is a security budget, what are they actually paying for? Is it for professional services (man-days)? Is it based on existing relationships? Is it to satisfy compliance requirements, or simply to "check a box" for management? And what is the gap between the list price and the actual transaction price? In reality, some clients were essentially paying for N8N professional services, while others only conducted a Proof of Concept (POC). Some preferred integrating AI within Splunk, while others favored using N8N for workflows. When it comes to "Agentic" (AI-agent-based) solutions, clients remain quite conservative—or perhaps they simply don't yet understand how to utilize them. In short, we didn't target the right clients.

We aimed to sell an "Agentic SOC," but what clients were actually buying was N8N professional services. We tried to sell "AI-powered penetration testing," while clients were looking for an "agent" that could function as a fully autonomous, senior security expert.

<!-- How wide is the gap between what we were selling and what the clients were actually buying? -->

Q5: Who did we lose to? Who are our true competitors? A: **Regarding discontinued POCs (Proof of Concepts):** Some were halted because competitors offered prices far below market rates. Others failed because clients didn’t know how to use the platform—often due to unrealistic expectations about AI’s capabilities (e.g., assuming an "Agent" could handle any task based on a single prompt, without actually understanding what an Agent is). Some clients simply wanted to see a demo or "play around" with a POC. Furthermore, while the platform’s tokens can be easily provisioned in a SaaS environment, some clients encountered bottlenecks when attempting private deployments—it is simply unrealistic to run all system components on one or two machines while ensuring stability.

**Regarding lost deals:** Some were paused due to organizational restructuring, while others were dropped because the company shifted its strategy toward promoting "WorkBuddy."

If one’s own house is in disarray, how can one expect to move forward on a solid footing? Moreover, clients often require specific compliance certifications for the platform.

When identifying **true competitors**, I prefer to start by examining our own shortcomings:
* In the era of AI Agents, development has accelerated, but it is impossible to fulfill every unique requirement from every client. We should only pursue requests that align with the platform’s long-term evolution; otherwise, **uncontrolled requirements** will inevitably lead to costly rework. Furthermore, one shouldn't assume that mastering the power-amplifying potential of Agents justifies an immediate, broad-scale expansion across multiple product lines—this is merely **wasteful overextension driven by "technological overconfidence."** This is especially problematic when the organizational structure fails to evolve in tandem. For instance, we initially envisioned having FDEs (Full-stack Development Engineers) use "Coding Agents" to build custom, granular features for specific client branches—a goal that proved entirely unfeasible. Additionally, in an premature attempt to exert control over Agents, we began developing an LLM gateway and formal interaction protocols.
* Relying solely on "incentive-based arrangements" (or kickbacks) to secure distribution channels or gain a competitive edge is a flawed strategy—such arrangements are far less robust than one might imagine. This culture can even foster dishonesty within the sales team, where the perceived importance of certain clients is inflated just to secure a larger share of R&D resources. Such short-sighted, profit-driven thinking can even cloud a founder’s judgment, leading them to misprioritize initiatives and disrupt the product iteration cycle. For example, we invested excessive effort into AI-driven penetration testing for "mini-programs," only to lose the client to a competitor offering an RPA-based solution at a rock-bottom price. Furthermore:
* More intelligent and unconstrained models are the core of any "Agentic Security Platform" (where cost and model availability are critical). If a model is subject to strict ethical guardrails, it becomes virtually impossible to implement an "Agentic SOC" that also incorporates AI-driven penetration testing for closed-loop validation.
* Enterprise clients tend to be quite cautious regarding the use of agents. Some, for instance, explicitly reference the specifications found in [OWASP/APTS](https://github.com/OWASP/APTS/) as a benchmark for the level of control they expect from such agents.
* Regarding user mindset: while some clients are open to AI, others are deeply distrustful and demand total control. Conversely, some have unrealistic expectations—hoping that agents can handle everything via a single prompt or a one-click action, effectively eliminating the need for any configuration. Often, these expectations lack the necessary foundational support; for example, a client might expect an agent to intelligently follow internal corporate policies, yet they haven't even documented their standard operating procedures (SOPs)—so how could the agent possibly "know" those policies?


> What (product) are you actually selling?

Q6: If general-purpose coding agents can already perform these tasks, why build a custom agent?

A: There are three main reasons: team collaboration, data compounding, and integration with enterprise infrastructure (compliance). General-purpose coding agents are not designed for team-based operations, and enterprise workflows cannot be confined to a single desktop client. Furthermore, to meet enterprise compliance requirements, a platform must support B2B-grade infrastructure—including key management, data security, RBAC (Role-Based Access Control), SOD (Segregation of Duties), audit logs, and SSO (Single Sign-On). Additionally, general-purpose coding agents lack the ability to reuse knowledge or build upon previous results (data compounding). For example, if user A performs an alert analysis on their own machine, user B cannot simply log into A’s computer to continue the conversation. An ideal solution would feature a browser-based (B/S) architecture integrated with an instant messaging (IM) interface, allowing for continuous, collaborative investigation of security incidents. This would include receiving progress updates via IM, the ability to share/resume sessions, and the capacity to follow up on tasks directly within the chat. Of course, these three aspects are not absolute. Based on the POC (Proof of Concept) clients I’ve engaged with, most lack a robust documentation system or a mature model platform. While they may possess the high-compliance infrastructure typical of traditional finance—such as integrated access control, authentication, and logging—they often fail to realize the full potential of "data compounding" (the cumulative value derived from data).

Q7: Does your product have a "moat"?

A: A moat can be built across various dimensions—product, technology, sales, market, delivery, and after-sales support—or through a combination of these. A moat established in one area only becomes truly deep when reinforced across all other dimensions. I’ve identified three key areas:

*   Data Engineering: This includes large-scale RAG (Retrieval-Augmented Generation), a three-tier memory architecture, enhancements to agent intelligence, anti-hallucination mechanisms, and the ability to "replay" agent execution results via a data lake.
*   Product Features: In reality, individual features—such as IM notifications, chat interfaces, scheduled tasks, or playbook learning—do not constitute a true moat, even if you are the first to market with them. More significant are architectural shifts, such as implementing a "Governed Mission Control" for better runtime oversight of agents, or evolving from single-agent/MCP (Model Context Protocol) setups to multi-agent orchestration.
*   Closed-Loop Scenarios: By integrating AI-driven penetration testing (AI Pentest), secure code analysis, and the handling of SOC (Security Operations Center) alerts—all underpinned by standardized data engineering—we create closed-loop operational scenarios. Furthermore, through continuous iteration between a "cyber range" (simulated environment) and the AI ​​Pentest agent, we deepen the agent’s ability to uncover vulnerabilities specific to an enterprise’s unique environment.

While these elements combined may form a partial moat, a *true* moat is more likely to be found in the platform’s knowledge layer and the inherent capabilities of the underlying models. In fact, the models themselves are the real "competitors"—though, from an application-development perspective, one shouldn't treat them as such.

Q8: How do you navigate new technologies and industry buzzwords?

A: There is no value in manufacturing buzzwords or blindly chasing trends. In the age of AI, there is an overwhelming influx of new terminology and gimmicks; chasing every trend is a recipe for failure. Instead, focus on your product’s core positioning and whether you possess the resources and capabilities to strengthen its competitive advantages. For instance, if your focus is an "Agentic Security Platform," you shouldn't get bogged down in deep-level model fine-tuning. There is no need to obsessively chase buzzwords like "Jev," "AI-Assisted SDLC," or "Harness." Instead, choose a platform direction that is a good fit—one that allows for long-term accumulation and sustainable development. Chasing the latest trends or technologies rarely yields good results. For instance, some founders might ask, "What is your ontology?" the moment they hear the term, or "Do you support SOC (Security Operations Center) scenarios?" the moment they hear "Jev." In reality, if you focus on the necessary foundational work and practical application, you often find that you’ve already implemented these concepts—whether in terms of product features or engineering practices—long before the buzzwords even emerged. We were working on an "Agentic SDLC" before the industry (Company A) even published articles on it; and when we began developing for "Agentic SOC," the prevailing landscape was still largely defined by tools like n8n or basic Agent+MCP integrations.


> Who builds it, and who sells it?

Q9: What matters more than the product itself?

Across the entire product lifecycle—from requirements gathering to realizing the "vibe" (the overall user experience/feel), from end-to-end (E2E) testing to version releases, and from user documentation to delivery and deployment—every single stage is a variable that cannot be ignored. Even the smallest detail can determine success or failure. While I once thought certain aspects were more critical than others, I now realize that everything is important (though, naturally, one must also discern which specific element is the most pressing priority at any given moment).

For example, a client might request LDAP support when you already support OIDC. In such a scenario, the product and sales teams must work to influence the client’s choice, while the technical team must decide whether or not to build the requested feature. Beyond this, the team requires transparent communication and proactive feedback. Consider a case where an SSO IdP (Identity Provider) configuration keeps failing: the root cause might be that the client’s standard server configuration cannot resolve the target address—a deeper issue involving network connectivity and DNS resolution. Furthermore, there might be discrepancies in the platform’s Base URL or the default OIDC algorithms. A standard delivery process might simply report, "It doesn't work; the script won't run." However, the ability to gather logs, systematically troubleshoot, and—crucially—propose solutions tailored to the client’s specific environment is far more important than the technical implementation itself. Another example: a client might lack their own AI model, or their model gateway might rotate its API keys every 30 minutes. If a platform task (such as an AI-driven penetration test) takes longer than 30 minutes, the task will inevitably be interrupted. How do you solve that? A quick-fix approach involves scripting a transparent proxy with rotating front-end endpoints; a more robust solution would be to automate the rotation and retrieval of gateway keys. Naturally, there are other stopgap measures as well.

If you fail to manage such details, claiming that you are "leaving it to fate" is simply irresponsible. True diligence—"doing all that is within one's power before leaving the rest to fate"—means taking full control of everything that *can* be controlled, and only then calmly awaiting the outcome of the uncontrollable factors. If you haven't done everything in your power, then "fate" is merely an empty excuse. Examples of truly uncontrollable factors might include a target client’s strategic pivot or a major organizational restructuring. Every single link in the chain deserves serious attention; there is no "most important" part—diligence itself is what matters most.

Q10: Are interest-based exchanges in sales sustainable?

A: Throughout my time as an entrepreneur, the term I’ve heard most often is "interest-based exchange." By definition, such exchanges involve trade-offs and constant flux—and where there is constant change, stability and longevity are impossible. As the saying goes, there are no permanent friends or permanent enemies. Business, by its very nature, is an exchange of interests; the issue isn't the exchange itself, but rather the *value* behind it. Is the exchange rooted in the genuine value of the product, or is it merely a matter of social maneuvering, kickbacks, or cash incentives?

Ultimately, capturing a market requires building a better product and providing superior service—not just relying on simple, transactional incentives value delivery; otherwise, it is unsustainable for any enterprise. This is especially true when clients don’t know what they need, sales teams are unaware of the specific use cases or solutions they can offer, and the delivery team doesn’t fully grasp how the product is actually used. If the engagement is based solely on a 100% transactional exchange of interests—rather than an exchange of product value—it is no different from receiving a series of vaccinations (a purely mechanical, perfunctory process).

A venture can only be truly long-lasting when it is built upon shared beliefs and common pursuits, rather than relying merely on the exchange or distribution of interests.

Q11: Can "super-individuals" form a "super-team"?

A: Intuitively speaking, if you define a "super-team" as a large-scale organization, then it is very difficult for "super-individuals" to form one. AI agents can transform individuals into "super-individuals"—for instance, an engineer who performs at 10x or 20x the capacity of an average peer. However, simply gathering these super-individuals together does not create a super-team; instead, it often leads to a decline in overall team quality, redundant tasks, and fragmented outcomes. Furthermore, this "10x" performance is localized. While an agent might enable a single engineer or a small team to achieve a 10x increase in output, a company functions as a chain—encompassing R&D, delivery, pre-sales, sales, and business development. Accelerating R&D alone does not speed up the entire chain; the overall velocity is determined by the slowest link. Moreover, being "advanced" does not automatically guarantee a return on investment. When clients engage services involving, say, n8n workflows, they are more likely to ask, "How are you better than n8n?" or express a preference to keep using their existing tools (like Splunk). Without a clear return, a "super-team" would lack the necessary "nutrients" (resources/value) to sustain itself.

That said, I do look forward to seeing organizational structures evolve in the near future. Imagine a team composed of a big-data expert, an AI-agent full-stack developer, a platform security expert, and a product expert—where each member functions as a "team" within their own domain. When brought together, they could leverage AI agents to achieve an even greater, multiplicative amplification of impact.

> How did it come to a halt, and why?

Q12: The first moment it felt like it wouldn't work

A: The first time I felt it wouldn't work was when there was an expectation to pack everything into the platform—whether it was solutions for vulnerability management or penetration testing for mini-programs—with the hope that the platform would support it all natively. At that stage, I felt I could still maintain control over the technical direction and resource allocation. Later, another critical juncture arose regarding the enrichment of the platform’s knowledge layer and the extent to which the platform was actually being utilized internally. We spent too much time critiquing the merits of "coding agents" without fully grasping that our primary objective was to build our own product. When "DSH" (a hypothetical or specific tool) emerged, everyone raved about its utility—yet no one bothered to verify its performance on the same tasks we were tackling. We eventually corrected this superficial perspective, which even led to a closed deal (though I’m not entirely certain if that sale was won on the product’s merits or out of personal goodwill).

Q13: Too early, or too slow?

A: We started early, but our first-mover advantage was crushed by foundation model providers and major tech incumbents. We simply lacked the necessary resources for market penetration and delivery.

Q14: Why did it fail? What are the lessons learned?

A: Unfortunately, it failed. A failure is a failure. // Having an open, magnanimous heart is a top-tier quality—and the only way to achieve that is through absolute sincerity.

According to the facts provided by the founder, the investors hit a setback and subsequently withdrew their funding. More objectively, however, they failed to honor the agreement to provide continuous funding for one year, and they even attempted to charge us for costs that fell outside the original scope. But, as they say, "business is business."

To put it bluntly: "What a fool—hardly worth collaborating with!" But, to be even more critical, I have to ask myself: **If the investors had honored the agreement and funded us for the full year, what would the company’s situation have been then?** (In hindsight, even with a full year of funding, there were still deep-seated issues.)

Key lessons include:
* Decisions must be formalized in written contracts; never rely on mere verbal promises.
* People who are primarily "deal-makers" or "networkers" (those who just "set the stage") are often ill-suited for the actual work of entrepreneurship.
* You must retain direct control over at least a portion of your distribution channels; if all your customers come through third-party agents, then, in effect, none of those customers are truly yours.

This leads to a follow-up question: **Regarding contracts, distribution channels, and the "deal-maker" issue—which of these were known before starting the venture? If they were known, then it wasn't a lack of knowledge—so what was actually missing?**

Furthermore, regarding product and delivery:
* High "cost of use" complicates the delivery process. Most users still operate under the misconception that a foundation model can do *anything* for them; they often have no concept of what an "agent" is, nor do they understand its function. Given the requirements for compliance and cost-efficiency, adopting an "Agentic Security Platform" entails a learning curve—not just for the security department, but for the delivery team as well.
* Avoid getting bogged down in minor, isolated advantages. Delivery teams often fall into the habit of praising various open-source products for specific, individual strengths. So what? That doesn’t translate into profit for the enterprise. Comparing tools based solely on such narrow features—without gaining a deeper understanding or establishing a feedback loop—is counterproductive. Instead, the focus should be on evolving your own platform to deliver greater, more substantial value.
* Do not build custom features or workflows just because a potential POC (Proof of Concept) client requests them—even if it’s just a "demo" flow. First, the client likely doesn’t fully grasp what they’re asking for. Second, such requests are rarely a sign of a deal that will actually close. Third, there’s almost certainly some exaggeration involved on the sales side. Furthermore, every step—writing code, fixing bugs, and eventually removing these unnecessary features—consumes "tokens" (resources/effort).

Regarding the team:
* Teams need confidence and tangible, conventional markers of success—such as competition rankings, prize money, or closed deals. It is up to the leader to instill a stronger sense of conviction. When there is no leader to look up to, that conviction—along with sound judgment based on personal experience—becomes even more critical.
* Always maintain a serious, professional attitude and ensure transparency. A solid, ethical value system is the best foundation for long-term progress.
* Demanding high levels of expertise and learning capacity from some teams while allowing others to remain disorganized and stagnant—without the ability to enforce standards or foster growth—will only accelerate failure.

Ultimately, you must embrace uncertainty. The evolution of events—whether in your daily work, sales deals, or team collaboration—is inherently unpredictable. Recognize this uncertainty, work to resolve it, and, at the same time, learn to accept it.
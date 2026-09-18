/**
 * Profile API. A Cloudflare Worker that lets the public site answer
 * questions and assess role fit without ever exposing an API key.
 *
 * Two endpoints:
 *   POST /ask  { question }  ->  { text }
 *   POST /fit  { jd }        ->  the assessment object the site renders
 *
 * Deploy:
 *   npm create cloudflare@latest profile-api -- --type=hello-world
 *   (replace src/index.js with this file)
 *   npx wrangler secret put ANTHROPIC_API_KEY
 *   npx wrangler deploy
 *
 * Then paste the deployed URL into API_BASE at the top of index.html.
 */

const MODEL = "claude-sonnet-5";

// Only these origins may call the API. Add your domain, keep the list short.
const ALLOWED_ORIGINS = [
  "https://harshitpandey.in",
  "https://www.harshitpandey.in",
  "http://localhost:8788",
];

// The single source of truth the model is allowed to answer from.
// Keep this in step with the site.
const RECORD = `
HARSHIT PANDEY, verified professional record. Bengaluru, India. hprishu@gmail.com, +91 98866 77953.
11.1 years continuous Salesforce experience since August 2015, with no employment gaps: he left Prodapt on 18 August 2025 and started at Bazaarvoice on 19 August 2025, the very next day.
Languages: English C2, Hindi C2, Spanish A1. Open to Salesforce Technical Architect, Technical Lead, Engineering Manager and Salesforce AI roles.

ROLE 1: Bazaarvoice, Bengaluru. His official job title is Salesforce Administrator (BTO India, CRM). Joined 19 August 2025, still there. The work below is architect scope: he is the design authority for the platform's AI and release infrastructure. If asked about seniority, say exactly that, the title is Administrator and the scope is architect. Never upgrade the stated title.

AI WORK AT BAZAARVOICE, the core of his current profile:
BV Cortex, an agentic control plane over the Bazaarvoice Salesforce estate. Five scored lenses (spend, commitment, health, adoption, data) over one org, each finding priced in dollars where a defensible rate exists, all ranked as a single prioritised backlog under one composite score. The composite is deliberately capped at 15 points above the weakest lens so a majority of healthy lenses cannot mask a critical one. Roughly 90 percent of Cortex has no model in it at all, because a number that needs a model to produce is a number nobody can audit. The agentic parts each have a human gate: Ask Cortex answers from a grounded brief and cites the findings it used; the Cortex Analyst runs in GitHub Actions, writes a fix and opens a draft pull request but never auto merges; Change Plans use propose, approve, dispatch, verify, where the model only writes down what it would do and a named human approves before anything executes, and the executor method takes an id rather than a payload so the set of things it can do is exactly the set somebody read and approved. Cortex cannot write to production by construction, not by configuration: the class that talks to production issues GET and contains no method capable of sending a record.
BV AI Apex Test Autopilot, Salesforce native autonomous Apex test generation, coverage measurement and failing test repair, built against an org of over 1,000 Apex classes. It runs on the in platform Salesforce Models API behind the Einstein Trust Layer, so no code leaves the Salesforce trust boundary and there are no external API keys, and the model name is configuration so it can be repointed without a deploy. Four prompt modes: generate, extend, repair and fix failing. Every prompt carries hard rules derived from observed failures, including a rule that every test method must contain a meaningful assertion, which is what stops a model writing a method that calls everything, asserts nothing and reports full coverage. Rules also force a 200 record bulk scenario, because governor limits are where Salesforce code actually breaks, and delta based count assertions, because org automation creates extra records. Architecturally it is a Queueable based state machine: generate, compile, run, measure and repair are independent transactions, which is what lets it work at scale inside governor limits. He diagnosed and worked around a platform level defect where Salesforce's own coverage aggregate table reported zero percent for classes that were demonstrably covered, rebuilding coverage measurement from first principles. An LWC dashboard carries the safety controls: a kill switch, a no progress guard and a regression guard. Piloted against a 454 class and trigger inventory in staging, it proved the end to end loop by taking a class from 0 to over 73 percent coverage with zero human written test code. He self initiated the project after identifying org wide test coverage as a recurring engineering gap.
Claude skills that automate delivery end to end: branch and pull request creation, validation and deployment, unit test generation, the Confluence technical write up, and the Jira status update.
BV DevOps, a 100 percent Salesforce native CI/CD application. He was the sole architect and developer: design, data model, Apex, LWC and the CI workflows. The whole release lifecycle runs inside Salesforce. A Release Manager LWC walks each release through its steps; Apex services call the GitHub REST API and Jira Cloud REST API through Named and External Credentials so no secret sits in code, dispatch GitHub Actions via workflow_dispatch to run the actual metadata deployment through the sf CLI, and poll for the result. Three deployment flows share one engine, staging, production and dev backup, each with server computed step gating so the UI reflects real release state. An 8 step staging pipeline and a 9 step production pipeline with a code review gate. Quick deploy reuses an already validated deployment. Metadata path resolution covers 40+ types including the awkward ones: custom labels that all live in one file, LWC and Aura bundles, email templates and object sub components. The data model is Release, Jira Ticket, Deployment, Merge Request and Environment, with independent release lookups so one ticket can sit in staging, production and dev backup flows at once without collision. Everything is configuration driven through Custom Metadata, branch names, ready statuses, endpoints and workflow routing, with nothing hardcoded, and the app is built to be packaged and reused.
Engineering problems he solved in that tool, useful in interview:
Component level copy deployment. Merging entire branch histories diffed thousands of files, so instead each ticket's package.xml is resolved to specific file paths and only those components are copied into a working branch, producing a pull request scoped to the real change set and therefore reviewable.
Branch matching at scale against a repository with more than 2,600 branches. Fast path uses GitHub's matching refs API with case variant prefixes; the fallback is a normalised paginated scan insensitive to case, separators, prefixes and suffixes, so arbitrary branch names still resolve.
Jira Cloud API pagination inconsistencies, where the live API deviates from Atlassian's own documentation, plus branch naming conflicts and metadata dependency resolution for child types such as validation rules, workflow rules, field updates, record types and list views.
GitHub Contents API concurrency. Each file write is its own commit and moves the branch head, so the SHA read for one file goes stale for the next and GitHub answers 409. Fixed with a refetch SHA and retry loop, per callout timeouts, smaller batches to stay within Apex callout limits, and Queueable chaining.
Merge state correctness. A genuine conflict and an already merged branch present the same way and both stall a release; reading changed files, commits and merged status from the pull request separated them and stopped components being silently dropped from deployment previews.
Governor limit hardening. Regex string operations failed with Regex too complicated on large base64 file payloads and were replaced with literal replace operations.
CI runtime stability. GitHub Actions pinned to Node 18 and a fixed Salesforce CLI version after Node 20 and later crashed the CLI, plus hardened auth URL handling.
Support AI platform instrumentation: prompt metric tracking and agent feedback across Suggested Reply, Similar Cases and Internal Assistance.
Agentforce case deflection proof of concept, grounded case comment generation through Prompt Builder, and similar case matching on the Case record.
Agentforce Flex Credit overage root cause analysis and control playbook, prepared as an internal leadership briefing.
Salesforce MCP adoption, with propose, approve, dispatch and verify gating, and independent checks that prove the target org is a sandbox before any write leaves.
On the DocuSign migration he audited every existing template and merge field, found a partially complete prior migration attempt, and reframed the project scope on that basis to cut the estimated effort substantially, then delivered a validated deployment package and an implementation runbook.
Owned the DocuSign platform migration against a hard vendor end of life on 16 October 2026, when the legacy dsfs eSignature app and the SBQQDS CPQ bridge stop working. DocuSign's own migration tool cannot convert CPQ integrations, so the send path was rebuilt on the Docusign Apps Launcher Apex Toolkit after he established that the vendor's sending page cannot be reached programmatically. Ten defects found and cleared, several of them each invisible until the one before it was fixed. A backlog of 87,809 CPQ quote documents that the new platform could not accept was solved with on demand idempotent conversion at send time rather than a migration batch. He also removed the largest manual rollout step by supplying documents and recipients from Apex instead of hand built envelope templates, and verified the whole chain live: quote sent, both signatures collected in routing order, envelope completed, signed PDF and certificate written back to the Quote.
Diagnosed revenue data integrity across account hierarchies and service contracts, including Booked ARR mismatches, proving the existing calculation correct and identifying the real cause rather than rewriting working logic.
Ran the Salesforce service queue: access governance, user lifecycle, CPQ quote and amendment defects, data reassignment, Certinia PSA support.

EXECUTIVE EXPOSURE AND EARLY TENURE:
He joined through a condensed knowledge transfer period covering the full Salesforce functional and technical landscape including third party integrations, and delivered a DocuSign proof of concept and an early Agentforce proof of concept that laid the groundwork for the later AI work.
Agentforce Service Agent proof of concept for automated case deflection and escalation, a screen flow calling Prompt Builder to generate grounded case comment drafts from case context. He demoed the working proof of concept to Directors and the CIO, and presented it at a cross team technical showcase to a visiting US engineering team.
Alongside it he built an Agentforce Token Consumption Dashboard giving leadership visibility into AI token usage per action and projected monthly cost. It was used to inform production cost governance decisions, and it pairs with the Flex Credit overage analysis: he both surfaced the cost and then explained the overage.

LEGACY MODERNISATION:
He took ownership of refactoring legacy Account trigger Apex classes dating back to 2013 that were causing cascading production issues and a recurring stream of helpdesk tickets. He restructured the trigger logic and migrated it from single record processing, batch size one, to full bulkified processing, which significantly improved data load performance and reduced both operational incidents and time to resolution.

OTHER WORK AT BAZAARVOICE, all his:
AI Case Comment System: three linked AI assisted support features on the Case object. AI generated draft replies, a similar cases widget surfacing resolution patterns from historical cases, and an internal assistance lookup for support reps. Built on Flow orchestration, Prompt Builder templates and Invocable Apex for context assembly, with a custom similar case matching engine combining SOSL candidate search, SOQL filtering and weighted multi field scoring, plus a usage tracking and feedback layer to measure whether reps actually adopted the suggestions.
BV Data Load Automation Tool, a proof of concept that polls Jira for data load tickets, self assigns them, parses and validates CSV and XLSX files against production data, and closes the ticket automatically. Includes a custom RFC 4180 compliant CSV parser and an XLSX parser written in Apex, and an advisory only AI column mapping assistant.
Certinia PSA scheduled hours: diagnosed a platform wide defect where new resource assignments showed zero scheduled hours after a Certinia version upgrade, root caused it to a misconfigured org level scheduling setting rather than a data or code defect, corrected it and backfilled roughly 300 affected historical records, restoring accurate capacity and resourcing data org wide.
Account Team Member cascade: reassigning an account's team member added the new owner but silently failed to remove the previous one for non owner users. Root caused to a sharing gated cascade delete running in the wrong execution context; resolved with a recursion guard and a scoped elevated permission execution path.
Case Comments rich text migration: rich text formatting was being lost between the case comment editor and downstream email templates and history fields. Rebuilt the HTML normalisation and plain text conversion utilities that had been dropped in a merge conflict, updated nine email templates and resolved a keystroke race condition in a related lookup component.
SQT SLA notification system: a three tier automated SLA for Sales Qualified Tasks, a 24 hour Slack alert, a 30 day overdue email escalation and a 90 day automatic closure with full audit trail updates, built on Custom Metadata so thresholds and recipients tune without a deployment. Delivered from build through UAT to production.
Certification Management Hub: an internal certification tracking system covering sponsored, reimbursement and self funded flows, with custom objects, a platform event for real time status updates, Experience Cloud components and a third party integration specification.
Salesforce test automation: a Playwright and TypeScript regression suite automating a 21 step sales workflow end to end, spanning contact activity creation, opportunity management, CPQ quote configuration on SBQQ, document generation, the DocuSign integration and stage progression through to Closed Won. It authenticates with JWT Bearer Flow using RS256 and impersonates a sales rep from an admin user so role based flows are tested accurately, supports resuming from a checkpoint so a long end to end run can be debugged without starting over, and ships with architecture, setup, tool comparison and test flow documentation for the team.
DLRS package review: led the formal technical evaluation of the Declarative Lookup Rollup Summaries open source package for org wide adoption, delivering an approval with documented guardrails on safe rollup configurations and calculation modes.
Salesforce and NetSuite address data spike: a full technical audit clarifying how address data flows and synchronises between the two systems, mapping the underlying automation chain and documenting it for the team.
Canned Comments multi select migration, including a two hop flow architecture to stay compatible with a managed package pending its own upgrade.
Core platform expertise across CPQ, Certinia PSA, Email to Case, DocuSign, Omni Channel, LeanData and Agentforce or Einstein. He established recurring architectural patterns for recursion control and trigger bypass handling that remain in use org wide, and reverse engineered and documented the full LeanData lead lifecycle and conversion logic from live org metadata.

ROLE 2: Prodapt. Technical Lead. Jul 2023 to 18 August 2025. Onsite Panama City, Panama Jul 2023 to Mar 2025 (21 months); Bengaluru Apr to Aug 2025. Client: Liberty Latin America, "Peacock" programme.
Led full stack B2C and B2B migration of 800,000 customers from a legacy stack onto Salesforce.
Designed and implemented end to end Salesforce Industries (Vlocity) CPQ and Order Management: OmniScripts, Integration Procedures, DataRaptors, decomposition, orchestration, advanced product configuration.
Custom development in Apex classes and triggers, Lightning Web Components and Flows. Integrations built and owned: ESB, SAP, NOKIA, Matrixx, ARIA, B2BSoft, Asurion, Braintree, TransUnion.
Resolved critical production issues during live migration, on site at the client. DevOps through Copado and Bitbucket.

ROLE 3: Prodapt. Lead Engineer. Apr 2021 to Jul 2023. Bengaluru. Client: Verizon.
Led the Apttus CLM implementation across both Wireline and Wireless contracting flows, unifying contract lifecycle management across business units.
Built custom user experiences in LWC and Apex; integrated DocuSign and other third party systems for e signature and data exchange.

ROLE 4: PwC, Bengaluru. Associate II. Nov 2018 to Apr 2021. Five engagements:
Global CRM (Sep 2020 to Apr 2021): PwC's own largest internal CRM and CPQ implementation; LWC development.
Ellie Mae (Jul to Aug 2020): CPQ pilot, requirements, analysis, POCs, user stories and grooming across two stakeholder organisations simultaneously. Recognised by client and engagement team.
Hologic CPQ assessment (May to Jun 2020): direct client engagement diagnosing existing CPQ pain points and recommending solutions.
IVY / BAT Mobility "Petra" (May 2019 to May 2020, onsite): agile Lightning delivery, components, Apex, upload and download APIs, admin configuration, Heroku integration. Travelled to Brazil as lead for a month to manage production deployment.
PG&E CLM (Dec 2018 to Apr 2019): Conga CLM on Lightning. Owned end to end from development through hypercare; delivered bulk upload beyond agreed scope.

ROLE 5: Infosys, Mysore. Senior System Engineer. Aug 2015 to Nov 2018. Client: Virgin Media Business (Liberty Global, UK).
Order management across new provides and MACD, covering Sales and Service in Salesforce Classic. Programme run in PI and sprints.
Resolved governor limit failures: too many SOQL queries and CPU time limit exceeded.
Part of every major production release. Received the Infosys Insta Award, with recognition from the delivery manager, senior manager, lead consultant and clients.

CERTIFICATIONS (9): Salesforce AI Specialist; Salesforce AI Associate; Salesforce Platform Developer I; Salesforce Platform App Builder; Salesforce Sales Cloud Consultant; Salesforce Administrator; Apttus CPQ 201 Level 1; Conga Contract Consultant; Conga Composer Consultant.
EDUCATION: B.Tech, University of Petroleum and Energy Studies, Dehradun, 2015, 81.2%. ISC 2011 87.3% and ICSE 2009 87.7%, W. H. Smith Memorial School, Varanasi.
NOT IN THE RECORD: no public open source portfolio, and no formal people management headcount with direct reports. Say so plainly if asked about either. This record covers his Salesforce career; anything he has done outside it is simply not documented here, so do not assert that it does not exist.
`.trim();

const STYLE =
  "Never invent numbers, employers, dates or technologies. Do not flatter. " +
  "If the record does not cover something, say so plainly rather than inferring. " +
  "Do not use em dashes or en dashes anywhere.";

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

const json = (obj, status, origin) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });

async function claude(env, prompt, maxTokens) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error("upstream " + r.status);
  const data = await r.json();
  return (data.content || []).map((b) => b.text || "").join("").trim();
}

/* ------------------------------------------------------------------
   Rate limiting.

   Two ceilings, both in memory:
     perIp    stops one person hammering the endpoint with curl
     global   caps the spend even if the traffic is spread across many

   In-memory means per isolate, so a request landing in another colo
   sees a fresh counter. That is deliberate: it needs no bindings and
   no dashboard config, and it stops the realistic case. For a hard
   global guarantee, add a WAF rate limiting rule on the route as well.
   ------------------------------------------------------------------ */
const LIMITS = {
  perIp: 8,       perIpWindowMs: 60000,
  global: 60,     globalWindowMs: 60000,
};

const ipHits = new Map();
let globalHits = [];

function rateLimited(ip) {
  const now = Date.now();

  globalHits = globalHits.filter((t) => now - t < LIMITS.globalWindowMs);
  if (globalHits.length >= LIMITS.global) return true;

  const seen = (ipHits.get(ip) || []).filter((t) => now - t < LIMITS.perIpWindowMs);
  if (seen.length >= LIMITS.perIp) {
    ipHits.set(ip, seen);
    return true;
  }

  seen.push(now);
  ipHits.set(ip, seen);
  globalHits.push(now);

  // never let the map grow without bound
  if (ipHits.size > 4000) {
    for (const [k, v] of ipHits) {
      if (!v.length || now - v[v.length - 1] > LIMITS.perIpWindowMs) ipHits.delete(k);
    }
  }
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, origin);
    }
    if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: "origin not allowed" }, 403, origin);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: "rate limited" }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60", ...cors(origin) },
      });
    }

    const url = new URL(request.url);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad json" }, 400, origin);
    }

    try {
      if (url.pathname.endsWith("/ask")) {
        const question = String(body.question || "").slice(0, 600).trim();
        if (question.length < 3) return json({ error: "empty question" }, 400, origin);

        const prompt =
          "You are answering a recruiter or hiring manager's question about one candidate, " +
          "using ONLY the verified record below. Be direct and specific; cite the concrete " +
          "evidence (system, project, client, technology, year). " + STYLE + " " +
          "Write 2 to 5 short paragraphs of plain prose, no headings, no bullet lists, no markdown.\n\n" +
          "=== VERIFIED RECORD ===\n" + RECORD + "\n=== END RECORD ===\n\nQuestion: " + question;

        return json({ text: await claude(env, prompt, 1200) }, 200, origin);
      }

      if (url.pathname.endsWith("/fit")) {
        const jd = String(body.jd || "").slice(0, 6000).trim();
        if (jd.length < 40) return json({ error: "job description too short" }, 400, origin);

        const prompt =
          "You are assessing how well ONE candidate fits ONE job description, for the hiring " +
          "manager who wrote it. Use ONLY the verified record below. Be useful, not flattering: " +
          "a hiring manager who cannot trust the gaps cannot trust the strengths. Score honestly. " +
          "If the role asks for something the record does not evidence, score it low and name it " +
          "as a gap, even if the overall fit is strong. Cite concrete evidence in each dimension. " +
          STYLE + "\n\n" +
          "Return JSON only, no prose around it, this exact shape:\n" +
          '{"verdict":"strong|partial|weak","score":0-100,"headline":"one short sentence",' +
          '"summary":"two or three sentences","dimensions":[{"name":"the requirement, short",' +
          '"score":0-100,"evidence":"what supports or fails this, with specifics"}],' +
          '"strengths":["..."],"gaps":["..."],"questions":["questions to probe the gaps"]}\n' +
          "Give 4 to 6 dimensions drawn from the job description itself, 3 to 5 strengths, " +
          "2 to 4 gaps, 3 questions.\n\n" +
          "=== VERIFIED RECORD ===\n" + RECORD + "\n=== END RECORD ===\n\n" +
          "=== JOB DESCRIPTION ===\n" + jd + "\n=== END JOB DESCRIPTION ===";

        const raw = await claude(env, prompt, 2400);
        const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
        if (s < 0 || e < 0) return json({ error: "unparseable" }, 502, origin);
        return json(JSON.parse(raw.slice(s, e + 1)), 200, origin);
      }

      return json({ error: "not found" }, 404, origin);
    } catch (err) {
      return json({ error: String(err.message || err) }, 502, origin);
    }
  },
};

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

ROLE 1: Bazaarvoice, Bengaluru. Salesforce Administrator, CRM Platform and AI (BTO India, CRM). Joined 19 August 2025, still there.

AI WORK AT BAZAARVOICE, the core of his current profile:
BV Cortex, an agentic control plane over the Bazaarvoice Salesforce estate. Five scored lenses (spend, commitment, health, adoption, data) over one org, each finding priced in dollars where a defensible rate exists, all ranked as a single prioritised backlog under one composite score. The composite is deliberately capped at 15 points above the weakest lens so a majority of healthy lenses cannot mask a critical one. Roughly 90 percent of Cortex has no model in it at all, because a number that needs a model to produce is a number nobody can audit. The agentic parts each have a human gate: Ask Cortex answers from a grounded brief and cites the findings it used; the Cortex Analyst runs in GitHub Actions, writes a fix and opens a draft pull request but never auto merges; Change Plans use propose, approve, dispatch, verify, where the model only writes down what it would do and a named human approves before anything executes, and the executor method takes an id rather than a payload so the set of things it can do is exactly the set somebody read and approved. Cortex cannot write to production by construction, not by configuration: the class that talks to production issues GET and contains no method capable of sending a record.
BV AI Apex Test Autopilot, Salesforce native autonomous Apex test generation, coverage measurement and failing test repair, built against an org of over 1,000 Apex classes. It runs on the in platform Salesforce Models API behind the Einstein Trust Layer, so no code leaves the Salesforce trust boundary and there are no external API keys, and the model name is configuration so it can be repointed without a deploy. Four prompt modes: generate, extend, repair and fix failing. Every prompt carries hard rules derived from observed failures, including a rule that every test method must contain a meaningful assertion, which is what stops a model writing a method that calls everything, asserts nothing and reports full coverage. Rules also force a 200 record bulk scenario, because governor limits are where Salesforce code actually breaks, and delta based count assertions, because org automation creates extra records.
Claude skills that automate delivery end to end: branch and pull request creation, validation and deployment, unit test generation, the Confluence technical write up, and the Jira status update.
A native Salesforce CI/CD application, architected and built by him: an LWC app unifying Salesforce, GitHub and Jira into one release workflow, replacing hand built package.xml files, CLI deploys and manual ticket updates. An 8 step staging pipeline and a 9 step production pipeline with a code review gate; GitHub Actions deployment with automatic quick deploy fallback and real time progress polling; metadata path resolution across 40+ types; pipeline behaviour in Custom Metadata so it retunes without a deploy.
Support AI platform instrumentation: prompt metric tracking and agent feedback across Suggested Reply, Similar Cases and Internal Assistance.
Agentforce case deflection proof of concept, grounded case comment generation through Prompt Builder, and similar case matching on the Case record.
Agentforce Flex Credit overage root cause analysis and control playbook, prepared as an internal leadership briefing.
Salesforce MCP adoption, with propose, approve, dispatch and verify gating, and independent checks that prove the target org is a sandbox before any write leaves.
Owned the DocuSign platform migration against a hard vendor end of life on 16 October 2026, when the legacy dsfs eSignature app and the SBQQDS CPQ bridge stop working. DocuSign's own migration tool cannot convert CPQ integrations, so the send path was rebuilt on the Docusign Apps Launcher Apex Toolkit after he established that the vendor's sending page cannot be reached programmatically. Ten defects found and cleared, several of them each invisible until the one before it was fixed. A backlog of 87,809 CPQ quote documents that the new platform could not accept was solved with on demand idempotent conversion at send time rather than a migration batch. He also removed the largest manual rollout step by supplying documents and recipients from Apex instead of hand built envelope templates, and verified the whole chain live: quote sent, both signatures collected in routing order, envelope completed, signed PDF and certificate written back to the Quote.
Diagnosed revenue data integrity across account hierarchies and service contracts, including Booked ARR mismatches, proving the existing calculation correct and identifying the real cause rather than rewriting working logic.
Ran the Salesforce service queue: access governance, user lifecycle, CPQ quote and amendment defects, data reassignment, Certinia PSA support.

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
NOT IN THE RECORD: no public open source portfolio, no formal people management headcount, and no non Salesforce production engineering. Say so plainly if asked about these.
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

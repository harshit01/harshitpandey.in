# harshitpandey.in

Profile site. Static HTML, no build step, no dependencies, no framework.

```
index.html    the whole site
worker.js     optional API that powers Role fit and Ask
```

The site works completely on its own. `worker.js` is only needed if you want
the two AI panels live for visitors.

The CV is deliberately **not** on this site. The PDF carries a QR code that
points here; traffic goes one way.

---

## 1. Buy the domain on GoDaddy

`harshitpandey.in` should run roughly Rs 500 to Rs 900 for the first year.

Two things to turn **off** during checkout, because GoDaddy pushes both hard:

- **Domain privacy as a paid add-on.** For `.in` it is often unavailable
  anyway, and you do not need the rest of the bundle.
- **Web hosting, Website Builder, Microsoft 365, SSL.** You need none of it.
  You are buying the name only. Hosting below is free and SSL comes with it.

---

## 2. Deploy the site

**Cloudflare Pages.** Free, fast, free SSL, and the same account you will
want later for the Worker and rate limiting.

1. Put `index.html` in a GitHub repo.
2. Cloudflare dashboard, **Workers & Pages**, **Create**, **Pages**,
   **Connect to Git**, pick the repo.
3. Build settings: **Framework preset** = None. Build command empty.
   **Build output directory** = `/`.
4. **Save and Deploy**. Live on `something.pages.dev` in about a minute.

### Point the GoDaddy domain at it

The cleanest route is to move DNS to Cloudflare. It is also what makes rate
limiting available later.

1. Cloudflare, **Add a site**, enter `harshitpandey.in`, pick the **Free** plan.
2. Cloudflare shows you two nameservers, something like
   `xxx.ns.cloudflare.com`.
3. GoDaddy, **My Products**, your domain, **DNS**, **Nameservers**, **Change**,
   **I'll use my own nameservers**. Paste both. Save.
4. Propagation is usually under an hour, occasionally longer.
5. Back in Cloudflare Pages, your project, **Custom domains**,
   **Set up a domain**, enter `harshitpandey.in`. It wires the DNS itself.
6. Add `www.harshitpandey.in` too and let it redirect to the apex.

**If you would rather leave DNS at GoDaddy:** in GoDaddy DNS add a `CNAME`
for host `www` pointing at your `pages.dev` address. The apex domain is the
awkward part, since GoDaddy does not support CNAME flattening at the root.
You would end up with `www.harshitpandey.in` only. Moving nameservers is
less work and gives you the better result.

---

## 3. The API

The two AI panels are served by a Cloudflare Worker, `profile-api`, whose
source is `api/src/index.js`. It holds the Anthropic key server side, only
accepts requests from this site's own origins, and rate limits per IP and
globally.

It deploys itself from this repo. Push a change under `api/` and the
workflow in `.github/workflows/deploy-api.yml` runs `wrangler deploy`.
No dashboard pasting.

### One time setup

1. Cloudflare, **My Profile**, **API Tokens**, **Create Token**, use the
   **Edit Cloudflare Workers** template. Copy the token.
2. GitHub repo, **Settings**, **Secrets and variables**, **Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — the token from step 1
   - `CLOUDFLARE_ACCOUNT_ID` — the id in your dashboard URL, the hex string
     right after `dash.cloudflare.com/`
3. Push anything under `api/`. Watch it in the **Actions** tab.

`ANTHROPIC_API_KEY` stays a Worker secret and is never in this repo.
`wrangler deploy` does not touch existing secrets, so it survives.

The workflow ends with a smoke test: it calls the API from a origin that is
not on the allowlist and fails the build unless it gets a 403 back. A deploy
that broke the origin check would go red rather than ship quietly.

### Keeping the bill small

- Worker free tier covers 100,000 requests a day.
- The Worker rate limits itself: 8 requests per IP per minute, 60 per minute
  overall. In memory, so per isolate; add a WAF rate limiting rule on the
  route for a hard global guarantee.
- Set a **spend limit** in the Anthropic console as a backstop.

## 4. Keeping it current

`RECORD` appears twice: in `index.html` (what the page shows) and in
`worker.js` (what the model may answer from). When something changes, update
both, or the site will say one thing and the answers another.

If you ever change the domain, the QR code baked into the PDF has to be
regenerated too. It encodes `https://harshitpandey.in` as a fixed image.

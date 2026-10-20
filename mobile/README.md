# AI Job Search - mobile app

A React Native (Expo) client for the job pipeline. It talks to `dashboard/server.py`, so it shows
exactly what the web dashboard shows: ranked jobs, the draft queue, drafted CVs and cover letters,
and the application tracker.

| Screen | What it does |
|---|---|
| **Pipeline** | Top picks / Ready / Queue / New / Hidden. Search, filter sheet, sort. Queue a draft, dismiss (with undo), mark applied, run the pipeline now. Pipeline status and next run at the top. |
| **Job detail** | Fit score, strengths and gaps, chips (city, work mode, ATS, experience note), full posting text, skills, link to the company's own posting, linked tracker row and PDFs. |
| **Tracker** | Every tracked application, filter by status, open the CV / cover letter PDF. |
| **Settings** | Server address and token (stored in the device's secure storage), connection test. |

**Filters** (saved on the device): keyword, city (Bengaluru, Hyderabad, Pune, Gurugram, Other), domain
(ML / AI, AI Engineering, Data Science), work mode, posted within N days, minimum fit score, company
portal (ATS), hide "2-4 years" stretch roles, hide senior-tagged roles, sort (best fit, newest, city,
company). The 0-2 year experience limit itself is applied by the pipeline at scrape time
(`tools/job_filters.py`); postings it rejected never reach the app.

## 1. Start the server so the phone can reach it

By default `dashboard/server.py` listens on `127.0.0.1` only. For the phone, bind a private address
and set a token (the server refuses a non-loopback address without one):

```bash
export JOB_DASHBOARD_HOST=0.0.0.0           # or your Tailscale / LAN IP
export JOB_DASHBOARD_TOKEN="$(openssl rand -hex 24)"
python3 dashboard/server.py
```

Use a private network (same Wi-Fi, or Tailscale / WireGuard): the token is sent over plain http. Don't
port-forward this to the internet. With a token set, the bundled web page can't sign in, so keep a
second instance (`JOB_DASHBOARD_PORT=8788`, no token, loopback) for the browser.

## 2. Run the app

```bash
cd mobile
npm install
npx expo install --fix     # aligns package versions with the installed Expo SDK
npx expo start             # scan the QR code with Expo Go
```

Then open **Settings**, enter `<server-ip>:8787` and the token, tap **Test**, then **Save**.

```bash
npm run typecheck          # tsc --noEmit
npm test                   # filter / bucket logic (Node 22.6+)
```

## Notes

- Dismiss / queue / applied / run use the same actions as the web dashboard, so both stay in sync.
- "Run now" needs the server host to have the `ai-job-pipeline` systemd user service (Linux).
- Full job text is fetched on demand by the server from freehire.me using the job's stored slug;
  jobs from other sources show the stored fields and a link to the posting.
- Salary is not a filter: freehire only exposes pay on a minority of postings, and the pipeline does
  not store it. A job's `pay_evidence` chip shows when `/rank` found one.

# Medina Portfolio Tracker

Family Bitcoin & Crypto Portfolio Tracker — React + Vite + Firebase + Vercel.

## Stack

- **React 18** + **Vite 5** — frontend framework and build tool
- **Firebase** — Firestore database, Auth, Analytics
- **Recharts** — portfolio charts
- **Claude Sonnet (Anthropic)** — AI tax analysis
- **Vercel** — deployment and hosting

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/Thecityismine/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Then fill in your values in `.env.local`:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=portfolio-f86b9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=portfolio-f86b9
VITE_FIREBASE_STORAGE_BUCKET=portfolio-f86b9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1087299953991
VITE_FIREBASE_APP_ID=1:1087299953991:web:92da00d9a40ae1746a1862
VITE_FIREBASE_MEASUREMENT_ID=G-156HX042RE
```

> ⚠️ Never commit `.env.local` to git. It is already listed in `.gitignore`.

### 4. Run the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`

---

## Deployment to Vercel

### Option A — Vercel Dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo `Thecityismine/portfolio`
2. Vercel auto-detects Vite — no framework config needed
3. Add environment variables in **Project Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | `your-firebase-api-key` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `portfolio-f86b9.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `portfolio-f86b9` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `portfolio-f86b9.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1087299953991` |
| `VITE_FIREBASE_APP_ID` | `1:1087299953991:web:92da00d9a40ae1746a1862` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-156HX042RE` |

4. Click **Deploy**. Every push to `main` auto-deploys.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Follow the prompts and add env vars when asked.

---

## Anthropic API Key (for AI Tax Analysis)

The Anthropic key is **NOT** a build-time environment variable — it is entered by the user at runtime via the app's **Settings** page. It is saved to browser `localStorage` only and sent directly to `api.anthropic.com` from the browser. It is never stored on any server.

To use AI tax analysis:
1. Get a key at [console.anthropic.com](https://console.anthropic.com)
2. Open the app → hamburger menu → **Settings**
3. Paste your `sk-ant-api...` key
4. Go to **Tax** tab → generate a report → **AI Analysis** tab

---

## Project Structure

```
portfolio/
├── index.html              # Entry HTML
├── vite.config.js          # Vite config
├── package.json
├── .env.example            # Template — copy to .env.local
├── .env.local              # Your actual keys — NOT committed
├── .gitignore
└── src/
    ├── main.jsx            # React root
    ├── App.jsx             # Full app (3,500+ lines)
    └── firebase.js         # Firebase init via env vars
```

---

## Key Features

- 9-member family portfolio (Jorge, Anseli, Emily, Marcos, Melanie, Michael, Skylar, Steven, iTrust Capital)
- Bitcoin + 17 altcoins tracked
- 1,059+ transaction history (2017–2026)
- FIFO tax engine — computes realized gains for any year/member
- 2025 tax data verified against CoinTracking export (Form 8949)
- AI tax summary via Claude Sonnet API
- Portfolio charts with BTC/SPY benchmarks
- Family leaderboard, BTC goal tracker, concentration risk

---

## Security Notes

- Firebase config values (API key, project ID, etc.) are safe to expose in frontend code — they are scoped and restricted by Firebase Security Rules
- The Anthropic key is user-supplied at runtime and stored only in the user's own browser
- No secrets are hardcoded in source code

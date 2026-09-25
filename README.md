# ELLabs Billing & Schedule Hub

Staff-only web app for Enriched Learning Labs:

- class calendar
- attendance
- Family Directory
- payment status by learning cycle
- fee calculator, Statements of Account, SOA archive
- school-year archives

It is hosted on **Vercel**. Data and sign-in run on **Firebase**.

| Part | What it does |
|---|---|
| GitHub (this repo) | Holds the code. Keep the repo **private**. |
| Vercel | Hosts the site and redeploys automatically on every push. |
| Firebase Authentication | Google sign-in. |
| Cloud Firestore | Stores all school data. Only emails listed in `firestore.rules` can access it. |

> **Never commit student or payment data.**
> Backups, exports and archives you download from the hub (`.json`, `.xlsx`, `.csv`, `.pdf`) stay on your computer. `.gitignore` already blocks these.

---

## One-time setup (about 30 minutes)

### 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and click **Create a project**.
   - Name it, for example, `ellabs-hub`.
   - You can turn Google Analytics off.
2. On the project home page, click the **Web** icon (`</>`) to add a web app.
   - Name it `ELLabs Hub`. You don't need Firebase Hosting.
3. Firebase shows a `firebaseConfig = { ... }` block. Copy the six values into **`firebase-config.js`**, replacing each `PASTE_...` placeholder.

### 2. Turn on Google sign-in

1. Go to **Build → Authentication**, click **Get started**, and open the **Sign-in method** tab.
2. Select **Google**, then **Enable**.
3. Choose a support email and click **Save**.

### 3. Create the database

1. Go to **Build → Firestore Database** and click **Create database**.
2. Choose the location **`asia-southeast1` (Singapore)**. It's closest to Manila, and it can't be changed later.
3. Start in **production mode**.
4. Open the **Rules** tab and replace everything with the contents of **`firestore.rules`**.
5. Put the real staff Google emails in the list, then click **Publish**.

### 4. Put the code on GitHub

1. Create a **private** repository, for example `ellabs-hub`.
2. Upload these files (drag and drop works on github.com):

   ```
   index.html
   firebase-config.js
   firebase-adapter.js
   firestore.rules
   vercel.json
   robots.txt
   .gitignore
   README.md
   ```

   Or from a terminal:

   ```bash
   git init
   git add .
   git commit -m "ELLabs Hub"
   git branch -M main
   git remote add origin https://github.com/<you>/ellabs-hub.git
   git push -u origin main
   ```

### 5. Deploy on Vercel

1. At <https://vercel.com/new>, import the `ellabs-hub` repository.
2. Leave **Framework Preset** as **Other**. There is no build command and no output directory.
3. Click **Deploy**. You'll get an address like `ellabs-hub.vercel.app`.

### 6. Allow the Vercel address to sign in

1. In Firebase, go to **Authentication → Settings → Authorized domains → Add domain**.
2. Add your Vercel address, for example `ellabs-hub.vercel.app`.
3. If you later add a custom domain, add that here too.

### 7. Bring over your data from the claude.ai version

1. In the **claude.ai** version, go to **Settings → School year → Download this year so far → Full backup (.json)**.
2. On the new site, sign in and go to **Settings → Backup & reset → Import backup**.
3. Choose that file and confirm.
   - This imports students, payment status, SOAs, attendance, the current learning cycle, rates and SOA details.
   - It's safe to run again: matching records are replaced, never duplicated.

Past years archived in the claude.ai version don't move automatically. Download each one there as **Full backup (.json)** and keep the files safe.

---

## Everyday admin

- **Add or remove a staff member.** Edit the email list in Firebase → Firestore Database → Rules, then click **Publish**. Emails must be Google accounts (Gmail or Google Workspace).
- **Update the app.** Replace `index.html` in GitHub (or push a commit). Vercel redeploys automatically within about a minute, and past deployments can be restored from the Vercel dashboard.
- **Backups.** Settings → School year gives you an Excel workbook or a full `.json` backup at any time. Keep a copy off-site at least once per learning cycle.
- **End of the school year.** Use Settings → **Archive this school year…**. The archive is saved in Firestore and can be downloaded later as Excel or `.json`.

## Costs

The free Firebase **Spark** plan and the free Vercel **Hobby** plan are enough for a school this size: well under 50,000 database reads and 20,000 writes per day. No credit card is needed.

## Troubleshooting

| What you see | Fix |
|---|---|
| "Setup needed: add your Firebase settings…" | `firebase-config.js` still has `PASTE_...` values. |
| "…is not on the ELLabs staff list" | Add that email to `firestore.rules` in the Firebase console and click **Publish**. |
| Sign-in window closes with an "unauthorized domain" error | Add the site address under Authentication → Settings → Authorized domains. |
| Pop-up blocked | Allow pop-ups for the site, or just click again. It falls back to a full-page sign-in. |

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (UI and logic). |
| `firebase-config.js` | Your Firebase project's web settings. |
| `firebase-adapter.js` | Google sign-in screen, database connection, file downloads. |
| `firestore.rules` | Who may read and write data. Paste into the Firebase console. |
| `vercel.json` | Security headers, and keeps the site out of search engines. |
| `robots.txt` | Asks search engines not to index the site. |
| `.gitignore` | Stops data exports from being committed. |

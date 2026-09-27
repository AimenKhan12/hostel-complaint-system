# Hostel Complaint Management System (with AI Priority Detection)

A simple full-stack project:
- **Frontend:** Plain HTML + CSS + JavaScript (no build step — just open in browser)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (pgAdmin4)
- **AI:** Google Gemini API — automatically marks each complaint as "Urgent" or "Normal"

---

## 📁 Project Structure
```
hostel-complaint-system/
├── backend/
│   ├── server.js        <- start here, this runs the server
│   ├── db.js             <- connects to PostgreSQL
│   ├── ai.js              <- calls the AI to detect priority
│   ├── schema.sql        <- run this in pgAdmin4 to create tables
│   ├── routes/
│   │   ├── auth.js       <- signup/login
│   │   └── complaints.js <- submit/view/update complaints
│   ├── package.json
│   └── .env.example      <- copy this to .env and fill your details
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## Step 1 — Set up the Database (pgAdmin4)

1. Open **pgAdmin4**.
2. Right-click **Databases** → **Create** → **Database**. Name it `hostel_db`.
3. Click on `hostel_db` → open the **Query Tool**.
4. Open `backend/schema.sql` from this project, copy all its content, paste into the Query Tool, and click **Execute (▶)**.
5. You should now see two tables under `hostel_db → Schemas → public → Tables`: `users` and `complaints`.

That's it — your database is ready.

---

## Step 2 — Get a free Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account and click **Create API Key**.
3. Copy the key — you'll paste it in Step 3.

---

## Step 3 — Configure the backend

1. Open the `backend` folder in a terminal.
2. Copy `.env.example` and rename the copy to `.env`.
3. Open `.env` and fill in:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres              <- your pgAdmin4 username
   DB_PASSWORD=your_real_password
   DB_NAME=hostel_db
   SESSION_SECRET=anyrandomtext123
   GEMINI_API_KEY=paste_your_key_here
   PORT=5000
   ```

---

## Step 4 — Install and run the backend

In the `backend` folder, run:
```
npm install
npm start
```

If everything is correct, you'll see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:5000
```

**If you see a database connection error:** double-check `DB_USER`, `DB_PASSWORD`, and that PostgreSQL service is running (pgAdmin4 must be able to connect too).

---

## Step 5 — Run the frontend

The frontend is plain HTML/CSS/JS, so no installation needed.

**Easiest way:** In VS Code, install the "Live Server" extension, right-click `frontend/index.html` → **Open with Live Server**. It will open at `http://localhost:5500`.

(If it opens on a different port, update the `origin` value in `backend/server.js` to match.)

---

## Step 6 — Try it out

1. Sign up as a **Student** (this is the only role the public form creates) — submit a complaint, e.g. "There is a gas leak smell in the kitchen" → it should be marked **Urgent**.
2. Try another one, e.g. "The wall paint is peeling" → should be marked **Normal**.
3. **Create the Admin account** using the script below (not the signup form — see Step 7).
4. Login as admin — you'll see stat cards (total/urgent/pending/resolved), a status filter, a room-number search, and can change complaint status.

---

## Step 7 — Creating an Admin account (important!)

Notice the public Sign Up form only ever creates **Students**. This is intentional — in a real system, random visitors should never be able to grant themselves admin rights. Only whoever has access to the backend code/server can create an admin.

In the `backend` folder, run:
```
node create-admin.js "Warden Name" "warden@hostel.com" "yourpassword"
```

This directly inserts an admin row into the database (with a securely hashed password). You can then log in with that email/password on the normal Login page — the system will detect the role and send you to the Admin Dashboard.

**For your viva:** this is a good point to mention — it shows you thought about a real security concern (privilege escalation) rather than just leaving the role selectable by anyone.

---

## Features included

- Student signup/login (session-based, no JWT)
- Submit complaint → AI (Gemini) automatically tags it **Urgent** or **Normal**
- Student dashboard: view own complaints, delete a complaint while it's still Pending
- Admin dashboard: overview stats (total / urgent / pending / resolved), filter by status, search by room number, update status (Pending → In Progress → Resolved)
- Admin accounts can only be created via a backend script, not the public form

---

## How the "connections" work (for your viva)

- **Frontend → Backend:** `app.js` uses `fetch()` to call URLs like `http://localhost:5000/api/complaints`. This is just sending an HTTP request, same as opening a webpage.
- **Backend → Database:** `db.js` creates a `Pool` (a connection manager) using your `.env` details. Every route file (`auth.js`, `complaints.js`) imports this pool and runs SQL queries like `pool.query('SELECT * FROM complaints ...')`.
- **Backend → AI:** `ai.js` sends the complaint text to Google's Gemini API over the internet and gets back "Urgent" or "Normal" as plain text.
- **Login without JWT:** `express-session` stores a small session on the server and gives the browser a cookie. Every future request automatically includes that cookie, so the server knows who's logged in — no manual token handling needed.

---

## Deploying it live (for your final submission)

- **Database:** Create a free PostgreSQL instance on [Render](https://render.com) or [Supabase](https://supabase.com), then update your `.env` with the new host/user/password they give you.
- **Backend:** Push the `backend` folder to GitHub, then deploy it on [Render](https://render.com) (Web Service) — add the same `.env` values in Render's "Environment" settings.
- **Frontend:** Push the `frontend` folder to GitHub, deploy on [Netlify](https://netlify.com) or [Vercel](https://vercel.com) — just update the `API` constant at the top of `app.js` to your live backend URL instead of `localhost:5000`.

# 📨 GCT CODE-A-THON 2026 - INVITATION MAIL BOT

> **Organised by:** Department of Information Technology (IT) in Coding Club  
> **Institution:** Gnanamani College of Technology  
> **Venue:** D Block IT Lab - 2  
> **Date & Time:** 14.10.2026 (Wednesday) @ 10:00 AM IST *(Reporting: 09:45 AM)*  
> **Contest Portal:** [https://code-a-thon-mu.vercel.app](https://code-a-thon-mu.vercel.app)

---

## 🚀 Features

1. **🎨 Brutalist Branded Email Template**:
   - Modern, responsive HTML email matching the collegiate arena design.
   - Highlights the 3 challenge stages: Round 1 (C Programming), Round 2 (Java Logic), and Round 3 (Python Finale).
   - Prominently showcases **Department of IT**, **Coding Club**, **D Block IT Lab - 2**, and reporting time **10:00 AM (14.10.26)**.
   - Displays direct CTA buttons to the Login & Portal pages and contest rules.

2. **📅 Automatic Calendar Invite (.ics)**:
   - RFC 5545 `.ics` calendar file attached and embedded in the email.
   - Automatically prompts recipients in Google Calendar, Outlook, and Apple Calendar with event details, venue map location, and a 30-minute reminder alarm.

3. **🗄️ Database & CSV Support**:
   - Directly queries registered participants from PostgreSQL (`participants` + `users`).
   - Supports importing custom participant lists from CSV files (e.g. departmental exports).

4. **⚡ Throttling & Safety**:
   - Built-in rate limiting (`SEND_DELAY_MS`) to protect your SMTP account from getting throttled or spam-flagged.
   - Includes `--dry-run` and `--preview` safety checks before sending live emails.

---

## 🛠️ Quick Setup

### 1. Configure SMTP Credentials
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `mail-bot/.env` with your sender credentials:
```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=codingclub.gct@gmail.com
SMTP_PASS=your_16_char_google_app_password

MAIL_FROM="Coding Club - Dept of IT <codingclub.gct@gmail.com>"
SEND_DELAY_MS=600
```

> **Tip for Gmail:**
> 1. Go to your Google Account -> **Security** -> Enable **2-Step Verification**.
> 2. Search for **App passwords** (or visit https://myaccount.google.com/apppasswords).
> 3. Generate an app password for "Mail" and paste the 16-character code into `SMTP_PASS`.

---

## 💻 Usage Commands

### 1. Generate & Preview Template Locally
Generates `preview.html` and `event.ics` without sending any emails. Double-click `preview.html` to view it in your browser:
```bash
node bot.js --preview
```

### 2. Send a Single Test Email
Sends one live invitation to your personal or test inbox:
```bash
node bot.js --test your-email@example.com
```

### 3. Dry-Run / Simulation
Verifies recipient loading without dispatching SMTP requests:
```bash
# Simulate DB blast
node bot.js --all --dry-run

# Simulate CSV blast
node bot.js --csv sample-participants.csv --dry-run
```

### 4. Blast to All Registered Participants (PostgreSQL)
Sends invitations to every registered participant in the database:
```bash
node bot.js --all
```

Limit to first 10 for staging:
```bash
node bot.js --all --limit 10
```

### 5. Blast from Custom CSV File
If you have an Excel or departmental CSV sheet:
```bash
node bot.js --csv sample-participants.csv
```
*Expected CSV headers: `email,name,department,year`*

---

## 📋 File Structure
```
mail-bot/
├── bot.js                  # CLI runner, SMTP dispatcher, DB & CSV parser
├── template.js             # Responsive HTML email & ICS calendar generator
├── package.json            # Node.js dependencies (nodemailer, pg, dotenv)
├── sample-participants.csv # Sample CSV recipient template
├── .env.example            # Environment template
├── .gitignore              # Ignores credentials and preview files
└── README.md               # Documentation and execution guide
```

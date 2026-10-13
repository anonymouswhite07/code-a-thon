#!/usr/bin/env node

/**
 * GCT CODE-A-THON 2026 - INVITATION MAIL BOT
 * Organised by: Department of Information Technology (IT) in Coding Club
 * Venue: D Block IT Lab - 2
 * Date & Time: 14.10.2026 @ 10:00 AM IST
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const { generateEmailHtml, generateCalendarIcs } = require('./template');

// 1. Load environment variables (Local mail-bot/.env first, then root ../.env)
const localEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath, override: false });
}

// 2. Parse CLI arguments
const args = process.argv.slice(2);

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return null;
}

const isHelp = args.includes('--help') || args.includes('-h');
const isPreview = args.includes('--preview');
const testEmail = getArgValue('--test');
const isAll = args.includes('--all');
const csvPath = getArgValue('--csv');
const isDryRun = args.includes('--dry-run');
const limit = getArgValue('--limit') ? parseInt(getArgValue('--limit'), 10) : null;
const delayMs = parseInt(getArgValue('--delay') || process.env.SEND_DELAY_MS || '600', 10);
const customSubject = getArgValue('--subject') || 'Official Invitation: CODE-A-THON 2026 | Dept of IT Coding Club';

// 3. Print Banner
function printBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║               GCT CODE-A-THON 2026 - OFFICIAL MAIL BOT                   ║
║  Organised by: Department of Information Technology in Coding Club       ║
║  Venue: D Block IT Lab - 2 | Date: 14.10.2026 @ 10:00 AM IST             ║
╚══════════════════════════════════════════════════════════════════════════╝
`);
}

// 4. Print Help
function printHelp() {
  printBanner();
  console.log(`USAGE:
  node bot.js [options]

OPTIONS:
  --preview              Generate a local preview HTML file and ICS calendar invite
  --test <email>         Send a single test invitation email to the specified address
  --all                  Send invitations to all registered participants from PostgreSQL
  --csv <filepath>       Send invitations to recipients listed in a CSV file (email,name,dept,year)
  --dry-run              Simulate recipient fetching and email generation without sending
  --limit <number>       Limit the number of emails sent (useful for staging)
  --delay <ms>           Delay in ms between sending emails (default: 600ms)
  --subject <text>       Customize the email subject line
  --help, -h             Show this help screen

EXAMPLES:
  # 1. Preview the brutalist template locally:
  node bot.js --preview

  # 2. Test send to your own email:
  node bot.js --test student@example.com

  # 3. Simulate sending to all registered participants (dry run):
  node bot.js --all --dry-run

  # 4. Blast invitations to all registered participants:
  node bot.js --all

  # 5. Send from a CSV list:
  node bot.js --csv participants.csv
`);
}

// 5. Setup Transporter
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      'Missing SMTP credentials!\nPlease set SMTP_USER and SMTP_PASS in mail-bot/.env or root .env\nSee mail-bot/.env.example for details.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

// 6. Sleep helper for throttling
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 7. Preview Mode
function handlePreview() {
  printBanner();
  console.log('⚡ Generating local preview files...');

  const sampleData = {
    fullName: 'Arun Kumar',
    email: 'arunkumar.it@gct.org.in',
    department: 'Information Technology',
    year: 'Final Year',
    college: 'Gnanamani College of Technology'
  };

  const htmlContent = generateEmailHtml(sampleData);
  const icsContent = generateCalendarIcs();

  const previewHtmlPath = path.resolve(__dirname, 'preview.html');
  const previewIcsPath = path.resolve(__dirname, 'event.ics');

  fs.writeFileSync(previewHtmlPath, htmlContent, 'utf8');
  fs.writeFileSync(previewIcsPath, icsContent, 'utf8');

  console.log(`✅ Preview HTML saved to: ${previewHtmlPath}`);
  console.log(`✅ Calendar (.ics) saved to: ${previewIcsPath}`);
  console.log('\nYou can open "preview.html" in your browser to inspect the complete brutalist invitation layout!\n');
}

// 8. Fetch participants from Database
async function fetchDbParticipants() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in mail-bot/.env or root .env');
  }

  // Strip sslmode from query string to let pg ssl config take precedence
  const sanitizedUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
  const pool = new Pool({
    connectionString: sanitizedUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Connecting to PostgreSQL to fetch registered participants...');
    
    // First query participants table joined with users
    const query = `
      SELECT 
        u.full_name AS "fullName",
        u.email,
        COALESCE(p.department, 'Information Technology') AS department,
        COALESCE(p.study_year, 'Participant') AS year,
        COALESCE(p.college, 'Gnanamani College of Technology') AS college
      FROM users u
      LEFT JOIN participants p ON p.user_id = u.id
      WHERE u.role = 'PARTICIPANT'
        AND (p.is_suspended IS NULL OR p.is_suspended = false)
      ORDER BY u.id ASC;
    `;

    const res = await pool.query(query);
    console.log(`🎯 Found ${res.rows.length} participant(s) registered in database.`);
    return res.rows;
  } finally {
    await pool.end();
  }
}

// 9. Parse CSV participants
function parseCsv(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`CSV file not found at: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing data rows.');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const emailIdx = headers.findIndex((h) => h.includes('email'));
  const nameIdx = headers.findIndex((h) => h.includes('name'));
  const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('department'));
  const yearIdx = headers.findIndex((h) => h.includes('year'));

  if (emailIdx === -1) {
    throw new Error('CSV must contain an "email" column.');
  }

  const participants = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    const email = parts[emailIdx];
    if (!email || !email.includes('@')) continue;

    participants.push({
      email,
      fullName: nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx] : 'Participant',
      department: deptIdx !== -1 && parts[deptIdx] ? parts[deptIdx] : 'Information Technology',
      year: yearIdx !== -1 && parts[yearIdx] ? parts[yearIdx] : 'Participant',
      college: 'Gnanamani College of Technology'
    });
  }

  console.log(`🎯 Loaded ${participants.length} participant(s) from CSV.`);
  return participants;
}

// 10. Send Email to Single Recipient
async function sendInvitation(transporter, recipient, icsData) {
  const mailFrom = process.env.MAIL_FROM || `Coding Club - Dept of IT <${process.env.SMTP_USER}>`;
  const replyTo = process.env.MAIL_REPLY_TO || process.env.SMTP_USER;

  const html = generateEmailHtml(recipient);

  const mailOptions = {
    from: mailFrom,
    to: recipient.email,
    replyTo: replyTo,
    subject: customSubject,
    html: html,
    text: `GCT CODE-A-THON 2026 Official Invitation\n\nDear ${recipient.fullName},\nYou are invited to CODE-A-THON 2026 organised by the Department of Information Technology in Coding Club.\n\nDate: 14.10.2026\nTime: 10:00 AM IST (Reporting: 09:45 AM)\nVenue: D Block IT Lab - 2, Gnanamani College of Technology\n\nContest Arena: https://code-a-thon-mu.vercel.app/login\n\nPlease arrive on time with your registered college credentials.`,
    icalEvent: {
      filename: 'invitation-codeathon-2026.ics',
      method: 'request',
      content: icsData
    },
    attachments: [
      {
        filename: 'CODE-A-THON-2026-Invitation.ics',
        content: icsData,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      }
    ]
  };

  return await transporter.sendMail(mailOptions);
}

// 11. Main Runner
async function main() {
  if (isHelp || (!isPreview && !testEmail && !isAll && !csvPath)) {
    printHelp();
    return;
  }

  if (isPreview) {
    handlePreview();
    return;
  }

  printBanner();

  let recipients = [];

  if (testEmail) {
    console.log(`🔬 Mode: Single Test Send -> ${testEmail}`);
    recipients.push({
      email: testEmail,
      fullName: 'Test Participant',
      department: 'Information Technology',
      year: 'Final Year',
      college: 'Gnanamani College of Technology'
    });
  } else if (csvPath) {
    console.log(`📁 Mode: CSV Blast -> ${csvPath}`);
    recipients = parseCsv(csvPath);
  } else if (isAll) {
    console.log('🗄️  Mode: Full Database Blast');
    recipients = await fetchDbParticipants();
  }

  if (limit && recipients.length > limit) {
    console.log(`⚠️  Applying recipient limit: ${limit} (total found: ${recipients.length})`);
    recipients = recipients.slice(0, limit);
  }

  if (recipients.length === 0) {
    console.log('⚠️  No recipients found to send to.');
    return;
  }

  console.log(`📋 Total recipients queued: ${recipients.length}`);
  const icsData = generateCalendarIcs();

  if (isDryRun) {
    console.log('\n🔍 [DRY RUN ACTIVE] No actual emails will be dispatched.');
    recipients.forEach((r, idx) => {
      console.log(`  [${idx + 1}/${recipients.length}] Would send to: ${r.fullName} <${r.email}> (${r.department}, ${r.year})`);
    });
    console.log('\n✅ Dry run completed successfully! Everything is configured properly.');
    return;
  }

  // Live SMTP dispatch
  console.log('\n🚀 Initializing SMTP connection...');
  const transporter = createTransporter();

  // Verify SMTP
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
  } catch (err) {
    console.error('❌ Failed to verify SMTP credentials:', err.message);
    console.error('Please verify SMTP_USER and SMTP_PASS in mail-bot/.env');
    process.exit(1);
  }

  console.log(`\n📨 Starting invitation blast with ${delayMs}ms throttle between sends...\n`);

  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const progress = `[${i + 1}/${recipients.length}]`;

    try {
      process.stdout.write(`⏳ ${progress} Sending to ${r.email}... `);
      await sendInvitation(transporter, r, icsData);
      console.log('✅ SENT');
      sentCount++;
    } catch (err) {
      console.log(`❌ FAILED (${err.message})`);
      failCount++;
    }

    if (i < recipients.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 CAMPAIGN SUMMARY:`);
  console.log(`   Total Queued: ${recipients.length}`);
  console.log(`   Successfully Sent: ${sentCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('══════════════════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal Error:', err.message);
  process.exit(1);
});

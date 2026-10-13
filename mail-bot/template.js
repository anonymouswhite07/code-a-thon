
/**
 * Event Invitation Email Template & Calendar Invite Generator
 * Event: CODE-A-THON 2026
 * Organiser: Department of Information Technology (IT) in Coding Club
 * College: Gnanamani College of Technology
 * Venue: D Block IT Lab - 2
 * Date: 14.10.2026 at 10:00 AM
 */

function generateEmailHtml({
  fullName = 'Participant',
  email = '',
  department = 'Information Technology',
  year = '2026',
  college = 'Gnanamani College of Technology'
} = {}) {
  const portalUrl = 'https://code-a-thon-mu.vercel.app/login';
  const leaderboardUrl = 'https://code-a-thon-mu.vercel.app';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Invitation: CODE-A-THON 2026</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F7F4ED;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #171717;
      line-height: 1.5;
    }
    .wrapper {
      width: 100%;
      background-color: #F7F4ED;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 3px solid #171717;
      border-radius: 16px;
      box-shadow: 6px 6px 0px #171717;
      overflow: hidden;
    }
    .header {
      background-color: #171717;
      color: #FFFFFF;
      padding: 24px;
      text-align: center;
      border-bottom: 3px solid #171717;
    }
    .badge {
      display: inline-block;
      background-color: #FF6B35;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #FFFFFF;
      margin-bottom: 8px;
    }
    .title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 6px 0;
      color: #B8E63E;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 13px;
      color: #D4D4D8;
      font-family: monospace;
      margin: 0;
    }
    .content {
      padding: 28px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 12px;
      color: #171717;
    }
    .intro-text {
      font-size: 14px;
      color: #374151;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .details-card {
      background-color: #FFFDF8;
      border: 2px solid #171717;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      box-shadow: 3px 3px 0px #171717;
    }
    .details-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px dashed #E5E7EB;
      font-size: 13px;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      width: 130px;
      font-weight: 800;
      color: #6B7280;
      font-family: monospace;
      text-transform: uppercase;
      font-size: 11px;
    }
    .details-value {
      flex: 1;
      font-weight: 700;
      color: #111827;
    }
    .highlight-pill {
      display: inline-block;
      background-color: #FFD84D;
      color: #171717;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #171717;
      font-weight: 800;
      font-family: monospace;
    }
    .rounds-section {
      margin-bottom: 24px;
    }
    .rounds-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      font-family: monospace;
      color: #171717;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .round-item {
      background-color: #F3F4F6;
      border: 1.5px solid #171717;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .round-name {
      font-weight: 800;
      font-size: 13px;
      color: #171717;
    }
    .round-lang {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      background-color: #3155FF;
      color: #FFFFFF;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #FF6B35;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 14px 28px;
      border: 2px solid #171717;
      border-radius: 12px;
      box-shadow: 4px 4px 0px #171717;
      font-family: monospace;
    }
    .btn-secondary {
      display: inline-block;
      margin-top: 12px;
      color: #3155FF !important;
      font-size: 12px;
      font-weight: 700;
      text-decoration: underline;
    }
    .rules-box {
      background-color: #FEF2F2;
      border: 1.5px solid #EF4444;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      color: #991B1B;
      margin-top: 20px;
      line-height: 1.5;
    }
    .rules-box strong {
      display: block;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .footer {
      background-color: #F9FAFB;
      border-top: 2px solid #E5E7EB;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #6B7280;
      font-family: monospace;
    }
    .footer-highlight {
      font-weight: 800;
      color: #171717;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <span class="badge">Official Competition Invitation</span>
        <h1 class="title">CODE-A-THON 2026</h1>
        <p class="subtitle">GNANAMANI COLLEGE OF TECHNOLOGY • CODING CLUB</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="greeting">Dear ${fullName},</div>
        <p class="intro-text">
          You are cordially invited to participate in <strong>CODE-A-THON 2026</strong>, organized by the <strong>Department of Information Technology (IT)</strong> in association with the <strong>GCT Coding Club</strong>.
        </p>

        <!-- Event Details Card -->
        <div class="details-card">
          <div class="details-row">
            <span class="details-label">📅 Event Date:</span>
            <span class="details-value"><span class="highlight-pill">14.10.2026 (Wednesday)</span></span>
          </div>
          <div class="details-row">
            <span class="details-label">⏰ Start Time:</span>
            <span class="details-value"><span class="highlight-pill">10:00 AM IST</span> (Report by 09:45 AM)</span>
          </div>
          <div class="details-row">
            <span class="details-label">📍 Venue:</span>
            <span class="details-value"><strong>D Block IT Lab - 2</strong></span>
          </div>
          <div class="details-row">
            <span class="details-label">🏢 Organised By:</span>
            <span class="details-value">Department of Information Technology (IT) • Coding Club</span>
          </div>
          <div class="details-row">
            <span class="details-label">👤 Participant:</span>
            <span class="details-value">${fullName} (${department} - ${year})</span>
          </div>
        </div>

        <!-- Competition Structure -->
        <div class="rounds-section">
          <div class="rounds-title">⚡ 3-Stage Arena Structure</div>
          <div class="round-item">
            <div>
              <span class="round-name">Round 01: The Foundation</span>
              <div style="font-size: 11px; color: #6B7280;">5 Challenges • 45 Minutes</div>
            </div>
            <span class="round-lang">C Language</span>
          </div>
          <div class="round-item">
            <div>
              <span class="round-name">Round 02: The Logic</span>
              <div style="font-size: 11px; color: #6B7280;">5 Challenges • 45 Minutes</div>
            </div>
            <span class="round-lang" style="background-color: #10B981;">Python 3</span>
          </div>
          <div class="round-item">
            <div>
              <span class="round-name">Round 03: The Master</span>
              <div style="font-size: 11px; color: #6B7280;">5 Challenges • 60 Minutes</div>
            </div>
            <span class="round-lang" style="background-color: #8B5CF6;">Java 17</span>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="btn-container">
          <a href="${portalUrl}" class="btn-primary" target="_blank">
            Access Competition Arena →
          </a>
          <br>
          <a href="${leaderboardUrl}" class="btn-secondary" target="_blank">
            View Live Leaderboard & Guidelines
          </a>
        </div>

        <!-- Integrity Notice -->
        <div class="rules-box">
          <strong>⚠️ Zero-Tolerance Integrity Policy:</strong>
          The competition features an automated proctoring arena. Tab switching, window blurring, and exiting fullscreen are actively monitored. Please report to <strong>D Block IT Lab - 2</strong> promptly at 09:45 AM with your student credentials.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>Organised by <span class="footer-highlight">Department of Information Technology</span></div>
        <div>Coding Club • Gnanamani College of Technology</div>
        <div style="margin-top: 8px; color: #9CA3AF;">A calendar invite (.ics) has been attached for your convenience.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateCalendarIcs() {
  // Event runs 14 Oct 2026, 10:00 AM to 01:00 PM IST (UTC+5:30 -> 04:30 UTC to 07:30 UTC)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gnanamani College of Technology//Coding Club Code-A-Thon//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'UID:codeathon-2026-itlab2-gct@codingclub.gct.org.in',
    'DTSTAMP:20261013T000000Z',
    'DTSTART:20261014T043000Z',
    'DTEND:20261014T073000Z',
    'SUMMARY:GCT CODE-A-THON 2026 - Coding Club (Dept of IT)',
    'DESCRIPTION:Annual Collegiate Competitive Programming Arena\\nOrganised by: Department of Information Technology in Coding Club\\nVenue: D Block IT Lab - 2\\nDate: 14.10.2026 at 10:00 AM\\nPortal: https://code-a-thon-mu.vercel.app',
    'LOCATION:D Block IT Lab - 2, Gnanamani College of Technology',
    'STATUS:CONFIRMED',
    'CATEGORIES:COMPETITION,CODING,EDUCATION',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: GCT CODE-A-THON 2026 starts in 30 minutes at D Block IT Lab - 2',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

module.exports = {
  generateEmailHtml,
  generateCalendarIcs
};

/**
 * Geometry ACP Prep: log mixed reviews to a Google Sheet (optional).
 *
 * Setup (about 5 minutes, once):
 *  1. Make a new Google Sheet (sheets.new). Name it something like "ACP Prep Log".
 *  2. In the sheet: Extensions > Apps Script. Delete what is there and paste this whole file. Save.
 *  3. Click Deploy > New deployment. Gear icon > Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Click Deploy, approve the permissions, and copy the Web app URL (ends in /exec).
 *  4. Paste that URL into logUrl in settings.js and re-upload settings.js.
 *
 * Two tabs fill in automatically: "Finished" (one row per completed review, with the score
 * per TEKS and the questions missed) and "Started" (one row each time a student starts).
 * If you edit this script later, use Deploy > Manage deployments > Edit > New version,
 * so the URL stays the same.
 */
const TEKS_ORDER = ['G.2B', 'G.2C', 'G.3B', 'G.4B', 'G.4C', 'G.5A', 'G.5B', 'G.5C', 'G.5D', 'G.6A', 'G.6C', 'G.6D', 'G.11A'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ev = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ev.event === 'finish') {
      const sh = sheet_(ss, 'Finished', ['Received', 'Name', 'Period', 'Difficulty', 'Started', 'Finished', 'Time taken', 'Score', 'Out of', 'Percent', 'Missed'].concat(TEKS_ORDER));
      const per = ev.per || {};
      sh.appendRow([new Date(), ev.name, ev.period, ev.mode, ev.startLocal, ev.endLocal, ev.timeTaken, ev.score, ev.total, ev.pct / 100, ev.missed || ''].concat(TEKS_ORDER.map(k => per[k] || '')));
      sh.getRange(sh.getLastRow(), 10).setNumberFormat('0%');
    } else if (ev.event === 'start') {
      const sh = sheet_(ss, 'Started', ['Received', 'Name', 'Period', 'Difficulty', 'Started']);
      sh.appendRow([new Date(), ev.name, ev.period, ev.mode, ev.startLocal]);
    }
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('The ACP Prep log is running.');
}

function sheet_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

/**
 * ACP Prep (Geometry and Algebra 2): log mixed reviews to a Google Sheet (optional).
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
 * Tabs fill in automatically. Geometry: "Finished" (one row per completed review, with the score
 * per TEKS and the questions missed) and "Started" (one row each time a student starts).
 * Algebra 2 goes to its own tabs: "Algebra 2 Finished" and "Algebra 2 Started".
 * If you edit this script later, use Deploy > Manage deployments > Edit > New version,
 * so the URL stays the same.
 */
const TEKS_ORDER = ['G.2B', 'G.2C', 'G.3B', 'G.4B', 'G.4C', 'G.5A', 'G.5B', 'G.5C', 'G.5D', 'G.6A', 'G.6C', 'G.6D', 'G.11A'];
const A2_TEKS_ORDER = ['2A.2A', '2A.3A', '2A.3B', '2A.3F', '2A.4B', '2A.4D', '2A.4F', '2A.4H', '2A.6C', '2A.6D', '2A.6E', '2A.6F', '2A.7A', '2A.7I'];

// Each course writes to its own pair of tabs. Geometry keeps the original tab names.
function course_(ev) {
  if (ev.course === 'Algebra 2') return { prefix: 'Algebra 2 ', teks: A2_TEKS_ORDER, cls: 'Class' };
  return { prefix: '', teks: TEKS_ORDER, cls: 'Period' };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ev = JSON.parse(e.postData.contents);
    const ss = book_(), c = course_(ev);
    if (ev.event === 'finish') {
      const sh = sheet_(ss, c.prefix + 'Finished', ['Received', 'First name', 'Last name', c.cls, 'Difficulty', 'Started', 'Finished', 'Time taken', 'Score', 'Out of', 'Percent', 'Missed'].concat(c.teks));
      const per = ev.per || {};
      sh.appendRow([new Date()].concat(names_(ev.name), [ev.period, ev.mode, ev.startLocal, ev.endLocal, ev.timeTaken, ev.score, ev.total, ev.pct / 100, ev.missed || '']).concat(c.teks.map(k => per[k] || '')));
      sh.getRange(sh.getLastRow(), 11).setNumberFormat('0%');
    } else if (ev.event === 'start') {
      const sh = sheet_(ss, c.prefix + 'Started', ['Received', 'First name', 'Last name', c.cls, 'Difficulty', 'Started']);
      sh.appendRow([new Date()].concat(names_(ev.name), [ev.period, ev.mode, ev.startLocal]));
    }
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Open the web app URL to check it. Add ?test=1 to the end of the URL to write one test row.
function doGet(e) {
  const ss = book_();
  if (e && e.parameter && e.parameter.test) {
    const sh = sheet_(ss, 'Started', ['Received', 'First name', 'Last name', 'Period', 'Difficulty', 'Started']);
    sh.appendRow([new Date(), 'TEST', 'ROW (delete me)', '', '', '']);
  }
  return ContentService.createTextOutput('The ACP Prep log is running. Results go to: ' + ss.getName() + '  ' + ss.getUrl());
}

// Works whether the script was made from inside a sheet (Extensions > Apps Script)
// or on its own at script.google.com. On its own, it makes a sheet called "ACP Prep Log" in your Drive.
function book_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('ACP Prep Log');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

// The site sends the name as "Mar Gar" (first 3 letters of each). Split it into two columns.
function names_(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return [parts[0] || '', parts.slice(1).join(' ')];
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

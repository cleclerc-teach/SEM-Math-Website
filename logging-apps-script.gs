/**
 * ACP Prep (Geometry and Algebra 2): log mixed reviews, targeted practice, and lesson practice to a Google Sheet (optional).
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
 * Tabs fill in automatically, a set for each course ("Geometry ..." and "Algebra 2 ..."):
 *   "Mixed Review"               one row per finished mixed review: questions chosen, score, score per TEKS, questions missed
 *   "Mixed Review Started"       one row each time a student starts a mixed review
 *   "Targeted Practice"          one row per finished targeted practice: questions and topics chosen, score, questions missed
 *   "Targeted Practice Started"  one row each time a student starts a targeted practice
 *   "Lesson Practice"            one row for every answer checked on a lesson's Practice tab
 * Tabs from older versions ("Geometry Finished", "Geometry Started", "Algebra 2 Finished", ...) are left
 * as they are and get no new rows. Keep them for the old results, or delete them.
 * If you edit this script later, use Deploy > Manage deployments > Edit > New version,
 * so the URL stays the same.
 */
const TEKS_ORDER = ['G.2B', 'G.2C', 'G.3B', 'G.4B', 'G.4C', 'G.5A', 'G.5B', 'G.5C', 'G.5D', 'G.6A', 'G.6C', 'G.6D', 'G.11A', 'G.2A', 'G.6B'];
const A2_TEKS_ORDER = ['2A.2A', '2A.3A', '2A.3B', '2A.3F', '2A.4B', '2A.4D', '2A.4F', '2A.4H', '2A.6C', '2A.6D', '2A.6E', '2A.6F', '2A.7A', '2A.7I'];

// Each course writes to its own set of tabs.
function course_(ev) {
  if (ev.course === 'Algebra 2') return { prefix: 'Algebra 2 ', teks: A2_TEKS_ORDER, cls: 'Class' };
  return { prefix: 'Geometry ', teks: TEKS_ORDER, cls: 'Period' };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ev = JSON.parse(e.postData.contents);
    const ss = book_(), c = course_(ev);
    // Mixed review and targeted practice each get their own tabs. (Older site versions sent no "kind".)
    const tp = ev.kind ? ev.kind === 'targeted' : /^Targeted/.test(ev.mode || '');
    const kind = tp ? 'Targeted Practice' : 'Mixed Review';
    if (ev.event === 'finish') {
      const head = ['Received', 'First name', 'Last name', c.cls, 'Questions chosen'].concat(tp ? ['Topics chosen'] : [], ['Difficulty', 'Started', 'Finished', 'Time taken', 'Score', 'Out of', 'Percent', 'Missed']);
      const sh = sheet_(ss, c.prefix + kind, head.concat(c.teks));
      const per = ev.per || {};
      sh.appendRow([new Date()].concat(names_(ev.name), [ev.period, ev.chosen || ev.total], tp ? [ev.topics || ''] : [], [ev.mode, ev.startLocal, ev.endLocal, ev.timeTaken, ev.score, ev.total, ev.pct / 100, ev.missed || '']).concat(c.teks.map(k => per[k] || '')));
      sh.getRange(sh.getLastRow(), head.indexOf('Percent') + 1).setNumberFormat('0%');
    } else if (ev.event === 'start') {
      const sh = sheet_(ss, c.prefix + kind + ' Started', ['Received', 'First name', 'Last name', c.cls, 'Questions chosen'].concat(tp ? ['Topics chosen'] : [], ['Difficulty', 'Started']));
      sh.appendRow([new Date()].concat(names_(ev.name), [ev.period, ev.chosen || ''], tp ? [ev.topics || ''] : [], [ev.mode, ev.startLocal]));
    } else if (ev.event === 'practice') {
      // One row for each answer a student checks on a lesson's Practice tab.
      const sh = sheet_(ss, c.prefix + 'Lesson Practice', ['Received', 'First name', 'Last name', c.cls, 'Date', 'Time', 'TEKS', 'Topic', 'Skill', 'Difficulty', 'Question', 'Student answer', 'Correct answer', 'Result', 'Used a hint']);
      sh.appendRow([new Date()].concat(names_(ev.name), [ev.period, ev.dateLocal, ev.timeLocal, ev.teks, ev.topic, ev.skill, ev.mode, ev.question, ev.answer, ev.correct, ev.ok ? 'Right' : 'Wrong', ev.hint ? 'Yes' : '']));
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
    const sh = sheet_(ss, 'Geometry Mixed Review Started', ['Received', 'First name', 'Last name', 'Period', 'Questions chosen', 'Difficulty', 'Started']);
    sh.appendRow([new Date(), 'TEST', 'ROW (delete me)', '', '', '', '']);
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
  // A newer site version can add columns (G.2A and G.6B came later). Add any missing header cells at the end.
  if (sh && sh.getLastRow() > 0 && sh.getLastColumn() < header.length) {
    sh.getRange(1, sh.getLastColumn() + 1, 1, header.length - sh.getLastColumn()).setValues([header.slice(sh.getLastColumn())]).setFontWeight('bold');
  }
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

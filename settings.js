/* ============================================================
   TEACHER SETTINGS: the only file you need to edit.
   Change the values between the quotes, save, and re-upload.
   ============================================================ */
window.SITE_SETTINGS = {

  // The name at the top of the home page.
  siteName: 'Ms. Leclerc\'s Math Review',
  // A short line under it.
  tagline: 'Practice the skills, then show what you know on the ACP.',

  // How students see your name ("Show this record to Ms. Leclerc").
  teacher: 'Ms. Leclerc',

  // The choices in the "Class period" drop-down on the mixed review.
  periods: ['1st period', '3rd period', '5th period', '6th period', 'Other', "Ms. Vergou's Student"],

  // Optional: your Google Apps Script web app address, so every mixed review
  // is logged to your Google Sheet. See logging-apps-script.gs for the steps.
  // Leave it as '' and the site still works: students show you their score screen instead.
  logUrl: 'https://script.google.com/macros/s/AKfycbzdmx6GT-3ckFWXZbxzf2wsXXt2v1dEccpTtsS4tkx7NSGmfgZZicWom0b-uBHi37_Lsg/exec',

  // The course cards on the home page. To add a course later, add its folder
  // (like algebra2/) and set ready: true. Cards with ready: false show "Coming soon".
  courses: [
    { name: 'Geometry', folder: 'geometry/index.html', test: 'Semester 1 ACP', blurb: 'Lessons and practice for all 13 TEKS, plus a mixed review weighted like the ACP.', ready: true },
    { name: 'Algebra 2', folder: 'algebra2/index.html', test: 'ACP', blurb: 'Coming soon.', ready: false }
  ]

};

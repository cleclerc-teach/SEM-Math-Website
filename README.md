# ACP Prep: Geometry and Algebra 2 (Semester 1)

Free practice sites for the Semester 1 ACPs. **Geometry Advanced**: lessons and endless practice for all 13 TEKS
(G.2B, 2C, 3B, 4B, 4C, 5A, 5B, 5C, 5D, 6A, 6C, 6D, 11A) plus a 28- or 15-question mixed review weighted like
the Dallas ISD blueprint. Every question is generated fresh, so students never run out.

**Algebra II Advanced** (`algebra2/`): lessons and practice for all 14 TEKS (2A.2A, 3A, 3B, 3F, 4B, 4D, 4F, 4H,
6C, 6D, 6E, 6F, 7A, 7I) plus a 28- or 14-question mixed review. Content crossed out on the 2026-27 blueprint is never
used (only the x³ and |x| parent functions, no focus/directrix, no square root equations, no set notation).
Its class choices are set in its own entry in the `courses` list in `settings.js` (`periods`, `defaultPeriod`).

Adapted with permission from Troy's site (weloveadamsonmath.github.io/GeometryACP1).

## Files

| File | What it is | Edit it? |
|---|---|---|
| `settings.js` | Site name, your name, class periods, Google Sheet link, course list | **Yes** |
| `theme.css` | Your colors (top block only), shared by every page | **Yes** |
| `logging-apps-script.gs` | Paste into Google Apps Script to receive results | Copy/paste only |
| `index.html` | The home page (course cards) | No |
| `geometry/index.html` | The whole Geometry site | No |
| `algebra2/index.html` | The whole Algebra 2 site | No |

## Adding a course later (e.g. Algebra 2)

Put the new course in its own folder (`algebra2/index.html`) and change `ready: false` to `ready: true`
for it in the `courses` list in `settings.js`. The home page card becomes a link.

## Getting student results sent to you

1. Open `logging-apps-script.gs` and follow the 4 steps at the top (make a Google Sheet, paste the script, deploy as a web app).
2. Paste the web app URL into `logUrl` in `settings.js`.
3. Every time a student starts or finishes a mixed review, a row lands in your sheet: name, period, difficulty,
   time taken, score, percent, the questions missed, and the score on each TEKS.

If a student is offline, the result waits on their device and sends the next time they open the site.

## Putting it online (GitHub Pages, free)

1. Sign in at github.com and click **New repository**. Name it e.g. `GeometryACP`, make it **Public**, create it.
2. Click **Add file > Upload files**, drag in all the files from this folder, and click **Commit changes**.
3. Go to **Settings > Pages**. Under "Branch," choose `main` and `/ (root)`, then **Save**.
4. In a minute or two the site is live at `https://YOUR-USERNAME.github.io/GeometryACP/`.

Link straight to one topic by adding its code: `geometry/#g6d`, `algebra2/#a4d`, or `#mix` for the mixed review.

Geometry results go to "Geometry Started" and "Geometry Finished", and Algebra 2 results go to "Algebra 2 Started" and "Algebra 2 Finished", all in the same sheet.

## For another teacher

Copy the whole folder (or fork the GitHub repo), change your name and periods in `settings.js`, your colors in
`theme.css`, set up your own Google Sheet with `logging-apps-script.gs`, and publish with the steps above.
Each teacher's results go only to their own sheet.

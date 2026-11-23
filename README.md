# Probability Studio: setup guide for a first-timer

You will end up with two web links:
- **Students:** `https://YOUR-NAME.github.io/probability-studio/index.html` (they play on phones or laptops)
- **You:** `https://YOUR-NAME.github.io/probability-studio/board.html` (timer, QR code, top-5 leaderboard)

No coding. About 45 minutes the first time. Everything used is free and open source.
Only Game 1 is built so far. Games 2 to 4 are added later by dropping in one more file each.

Do the steps in order.

---

## Step 1. Create the free database (Supabase)

1. Go to **supabase.com** and click **Start your project**. Sign up (the "Continue with GitHub" button is easiest).
2. Click **New project**. Fill in:
   - Name: `probability-studio`
   - Database password: click "Generate a password" and save it anywhere. You will not need it again.
   - Region: the closest one to Oklahoma (an "East US" option).
   - Plan: **Free**.
3. Click **Create new project** and wait about 2 minutes.

## Step 2. Choose your instructor passcode and load the database

1. Open the file `setup-only/schema.sql` in Notepad (Windows) or TextEdit (Mac).
2. Press Ctrl+F (Cmd+F on Mac), search for `CHANGE_ME`. It appears **once**. Replace it with a passcode only you know (letters and numbers, no quotes). Save the file.
3. In Supabase, click **SQL Editor** in the left menu, then **New query**.
4. Copy the **entire** contents of `schema.sql`, paste it, and click **Run**.
5. You should see "Success. No rows returned." Run the script only once; running it twice gives "already exists" errors.

> Never upload `schema.sql` to GitHub. It holds your passcode. That is why it sits in the `setup-only` folder.

## Step 3. Copy two values into `config.js`

1. In Supabase click the **gear icon (Project Settings)**, then **API Keys** (it may be called **Data API** or **API**).
2. Copy the **Project URL**. It looks like `https://abcdxyz.supabase.co`.
3. Copy the public key: the **anon** key (starts with `eyJ`) or the **publishable** key (starts with `sb_publishable_`). If the publishable key gives errors later, use the anon key. It may be under a "Legacy API keys" tab.
4. Open `config.js` in Notepad/TextEdit and paste the two values between the quotes. Save.

Both values are meant to be public. Your passcode is the secret one, and it is not in this file.

## Step 4. Test on your own computer

1. Unzip the folder. Double-click `board.html`. It opens in your browser and shows "Lobby".
2. Open `index.html` in a second tab. Enter session code `XMAS` and a username like `test01`, then click Join.
3. In the board tab, type your passcode and click **Open round 1**. The question appears on the student tab within 3 seconds.
4. Answer it, wait for the timer, and see the result and the leaderboard.
5. Click **Back to lobby** when done.
6. Clear the test answers: in Supabase, **Table Editor**, then **answers**, tick the rows, and click Delete.

## Step 5. Put it on the internet (GitHub Pages)

You already have a GitHub account, so:

1. Go to **github.com**, click **+** (top right), then **New repository**.
   Name it `probability-studio`, choose **Public**, and click **Create repository**.
2. Click **uploading an existing file**.
3. Open the unzipped folder and select **the files inside it** (`index.html`, `board.html`, `engine.js`, `game1.js`, `api.js`, `config.js`, `qrcode.js`, `test.js`, `README.md`). Drag them into the browser.
   **Do not upload the `setup-only` folder.**
4. Click **Commit changes**.
5. Go to the repository's **Settings**, then **Pages**. Under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/(root)**, and click **Save**.
6. Wait 1 to 2 minutes. The page shows your live address: `https://YOUR-NAME.github.io/probability-studio/`.
7. Open `.../board.html` on your computer and `.../index.html` on your phone. If both work, you are done.

If you change a file later (for example `config.js`), open it on GitHub, click the pencil icon, edit, and commit. The site updates in about a minute.

## Step 6. The day before class

- Open the Supabase dashboard once. Free projects pause after 7 days of no use, and opening it keeps yours awake. If it says "paused", click **Restore**.
- Do a full test with a friend on the **classroom Wi-Fi**, using their phone.
- Clear test answers again (Step 4, item 6).

## Step 7. Class day

1. Open `board.html` and project it. Enter your passcode, choose **Game 1**, keep session code `XMAS` (or change it), and keep **10 minutes per round**.
2. Students scan the QR code, or type the link and the session code. The QR code already contains the session code.
3. Click **Open round 1**. When the timer ends, the round closes by itself and the leaderboard updates. Click **Open round 2**, and so on.
4. You can click **Close round now** to end a round early.
5. After round 4, click **Download CSV for Canvas**.

Canvas upload: the CSV has `Login ID, Game, Balance, Points (%)`. Canvas's own import needs its own column layout. The easiest route is to export your Canvas gradebook, paste the Points column next to each student's login ID, and import that file. Send me a sample Canvas export header if you want me to produce the exact format.

---

## Good to know

- **Scoring.** Each round, a student loses money equal to how much worse their choice was than the best choice. A missed round counts as the worst choice. A correct numeric answer adds a $5 bonus (H$5,000). H$1,000 equals $1.
- **Numbers differ per student**, so students can talk about methods but not copy answers.
- **First answer is final.** Late answers are rejected by the server's clock, not the phone's.
- **The leaderboard shows** only students who answered at least once.
- **If the Wi-Fi drops**, a student's phone keeps retrying by itself and shows "Saving…".
- **Limits:** a student could read the game's open code to find formulas, and anyone who knows the session code can join. This is a practice game, so we accepted both.

## Troubleshooting

| Problem | Fix |
|---|---|
| Board says "connection problem" | `config.js` values are wrong, or the Supabase project is paused. Re-check Step 3, then Step 6. |
| "Wrong passcode" | Use exactly what you typed in `schema.sql`. |
| Student sees "session code does not match" | Check the code on the projector (case does not matter). |
| Students see a blank page | Wait 2 minutes after the GitHub step, then check the link ends in `/index.html`. |
| A student sees "Saving…" for a long time | Network problem. Keep the page open. If the round closes first, the answer is lost and counts as missed. |

## Files

`index.html` student page · `board.html` your page · `engine.js` scoring · `game1.js` Game 1 questions · `api.js` database helper · `config.js` your 2 keys · `qrcode.js` open-source QR library (MIT) · `test.js` run `node test.js` to check the math.



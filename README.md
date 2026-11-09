# LifeOS

**Dump everything in your head. Let LifeOS organize the rest.**

LifeOS is a personal productivity web app. Write down whatever is on your mind, ask AI to organize it, then turn those thoughts into ideas, tasks, and reminders.

**Live app:** https://raphaelraflores11-sys.github.io/LifeOs/

## How it fits together

- **Notes = Brain Dumps.** Everything you write goes into Brain Dump first. Your brain dumps are your notes.
- **Ideas:** thoughts worth exploring later. Turn an idea into a task when you're ready to act on it.
- **Tasks:** things you need to do.
- **Reminders:** things tied to a date and time.

## What it does today

- **Brain Dump:** write down anything (up to 500 characters), see it in a list, and delete it.
- **Organize with AI:** AI reads what you wrote and suggests a short summary plus ideas and tasks. You tap **Add to Ideas** or **Add to Tasks** for the ones you want. Nothing is added automatically, and your last result stays visible until you dismiss it.
- **Make idea / Make task / Make reminder:** turn any brain dump into an idea, a task, or a reminder with a date and time, in one tap. The original dump is kept.
- **Ideas:** add, list, and delete ideas. **Turn into task** creates a task and removes the idea.
- **Tasks:** add, tick off, and delete tasks, and filter by All, Active, or Done.
- **Reminders:** set reminders with a date and time. They are grouped into Overdue, Upcoming, and Done.
- **Dashboard:** live counts of your brain dumps, active tasks, and open reminders, plus your recent dumps and a quick-dump box.
- **Works on phones:** the layout adapts to small screens, and you can add it to your Home Screen.

Your brain dumps, ideas, tasks, and reminders are saved in your own browser (LocalStorage). There are no accounts. This means data is not shared between devices, and clearing your browser data erases it.

## MVP progress

The first version is complete when a user can:

- [x] Dump thoughts into LifeOS
- [x] Ask real AI to organize those thoughts
- [x] See ideas, tasks, and notes in their own places
- [x] Save and revisit the results
- [x] Turn an idea into an actionable task
- [x] Use the app through a shareable link (live on GitHub Pages)

## Privacy

When you tap **Organize with AI**, the text in the box is sent through a small Cloudflare Worker to Google's Gemini API. Free tiers can allow the provider to use submitted text to improve its models, so don't put sensitive information in a brain dump you plan to organize with AI. Everything else stays in your browser.

## Tech stack

- **Frontend:** plain HTML, CSS, and JavaScript, with no frameworks
- **Storage:** browser LocalStorage
- **Hosting:** GitHub Pages
- **AI:** a Cloudflare Worker (`worker/`) that calls the Gemini API. The API key is stored as a secret in Cloudflare and never appears in this repo or in the site's code.
- **Early backend experiment:** `server/` holds a small Node.js and Express server from an earlier step. It isn't used by the live app.

## Project structure

- `index.html`, `styles.css`, `script.js`: the app shell, navigation, Dashboard, and Brain Dump
- `ai-organize.js`: the "Organize with AI" button and its results
- `ideas.js`, `ideas.css`: the Ideas page
- `tasks.js`, `tasks.css`: the Tasks page
- `reminders.js`, `reminders.css`: the Reminders page
- `dump-actions.js`: the "Make idea", "Make task", and "Make reminder" buttons on Brain Dump entries
- `worker/`: the Cloudflare Worker that talks to the AI
- `server/`: an early backend experiment, not used by the live app

The Schedule and Expenses sections exist in the page but are hidden from the menu until they are built.

## Run it locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. The AI button only works on the live site, because the Worker only accepts requests from there.

## Security

- Never put an API key in the frontend code or commit one to GitHub.
- Keys live in Cloudflare as secrets. `.env` files are excluded by `.gitignore`, and `.env.example` only holds placeholders.

## Roadmap

1. An "Organize with AI" button on each saved brain dump, not just the new-entry box.
2. Back up and restore your data.
3. Accounts and syncing across devices.
4. Schedule and Expenses.

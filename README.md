# LifeOS

**Dump everything in your head. Let LifeOS organize the rest.**

LifeOS is a personal productivity web app. Write down whatever is on your mind, then turn those thoughts into tasks and reminders.

**Live app:** https://raphaelraflores11-sys.github.io/LifeOs/

## What it does today

- **Brain Dump:** write down anything (up to 500 characters), see it in a list, and delete it.
- **Make task / Make reminder:** turn any brain dump into a task, or into a reminder with a date and time, in one tap. The original dump is kept.
- **Tasks:** add, tick off, and delete tasks, and filter by All, Active, or Done.
- **Reminders:** set reminders with a date and time. They are grouped into Overdue, Upcoming, and Done.
- **Dashboard:** live counts of your brain dumps, active tasks, and open reminders, plus your recent dumps and a quick-dump box.
- **Works on phones:** the layout adapts to small screens, and you can add it to your Home Screen.

All your data is saved in your own browser (LocalStorage). There are no accounts, and nothing is sent to a server. This also means data is not shared between devices, and clearing your browser data erases it.

## MVP progress

The first version is complete when a user can:

- [x] Dump thoughts into LifeOS
- [ ] Ask real AI to organize those thoughts
- [ ] See ideas, tasks, and notes separated
- [ ] Save and revisit the results
- [x] Turn a thought into an actionable task (currently by hand, from any dump)
- [x] Use the app through a shareable link (live on GitHub Pages)

## Tech stack

- **Frontend:** plain HTML, CSS, and JavaScript, with no frameworks
- **Storage:** browser LocalStorage
- **Hosting:** GitHub Pages
- **Backend foundation:** Node.js, Express, and the official OpenAI JavaScript SDK in `server/`. For now it only has a health check endpoint. AI features are not built yet.

## Project structure

- `index.html`, `styles.css`, `script.js`: the app shell, navigation, Dashboard, and Brain Dump
- `tasks.js`, `tasks.css`: the Tasks page
- `reminders.js`, `reminders.css`: the Reminders page
- `dump-actions.js`: the "Make task" and "Make reminder" buttons on Brain Dump entries
- `server/`: the backend foundation (`server.js`, `package.json`)
- `.env.example`: placeholder settings for the backend

The Schedule and Expenses sections exist in the page but are hidden from the menu until they are built.

## Run it locally

Frontend only:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Backend health check:

```
cd server
npm install
npm start
```

Then open http://localhost:3000/api/health. It should return JSON saying the backend is running.

## Security

- Never put an API key in the frontend code or commit one to GitHub.
- Real keys go in a `.env` file or in your host's secret settings. The `.env` file is excluded by `.gitignore`.
- `.env.example` only holds placeholders.

## Roadmap

1. AI organization: send a brain dump to a hosted backend and get back a summary plus items labeled idea, task, or note, shown as suggestions you can accept.
2. Save and revisit AI results.
3. Turn an accepted idea into a task.
4. Back up and restore your data.
5. Accounts and syncing across devices.
6. Schedule and Expenses.

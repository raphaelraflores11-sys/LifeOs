(function () {
  "use strict";

  var DUMPS_KEY = "lifeos_brain_dumps";
  var TASK_MAX = 200;
  var REMINDER_MAX = 120;

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".dump-item-actions { display: flex; flex-wrap: wrap; gap: 8px; }",
      ".dump-reminder-picker { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }",
      ".dump-reminder-picker[hidden] { display: none; }",
      ".dump-reminder-input { padding: 8px 10px; border: 1px solid #d9dde6; border-radius: 10px; font: inherit; background: #fff; max-width: 100%; }",
      ".dump-note { margin-top: 8px; font-size: 0.9rem; color: #2446b8; }",
      ".dump-note:empty { display: none; }",
      ".dump-note-error { color: #b42318; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function inOneHour() {
    var d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return (
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
    );
  }

  function fullText(id) {
    try {
      var list = JSON.parse(localStorage.getItem(DUMPS_KEY) || "[]");
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].id) === String(id)) return String(list[i].content || "");
      }
    } catch (e) {
      /* ignore unreadable storage */
    }
    return "";
  }

  function clip(text, max) {
    var clean = text.replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 3) + "..." : clean;
  }

  function flash(note, message, isError) {
    note.textContent = message;
    note.className = "dump-note" + (isError ? " dump-note-error" : "");
    setTimeout(function () {
      if (note.textContent === message) note.textContent = "";
    }, 3000);
  }

  function enhance(item) {
    item.setAttribute("data-dump-enhanced", "1");
    var actions = item.querySelector(".dump-item-actions");
    var del = item.querySelector("[data-dump-id]");
    if (!actions || !del) return;
    var id = del.getAttribute("data-dump-id");

    var taskBtn = el("button", "dump-item-btn", "Make task");
    taskBtn.type = "button";
    var reminderBtn = el("button", "dump-item-btn", "Make reminder");
    reminderBtn.type = "button";

    var picker = el("div", "dump-reminder-picker");
    picker.hidden = true;
    var when = el("input", "dump-reminder-input");
    when.type = "datetime-local";
    when.setAttribute("aria-label", "Reminder date and time");
    var setBtn = el("button", "dump-item-btn", "Set reminder");
    setBtn.type = "button";
    var cancelBtn = el("button", "dump-item-btn", "Cancel");
    cancelBtn.type = "button";
    picker.appendChild(when);
    picker.appendChild(setBtn);
    picker.appendChild(cancelBtn);

    var note = el("div", "dump-note");
    note.setAttribute("aria-live", "polite");

    taskBtn.addEventListener("click", function () {
      var text = clip(fullText(id), TASK_MAX);
      if (!text) {
        flash(note, "Couldn't read that dump.", true);
        return;
      }
      if (!window.LifeOSTasks) {
        flash(note, "Tasks aren't available right now.", true);
        return;
      }
      window.LifeOSTasks.add(text);
      flash(note, "Added to Tasks \u2713");
    });

    reminderBtn.addEventListener("click", function () {
      picker.hidden = !picker.hidden;
      if (!picker.hidden) when.value = inOneHour();
    });

    cancelBtn.addEventListener("click", function () {
      picker.hidden = true;
    });

    setBtn.addEventListener("click", function () {
      var title = clip(fullText(id), REMINDER_MAX);
      if (!title) {
        flash(note, "Couldn't read that dump.", true);
        return;
      }
      if (!when.value || isNaN(new Date(when.value).getTime())) {
        flash(note, "Please pick a date and time.", true);
        return;
      }
      if (!window.LifeOSReminders) {
        flash(note, "Reminders aren't available right now.", true);
        return;
      }
      window.LifeOSReminders.add(title, when.value);
      picker.hidden = true;
      flash(note, "Reminder set \u2713");
    });

    actions.insertBefore(taskBtn, del);
    actions.insertBefore(reminderBtn, del);
    actions.insertAdjacentElement("afterend", picker);
    picker.insertAdjacentElement("afterend", note);
  }

  function scan() {
    var items = document.querySelectorAll("#dumpsList .dump-item:not([data-dump-enhanced])");
    for (var i = 0; i < items.length; i++) enhance(items[i]);
  }

  function start() {
    var list = document.getElementById("dumpsList");
    if (!list) return;
    addStyles();
    scan();
    // The list is rebuilt on every change, so enhance new entries as they appear.
    new MutationObserver(scan).observe(list, { childList: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

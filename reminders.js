(function () {
  "use strict";

  var STORAGE_KEY = "lifeos_reminders";
  var MAX_LEN = 120;
  var reminders = load();
  var ui = {};

  function valid(r) {
    return (
      r &&
      typeof r.id === "string" &&
      typeof r.title === "string" &&
      typeof r.due === "string" &&
      !isNaN(new Date(r.due).getTime()) &&
      typeof r.done === "boolean"
    );
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(valid) : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (e) {
      /* storage unavailable; reminders stay in memory for this visit */
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function toInputValue(d) {
    return (
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
    );
  }

  function defaultDue() {
    var d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return toInputValue(d);
  }

  function formatDue(str) {
    return new Date(str).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function byDue(a, b) {
    return new Date(a.due).getTime() - new Date(b.due).getTime();
  }

  function grouped() {
    var now = Date.now();
    var overdue = [];
    var upcoming = [];
    var done = [];
    reminders.forEach(function (r) {
      if (r.done) done.push(r);
      else if (new Date(r.due).getTime() < now) overdue.push(r);
      else upcoming.push(r);
    });
    overdue.sort(byDue);
    upcoming.sort(byDue);
    done.sort(function (a, b) { return byDue(b, a); });
    return { overdue: overdue, upcoming: upcoming, done: done };
  }

  function updateDashboardCount() {
    var node = document.getElementById("reminderCount");
    if (!node) return;
    var g = grouped();
    node.textContent = String(g.overdue.length + g.upcoming.length);
  }

  function addReminder(title, due) {
    reminders.push({ id: newId(), title: title, due: due, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleReminder(id) {
    reminders.forEach(function (r) {
      if (r.id === id) r.done = !r.done;
    });
    save();
    render();
  }

  function deleteReminder(id) {
    reminders = reminders.filter(function (r) { return r.id !== id; });
    save();
    render();
  }

  function clearDone() {
    reminders = reminders.filter(function (r) { return !r.done; });
    save();
    render();
  }

  function showError(message) {
    ui.error.textContent = message;
    ui.error.hidden = !message;
  }

  function renderGroup(container, label, className, items) {
    if (items.length === 0) return;
    container.appendChild(
      el("h3", "reminder-group-title " + className, label + " (" + items.length + ")")
    );
    var list = el("ul", "reminders-list");

    items.forEach(function (r) {
      var li = el("li", "reminder-item " + className);

      var main = el("label", "reminder-main");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = r.done;
      box.addEventListener("change", function () { toggleReminder(r.id); });

      var info = el("div", "reminder-info");
      info.appendChild(el("span", "reminder-title", r.title));
      info.appendChild(el("span", "reminder-due", formatDue(r.due)));

      main.appendChild(box);
      main.appendChild(info);

      var del = el("button", "reminder-delete", "Delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete reminder: " + r.title);
      del.addEventListener("click", function () { deleteReminder(r.id); });

      li.appendChild(main);
      li.appendChild(del);
      list.appendChild(li);
    });

    container.appendChild(list);
  }

  function render() {
    var g = grouped();
    var box = ui.groups;
    box.innerHTML = "";

    if (reminders.length === 0) {
      box.appendChild(el("p", "empty-state", "No reminders yet. Add your first one above!"));
    } else if (g.overdue.length + g.upcoming.length === 0) {
      box.appendChild(el("p", "empty-state", "You're all caught up."));
    }

    renderGroup(box, "Overdue", "overdue", g.overdue);
    renderGroup(box, "Upcoming", "upcoming", g.upcoming);
    renderGroup(box, "Done", "done", g.done);

    ui.summary.textContent =
      g.overdue.length + " overdue \u00b7 " +
      g.upcoming.length + " upcoming \u00b7 " +
      g.done.length + " done";
    ui.clear.hidden = g.done.length === 0;

    updateDashboardCount();
  }

function build() {
    var section = document.getElementById("reminders");
    if (!section) return;
    var placeholder = section.querySelector(".placeholder");
    if (!placeholder) return;

    var subtitle = section.querySelector(".page-subtitle");
    if (subtitle) subtitle.textContent = "Set reminders for what matters and see what's overdue.";

    var root = el("div", "reminders-app");

    var form = el("form", "reminders-form");
    var titleInput = el("input", "reminders-input");
    titleInput.type = "text";
    titleInput.maxLength = MAX_LEN;
    titleInput.placeholder = "Remind me to...";
    titleInput.setAttribute("aria-label", "Reminder");

    var dueInput = el("input", "reminders-input");
    dueInput.type = "datetime-local";
    dueInput.value = defaultDue();
    dueInput.setAttribute("aria-label", "Due date and time");

    var addBtn = el("button", "btn btn-primary reminders-add", "Add Reminder");
    addBtn.type = "submit";

    form.appendChild(titleInput);
    form.appendChild(dueInput);
    form.appendChild(addBtn);

    ui.error = el("div", "reminders-error");
    ui.error.hidden = true;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = titleInput.value.trim().slice(0, MAX_LEN);
      var due = dueInput.value;
      if (!title) {
        showError("Please enter what to be reminded about.");
        return;
      }
      if (!due || isNaN(new Date(due).getTime())) {
        showError("Please pick a date and time.");
        return;
      }
      showError("");
      addReminder(title, due);
      titleInput.value = "";
      dueInput.value = defaultDue();
      titleInput.focus();
    });

    ui.summary = el("div", "reminders-summary");
    ui.groups = el("div", "reminders-groups");
    ui.clear = el("button", "reminders-clear", "Clear completed");
    ui.clear.type = "button";
    ui.clear.addEventListener("click", clearDone);

    root.appendChild(form);
    root.appendChild(ui.error);
    root.appendChild(ui.summary);
    root.appendChild(ui.groups);
    root.appendChild(ui.clear);

    placeholder.parentNode.replaceChild(root, placeholder);
    render();

    // Reminders slip from Upcoming to Overdue as time passes.
    setInterval(render, 30000);

    // Keep the Dashboard count correct after any click or navigation.
    document.addEventListener("click", function () {
      setTimeout(updateDashboardCount, 0);
    });
  }
  window.LifeOSReminders = { add: function (title, due) { addReminder(title, due); } };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();

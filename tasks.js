(function () {
  "use strict";

  var STORAGE_KEY = "lifeos_tasks";
  var MAX_LEN = 200;
  var tasks = load();
  var filter = "all";
  var ui = {};

  function valid(t) {
    return t && typeof t.id === "string" && typeof t.text === "string" && typeof t.done === "boolean";
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* storage unavailable; tasks stay in memory for this visit */
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

  function activeCount() {
    return tasks.filter(function (t) { return !t.done; }).length;
  }

  function updateDashboardCount() {
    var node = document.getElementById("taskCount");
    if (node) node.textContent = String(activeCount());
  }

  function addTask(text) {
    var clean = text.trim().slice(0, MAX_LEN);
    if (!clean) return;
    tasks.unshift({ id: newId(), text: clean, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleTask(id) {
    tasks.forEach(function (t) {
      if (t.id === id) t.done = !t.done;
    });
    save();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
  }

  function clearDone() {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  }

  function visibleTasks() {
    return tasks.filter(function (t) {
      if (filter === "active") return !t.done;
      if (filter === "done") return t.done;
      return true;
    });
  }

  function emptyMessage() {
    if (filter === "active") return "Nothing left to do. Nice work!";
    if (filter === "done") return "No completed tasks yet.";
    return "No tasks yet. Add your first one above!";
  }

  function render() {
    var list = ui.list;
    list.innerHTML = "";

    var items = visibleTasks();
    if (items.length === 0) {
      list.appendChild(el("li", "empty-state", emptyMessage()));
    }

    items.forEach(function (task) {
      var li = el("li", "task-item" + (task.done ? " done" : ""));

      var label = el("label", "task-main");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = task.done;
      box.addEventListener("change", function () { toggleTask(task.id); });
      label.appendChild(box);
      label.appendChild(el("span", "task-text", task.text));

      var del = el("button", "task-delete", "Delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete task: " + task.text);
      del.addEventListener("click", function () { deleteTask(task.id); });

      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    });

    var done = tasks.length - activeCount();
    ui.summary.textContent = activeCount() + " active \u00b7 " + done + " done";
    ui.clear.hidden = done === 0;

    ui.filters.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-task-filter") === filter);
    });

    updateDashboardCount();
  }

  function build() {
    var section = document.getElementById("tasks");
    if (!section) return;
    var placeholder = section.querySelector(".placeholder");
    if (!placeholder) return;

    var subtitle = section.querySelector(".page-subtitle");
    if (subtitle) subtitle.textContent = "Add what you need to do and tick it off when it's done.";

    var root = el("div", "tasks-app");

    var form = el("form", "tasks-form");
    var input = el("input", "tasks-input");
    input.type = "text";
    input.maxLength = MAX_LEN;
    input.placeholder = "Add a task...";
    input.setAttribute("aria-label", "New task");
    var addBtn = el("button", "btn btn-primary", "Add Task");
    addBtn.type = "submit";
    form.appendChild(input);
    form.appendChild(addBtn);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      addTask(input.value);
      input.value = "";
      input.focus();
    });

    var header = el("div", "list-header");
    header.appendChild(el("h2", "", "Your Tasks"));
    var filterBox = el("div", "list-filters");
    ui.filters = [];
    [["all", "All"], ["active", "Active"], ["done", "Done"]].forEach(function (pair) {
      var btn = el("button", "filter-btn", pair[1]);
      btn.type = "button";
      btn.setAttribute("data-task-filter", pair[0]);
      btn.addEventListener("click", function () {
        filter = pair[0];
        render();
      });
      filterBox.appendChild(btn);
      ui.filters.push(btn);
    });
    header.appendChild(filterBox);

    ui.summary = el("div", "tasks-summary");
    ui.list = el("ul", "tasks-list");
    ui.clear = el("button", "tasks-clear", "Clear completed");
    ui.clear.type = "button";
    ui.clear.addEventListener("click", clearDone);

    root.appendChild(form);
    root.appendChild(header);
    root.appendChild(ui.summary);
    root.appendChild(ui.list);
    root.appendChild(ui.clear);

    placeholder.parentNode.replaceChild(root, placeholder);
    render();

    // Keep the Dashboard "Tasks" count correct after any click or navigation.
    document.addEventListener("click", function () {
      setTimeout(updateDashboardCount, 0);
    });
  }
  window.LifeOSTasks = { add: function (text) { addTask(text); } };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();

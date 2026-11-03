(function () {
  "use strict";

  var STORAGE_KEY = "lifeos_ideas";
  var MAX_LEN = 500;
  var TASK_MAX = 200;
  var ideas = load();
  var ui = {};
  var noteTimer = null;

  function valid(i) {
    return i && typeof i.id === "string" && typeof i.text === "string";
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      /* storage unavailable; ideas stay in memory for this visit */
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

  function clip(text, max) {
    var clean = text.replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 3) + "..." : clean;
  }

  function showNote(message, isError) {
    if (!ui.note) return;
    ui.note.textContent = message;
    ui.note.className = "ideas-note" + (isError ? " ideas-note-error" : "");
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      ui.note.textContent = "";
    }, 3000);
  }

  function addIdea(text) {
    var clean = clip(String(text), MAX_LEN);
    if (!clean) return false;
    ideas.unshift({ id: newId(), text: clean, createdAt: Date.now() });
    save();
    render();
    return true;
  }

  function deleteIdea(id) {
    ideas = ideas.filter(function (i) { return i.id !== id; });
    save();
    render();
  }

  function turnIntoTask(id) {
    var idea = null;
    for (var n = 0; n < ideas.length; n++) {
      if (ideas[n].id === id) idea = ideas[n];
    }
    if (!idea) return;
    if (!window.LifeOSTasks) {
      showNote("Tasks aren't available right now.", true);
      return;
    }
    window.LifeOSTasks.add(clip(idea.text, TASK_MAX));
    ideas = ideas.filter(function (i) { return i.id !== id; });
    save();
    render();
    showNote("Turned into a task \u2713");
  }

  function render() {
    if (!ui.list) return;
    ui.list.innerHTML = "";

    if (ideas.length === 0) {
      ui.list.appendChild(
        el("li", "empty-state", "No ideas yet. Add one above, or tap \"Make idea\" on a brain dump.")
      );
    }

    ideas.forEach(function (idea) {
      var li = el("li", "idea-item");
      li.appendChild(el("div", "idea-text", idea.text));

      var actions = el("div", "idea-actions");
      var toTask = el("button", "idea-btn", "Turn into task");
      toTask.type = "button";
      toTask.addEventListener("click", function () { turnIntoTask(idea.id); });

      var del = el("button", "idea-btn", "Delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete idea: " + idea.text);
      del.addEventListener("click", function () { deleteIdea(idea.id); });

      actions.appendChild(toTask);
      actions.appendChild(del);
      li.appendChild(actions);
      ui.list.appendChild(li);
    });

    ui.summary.textContent = ideas.length + (ideas.length === 1 ? " idea" : " ideas");
  }

  function build() {
    var section = document.getElementById("ideas");
    if (!section) return;
    var placeholder = section.querySelector(".placeholder");
    if (!placeholder) return;

    var subtitle = section.querySelector(".page-subtitle");
    if (subtitle) subtitle.textContent = "Keep ideas here until you're ready to act on them.";

    var root = el("div", "ideas-app");

    var form = el("form", "ideas-form");
    var input = el("input", "ideas-input");
    input.type = "text";
    input.maxLength = MAX_LEN;
    input.placeholder = "Add an idea...";
    input.setAttribute("aria-label", "New idea");
    var addBtn = el("button", "btn btn-primary", "Add Idea");
    addBtn.type = "submit";
    form.appendChild(input);
    form.appendChild(addBtn);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (addIdea(input.value)) input.value = "";
      input.focus();
    });

    ui.note = el("div", "ideas-note");
    ui.note.setAttribute("aria-live", "polite");
    ui.summary = el("div", "ideas-summary");
    ui.list = el("ul", "ideas-list");

    root.appendChild(form);
    root.appendChild(ui.note);
    root.appendChild(ui.summary);
    root.appendChild(ui.list);

    placeholder.parentNode.replaceChild(root, placeholder);
    render();
  }

  // Lets other files (like dump-actions.js) add ideas.
  window.LifeOSIdeas = {
    add: function (text) { return addIdea(text); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();

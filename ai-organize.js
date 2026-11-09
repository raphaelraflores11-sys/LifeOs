(function () {
  "use strict";

  var WORKER_URL = "https://lifeos-ai.raphaelraflores11.workers.dev/";
  var STORAGE_KEY = "lifeos_last_ai";
  var TASK_MAX = 200;
  var LABELS = { idea: "Idea", task: "Task" };
  var busy = false;
  var current = null; // { summary, items: [{ type, text, reason, added }] }
  var ui = {};

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".aio-panel { margin-top: 16px; width: 100%; }",
      ".aio-btn { padding: 10px 16px; border-radius: 8px; border: 2px solid var(--primary-color, #2563eb); background: #fff; color: var(--primary-color, #2563eb); font: inherit; font-weight: 600; cursor: pointer; }",
      ".aio-btn:disabled { opacity: 0.6; cursor: not-allowed; }",
      ".aio-status { margin-top: 12px; color: #555; font-size: 0.9rem; }",
      ".aio-status:empty { display: none; }",
      ".aio-error { color: #b42318; background: #fef3f2; border: 1px solid #fecdca; border-radius: 10px; padding: 10px 12px; }",
      ".aio-results { margin-top: 12px; }",
      ".aio-summary { background: #f4f6fb; border-radius: 12px; padding: 12px 14px; }",
      ".aio-summary p { margin: 6px 0 0; }",
      ".aio-items { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; }",
      ".aio-item { border: 1px solid #e3e6ee; border-radius: 12px; padding: 12px 14px; background: #fff; }",
      ".aio-badge { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-bottom: 6px; }",
      ".aio-idea { background: #efe7ff; color: #5b2bb5; }",
      ".aio-task { background: #e1eaff; color: #2446b8; }",
      ".aio-text { font-weight: 600; overflow-wrap: anywhere; }",
      ".aio-reason { margin-top: 4px; font-size: 0.9rem; color: #666; }",
      ".aio-add { margin-top: 8px; background: none; border: none; color: var(--primary-color, #2563eb); font: inherit; font-size: 0.9rem; cursor: pointer; padding: 6px 0; }",
      ".aio-add:disabled { color: #15803d; cursor: default; }",
      ".aio-foot { margin-top: 12px; font-size: 0.85rem; color: #666; }",
      ".aio-dismiss { background: none; border: none; color: #666; font: inherit; font-size: 0.85rem; text-decoration: underline; cursor: pointer; padding: 6px 0; margin-left: 8px; }",
      "@media (max-width: 600px) { .aio-btn { width: 100%; } }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clip(text, max) {
    var clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 3) + "..." : clean;
  }

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (data && typeof data.summary === "string" && Array.isArray(data.items)) return data;
    } catch (e) {
      /* ignore unreadable storage */
    }
    return null;
  }

  function saveCurrent() {
    try {
      if (current) localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* storage unavailable */
    }
  }

  function setStatus(message, isError) {
    ui.status.textContent = message;
    ui.status.className = "aio-status" + (isError ? " aio-error" : "");
  }

  function addItem(item) {
    if (item.type === "idea") {
      if (!window.LifeOSIdeas) {
        setStatus("Ideas aren't available right now.", true);
        return;
      }
      window.LifeOSIdeas.add(item.text);
    } else {
      if (!window.LifeOSTasks) {
        setStatus("Tasks aren't available right now.", true);
        return;
      }
      window.LifeOSTasks.add(clip(item.text, TASK_MAX));
    }
    item.added = true;
    saveCurrent();
    render();
  }

  function render() {
    ui.results.innerHTML = "";
    if (!current) return;

    var summary = el("div", "aio-summary");
    summary.appendChild(el("strong", "", "Summary"));
    summary.appendChild(el("p", "", current.summary));
    ui.results.appendChild(summary);

    if (current.items.length === 0) {
      ui.results.appendChild(
        el("p", "aio-foot", "No ideas or tasks found. Your note stays in Brain Dump.")
      );
    } else {
      var list = el("ul", "aio-items");
      current.items.forEach(function (item) {
        var li = el("li", "aio-item");
        li.appendChild(el("span", "aio-badge aio-" + item.type, LABELS[item.type]));
        li.appendChild(el("div", "aio-text", item.text));
        li.appendChild(el("div", "aio-reason", item.reason));

        var add = el(
          "button",
          "aio-add",
          item.added ? "Added \u2713" : item.type === "idea" ? "Add to Ideas" : "Add to Tasks"
        );
        add.type = "button";
        add.disabled = Boolean(item.added);
        add.addEventListener("click", function () { addItem(item); });
        li.appendChild(add);
        list.appendChild(li);
      });
      ui.results.appendChild(list);
    }

    var foot = el("div", "aio-foot", "These are suggestions only. Nothing is added unless you tap a button.");
    var dismiss = el("button", "aio-dismiss", "Dismiss");
    dismiss.type = "button";
    dismiss.addEventListener("click", function () {
      current = null;
      saveCurrent();
      render();
    });
    foot.appendChild(dismiss);
    ui.results.appendChild(foot);
  }

  function validItem(i) {
    return (
      i &&
      (i.type === "idea" || i.type === "task") &&
      typeof i.text === "string" &&
      i.text.trim() !== "" &&
      typeof i.reason === "string"
    );
  }

  async function organize(textarea) {
    if (busy) return;
    var text = textarea.value.trim();
    if (!text) {
      setStatus("Type something in the Brain Dump box first.", true);
      return;
    }

    busy = true;
    ui.button.disabled = true;
    ui.button.textContent = "Organizing...";
    setStatus("AI is organizing your thoughts...", false);

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);

    try {
      var res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text }),
        signal: controller.signal
      });

      var data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        throw new Error((data && data.error) || "Something went wrong. Please try again.");
      }
      if (!data || typeof data.summary !== "string" || !Array.isArray(data.items)) {
        throw new Error("The AI gave an unusable answer. Please try again.");
      }

      current = {
        summary: data.summary,
        items: data.items.filter(validItem).map(function (i) {
          return { type: i.type, text: i.text.trim(), reason: i.reason.trim(), added: false };
        })
      };
      saveCurrent();
      setStatus("", false);
      render();
    } catch (err) {
      var message;
      if (err && err.name === "AbortError") {
        message = "The AI took too long. Please try again.";
      } else if (err instanceof TypeError) {
        message = "Can't reach the AI right now. Check your connection and try again.";
      } else {
        message = err.message;
      }
      setStatus(message, true);
    } finally {
      clearTimeout(timer);
      busy = false;
      ui.button.disabled = false;
      ui.button.textContent = "\u2728 Organize with AI";
    }
  }

  function start() {
    var textarea = document.getElementById("dumpInput");
    var actions = document.querySelector("#brain-dump .dump-actions");
    if (!textarea || !actions) return;
    addStyles();

    var root = el("div", "aio-panel");
    ui.button = el("button", "aio-btn", "\u2728 Organize with AI");
    ui.button.type = "button";
    ui.status = el("div", "aio-status");
    ui.status.setAttribute("aria-live", "polite");
    ui.results = el("div", "aio-results");
    root.appendChild(ui.button);
    root.appendChild(ui.status);
    root.appendChild(ui.results);

    ui.button.addEventListener("click", function () { organize(textarea); });

    actions.insertAdjacentElement("afterend", root);
    current = loadSaved();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

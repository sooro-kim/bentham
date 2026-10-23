// Shared header, footer, and the reader's Ledger (progress through the site).
// Pages set <body data-root="../"> when they live one folder down (games/).
// Pages that must be earned set <body data-step="g-purse">; the page is
// replaced by a lock notice until the steps it needs are done.

window.Ledger = (function () {
  const KEY = "bentham-ledger-v1";
  const STEPS = [
    { id: "about",      label: "The Life",                 href: "about.html" },
    { id: "ideas",      label: "Key Ideas",                href: "ideas.html" },
    { id: "timeline",   label: "Timeline",                 href: "timeline.html" },
    { id: "critics",    label: "Critics & Legacy",         href: "critics.html" },
    { id: "quotes",     label: "Quotes",                   href: "quotes.html" },
    { id: "model",      label: "The Model",                href: "model.html" },
    { id: "g-calculus", label: "The Felicific Calculus",   href: "games/calculus.html" },
    { id: "g-purse",    label: "The Labourer and the Richest Man", href: "games/purse.html", needs: ["g-calculus"] },
    { id: "g-chest",    label: "The Money in the Chest",   href: "games/chest.html",    needs: ["g-purse"] },
    { id: "g-tribunal", label: "The Tribunal of Utility",  href: "games/tribunal.html", needs: ["g-chest"] },
    { id: "exam",       label: "The Examination",          href: "games/exam.html",
      needs: ["ideas", "g-calculus", "g-purse", "g-chest", "g-tribunal"] },
  ];

  // Storage can be missing (private windows, blocked site data). Fall back to memory.
  let state = { done: {}, notes: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(state, JSON.parse(raw)); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  // Presenter mode (?presenter in the URL) opens every lock for this tab only, for class demos.
  let presenter = false;
  try {
    if (new URLSearchParams(location.search).has("presenter")) sessionStorage.setItem("bentham-presenter", "1");
    presenter = sessionStorage.getItem("bentham-presenter") === "1";
  } catch (e) {}

  const step = id => STEPS.find(s => s.id === id);
  const isDone = id => !!state.done[id];
  const missing = id => ((step(id) || {}).needs || []).filter(n => !isDone(n));
  const isOpen = id => presenter || missing(id).length === 0;
  const count = () => STEPS.filter(s => isDone(s.id)).length;

  const listeners = [];
  function complete(id, info) {
    const first = !isDone(id);
    state.done[id] = Object.assign({ at: new Date().toISOString() }, info || {});
    save();
    listeners.forEach(f => f());
    if (first) toast(`Seal earned: ${step(id).label} · ${count()} of ${STEPS.length}`);
  }
  function note(k, v) { if (v === undefined) return state.notes[k]; state.notes[k] = v; save(); }
  function reset() { state = { done: {}, notes: {} }; save(); listeners.forEach(f => f()); }

  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "seal-toast"; toastEl.setAttribute("role", "status");
      document.body.append(toastEl);
    }
    toastEl.textContent = "✦ " + msg;
    toastEl.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove("show"), 3600);
  }

  return { STEPS, step, isDone, isOpen, missing, complete, count, note, reset, toast,
           onChange: f => listeners.push(f), get presenter() { return presenter; } };
})();

(function () {
  const root = document.body.dataset.root || "";
  const here = location.pathname.split("/").pop() || "index.html";
  const inGames = root === "../";

  const links = [
    ["index.html", "Home"],
    ["about.html", "About", "about"],
    ["ideas.html", "Key Ideas", "ideas"],
    ["timeline.html", "Timeline", "timeline"],
    ["critics.html", "Critics & Legacy", "critics"],
    ["quotes.html", "Quotes", "quotes"],
    ["model.html", "Model", "model"],
    ["play.html", "Play and Learn"],
    ["sources.html", "Sources"],
  ];

  function navHTML() {
    return links.map(([href, label, id]) => {
      const current = href === here || (inGames && href === "play.html");
      const dot = id && Ledger.isDone(id) ? '<span class="done-dot" title="Seal earned"></span>' : "";
      return `<a href="${root}${href}"${current ? ' aria-current="page"' : ""}>${label}${dot}</a>`;
    }).join("");
  }
  function ringSVG() {
    const n = Ledger.count(), N = Ledger.STEPS.length, C = 2 * Math.PI * 9;
    return `<svg class="ring" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="9" fill="none" stroke="#2c5047" stroke-width="3"/>
      <circle cx="11" cy="11" r="9" fill="none" stroke="#dcb15f" stroke-width="3" stroke-linecap="round"
        stroke-dasharray="${C * n / N} ${C}" transform="rotate(-90 11 11)"/></svg>`;
  }

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap">
      <a class="brand" href="${root}index.html">J. Bentham</a>
      <div class="header-right">
        <nav class="nav" id="site-nav" aria-label="Main">${navHTML()}</nav>
        <a class="ledger-pill" href="${root}index.html#ledger" title="Your ledger: seals earned on this site">
          <span id="ledger-ring">${ringSVG()}</span><span id="ledger-count">${Ledger.count()}/${Ledger.STEPS.length}</span></a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
      </div>
    </div>`;
  document.body.prepend(header);

  Ledger.onChange(() => {
    header.querySelector("#site-nav").innerHTML = navHTML();
    header.querySelector("#ledger-ring").innerHTML = ringSVG();
    header.querySelector("#ledger-count").textContent = `${Ledger.count()}/${Ledger.STEPS.length}`;
  });

  const toggle = header.querySelector(".nav-toggle");
  const navEl = header.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = navEl.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <span>Jeremy Bentham (1748–1832) · A History of Economic Thought project · Build 3</span>
      <span>Content drawn from Hunt &amp; Lautzenheiser, <em>History of Economic Thought</em>, ch. 6 · <a href="${root}sources.html">Sources</a></span>
    </div>`;
  document.body.append(footer);

  // Locked pages: swap the page for a notice naming what must be done first.
  const stepId = document.body.dataset.step;
  if (stepId && !Ledger.isOpen(stepId)) {
    const main = document.querySelector("main");
    const need = Ledger.missing(stepId).map(id => Ledger.step(id));
    main.innerHTML = `
      <header class="page-head">
        <p class="eyebrow">Locked</p>
        <h1>${Ledger.step(stepId).label} is still sealed</h1>
        <p class="lede">This site is built so that each game stands on the one before it. Earn ${need.length === 1 ? "this seal" : "these seals"} first:</p>
      </header>
      <div class="card" style="max-width:640px">
        <ul style="margin:0;padding-left:1.2em">${need.map(s => `<li><a href="${root}${s.href}">${s.label}</a></li>`).join("")}</ul>
      </div>`;
    document.body.dataset.locked = "1";
  }
})();

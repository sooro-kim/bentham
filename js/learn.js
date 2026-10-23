// Small building blocks for "answer first, then read".
//   Learn.mcq(el, {label, q, choices:[{t, ok, fb}], onSolve})
//   Learn.num(el, {label, q, answer, tol, unit, misses:[{when:v=>bool, fb}], fbRight, onSolve})
// A wrong choice is struck out and explained; the reader keeps going until right.
// onSolve(firstTry) fires once, with firstTry = true when no wrong answer came first.

window.Learn = (function () {
  const esc = s => String(s);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function shell(el, label, q) {
    el.classList.add("ask");
    el.innerHTML = `<div class="ask-label">${esc(label || "Before you read on")}</div>
      <div class="ask-q">${q}</div><div class="ask-body"></div>
      <div class="feedback" aria-live="polite"></div>`;
    return { body: el.querySelector(".ask-body"), fb: el.querySelector(".feedback") };
  }
  function say(fb, good, html) {
    fb.className = "feedback show " + (good ? "good" : "bad");
    fb.innerHTML = html;
  }

  function mcq(el, o) {
    const { body, fb } = shell(el, o.label, o.q);
    const list = o.fixed ? o.choices : shuffle(o.choices);
    body.innerHTML = `<div class="choices">${list.map((c, i) =>
      `<button type="button" data-i="${i}"><span class="key">${"ABCDEF"[i]}</span> ${c.t}</button>`).join("")}</div>`;
    let wrongs = 0, solved = false;
    body.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      if (solved) return;
      const c = list[+b.dataset.i];
      if (c.ok) {
        solved = true;
        b.classList.add("right");
        body.querySelectorAll("button").forEach(x => x.disabled = true);
        say(fb, true, `<strong>${wrongs ? "Now you have it." : "Right."}</strong> ${c.fb || ""}`);
        el.classList.add("solved");
        o.onSolve && o.onSolve(wrongs === 0);
      } else {
        wrongs++;
        b.classList.add("wrong"); b.disabled = true;
        say(fb, false, `<strong>Not quite.</strong> ${c.fb || "Think again."}`);
        o.onMiss && o.onMiss(c);
      }
    }));
    return { get solved() { return solved; } };
  }

  function num(el, o) {
    const { body, fb } = shell(el, o.label, o.q);
    body.innerHTML = `<div class="numrow">
        <input type="number" step="any" inputmode="decimal" aria-label="Your answer">
        ${o.unit ? `<span class="muted">${o.unit}</span>` : ""}
        <button type="button" class="btn small primary">Check</button></div>`;
    const input = body.querySelector("input"), btn = body.querySelector("button");
    let wrongs = 0, solved = false;
    function check() {
      if (solved) return;
      const v = parseFloat(input.value);
      if (isNaN(v)) { say(fb, false, "Type a number first."); return; }
      if (Math.abs(v - o.answer) <= (o.tol || 0)) {
        solved = true; input.disabled = btn.disabled = true;
        say(fb, true, `<strong>${wrongs ? "Now you have it." : "Right."}</strong> ${o.fbRight || ""}`);
        el.classList.add("solved");
        o.onSolve && o.onSolve(wrongs === 0);
        return;
      }
      wrongs++;
      const m = (o.misses || []).find(m => m.when(v));
      say(fb, false, `<strong>Not ${v}.</strong> ${m ? m.fb : (o.hint || "Work it through again.")}`);
      if (wrongs >= 3 && o.reveal) fb.insertAdjacentHTML("beforeend", `<br><em>Worked answer:</em> ${o.reveal}`);
    }
    btn.addEventListener("click", check);
    input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
    return { get solved() { return solved; } };
  }

  // Reveal a hidden block (with a short fade) and scroll it into view.
  function open(node, scroll) {
    node.classList.remove("hidden");
    node.classList.add("reveal");
    if (scroll) setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  }

  return { mcq, num, open, shuffle };
})();

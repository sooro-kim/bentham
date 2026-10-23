// Bentham's three models, shared by the Model page, the games, and the Examination.
// Each is a simplified, stated version of an argument in Hunt & Lautzenheiser, ch. 6.
//
// 1. THE FELICIFIC CALCULUS (Introduction to the Principles of Morals and Legislation, ch. IV).
//    A single pleasure (or pain) is valued by four circumstances:
//      value = intensity × duration × certainty × propinquity
//    certainty is a probability (0–1); propinquity is a weight for nearness (1 = now, smaller = remote).
//    An act's tendency adds fecundity (the chance it is followed by more pleasure) and subtracts
//    impurity (the chance it is followed by pain):
//      value of act for one person = value + fecundity.p × fecundity.v − impurity.p × impurity.v
//    Extent is the number of persons affected; the total is summed over them.
//
// 2. DIMINISHING MARGINAL UTILITY OF MONEY (Bentham's labourer and "the richest man").
//    Utility of an income y is u(y) = y^θ with 0 < θ < 1. Bentham guessed that a man with
//    50,000 times the labourer's income has at most 5, more likely 2, times the pleasure.
//    That pins θ: 50,000^θ = R  ⇒  θ = ln R / ln 50,000.
//    Redistribution: a share t of the rich income goes to the labourers. Bentham's limit, the
//    "inducement to labour", is modelled as a loss of output: every income is scaled by (1 − k·t²).
//
// 3. THE MONEY IN THE CHEST (Bentham after 1801, against his own earlier view and Say's law).
//    Each year nominal income Y is spent or saved; a share s is saved, and a share h of savings is
//    hoarded "in a chest" instead of lent out to employ labour. New money M can be issued.
//      next year's spending D = Y − s·h·Y + M
//    Against full-employment capacity F (real output) valued at last year's prices P, g = D / (F·P):
//      g < 1: prices and output both fall (each by √g, so price × output = D)
//      g ≥ 1: output is at capacity and prices rise by g.

window.Econ = (function () {
  // ---------- 1. felicific calculus ----------
  function lot(o) {
    const base = o.intensity * o.duration * (o.certainty ?? 1) * (o.propinquity ?? 1);
    const fec = o.fecundity ? o.fecundity.p * o.fecundity.v : 0;
    const imp = o.impurity ? o.impurity.p * o.impurity.v : 0;
    const sign = o.pain ? -1 : 1;
    return { base: sign * base, fec: sign * fec, imp: -sign * imp, value: sign * (base + fec - imp) };
  }
  // act = [{ persons: n, lots: [lot, …] }, …]  →  total over everyone affected (extent)
  function act(groups) {
    let total = 0;
    const rows = groups.map(g => {
      const each = g.lots.reduce((s, l) => s + lot(l).value, 0);
      total += each * g.persons;
      return { ...g, each, sum: each * g.persons };
    });
    return { rows, total };
  }

  // ---------- 2. utility of money ----------
  const RATIO = 50000;
  const theta = (R, ratio = RATIO) => Math.log(R) / Math.log(ratio);
  const u = (y, th) => Math.pow(Math.max(y, 0), th);
  const mu = (y, th) => th * Math.pow(Math.max(y, 1e-9), th - 1);

  // society: { nPoor, yPoor, nRich, yRich, th, k }, share t of rich income transferred
  function society(o, t) {
    const scale = Math.max(0, 1 - (o.k || 0) * t * t);
    const moved = t * o.yRich * o.nRich;
    const yP = (o.yPoor + moved / o.nPoor) * scale;
    const yR = o.yRich * (1 - t) * scale;
    const uP = u(yP, o.th), uR = u(yR, o.th);
    return { t, scale, yP, yR, uP, uR,
             output: (yP * o.nPoor + yR * o.nRich),
             welfare: o.nPoor * uP + o.nRich * uR,
             ratio: yR / yP };
  }
  function bestShare(o, steps = 1000) {
    let best = society(o, 0);
    for (let i = 1; i <= steps; i++) { const s = society(o, i / steps); if (s.welfare > best.welfare) best = s; }
    return best;
  }

  // ---------- 3. hoarding ----------
  function year(st, { s, h, M = 0, F }) {
    const hoard = s * h * st.Y;
    const D = st.Y - hoard + M;
    const g = D / (F * st.P);
    let P = st.P, Q;
    if (g < 1) { P = st.P * Math.sqrt(g); Q = F * Math.sqrt(g); }
    else { P = st.P * g; Q = F; }
    return { Y: D, P, Q, g, hoard, M, unemployment: Math.max(0, 1 - Q / F) };
  }

  // ---------- a small line chart, shared by pages ----------
  // series: [{ points: [[x, y], …], color, label, dash }]
  function lineSVG(series, o = {}) {
    const W = o.width || 640, H = o.height || 300, padL = o.padL || 52, padB = 40, padT = 18, padR = 18;
    const xs = series.flatMap(s => s.points.map(p => p[0])), ys = series.flatMap(s => s.points.map(p => p[1]));
    const x0 = o.xmin ?? Math.min(...xs), x1 = o.xmax ?? Math.max(...xs);
    const y0 = o.ymin ?? Math.min(0, ...ys), y1 = o.ymax ?? Math.max(...ys) * 1.08;
    const X = v => padL + (v - x0) / (x1 - x0 || 1) * (W - padL - padR);
    const Y = v => H - padB - (v - y0) / (y1 - y0 || 1) * (H - padB - padT);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || "chart"}">`;
    const yt = o.yticks || 4;
    for (let i = 0; i <= yt; i++) {
      const v = y0 + (y1 - y0) * i / yt;
      s += `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2c5047"/>
            <text x="${padL - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="#b2c2b9">${(o.yfmt || (v => +v.toFixed(2)))(v)}</text>`;
    }
    (o.xticksAt || []).forEach(v => {
      s += `<text x="${X(v)}" y="${H - padB + 18}" text-anchor="middle" font-size="12" fill="#b2c2b9">${(o.xfmt || (v => v))(v)}</text>`;
    });
    if (o.xlabel) s += `<text x="${(padL + W - padR) / 2}" y="${H - 4}" text-anchor="middle" font-size="12" fill="#b2c2b9">${o.xlabel}</text>`;
    if (o.ylabel) s += `<text x="12" y="${(padT + H - padB) / 2}" text-anchor="middle" font-size="12" fill="#b2c2b9" transform="rotate(-90 12 ${(padT + H - padB) / 2})">${o.ylabel}</text>`;
    (o.vlines || []).forEach(v => {
      s += `<line x1="${X(v.x)}" x2="${X(v.x)}" y1="${padT}" y2="${H - padB}" stroke="${v.color || "#dcb15f"}" stroke-dasharray="5 4"/>`;
      if (v.label) s += `<text x="${X(v.x) + 5}" y="${padT + 12}" font-size="12" fill="${v.color || "#dcb15f"}">${v.label}</text>`;
    });
    series.forEach(sr => {
      s += `<polyline fill="none" stroke="${sr.color}" stroke-width="${sr.width || 2.5}" ${sr.dash ? `stroke-dasharray="${sr.dash}"` : ""}
              points="${sr.points.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ")}"/>`;
      if (sr.label) { const p = sr.points[sr.points.length - 1]; s += `<text x="${X(p[0]) - 4}" y="${Y(p[1]) - 8}" text-anchor="end" font-size="12" fill="${sr.color}">${sr.label}</text>`; }
    });
    (o.dots || []).forEach(d => { s += `<circle cx="${X(d.x)}" cy="${Y(d.y)}" r="${d.r || 5}" fill="${d.color || "#dcb15f"}"/>`; });
    return s + "</svg>";
  }

  const fmt = (v, d = 0) => Number(v).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  return { lot, act, RATIO, theta, u, mu, society, bestShare, year, lineSVG, fmt, rnd, pick };
})();

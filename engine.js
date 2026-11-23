// Shared engine: seeded randomness + scoring. No dependencies.
// Same file runs in the browser (student + projector pages) and in Node (tests).
(function (root) {
  const GAMES = root.GAMES || (root.GAMES = {});
  const START = 1000000; // every game starts at H$1,000,000
  const SCALE = 1000;    // H$1,000 = $1 of story money
  const BONUS = 5;       // $ per correct numeric answer
  const MIN_GAP = 2;     // best option must beat the other by at least $2

  function hash(s) { // FNV-1a
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function comb(n, k) {
    if (k < 0 || k > n) return 0;
    let c = 1;
    for (let i = 1; i <= k; i++) c = c * (n - k + i) / i;
    return c;
  }
  const fact = n => (n < 2 ? 1 : n * fact(n - 1));
  const binom = (n, k, p) => comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  const pois = (k, l) => Math.exp(-l) * Math.pow(l, k) / fact(k);
  function Phi(x) { // standard normal CDF (Abramowitz & Stegun 26.2.17, error < 1e-7)
    const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }

  // Round r (1-based) of a game, with numbers fixed by (student, game, round).
  function build(game, student, r) {
    const rnd = rng(hash(student + '|' + game + '|' + r));
    let R;
    for (let i = 0; i < 50; i++) { // redraw until the best option clearly wins (>= $2)
      R = GAMES[game].rounds[r - 1](rnd);
      const v = Object.values(R.values).sort((a, b) => b - a);
      if (v[0] - v[1] >= MIN_GAP) break;
    }
    R.round = r;
    return R;
  }

  // Money outcome of one round, relative to the best option (always <= 0) plus bonus.
  function result(R, ans) {
    const ids = Object.keys(R.values);
    const best = ids.reduce((a, b) => (R.values[b] > R.values[a] ? b : a));
    const worst = Math.min(...ids.map(i => R.values[i]));
    const bestV = R.values[best];
    if (!ans) return { answered: false, best, delta: worst - bestV, bonus: 0, right: [] };
    const v = R.values[ans.choice];
    const delta = (v === undefined ? worst : v) - bestV;
    let bonus = 0;
    const right = R.asks.map((a, i) => {
      const x = ans.nums ? ans.nums[i] : null;
      const ok = typeof x === 'number' && Math.abs(x - a.answer) <= a.tol;
      if (ok) bonus += BONUS;
      return ok;
    });
    return { answered: true, best, delta, bonus, right };
  }

  // Net dollars from rounds 1..upTo of one game. rows = this student's answers (any game).
  // A missed round counts as the worst option.
  function gameSum(game, student, rows, upTo) {
    const by = {};
    rows.forEach(a => { if (a.game === undefined || a.game === game) by[a.round] = a; });
    let sum = 0;
    for (let r = 1; r <= upTo; r++) {
      const res = result(build(game, student, r), by[r]);
      sum += res.delta + res.bonus;
    }
    return sum;
  }
  // Balance inside a single game, starting from H$1,000,000.
  function balance(game, student, rows, upTo) {
    return Math.round(START + SCALE * gameSum(game, student, rows, upTo));
  }
  // Running balance: money carries over. Earlier games count in full (skipped rounds = worst option),
  // the current game counts up to round `upTo`.
  function cumulative(student, rows, game, upTo) {
    let sum = 0;
    for (let g = 1; g < game; g++) if (GAMES[g]) sum += gameSum(g, student, rows, GAMES[g].rounds.length);
    return Math.round(START + SCALE * (sum + gameSum(game, student, rows, upTo)));
  }

  const Engine = { START, SCALE, BONUS, hash, rng, pick, comb, fact, binom, pois, Phi, build, result, balance, cumulative };
  root.Engine = Engine;
  if (typeof module !== 'undefined') module.exports = Engine;
})(typeof globalThis !== 'undefined' ? globalThis : window);

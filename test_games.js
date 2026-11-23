// Run: node test_games.js
// Checks Games 1-4: formulas against Monte Carlo simulation, plus invariants for every round.
const E = require('./engine.js');
['game1.js', 'game2.js', 'game3.js', 'game4.js'].forEach(f => require('./' + f));
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) { fails++; console.log('FAIL', name, extra || ''); } else console.log('ok  ', name); };
const near = (a, b, t) => Math.abs(a - b) <= t;
const R = E.rng(12345);                       // simulation randomness (fixed seed)
const N = 400000;
const normal = () => { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); };
const poisson = l => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; };

// --- helper functions against known values
ok('Phi(1)=0.8413', near(E.Phi(1), 0.8413, 1e-4));
ok('Phi(1.96)=0.975', near(E.Phi(1.96), 0.975, 1e-4));
ok('Phi(-1.58)=0.0571', near(E.Phi(-1.58), 0.0571, 1e-4));
ok('binom(10,8,0.88)+..=0.891', near([8, 9, 10].reduce((s, k) => s + E.binom(10, k, 0.88), 0), 0.8913, 1e-3));
ok('Poisson(4) P(>=6)=0.2149', near(1 - [0, 1, 2, 3, 4, 5].reduce((s, k) => s + E.pois(k, 4), 0), 0.2149, 1e-3));

// --- Monte Carlo checks: pick a few students per round and simulate the story
const find = (game, round, test) => { for (let i = 0; i < 2000; i++) { const s = 'mc' + i, r = E.build(game, s, round); if (!test || test(r.p)) return r; } };

// Game 2 round 2: total probability. Simulate warehouse then defect.
{ const r = find(2, 2); let d = 0; const { sh, df } = r.p;
  for (let i = 0; i < N; i++) { const u = R(); const w = u < sh[0] ? 0 : u < sh[0] + sh[1] ? 1 : 2; if (R() < df[w]) d++; }
  ok('G2R2 total probability = simulation', near(d / N, r.asks[0].answer, 0.003), (d / N) + ' vs ' + r.asks[0].answer); }

// Game 2 round 3: Bayes. Simulate texts, condition on sender.
[true, false].forEach(known => { const r = find(2, 3, p => p.known === known); const { g, sg, sf } = r.p; let n = 0, gen = 0;
  for (let i = 0; i < N * 2; i++) { const genuine = R() < g; const saved = R() < (genuine ? sg : sf); if (saved === known) { n++; if (genuine) gen++; } }
  ok('G2R3 Bayes (' + (known ? 'saved' : 'unknown') + ') = simulation', near(gen / n, r.p.P, 0.01), (gen / n) + ' vs ' + r.p.P); });

// Game 2 round 4: independence: P(A late and C late) = pa*pc by simulation of independent carriers
{ const r = find(2, 4); let b = 0;
  for (let i = 0; i < N; i++) if (R() < r.p.pa && R() < r.p.pc) b++;
  ok('G2R4 independent product = simulation', near(b / N, r.asks[0].answer, 0.002)); }

// Game 3 round 1: binomial (>=8 of 10) and geometric (first dud on 3rd string)
{ const r = find(3, 1); let a = 0, g3 = 0; const pa = r.p.pa;
  for (let i = 0; i < N; i++) { let w = 0; for (let j = 0; j < 10; j++) if (R() < pa) w++; if (w >= 8) a++; }
  for (let i = 0; i < N; i++) { let k = 0; while (R() < pa) k++; if (k === 2) g3++; }  // two working, then a dud
  ok('G3R1 binomial = simulation', near(a / N, r.asks[0].answer, 0.003));
  ok('G3R1 geometric = simulation', near(g3 / N, r.asks[1].answer, 0.003)); }

// Game 3 round 2: sum of independent normals
{ const r = find(3, 2); const { m1, s1, m2, s2, D } = r.p; let on = 0, s = 0, s2sum = 0;
  for (let i = 0; i < N; i++) { const t = m1 + s1 * normal() + m2 + s2 * normal(); if (t <= D) on++; s += t; s2sum += t * t; }
  const sd = Math.sqrt(s2sum / N - (s / N) * (s / N));
  ok('G3R2 sum of normals P = simulation', near(on / N, r.asks[0].answer, 0.004));
  ok('G3R2 sd of sum = simulation', near(sd, r.asks[1].answer, 0.01)); }

// Game 3 round 3: Poisson tail
{ const r = find(3, 3); let c = 0;
  for (let i = 0; i < N; i++) if (poisson(r.p.l1) >= 6) c++;
  ok('G3R3 Poisson tail = simulation', near(c / N, r.asks[0].answer, 0.004)); }

// Game 3 round 4: exponential, including memorylessness
{ const r = find(3, 4); const { m, k } = r.p; let w = 0, wait2 = 0, wait2k = 0;
  for (let i = 0; i < N; i++) { const t = -m * Math.log(R()); if (t <= k) w++; if (t > 2) { wait2++; if (t <= 2 + k) wait2k++; } }
  ok('G3R4 exponential = simulation', near(w / N, r.asks[0].answer, 0.004));
  ok('G3R4 memoryless = simulation', near(wait2k / wait2, r.asks[1].answer, 0.01)); }

// Game 4 round 1: coupon mean and SD
{ const r = find(4, 1); const { rates, probs } = r.p.set; let s = 0, s2 = 0;
  for (let i = 0; i < N; i++) { const u = R(); const k = u < probs[0] ? 0 : u < probs[0] + probs[1] ? 1 : 2; const sav = 200 * rates[k]; s += sav; s2 += sav * sav; }
  const sd = Math.sqrt(s2 / N - (s / N) * (s / N));
  ok('G4R1 expected savings = simulation', near(s / N, r.asks[0].answer, 0.15));
  ok('G4R1 SD = simulation', near(sd, r.asks[1].answer, 0.3)); }

// Game 4 round 2: variance of a sum with correlation
{ const r = find(4, 2); const { s1, s2, r1 } = r.p; let a = 0, b = 0, ab = 0, t = 0, tt = 0;
  for (let i = 0; i < N; i++) { const z1 = normal(), z2 = normal(); const x = s1 * z1, y = s2 * (r1 * z1 + Math.sqrt(1 - r1 * r1) * z2); a += x * y; t += x + y; tt += (x + y) * (x + y); }
  const sd = Math.sqrt(tt / N - (t / N) * (t / N));
  ok('G4R2 covariance = simulation', near(a / N, r.asks[0].answer, 1.5), (a / N) + ' vs ' + r.asks[0].answer);
  ok('G4R2 SD of total = simulation', near(sd, r.asks[1].answer, 0.5)); }

// Game 4 round 3: CLT with a non-normal shipping time (exponential-shaped, mean mu, sd sg)
{ const r = find(4, 3); const { mu, sg, n, dA } = r.p; let keep = 0; const T = 40000;
  for (let i = 0; i < T; i++) { let s = 0; for (let j = 0; j < n; j++) s += mu + sg * (-Math.log(R()) - 1); if (s / n <= mu + dA) keep++; }
  ok('G4R3 CLT approx vs simulation (skewed data)', near(keep / T, r.asks[0].answer, 0.02), (keep / T) + ' vs ' + r.asks[0].answer); }

// Game 4 round 4: z-test arithmetic
{ const r = find(4, 4); const { p0, n, x } = r.p; const ph = x / n;
  ok('G4R4 z statistic', near((ph - p0) / Math.sqrt(p0 * (1 - p0) / n), r.asks[0].answer, 1e-9));
  ok('G4R4 CI lower end', near(ph - 1.96 * Math.sqrt(ph * (1 - ph) / n), r.asks[1].answer, 1e-9)); }

// --- Invariants for every game, round and student
for (const g of [1, 2, 3, 4]) {
  let ties = 0, bad = 0, nan = 0, tot = 0, same = true;
  for (let i = 0; i < 1500; i++) for (let r = 1; r <= 4; r++) {
    const a = E.build(g, 'u' + i, r), b = E.build(g, 'u' + i, r); tot++;
    if (JSON.stringify(a) !== JSON.stringify(b)) same = false;
    const v = Object.values(a.values).sort((p, q) => q - p);
    if (v[0] - v[1] < 2) ties++;
    if (v.some(x => !Number.isFinite(x)) || a.asks.some(q => !Number.isFinite(q.answer))) nan++;
    if (a.asks.some(q => (q.kind !== 'num') && !(q.answer >= 0 && q.answer <= 1))) bad++;
    if (a.options.length !== 2 || !a.options.every(o => o.id in a.values)) bad++;
  }
  ok('game ' + g + ': deterministic', same);
  ok('game ' + g + ': best option wins by >= $2 (' + ties + '/' + tot + ' near-ties)', ties === 0);
  ok('game ' + g + ': no NaN, probabilities in [0,1], options match values', nan === 0 && bad === 0, 'nan=' + nan + ' bad=' + bad);
  const s = 'perf'; const picks = [1, 2, 3, 4].map(r => { const q = E.build(g, s, r); return { round: r, choice: E.result(q, null).best, nums: q.asks.map(a => a.answer) }; });
  const bonus = [1, 2, 3, 4].reduce((t, r) => t + E.build(g, s, r).asks.length * E.BONUS, 0);
  ok('game ' + g + ': perfect play = start + bonuses', E.balance(g, s, picks, 4) === E.START + E.SCALE * bonus);
  ok('game ' + g + ': all missed < start', E.balance(g, s, [], 4) < E.START);
}

// --- Money carries over between games
{
  const s = 'carry', perfectRows = g => [1, 2, 3, 4].map(r => { const q = E.build(g, s, r); return { game: g, round: r, choice: E.result(q, null).best, nums: q.asks.map(a => a.answer) }; });
  const bonus = g => [1, 2, 3, 4].reduce((t, r) => t + E.build(g, s, r).asks.length * E.BONUS, 0);
  const g1 = perfectRows(1), g2 = perfectRows(2);
  ok('carry-over: start of game 2 keeps game 1 result', E.cumulative(s, g1, 2, 0) === E.START + E.SCALE * bonus(1));
  ok('carry-over: game 1 perfect + game 2 perfect adds up', E.cumulative(s, g1.concat(g2), 2, 4) === E.START + E.SCALE * (bonus(1) + bonus(2)));
  ok('carry-over: skipping game 1 costs money in game 2', E.cumulative(s, g2, 2, 4) < E.cumulative(s, g1.concat(g2), 2, 4));
  ok('carry-over: game 1 equals plain balance', E.cumulative(s, g1, 1, 4) === E.balance(1, s, g1, 4));
  ok('carry-over: rows of other games are not mixed in', E.cumulative(s, g1.concat(g2), 1, 4) === E.balance(1, s, g1, 4));
  const g3 = perfectRows(3), g4 = perfectRows(4);
  ok('carry-over: all four perfect games', E.cumulative(s, [].concat(g1, g2, g3, g4), 4, 4) === E.START + E.SCALE * (bonus(1) + bonus(2) + bonus(3) + bonus(4)));
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);

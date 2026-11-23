// Run: node test.js   (no installs needed)
const E = require('./engine.js');
require('./game1.js');
let fails = 0;
const ok = (name, cond) => { if (!cond) { fails++; console.log('FAIL', name); } else console.log('ok  ', name); };
const near = (a, b, t = 0.001) => Math.abs(a - b) < t;

// Numbers from the game design
ok('counting A 5/20 = 0.447', near(1 - E.comb(15, 2) / E.comb(20, 2), 0.4474));
ok('counting B 6/30 = 0.366', near(1 - E.comb(24, 2) / E.comb(30, 2), 0.3655));
ok('union 0.4+0.3-0.1 = 0.6', near(0.4 + 0.3 - 0.1, 0.6));
ok('0.85^6 = 0.377', near(Math.pow(0.85, 6), 0.3771));
ok('multinomial 4/1/1 = 0.092', near(30 * Math.pow(0.8, 4) * 0.15 * 0.05, 0.0922, 0.0005));
ok('P(in stock|limited) 30/60 = 0.5', 30 / 60 === 0.5);

// Determinism and variety
const a1 = JSON.stringify(E.build(1, 'abcd1234', 1)), a2 = JSON.stringify(E.build(1, 'abcd1234', 1));
ok('same student -> same numbers', a1 === a2);
const seen = new Set();
for (let i = 0; i < 200; i++) seen.add(E.build(1, 'user' + i, 1).story);
ok('different students -> varied numbers', seen.size > 10);

// Every round, every student: best/worst exist and asks are probabilities
let ties = 0, bad = 0, total = 0;
for (let i = 0; i < 2000; i++) for (let r = 1; r <= 4; r++) {
  const R = E.build(1, 'u' + i, r), v = Object.values(R.values);
  total++;
  if (Math.abs(v[0] - v[1]) < 2) ties++;
  if (R.asks.some(a => !(a.answer >= 0 && a.answer <= 1))) bad++;
}
ok('no near-ties (gap >= $2): ' + ties + '/' + total, ties === 0);
ok('all ask answers in [0,1]', bad === 0);

// Scoring
const best = r => E.result(E.build(1, 's', r), null).best;
const perfect = [1, 2, 3, 4].map(r => ({ round: r, choice: best(r), nums: E.build(1, 's', r).asks.map(a => a.answer) }));
const bonusTotal = [1, 2, 3, 4].reduce((s, r) => s + E.build(1, 's', r).asks.length * E.BONUS, 0);
ok('perfect play = start + bonuses', E.balance(1, 's', perfect, 4) === E.START + E.SCALE * bonusTotal);
ok('missed everything < perfect', E.balance(1, 's', [], 4) < E.START);
ok('upTo=0 -> start', E.balance(1, 's', [], 0) === E.START);
const wrong = perfect.map(p => ({ ...p, choice: Object.keys(E.build(1, 's', p.round).values).find(k => k !== p.choice), nums: [] }));
ok('all wrong < all missed or equal', E.balance(1, 's', wrong, 4) <= E.START);
ok('wrong choice never beats best', E.balance(1, 's', wrong, 4) < E.balance(1, 's', perfect, 4));

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);

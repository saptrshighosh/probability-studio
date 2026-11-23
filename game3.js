// Game 3 - "Last-Minute Rush" (Module 3: Random Variables and Engineering Systems)
// Dec 20. Everything is still to buy, ship and pick up.
(function (root) {
  const E = root.Engine;
  const num = (x, d) => (+x.toFixed(d === undefined ? 2 : d)).toString();

  root.GAMES[3] = {
    name: 'Last-Minute Rush',
    intro: 'Dec 20. Lights to buy, gifts to ship, lines to beat.',
    rounds: [
      // 1. Bernoulli, binomial, geometric
      function (rnd) {
        const pa = E.pick(rnd, [0.86, 0.88, 0.90]), pb = E.pick(rnd, [0.94, 0.95, 0.96]), x = E.pick(rnd, [3, 5, 8]);
        const ge8 = p => [8, 9, 10].reduce((s, k) => s + E.binom(10, k, p), 0);
        const gA = ge8(pa), gB = ge8(pb);
        return {
          lesson: 'Bernoulli, binomial and geometric',
          title: 'Which light strings?',
          story: `You need at least 8 of 10 light strings to work to finish the decoration. Otherwise you pay $60 for rush replacements. ` +
                 `Each Brand A string works with probability ${pa}. Each Brand B string works with probability ${pb}, but the pack costs $${x} more. Strings work independently.`,
          options: [{ id: 'A', label: 'Brand A' }, { id: 'B', label: `Brand B (+$${x})` }],
          values: { A: -60 * (1 - gA), B: -x - 60 * (1 - gB) },
          asks: [
            { label: 'P(at least 8 of 10 work) with Brand A', answer: gA, tol: 0.01 },
            { label: 'Testing Brand A strings one by one: P(the first dud is the 3rd string)', answer: pa * pa * (1 - pa), tol: 0.005 }
          ],
          p: { pa, pb, gA, gB }
        };
      },
      // 2. Normal, functions of random variables
      function (rnd) {
        const m1 = E.pick(rnd, [1, 1.5]), s1 = E.pick(rnd, [0.5, 0.6]), m2 = E.pick(rnd, [2.5, 3]), s2 = E.pick(rnd, [0.7, 0.8]);
        const D = E.pick(rnd, [5, 5.5]), me = E.pick(rnd, [1.5, 2]), se = E.pick(rnd, [0.3, 0.4]), fee = E.pick(rnd, [12, 15, 18]);
        const sdS = Math.sqrt(s1 * s1 + s2 * s2), sdE = Math.sqrt(s1 * s1 + se * se);
        const pS = E.Phi((D - (m1 + m2)) / sdS), pE = E.Phi((D - (m1 + me)) / sdE);
        return {
          lesson: 'Normal distribution and sums of random variables',
          title: 'Standard or express?',
          story: `A gift must arrive within ${D} days. Order processing takes N(${m1}, ${num(s1 * s1)}) days (mean, variance). ` +
                 `Standard transit then takes N(${m2}, ${num(s2 * s2)}) days. Express transit (+$${fee}) instead takes N(${me}, ${num(se * se)}) days. ` +
                 `The times are independent. A late gift costs you $60.`,
          options: [{ id: 'S', label: 'Standard transit' }, { id: 'E', label: `Express transit (+$${fee})` }],
          values: { S: -60 * (1 - pS), E: -fee - 60 * (1 - pE) },
          asks: [
            { label: 'P(arrives within the deadline) with standard', answer: pS, tol: 0.01 },
            { label: 'Standard total time: standard deviation in days', answer: sdS, tol: 0.02, kind: 'num' }
          ],
          p: { m1, s1, m2, s2, D, me, se, pS, pE, sdS }
        };
      },
      // 3. Poisson
      function (rnd) {
        const l1 = E.pick(rnd, [3.5, 4, 4.5]), l2 = E.pick(rnd, [2, 2.5, 3]), c = E.pick(rnd, [2, 4, 6]);
        const tail = l => 1 - [0, 1, 2, 3, 4, 5].reduce((s, k) => s + E.pois(k, l), 0);
        const t1 = tail(l1), t2 = tail(l2);
        return {
          lesson: 'Poisson distribution',
          title: 'When to go?',
          story: `Customers join the checkout line at random. In the 10 minutes before you arrive, the number joining is Poisson. ` +
                 `Saturday 10 am: mean ${l1}. Sunday 3 pm: mean ${l2}, but that trip costs $${c} extra. ` +
                 `If 6 or more join, the line is long and you lose $40 of time.`,
          options: [{ id: 'SAT', label: 'Saturday 10 am' }, { id: 'SUN', label: `Sunday 3 pm (+$${c})` }],
          values: { SAT: -40 * t1, SUN: -c - 40 * t2 },
          asks: [{ label: 'P(6 or more join) on Saturday', answer: t1, tol: 0.01 }],
          p: { l1, l2, t1, t2 }
        };
      },
      // 4. Exponential
      function (rnd) {
        const m = E.pick(rnd, [2, 3, 4]), k = E.pick(rnd, [2, 3]), A = E.pick(rnd, [12, 15, 20]);
        const Pw = 1 - Math.exp(-k / m);
        return {
          lesson: 'Exponential distribution',
          title: 'Wait or buy the alternative?',
          story: `Your gift is out of stock. The store says the restock time is random, with an average of ${m} days (exponential). You need it within ${k} days. ` +
                 `Missing the deadline costs you $60. A different item that is in stock costs $${A} extra.`,
          options: [{ id: 'WAIT', label: 'Wait for the restock' }, { id: 'ALT', label: `Buy the alternative (+$${A})` }],
          values: { WAIT: -60 * (1 - Pw), ALT: -A },
          asks: [
            { label: `P(restock within ${k} days)`, answer: Pw, tol: 0.01 },
            { label: `It has been 2 days with no restock. P(restock within ${k} more days)`, answer: Pw, tol: 0.01 }
          ],
          p: { m, k, Pw }
        };
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

// Game 2 - "The $400 TV Deal" (Module 2: Decision Making Under Uncertainty)
// One purchase, followed from the sale to the doorstep.
(function (root) {
  const E = root.Engine;
  const pct = p => Math.round(p * 100) + '%';

  root.GAMES[2] = {
    name: 'The $400 TV Deal',
    intro: 'One TV, one deal. Follow it from the first click to your doorstep.',
    rounds: [
      // 1. Tree diagrams
      function (rnd) {
        const pr = E.pick(rnd, [0.8, 0.85, 0.9]), ps = E.pick(rnd, [0.4, 0.5, 0.6]), pw = E.pick(rnd, [0.65, 0.7, 0.75, 0.8, 0.85]);
        const pP = pr + (1 - pr) * ps;
        return {
          lesson: 'Tree diagrams',
          title: 'Pickup or walk-in?',
          story: `A $400 TV is on sale tonight only, and getting it tonight saves you $80. ` +
                 `Option 1: order online for store pickup. It is ready by 5 pm with probability ${pr}. If it is not ready, staff find one on the shelf with probability ${ps}. ` +
                 `Option 2: drive in and look. The store has one in stock with probability ${pw}.`,
          options: [{ id: 'P', label: 'Order online for pickup' }, { id: 'W', label: 'Drive in and hope' }],
          values: { P: 80 * pP, W: 80 * pw },
          asks: [{ label: 'P(you get the TV tonight) with online pickup', answer: pP, tol: 0.01 }],
          p: { pP, pw }
        };
      },
      // 2. Law of total probability
      function (rnd) {
        const sh = E.pick(rnd, [[0.5, 0.3, 0.2], [0.6, 0.25, 0.15], [0.4, 0.4, 0.2]]);
        const df = E.pick(rnd, [[0.02, 0.04, 0.10], [0.01, 0.05, 0.08], [0.03, 0.03, 0.12]]);
        const fee = E.pick(rnd, [20, 25, 30, 35]);
        const pd = sh[0] * df[0] + sh[1] * df[1] + sh[2] * df[2];
        return {
          lesson: 'Law of total probability',
          title: 'Buy the protection plan?',
          story: `The TV ships from one of 3 warehouses: ${pct(sh[0])} from Warehouse 1, ${pct(sh[1])} from Warehouse 2, ${pct(sh[2])} from Warehouse 3. ` +
                 `Their defect rates are ${pct(df[0])}, ${pct(df[1])} and ${pct(df[2])}. A defective TV costs you $400 unless you buy the $${fee} protection plan, which covers it fully.`,
          options: [{ id: 'PLAN', label: `Buy the protection plan ($${fee})` }, { id: 'NONE', label: 'Skip the plan' }],
          values: { PLAN: -fee, NONE: -400 * pd },
          asks: [{ label: 'P(your TV is defective)', answer: pd, tol: 0.005 }],
          p: { sh, df, pd }
        };
      },
      // 3. Bayes' theorem
      function (rnd) {
        const g = E.pick(rnd, [0.15, 0.2, 0.25]), sg = E.pick(rnd, [0.9, 0.95]), sf = E.pick(rnd, [0.1, 0.15]);
        const known = rnd() < 0.5;
        const a = known ? sg : 1 - sg, b = known ? sf : 1 - sf;
        const P = g * a / (g * a + (1 - g) * b);
        const ev = P * 60 - (1 - P) * 100;
        return {
          lesson: "Bayes' theorem",
          title: 'Tap the link?',
          story: `A text says "EXTRA 50% OFF that TV, tap now!". Of all texts like this, ${pct(g)} are genuine and the rest are scams. ` +
                 `A number saved in your phone sends ${pct(sg)} of genuine texts and ${pct(sf)} of scam texts. ` +
                 `This one came from ${known ? 'a number saved in your phone' : 'a number you do not know'}. ` +
                 `If it is genuine, tapping saves you $60. If it is a scam, you lose $100.`,
          options: [{ id: 'TAP', label: 'Tap the link' }, { id: 'SKIP', label: 'Ignore it' }],
          values: { TAP: ev, SKIP: 0 },
          asks: [{ label: 'P(genuine | this sender)', answer: P, tol: 0.01 }],
          p: { g, sg, sf, known, P }
        };
      },
      // 4. Independence
      function (rnd) {
        const pa = E.pick(rnd, [0.10, 0.15]), pb = E.pick(rnd, [0.10, 0.12]), jb = E.pick(rnd, [0.04, 0.05, 0.06]);
        const pc = E.pick(rnd, [0.10, 0.12, 0.15]), fb = E.pick(rnd, [4, 6, 8]), fc = E.pick(rnd, [10, 12, 14]);
        const c = x => Math.round(x * 1000);
        return {
          lesson: 'Independence',
          title: 'Pick a backup carrier',
          story: `Your TV ships with Carrier A. You also send a backup order. If both are late, the gift is missing and costs you $300. ` +
                 `Past shipments, per 1,000 with A and Backup B: both late ${c(jb)}, only A late ${c(pa - jb)}, only B late ${c(pb - jb)}, neither late ${c(1 - pa - pb + jb)}. ` +
                 `Backup C uses a different hub and is independent of A. C is late with probability ${pc}. ` +
                 `Backup B costs $${fb} and Backup C costs $${fc}.`,
          options: [{ id: 'B', label: `Backup B ($${fb})` }, { id: 'C', label: `Backup C ($${fc})` }],
          values: { B: -fb - 300 * jb, C: -fc - 300 * pa * pc },
          asks: [{ label: 'P(A late and C late)', answer: pa * pc, tol: 0.002 }],
          p: { pa, pb, jb, pc }
        };
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

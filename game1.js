// Game 1 - "Saturday Gift Run" (Module 1: Modeling Uncertainty)
// Each round: a story, two options, each option's true net value in dollars,
// and numeric questions with their correct answers (for the bonus).
(function (root) {
  const E = root.Engine;
  const pct = p => Math.round(p * 100) + '%';

  root.GAMES[1] = {
    name: 'Saturday Gift Run',
    intro: 'One Saturday at the mall. Five gifts to buy, $1,000 to spend.',
    rounds: [
      // 1. Counting
      function (rnd) {
        const a = E.pick(rnd, [4, 5, 6]), b = E.pick(rnd, [6, 7, 8, 9]), d = E.pick(rnd, [2, 3, 4, 5]);
        const pA = 1 - E.comb(20 - a, 2) / E.comb(20, 2);
        const pB = 1 - E.comb(30 - b, 2) / E.comb(30, 2);
        return {
          lesson: 'Counting',
          title: 'Which checkout?',
          story: `Both stores sell your $200 gift. At checkout you draw 2 sealed envelopes from a bin, without putting any back. Some envelopes hold a $50 coupon, and only one coupon can be used. ` +
                 `Store A: ${a} coupon envelopes among 20. Store B: ${b} among 30, and its gift costs $${d} less.`,
          options: [{ id: 'A', label: 'Shop at Store A' }, { id: 'B', label: 'Shop at Store B' }],
          values: { A: 50 * pA, B: 50 * pB + d },
          asks: [{ label: 'P(at least one coupon) at Store A (a decimal like 0.447)', answer: pA, tol: 0.01 }]
        };
      },
      // 2. Set theory and axioms
      function (rnd) {
        const pa = E.pick(rnd, [0.35, 0.4, 0.45]), pb = E.pick(rnd, [0.3, 0.35]), pab = E.pick(rnd, [0.05, 0.1]);
        const y1 = E.pick(rnd, [0.3, 0.35, 0.4]), y2 = E.pick(rnd, [0.3, 0.35, 0.4]);
        const px = pa + pb - pab, py = y1 + y2;
        return {
          lesson: 'Set theory and axioms',
          title: 'Which flyers?',
          story: `Five gifts on your list. Each gift gets $20 off if it appears on at least one store flyer. ` +
                 `Store X: flyer A covers ${pct(pa)} of items, flyer B covers ${pct(pb)}, and ${pct(pab)} are on both. ` +
                 `Store Y: flyer A covers ${pct(y1)}, flyer B covers ${pct(y2)}, and no item is on both.`,
          options: [{ id: 'X', label: 'Shop at Store X' }, { id: 'Y', label: 'Shop at Store Y' }],
          values: { X: 100 * px, Y: 100 * py },
          asks: [{ label: 'P(an item is on at least one flyer) at Store X', answer: px, tol: 0.01 }]
        };
      },
      // 3. Binomial and multinomial
      function (rnd) {
        const ps = E.pick(rnd, [0.78, 0.8, 0.82]), lost = 0.05, late = +(1 - ps - lost).toFixed(2);
        const pe = E.pick(rnd, [0.92, 0.94, 0.96]), fee = E.pick(rnd, [20, 30, 40]);
        const allS = Math.pow(ps, 6), allE = Math.pow(pe, 6);
        const multi = (E.fact(6) / (E.fact(4) * E.fact(1) * E.fact(1))) * Math.pow(ps, 4) * late * lost;
        return {
          lesson: 'Binomial and multinomial',
          title: 'Standard or express?',
          story: `You mail 6 gifts, each in its own package. Standard shipping: a package arrives on time with probability ${ps}, late with ${late}, lost with ${lost}. ` +
                 `Express shipping (+$${fee} total): on time with probability ${pe}. ` +
                 `If any gift misses Christmas, you pay $100 for a rush replacement.`,
          options: [{ id: 'S', label: 'Standard shipping' }, { id: 'E', label: `Express shipping (+$${fee})` }],
          values: { S: -100 * (1 - allS), E: -fee - 100 * (1 - allE) },
          asks: [
            { label: 'P(all 6 arrive on time) with standard', answer: allS, tol: 0.01 },
            { label: 'P(exactly 4 on time, 1 late, 1 lost) with standard', answer: multi, tol: 0.005 }
          ]
        };
      },
      // 4. Conditional probability
      function (rnd) {
        const a = E.pick(rnd, [25, 30, 35, 40]), b = E.pick(rnd, [25, 30, 35]);
        const c = E.pick(rnd, [100, 120, 140]), d = E.pick(rnd, [6, 10, 14]);
        const T = E.pick(rnd, [6, 8, 10, 12]), S = E.pick(rnd, [9, 11, 13, 15]);
        const pOut = b / (a + b);
        return {
          lesson: 'Conditional probability',
          title: 'Drive or ship?',
          story: `The last gift shows "limited stock" online. Counts from this store's website last month: ` +
                 `flagged "limited": ${a} were in stock and ${b} were sold out; not flagged: ${c} in stock and ${d} sold out. ` +
                 `Driving there costs $${T}. If it is sold out you still pay $${S} to ship it. Shipping now costs $${S}.`,
          options: [{ id: 'D', label: `Drive to the store ($${T})` }, { id: 'S', label: `Ship it now ($${S})` }],
          values: { D: -T - pOut * S, S: -S },
          asks: [{ label: 'P(in stock | flagged "limited")', answer: a / (a + b), tol: 0.01 }]
        };
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

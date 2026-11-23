// Game 4 - "Can I Trust This Store?" (Module 4: Expectations, Variability and Risk)
(function (root) {
  const E = root.Engine;
  const pct = p => Math.round(p * 100) + '%';

  root.GAMES[4] = {
    name: 'Can I Trust This Store?',
    intro: 'Which deals are worth the risk, and which store claims can you believe?',
    rounds: [
      // 1. Expected value and variance
      function (rnd) {
        const r = E.pick(rnd, [0.12, 0.14, 0.15, 0.16]);
        const set = E.pick(rnd, [
          { rates: [0.4, 0.2, 0.05], probs: [0.2, 0.3, 0.5] },
          { rates: [0.5, 0.25, 0.05], probs: [0.1, 0.3, 0.6] },
          { rates: [0.3, 0.15, 0.05], probs: [0.25, 0.35, 0.4] }
        ]);
        const mean = set.rates.reduce((s, x, i) => s + x * set.probs[i], 0);
        const m2 = set.rates.reduce((s, x, i) => s + x * x * set.probs[i], 0);
        const sd = 200 * Math.sqrt(m2 - mean * mean);
        const desc = set.rates.map((x, i) => `${pct(x)} off with probability ${set.probs[i]}`).join(', ');
        return {
          lesson: 'Expected value and variance',
          title: 'Flat coupon or surprise coupon?',
          story: `You are buying a $200 gift. Option A: a flat ${pct(r)} coupon. Option B: a surprise coupon that gives ${desc}. Pick the option with the bigger expected savings.`,
          options: [{ id: 'A', label: `Flat ${pct(r)} coupon` }, { id: 'B', label: 'Surprise coupon' }],
          values: { A: 200 * r, B: 200 * mean },
          asks: [
            { label: 'Expected savings with the surprise coupon, in $', answer: 200 * mean, tol: 0.5, kind: 'num' },
            { label: 'Standard deviation of the surprise coupon savings, in $', answer: sd, tol: 1, kind: 'num' }
          ],
          p: { r, mean, sd, set }
        };
      },
      // 2. Covariance and correlation
      function (rnd) {
        const s1 = E.pick(rnd, [20, 25]), s2 = E.pick(rnd, [30, 35]);
        const r1 = E.pick(rnd, [0.6, 0.8]), r2 = E.pick(rnd, [-0.2, 0, 0.2]);
        const sd = r => Math.sqrt(s1 * s1 + s2 * s2 + 2 * r * s1 * s2);
        return {
          lesson: 'Covariance and correlation',
          title: 'Which pair of items?',
          story: `You will buy a TV (price standard deviation $${s1}) and a soundbar (price standard deviation $${s2}), and prices change daily. ` +
                 `Pair 1: both from the same store, with price correlation ${r1}. Pair 2: from two different stores, with correlation ${r2}. ` +
                 `You must keep a cash buffer equal to half the standard deviation of the total price.`,
          options: [{ id: 'P1', label: 'Pair 1 (same store)' }, { id: 'P2', label: 'Pair 2 (different stores)' }],
          values: { P1: -0.5 * sd(r1), P2: -0.5 * sd(r2) },
          asks: [
            { label: 'Cov(TV, soundbar) for Pair 1', answer: r1 * s1 * s2, tol: 1, kind: 'num' },
            { label: 'Standard deviation of the total price for Pair 1, in $', answer: sd(r1), tol: 0.5, kind: 'num' }
          ],
          p: { s1, s2, r1, r2 }
        };
      },
      // 3. Chebyshev and the central limit theorem
      function (rnd) {
        const mu = E.pick(rnd, [3, 3.5]), sg = E.pick(rnd, [1, 1.2, 1.5]), n = E.pick(rnd, [64, 100, 144]);
        const dA = E.pick(rnd, [0.2, 0.3]), dB = E.pick(rnd, [0.1, 0.15]);
        const bA = E.pick(rnd, [30, 40]), bB = E.pick(rnd, [55, 70]), c = E.pick(rnd, [100, 150]), k = E.pick(rnd, [2, 2.5, 3]);
        const kA = E.Phi(dA * Math.sqrt(n) / sg), kB = E.Phi(dB * Math.sqrt(n) / sg);
        return {
          lesson: 'Chebyshev and the central limit theorem',
          title: 'Which promise to make?',
          story: `Shipping time per order has mean ${mu} days and standard deviation ${sg} (in days). You will promise that the average shipping time of your next ${n} orders is at most the mean plus a margin. ` +
                 `Promise A: margin ${dA} days. Keeping it earns $${bA}. Promise B: margin ${dB} days. Keeping it earns $${bB}. Breaking either costs $${c}.`,
          options: [{ id: 'A', label: `Promise A (${dA} days)` }, { id: 'B', label: `Promise B (${dB} days)` }],
          values: { A: bA * kA - c * (1 - kA), B: bB * kB - c * (1 - kB) },
          asks: [
            { label: 'P(you keep Promise A), using the central limit theorem', answer: kA, tol: 0.01 },
            { label: `Chebyshev bound: P(one order is ${k} or more standard deviations from the mean)`, answer: 1 / (k * k), tol: 0.005 }
          ],
          p: { mu, sg, n, dA, dB, kA, kB, k }
        };
      },
      // 4. Confidence interval and hypothesis test
      function (rnd) {
        let p0, n, x, ph, z, pv;
        do {
          p0 = E.pick(rnd, [0.9, 0.85]); n = E.pick(rnd, [40, 50, 60]);
          x = Math.round(n * (p0 - E.pick(rnd, [0.04, 0.06, 0.08, 0.1])));
          ph = x / n; z = (ph - p0) / Math.sqrt(p0 * (1 - p0) / n); pv = E.Phi(z);
        } while (Math.abs(pv - 0.05) < 0.012);
        const reject = pv < 0.05;
        return {
          lesson: 'Confidence intervals and hypothesis testing',
          title: 'Trust the claim?',
          story: `A store claims that at least ${pct(p0)} of its orders arrive on time. You tracked ${n} orders and ${x} arrived on time. ` +
                 `Your rule: buy backup shipping only if the data contradict the claim at the 5% level (one-sided z-test). Backup costs $10. Being wrong about a bad store costs $40.`,
          options: [{ id: 'TRUST', label: 'Trust the claim' }, { id: 'BACKUP', label: 'Buy backup shipping' }],
          values: reject ? { TRUST: -40, BACKUP: -10 } : { TRUST: -10, BACKUP: -40 },
          asks: [
            { label: 'z statistic (use the claimed rate for the standard error)', answer: z, tol: 0.05, kind: 'num' },
            { label: 'Lower end of the 95% confidence interval for the on-time rate', answer: ph - 1.96 * Math.sqrt(ph * (1 - ph) / n), tol: 0.01, kind: 'num' }
          ],
          p: { p0, n, x, z, pv }
        };
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

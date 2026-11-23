// Tiny Supabase REST helper. No libraries.
const API = (function () {
  // Accept the URL with or without a trailing /rest/v1 (the Data API page shows it with).
  const base = CONFIG.SUPABASE_URL.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '') + '/rest/v1/';
  const hdr = { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' };
  if (CONFIG.SUPABASE_KEY.startsWith('eyJ')) hdr.Authorization = 'Bearer ' + CONFIG.SUPABASE_KEY;
  let skew = 0; // server clock minus this device's clock, in ms

  async function call(path, opts) {
    opts = opts || {};
    const res = await fetch(base + path, {
      method: opts.method || 'GET', cache: 'no-store',
      headers: Object.assign({}, hdr, opts.headers || {}), body: opts.body
    });
    const text = await res.text();
    if (!res.ok) { const e = new Error(text || String(res.status)); e.status = res.status; throw e; }
    return text ? JSON.parse(text) : null;
  }

  return {
    now: () => Date.now() + skew,
    async state() {
      const t0 = Date.now();
      const s = await call('rpc/get_state', { method: 'POST', body: '{}' });
      skew = Date.parse(s.now) - (t0 + Date.now()) / 2;
      return s;
    },
    answers: (game, student) =>
      call('answers?game=eq.' + game + (student ? '&student=eq.' + encodeURIComponent(student) : '') + '&limit=5000'),
    submit: row => call('answers', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) }),
    setRound: (pass, game, round, secs, code) =>
      call('rpc/set_round', { method: 'POST', body: JSON.stringify({ p_pass: pass, p_game: game, p_round: round, p_secs: secs, p_code: code }) })
  };
})();
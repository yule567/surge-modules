// TikTok feed filter: explicit ad markers only; fail open.
(function () {
  let out = {};
  try {
    const b = $response.body;
    const h = $response.headers || {};
    const ct = Object.keys(h).find(k => k.toLowerCase() === "content-type");
    const kind = String(ct ? h[ct] : "unknown").split(";")[0];
    if (typeof b !== "string" || b.length > 2097152 || !/^\s*\{/.test(b)) {
      console.log("TikTok feed: unsupported response (" + kind + "); unchanged");
      return $done({});
    }
    const data = JSON.parse(b);
    if (!data || typeof data !== "object" || (data.status_code != null && Number(data.status_code) !== 0)) return $done({});
    const yes = v => v === true || v === 1 || v === "1" || v === "true";
    const isAd = v => v && typeof v === "object" && [v, v.aweme_info, v.aweme].some(x => x && typeof x === "object" && (yes(x.is_ad) || yes(x.is_ads) || yes(x.isAd) || yes(x.is_sponsored) || yes(x.isSponsored)));
    let removed = 0, seen = 0;
    for (const obj of [data, data.data]) {
      if (!obj || typeof obj !== "object") continue;
      for (const key of ["aweme_list", "awemeList"]) {
        const a = obj[key];
        if (!Array.isArray(a) || a.length > 1000) continue;
        seen += a.length;
        const kept = a.filter(v => !isAd(v));
        if (kept.length && kept.length < a.length) {
          removed += a.length - kept.length;
          obj[key] = kept;
        }
      }
    }
    if (removed) {
      const headers = Object.assign({}, h);
      for (const k of Object.keys(headers)) if (/^(content-length|content-encoding|etag|content-md5)$/i.test(k)) delete headers[k];
      out = {body: JSON.stringify(data), headers};
    }
    console.log("TikTok feed: scanned " + seen + ", removed " + removed + " (" + kind + ")");
  } catch (_) { console.log("TikTok feed: parse failed; unchanged"); }
  $done(out);
})();

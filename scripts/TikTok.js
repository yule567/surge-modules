// TikTok feed filter: only explicit ad flags; fail open.
(function () {
  let out = {};
  try {
    const b = $response.body;
    const h = $response.headers || {};
    const ct = Object.keys(h).find(k => k.toLowerCase() === "content-type");
    if (typeof b !== "string" || b.length > 524288 || !ct || !/^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(String(h[ct]))) return $done({});
    const data = JSON.parse(b);
    if (!data || typeof data !== "object" || !Array.isArray(data.aweme_list) || data.aweme_list.length > 500 || (data.status_code != null && data.status_code !== 0)) return $done({});
    const yes = v => v === true || v === 1 || v === "1";
    const isAd = v => v && typeof v === "object" && (yes(v.is_ad) || yes(v.is_ads) || yes(v.isAd));
    const original = data.aweme_list;
    const kept = original.filter(v => !isAd(v));
    if (kept.length && kept.length < original.length) {
      data.aweme_list = kept;
      out = {body: JSON.stringify(data)};
      console.log("TikTok: removed " + (original.length - kept.length) + " explicitly marked ads");
    }
  } catch (_) { out = {}; }
  $done(out);
})();

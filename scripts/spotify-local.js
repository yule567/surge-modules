/*
 * Spotify Local Experiments — original Surge script
 * This is NOT a Premium unlock or a Protobuf decoder.
 * Only adjusts explicit JSON ad display fields and local shuffle hints.
 * Unknown/binary responses are returned untouched.
 */
(function () {
  try {
    const body = $response && $response.body;
    if (typeof body !== "string" || !body.trimStart().startsWith("{")) {
      $done({});
      return;
    }
    const headers = $response.headers || {};
    const contentType = Object.keys(headers).find(k => k.toLowerCase() === "content-type");
    if (contentType && !/json/i.test(String(headers[contentType]))) {
      $done({});
      return;
    }
    const data = JSON.parse(body);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      $done({});
      return;
    }

    let changes = 0;
    const visited = new Set();
    const walk = (obj, depth) => {
      if (!obj || typeof obj !== "object" || depth > 8 || visited.has(obj)) return;
      visited.add(obj);
      if (Array.isArray(obj)) {
        obj.slice(0, 300).forEach(x => walk(x, depth + 1));
        return;
      }
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        // Only remove known optional display placements, not audio playback payloads.
        if ((key === "adBanners" || key === "adPlacements") && Array.isArray(value)) {
          obj[key] = [];
          changes++;
          continue;
        }
        // These are presentation hints, not server-side playback entitlements.
        if ((key === "shuffleEnabled" || key === "isShuffling") && value === true) {
          obj[key] = false;
          changes++;
          continue;
        }
        walk(value, depth + 1);
      }
    };
    walk(data, 0);
    if (!changes) {
      console.log("[Spotify Experimental] JSON matched; no supported fields");
      $done({});
      return;
    }
    const newHeaders = { ...headers };
    for (const key of Object.keys(newHeaders)) {
      if (/^(content-length|content-encoding|etag|content-md5)$/i.test(key)) delete newHeaders[key];
    }
    console.log("[Spotify Experimental] modified fields: " + changes);
    $done({ body: JSON.stringify(data), headers: newHeaders });
  } catch (e) {
    console.log("[Spotify Experimental] pass-through: " + String(e));
    $done({});
  }
})();

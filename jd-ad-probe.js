// Local-only JD interface inventory. No headers, cookies, bodies or full URLs retained.
(function () {
  var key = "jd_ad_probe_v1";
  var panel = typeof $input !== "undefined" && $input && $input.purpose === "panel";
  var result = {};
  try {
    var now = Date.now(), state;
    try { state = JSON.parse($persistentStore.read(key) || "{}"); } catch (_) { state = {}; }
    if (!state.items || !state.start || now - state.start > 86400000) state = {start:now,total:0,items:{}};
    if (panel) {
      var rows = Object.keys(state.items).map(function(k){return {id:k,n:state.items[k].n,kind:state.items[k].kind};});
      rows.sort(function(a,b){return b.kind-a.kind || b.n-a.n;});
      var suspects=rows.filter(function(r){return r.kind>0;});
      var lines=rows.slice(0,15).map(function(r){return (r.kind===2?"[广告线索] ":r.kind===1?"[待核查] ":"[其他] ")+r.id+" ×"+r.n;});
      result={title:"京东 广告嗅探",content:"近24小时｜请求 "+state.total+"｜接口 "+rows.length+"｜疑似 "+suspects.length+"\n"+(lines.join("\n")||"请先打开京东，再刷新面板"),style:suspects.length?"alert":"info"};
    } else if (typeof $request !== "undefined") {
      var url=String($request.url||"");
      var m=url.match(/[?&]functionId=([A-Za-z][A-Za-z0-9_-]{0,79})(?:[&#]|$)/i);
      var host=url.match(/^https:\/\/((?:api\.m|ads-img-x|ads-video-x|dsp-x|bdsp-x)\.jd\.com)(?::443)?(?:\/|$)/i);
      if (host) {
        var id=m?m[1]:host[1].toLowerCase();
        var kind= /^(?:ads-img-x|ads-video-x|dsp-x|bdsp-x)\./i.test(host[1]) || /advert|splash|adserver|(^|[_-])ads?([_-]|$)|^ad[A-Z]|^ads[A-Z]/.test(id) || /advert|splash|adserver/i.test(id) ? 2 : /banner|promotion|recommend|marketing|startup|launch/i.test(id)?1:0;
        state.total++;
        if (!Object.prototype.hasOwnProperty.call(state.items,id) && Object.keys(state.items).length<200) {
          state.items[id]={n:0,kind:kind};
          console.log("[京东嗅探] "+(kind?"疑似 ":"其他 ")+id);
        }
        if (Object.prototype.hasOwnProperty.call(state.items,id)) state.items[id].n++;
        $persistentStore.write(JSON.stringify(state),key);
      }
    }
  } catch (_) { if(panel) result={title:"京东 广告嗅探",content:"读取失败，请刷新",style:"error"}; }
  $done(result);
})();

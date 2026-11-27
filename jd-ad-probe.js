(function(){
var key="jd_ad_probe_v2",out={};
try{
var s;try{s=JSON.parse($persistentStore.read(key)||"{}");}catch(e){s={};}
if(!s.items||Date.now()-s.start>86400000)s={start:Date.now(),req:0,resp:0,items:{}};
if(typeof $request==="undefined"){
var rows=Object.keys(s.items).map(function(k){return s.items[k];}).sort(function(a,b){return b.score-a.score||b.n-a.n;});
out={title:"京东 广告嗅探 V2",content:"请求 "+s.req+"｜响应 "+s.resp+"｜疑似 "+rows.filter(function(r){return r.score>0;}).length+"\n"+(rows.slice(0,12).map(function(r){return (r.score>=2?"[广告线索] ":r.score?"[待核查] ":"[其他] ")+r.id+" ×"+r.n+(r.tags.length?" "+r.tags.join(","):"");}).join("\n")||"暂无记录"),style:"info"};
}else{
var url=String($request.url||""),response=typeof $response!=="undefined",body=String((response?$response.body:$request.body)||""),host=(url.match(/^https:\/\/([^\/:?]+)/i)||[])[1]||"";
var id=(url.match(/[?&]functionId=([A-Za-z][A-Za-z0-9_-]{0,79})(?:[&#]|$)/i)||[])[1];
if(!response&&!id)id=(body.match(/(?:^|&)functionId=([A-Za-z][A-Za-z0-9_-]{0,79})(?:&|$)/i)||body.match(/"functionId"\s*:\s*"([A-Za-z][A-Za-z0-9_-]{0,79})"/i)||[])[1];
var rid=String($request.id||"");
if(!response&&id&&rid)$persistentStore.write(id,"jd_probe_id_"+rid);
if(response&&rid){id=id||$persistentStore.read("jd_probe_id_"+rid);$persistentStore.write("","jd_probe_id_"+rid);}
id=/^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(id||"")?id:host;
var tags=[],score=0;
function hit(tag,n){if(tags.indexOf(tag)<0)tags.push(tag);score=Math.max(score,n);}
if(/^(ads-img-x|ads-video-x|dsp-x|bdsp-x)\./i.test(host))hit("广告域名",2);
if(/advert|splash|adserver|^ad[A-Z]|^ads[A-Z]/.test(id)||/advert|splash|adserver/i.test(id))hit("接口名称",2);
if(/banner|promotion|marketing|launch/i.test(id))hit("推广名称",1);
var signals=[["开屏",/"(?:splashAd|splashAds|splashConfig|launchAd|startupAd|openScreenAd)"/i,2],["广告素材",/"(?:adId|adList|adInfo|adMaterial|adImage|adVideo|advertId|advertisement|advertList|adConfig|adData)"/i,2],["广告跟踪",/"(?:adTracking|adTrackUrl|impressionUrl|adClickUrl|exposureUrl)"/i,2],["推广弹窗",/"(?:popupAd|popUpAd|popupConfig|promotionList|bannerList|bannerInfo)"/i,1]];
var sample=body.slice(0,1048576);
if(!response){try{sample=decodeURIComponent(sample.replace(/\+/g," "));}catch(e){}}
signals.forEach(function(x){if(x[1].test(sample))hit(x[0],x[2]);});
if(response)s.resp++;else s.req++;
if(!Object.prototype.hasOwnProperty.call(s.items,id)&&Object.keys(s.items).length<200)s.items[id]={id:id,n:0,score:0,tags:[]};
if(Object.prototype.hasOwnProperty.call(s.items,id)){var r=s.items[id];r.n++;r.score=Math.max(r.score,score);tags.forEach(function(t){if(r.tags.indexOf(t)<0)r.tags.push(t);});}
$persistentStore.write(JSON.stringify(s),key);
if(score)console.log("[京东嗅探] "+id+" "+tags.join(","));
}
}catch(e){if(typeof $request==="undefined")out={title:"京东 广告嗅探 V2",content:"统计读取失败",style:"info"};}
$done(out);
})();
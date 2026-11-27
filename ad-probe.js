(function(){
var out={},key="universal_ad_probe_v6",panel=typeof $request==="undefined";
try{
var s;try{s=JSON.parse($persistentStore.read(key)||"{}");}catch(e){s={};}
if(!s.items||!s.start||Date.now()-s.start>=86400000)s={start:Date.now(),req:0,resp:0,items:{}};
if(panel){
if(typeof $argument!=="undefined"&&$argument==="reset"){
if(typeof $trigger!=="undefined"&&$trigger==="button"){
$persistentStore.write(JSON.stringify({start:Date.now(),req:0,resp:0,items:{}}),key);
out={title:"清空嗅探记录",content:"已清空，请刷新主面板",style:"info"};
}else out={title:"清空嗅探记录",content:"点击右侧刷新按钮清空",style:"info"};
$done(out);return;
}
var rows=Object.keys(s.items).map(function(k){return s.items[k];});
function strong(r){return r.tags.some(function(t){return ["广告域名","独立广告候选","广告接口","开屏","广告素材","广告跟踪","DSP广告追踪"].indexOf(t)>=0;});}
function esc(v){return v.replace(/\./g,"\\.");}
function rule(r){
if(r.tags.indexOf("独立广告候选")>=0)return "DOMAIN,"+r.host+",REJECT";
if(r.path&&r.path!=="/"&&r.tags.indexOf("DSP广告追踪")>=0)return "^https:\\/\\/"+esc(r.host)+esc(r.path).replace(/\//g,"\\/")+"(?:[/?]|$) - reject";
if(r.id)return "接口参数: "+r.id+"（需确认参数位置）";
return "";
}
var hidden=rows.filter(function(r){return r.tags.indexOf("追踪线索")>=0&&!strong(r);}).length;
rows=rows.filter(function(r){return strong(r)||r.tags.indexOf("全屏素材待核查")>=0;}).sort(function(a,b){return Number(strong(b))-Number(strong(a))||b.score-a.score||b.n-a.n;});
out={title:"智能广告嗅探 V6",style:"info",content:"广告候选 "+rows.length+" | 隐藏追踪 "+hidden+"\n"+(rows.slice(0,10).map(function(r){var candidate=rule(r);return (strong(r)?"[广告线索] ":"[素材待核查] ")+r.host+(r.id?" · "+r.id:(r.path?r.path:""))+" ×"+r.n+"\n"+r.tags.join("、")+(candidate?"\n候选: "+candidate:"");}).join("\n\n")||"暂无广告线索")};
}else{
var url=String($request.url||""),host=(url.match(/^https:\/\/([a-z0-9.-]+)(?::443)?\//i)||[])[1];
if(!host||!/(^|\.)(jd\.com|360buyimg\.com|taobao\.com|tmall\.com|alicdn\.com|pinduoduo\.com|yangkeduo\.com|pddpic\.com|pdd\.net|snssdk\.com|pangle\.io|gdt\.qq\.com|e\.qq\.com|ad\.qq\.com|doubleclick\.net|googlesyndication\.com)$/i.test(host)||/(^|[.-])(pay|payment|cashier|wallet|passport|login|auth|sso|account|bank|security|trade|order|checkout|cdnpay)([.-]|$)/i.test(host)||/(?:login|passport|payment|cashier|checkout|oauth|token|password|verify|account|address|order|profile|wallet)/i.test(url.split("?")[0])){$done({});return;}
var response=typeof $response!=="undefined";
var body=String((response?$response.body:$request.body)||"").slice(0,262144);
var id=(url.match(/[?&](?:functionId|api|method)=([A-Za-z][A-Za-z0-9_.-]{0,79})(?:[&#]|$)/i)||[])[1]||"";
if(!id&&!response)id=(body.match(/(?:^|&)(?:functionId|api|method)=([A-Za-z][A-Za-z0-9_.-]{0,79})(?:&|$)/i)||[])[1]||"";
if(/(?:login|passport|payment|cashier|checkout|oauth|token|password|verify|account|address|order|profile|wallet)/i.test(id)){$done({});return;}
var tags=[],score=0;function hit(t,n){if(tags.indexOf(t)<0){tags.push(t);score+=n;}}
if(/(^|[.-])(?:ads?|adserver|adservice|admob|dsp|bdsp|ads-img|ads-video|gdt|pangle)([.-]|$)|doubleclick\.net$|googlesyndication\.com$/i.test(host))hit("广告域名",2);
if(/^(?:mars\.jd\.com|blackhole\.m\.jd\.com)$/i.test(host)||/(^|[.-])(?:analytics|telemetry|tracking|tracker|metrics|beacon)([.-]|$)/i.test(host))hit("追踪线索",1);
if(/^(?:ads-img-x\.jd\.com|ads-video-x\.jd\.com|dsp-x\.jd\.com|bdsp-x\.jd\.com|ad\.qq\.com|gdt\.qq\.com|pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)$/i.test(host))hit("独立广告候选",2);
var path=url.split("?")[0].replace(/^https:\/\/[^/]+/i,"");
if(/(?:advert|splash|adserver|adservice|adrequest|adload|adfetch|adlist|adconfig|admaterial|\/ads?(?:\/|$))/i.test(path+" "+id))hit("广告接口",2);
if(/startup|strategy|banner|promotion|marketing|launch|popup|feed/i.test(path+" "+id))hit("启动/推广",1);
if(!response){try{body=decodeURIComponent(body.replace(/\+/g," "));}catch(e){}}
var fields=[["开屏",/"(?:splashAd|splashAds|splashConfig|launchAd|startupAd|openScreenAd|splash_ad|splash_config)"/i,2],["广告素材",/"(?:adId|adList|adInfo|adMaterial|adImage|adVideo|advertId|advertisement|advertList|adConfig|adData|ad_id|ad_list|ad_info|ad_data|creative_id|ad_unit_id|advertising|isAd|is_ad)"/i,2],["广告跟踪",/"(?:adTracking|adTrackUrl|impressionUrl|adClickUrl|ad_tracking|impression_url|click_track_url)"/i,2],["推广弹窗",/"(?:popupAd|popUpAd|popupConfig|promotionList|bannerList|bannerInfo|popup_ad|banner_list)"/i,1]];
fields.forEach(function(f){if(f[1].test(body))hit(f[0],f[2]);});
host=host.toLowerCase();
if(/^im-x\.jd\.com$/i.test(host)&&/^\/dsp\//i.test(path))hit("DSP广告追踪",3);
if(/(?:^|\/)(?:s1125x2436|s1242x2688)_jfs\//i.test(path)&&/\.360buyimg\.com$/i.test(host))hit("全屏素材待核查",1);
if(/^(?:mllog\.jd\.com|cltm\.jd\.com|ex\.m\.jd\.com)$/i.test(host))hit("追踪线索",1);
var safePath=/^\/[A-Za-z0-9_./-]{1,120}$/.test(path)&&!/[0-9]{6,}|[a-f0-9]{16,}/i.test(path)&&!/(?:jfs|\.jpg|\.png|\.avif|\.webp)/i.test(path)?path:"";
var k=host+"|"+(id||safePath);
if(response)s.resp++;else s.req++;
if(score>0&&!Object.prototype.hasOwnProperty.call(s.items,k)){if(Object.keys(s.items).length>=200){var low=Object.keys(s.items).sort(function(a,b){return s.items[a].score-s.items[b].score||s.items[a].n-s.items[b].n;})[0];if(s.items[low].score<score)delete s.items[low];}if(Object.keys(s.items).length<200)s.items[k]={host:host,id:id,path:safePath,n:0,score:0,tags:[]};}
if(score===0){$done({});return;}
if(s.items[k]){var r=s.items[k];r.n++;r.score=Math.max(r.score,score);tags.forEach(function(t){if(r.tags.indexOf(t)<0)r.tags.push(t);});}
$persistentStore.write(JSON.stringify(s),key);
}
}catch(e){if(panel)out={title:"智能广告嗅探 V6",content:"统计读取失败",style:"info"};}
$done(out);
})();
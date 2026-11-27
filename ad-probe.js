(function probe(env){
  const {request,response,store,argument,trigger,done,log,now}=env;
  const key="ad_probe_v8"; const title="智能广告嗅探 V8";
  const fresh=()=>({start:now,items:[]});
  const read=()=>{try{const s=JSON.parse(store.read(key)||"null");if(s&&Array.isArray(s.items)&&Number.isFinite(s.start)&&now-s.start<86400000&&now>=s.start)return s;}catch(e){}return fresh();};
  const write=s=>{if(store.write(JSON.stringify(s),key)===false)throw Error("store write failed");};
  let result={};
  try{
    if(!request){
      if(argument==="reset"){
        if(trigger==="button"){write(fresh());result={title:"清空嗅探记录",content:"已清空，请刷新主面板",style:"info"};}
        else result={title:"清空嗅探记录",content:"点击刷新按钮清空",style:"info"};
      }else{
        const items=read().items.slice().sort((a,b)=>b.score-a.score||b.n-a.n);
        result={title,style:"info",content:"仅检测 · "+items.length+" 条候选 · 24小时\n"+(items.slice(0,10).map(r=>`[${r.score>=3?"较强":"待核查"}] ${r.host}${r.path} ×${r.n}\n${r.tag}`).join("\n\n")||"暂无广告线索")};
      }
    }else{
      const m=/^https:\/\/([a-z0-9.-]+)(?::443)?(\/[^?#]*)?(?:[?#]|$)/i.exec(String(request.url||""));
      if(m){
        const host=m[1].toLowerCase(),path=m[2]||"/";
        const independent=/^(?:ads-img-x\.jd\.com|ads-video-x\.jd\.com|dsp-x\.jd\.com|bdsp-x\.jd\.com|ad\.qq\.com|gdt\.qq\.com|pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)$/;
        let tag="",score=0;
        if(!response&&independent.test(host)){tag="独立广告域名候选";score=3;}
        else if(!response&&host==="im-x.jd.com"&&/^\/dsp(?:\/|$)/i.test(path)){tag="DSP广告追踪候选";score=3;}
        else if(response&&host==="api.m.jd.com"&&/^\/(?:client\.action|api)(?:\/|$)/i.test(path)&&Number(response.status)>=200&&Number(response.status)<300){
          const headers=response.headers||{};
          const ct=Object.keys(headers).find(k=>k.toLowerCase()==="content-type");
          const body=response.body;
          if(ct&&/^(?:application\/(?:json|[\w.+-]+\+json)|text\/json)(?:\s*;|$)/i.test(String(headers[ct]))&&typeof body==="string"&&body.length<=131072){
            let root;try{root=JSON.parse(body);}catch(e){}
            if(root&&typeof root==="object"){
              const stack=[{v:root,d:0}];let count=0;
              while(stack.length&&count<3000){
                const {v,d}=stack.pop();if(!v||typeof v!=="object"||d>12)continue;
                for(const k of Object.keys(v)){
                  if(++count>3000)break;
                  const x=v[k];
                  if(/^(?:is_ad|is_ads|isAd|isSponsored|is_sponsored)$/i.test(k)&&(x===true||x===1||x==="1"||x==="true")){tag="明确广告标记候选";score=3;}
                  else if(score<2&&/^(?:ad_info|adInfo|ad_list|adList|ad_material|adMaterial|splash_ad|splashAd|raw_ad_data)$/i.test(k)&&x&&typeof x==="object"&&Object.keys(x).length){tag="非空广告结构候选";score=2;}
                  if(x&&typeof x==="object"&&d<12&&stack.length<3000)stack.push({v:x,d:d+1});
                }
                if(score>=3)break;
              }
            }
          }
        }
        if(score){
          const safePath=host==="api.m.jd.com"?(/^\/client\.action(?:\/|$)/i.test(path)?"/client.action":"/api"):host==="im-x.jd.com"?"/dsp":"";
          const s=read();let r=s.items.find(x=>x.host===host&&x.path===safePath&&x.tag===tag);
          if(!r){r={host,path:safePath,tag,score,n:0,last:0};if(s.items.length>=100){s.items.sort((a,b)=>a.score-b.score||a.last-b.last);s.items.shift();}s.items.push(r);}
          if(!r.last||now-r.last>=5000){r.n++;r.last=now;write(s);}
        }
      }
    }
  }catch(e){log("广告嗅探 V8：处理失败，流量原样放行");if(!request)result={title,content:"统计读取或写入失败",style:"info"};}
  done(result);
})({request:typeof $request==='undefined'?null:$request,response:typeof $response==='undefined'?null:$response,store:$persistentStore,argument:typeof $argument==='undefined'?'':$argument,trigger:typeof $trigger==='undefined'?'':$trigger,done:$done,log:function(s){console.log(s);},now:Date.now()});

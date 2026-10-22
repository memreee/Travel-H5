/* Scroll controls the story; wind, footsteps and decorations have their own clock. */
(() => {
 const data=window.TRAVEL_MOTION_ASSETS;
 const poster=document.querySelector('.poster'),background=document.querySelector('.long-image');
 if(!data||matchMedia('(prefers-reduced-motion: reduce)').matches){background.src='assets/poster.jpg';window.TRAVEL_MOTION_BOOT?.finish('static');return}
 const ns='http://www.w3.org/2000/svg',root=document.createElement('div');
 root.className='motion-layers';root.setAttribute('aria-hidden','true');root.style.visibility='hidden';
 const tails={
  35:{polygon:[[.52,0],[1,0],[1,.30],[.67,.31],[.67,.21],[.56,.20],[.54,.14]],root:[.63,.17]},
  31:{polygon:[[.53,.15],[.80,.13],[.82,.32],[.62,.34],[.61,.27],[.54,.24]],root:[.60,.25]},
  37:{polygon:[[0,0],[.48,0],[.45,.12],[.35,.14],[.35,.27],[.20,.32],[0,.28]],root:[.38,.20]},
  32:{polygon:[[.53,0],[.95,0],[.95,.18],[.67,.19],[.67,.14],[.57,.12]],root:[.65,.13]},
  70:{polygon:[[0,0],[.52,0],[.55,.14],[.42,.21],[.28,.26],[.18,.35],[0,.31]],root:[.40,.19]},
  201:{polygon:[[.20,0],[.62,0],[.62,.10],[.54,.20],[.48,.23],[.45,.46],[.40,.54],[.25,.55],[.20,.40]],root:[.52,.19]}
 };
 const legs={
  35:[{polygon:[[62,164],[98,173],[97,235],[20,235],[20,190],[50,190]],root:[79,168]},
      {polygon:[[100,169],[134,152],[170,184],[170,235],[101,235]],root:[118,163]}],
  31:[{polygon:[[139,225],[188,250],[187,315],[88,315],[88,250]],root:[163,239]},
      {polygon:[[202,244],[248,215],[300,248],[300,310],[228,310]],root:[226,230]}]
 };
 const routes=new Set([24,34,36,51,65,69]),blocks=new Set([53,54,55,56]);
 const stepDelays={133:0,136:3.4,137:6.8};
 const topicSign=new Set([79,145,146,149,150,227]),rewardSign=new Set([82,186,187,190,191,228]);
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>1-Math.pow(1-clamp(x),3),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 function el(tag,attrs={}){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
 function image(src,w,h){return el('image',{href:src,width:w,height:h})}
 function polygon(points){return 'M'+points.map(p=>p.join(' ')).join(' L')+' Z'}
 function clipImage(src,w,h,id,defs,path){const clip=el('clipPath',{id});clip.append(el('path',{d:path}));defs.append(clip);const art=image(src,w,h);art.setAttribute('clip-path',`url(#${id})`);return art}
 function vectorD(paths,left,top){return paths.map(p=>{if(!p.knots.length)return '';const point=a=>`${(a[0]-left).toFixed(3)} ${(a[1]-top).toFixed(3)}`;let d=`M ${point(p.knots[0][1])}`;for(let i=1;i<p.knots.length;i++)d+=` C ${point(p.knots[i-1][2])} ${point(p.knots[i][0])} ${point(p.knots[i][1])}`;if(p.closed){const first=p.knots[0],last=p.knots[p.knots.length-1];d+=` C ${point(last[2])} ${point(first[0])} ${point(first[1])} Z`}return d}).join(' ')}
 const items=data.map(a=>{
  const [left,top]=a.bbox,[w,h]=a.size,src=`assets/motion/layer-${a.index}.png`;
  const node=el('svg',{viewBox:`0 0 ${w} ${h}`,class:`motion-item motion-${a.index}`});
  node.style.cssText=`left:${left/10.8}%;top:${top/127.34}%;width:${w/10.8}%;height:${h/127.34}%`;
  const item={...a,node},defs=el('defs');node.append(defs);
  if(tails[a.index]){
   const spec=tails[a.index],tailPath=polygon(spec.polygon.map(([x,y])=>[x*w,y*h]));
   const legSpecs=legs[a.index]||[],holes=[tailPath,...legSpecs.map(l=>polygon(l.polygon))];
   const bodyClip=el('clipPath',{id:`body-${a.index}`});bodyClip.append(el('path',{d:`M 0 0 H ${w} V ${h} H 0 Z ${holes.join(' ')}`,'fill-rule':'evenodd','clip-rule':'evenodd'}));defs.append(bodyClip);
   const body=image(src,w,h);body.setAttribute('clip-path',`url(#body-${a.index})`);node.append(body);
   const tail=el('g');tail.append(clipImage(src,w,h,`tail-${a.index}`,defs,tailPath));node.append(tail);item.tail=tail;item.pivot=[spec.root[0]*w,spec.root[1]*h];
   item.legs=legSpecs.map((l,i)=>{const group=el('g');group.append(clipImage(src,w,h,`leg-${a.index}-${i}`,defs,polygon(l.polygon)));node.append(group);return {group,root:l.root}});
  }else if(a.index===200){
   const parts=[
    [[0,140],[205,140],[263,474],[322,479],[322,575],[0,575]],
    [[258,0],[520,0],[520,310],[492,310],[492,406],[258,406]],
    [[548,137],[686,137],[686,634],[447,634],[447,540],[484,540],[514,389],[536,262]],
    [[700,195],[1007,195],[1007,505],[700,505]]
   ];
   item.prizeParts=parts.map((points,i)=>{const group=el('g',{'data-prize':i});group.append(clipImage(src,w,h,`floating-prize-${i}`,defs,polygon(points)));node.append(group);return group});
  }else if(a.index in stepDelays){
   item.stepParts=[0,52].map((y,i)=>{const group=el('g',{'data-step-part':i===0?'heading':'content'});group.append(clipImage(src,w,h,`step-${a.index}-${i}`,defs,`M 0 ${y} H ${w} V ${i===0?52:h} H 0 Z`));node.append(group);return group});
  }else if(a.index===29){
   const cuts=[0,190,300,410,540,674,840,w];
   item.glyphs=cuts.slice(0,-1).map((x,i)=>{const clip=el('clipPath',{id:`glyph-${i}`});clip.append(el('rect',{x,y:0,width:cuts[i+1]-x,height:h}));defs.append(clip);const group=el('g',{'data-character':'把自由写进路上'[i]});const art=image(src,w,h);art.setAttribute('clip-path',`url(#glyph-${i})`);group.append(art);node.append(group);return group});
  }else if(a.index===28){
   const region='M 520 -20 H 740 V 260 H 520 Z';
   const fixedClip=el('clipPath',{id:'kite-fixed'});fixedClip.append(el('path',{d:`M 0 0 H ${w} V ${h} H 0 Z ${region}`,'fill-rule':'evenodd','clip-rule':'evenodd'}));defs.append(fixedClip);
   const fixed=image(src,w,h);fixed.setAttribute('clip-path','url(#kite-fixed)');node.append(fixed);
   item.kite=el('g');item.kite.append(clipImage(src,w,h,'kite-moving',defs,region));node.append(item.kite);
  }else if(a.index===14){
   const gradient=el('linearGradient',{id:'road-gradient',x1:0,y1:0,x2:0,y2:h,gradientUnits:'userSpaceOnUse'});
   const first=el('stop',{offset:0,'stop-color':'white'}),last=el('stop',{offset:0,'stop-color':'black'});gradient.append(first,last);defs.append(gradient);
   const mask=el('mask',{id:'road-mask',maskUnits:'userSpaceOnUse',x:0,y:0,width:w,height:h});mask.append(el('rect',{width:w,height:h,fill:'url(#road-gradient)'}));defs.append(mask);const art=image(src,w,h);art.setAttribute('mask','url(#road-mask)');node.append(art);item.roadStops=[first,last];
  }else if(routes.has(a.index)&&a.vector_paths.length){
   const mask=el('mask',{id:`route-${a.index}`,maskUnits:'userSpaceOnUse',x:-40,y:-40,width:w+80,height:h+80});
   const path=el('path',{d:vectorD(a.vector_paths,left,top),fill:'none',stroke:'white','stroke-width':60,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1});
   mask.append(path);defs.append(mask);const art=image(src,w,h);art.setAttribute('mask',`url(#route-${a.index})`);node.append(art);item.path=path;
  }else node.append(image(src,w,h));
  root.append(node);return item;
 });
 const settings=window.TRAVEL_MOTION_SETTINGS||{};
 let enabled=settings.autoStart!==false,holding=false,manualUntil=0,goal=scrollY,lastWritten=-1,lastAutoAt=-Infinity,lastFrame=0,playTime=0,lastLabel='';
 const speed=settings.speed??35,resumeDelay=settings.resumeDelay??900;
 // Once the last hero paragraph has entered, keep this scene revealed on return.
 const heroRevealEnd=1060;
 let heroRevealed=false;
 function manual(){manualUntil=performance.now()+resumeDelay;goal=scrollY}
 function updateControl(state){if(lastLabel===state)return;lastLabel=state;document.documentElement.dataset.autoScroll=state}
 function paint(t,dt,modal){
  const rect=poster.getBoundingClientRect(),scale=rect.width/1080,y=-rect.top/scale,vh=innerHeight/scale;
  if(y>=heroRevealEnd)heroRevealed=true;
  const heroY=heroRevealed?Math.max(y,heroRevealEnd):y,roadProgress=smooth((heroY-120)/640);
  for(const a of items){
   const top=a.bbox[1],h=a.size[1],visible=clamp((y+vh-top)/(vh+h));a.node.dataset.progress=visible.toFixed(4);
   const onScreen=top+h>y-200&&top<y+vh+200;
   if(a.prizeParts){a.prizeParts.forEach((part,i)=>{const offset=Math.sin(playTime*.95+i*1.6)*11;part.setAttribute('transform',`translate(0 ${offset.toFixed(3)})`)});continue}
   const stepProgress=(y+vh*.8-2920)/100;
   if(a.stepParts){a.stepParts.forEach((part,i)=>{part.style.opacity=smooth(stepProgress-stepDelays[a.index]-i*1.1).toFixed(4)});continue}
   if([135,138,139].includes(a.index)){const delay=a.index===138?2.3:a.index===139?5.7:4.5;a.node.style.opacity=smooth(stepProgress-delay).toFixed(4);continue}
   if(topicSign.has(a.index)||rewardSign.has(a.index)){const anchor=topicSign.has(a.index)?3850:8159;a.node.style.opacity=smooth((y+vh*.8-anchor)/(vh*.32)).toFixed(4);if(a.index!==79&&a.index!==82)a.node.style.mixBlendMode='multiply';continue}
   if(a.index===37){
    // Start emerging only after the topic sign's fade has fully finished.
    const p=smooth((y+vh*.48-3850)/(vh*.24));
    a.node.style.opacity=p.toFixed(4);
    a.node.style.transform=`translateX(${(170*(1-p)*scale).toFixed(3)}px)`;
   }
   if(a.tail){
    const walking=a.legs.length>0,phase=playTime*5.2+(a.index===31?Math.PI:0);
    const angle=walking?Math.sin(phase*.55)*5:Math.sin(visible*Math.PI*8)*8*Math.sin(visible*Math.PI);
    a.tail.setAttribute('transform',`rotate(${angle.toFixed(4)} ${a.pivot[0]} ${a.pivot[1]})`);
    if(walking){
     for(let i=0;i<a.legs.length;i++){const limb=a.legs[i],rotation=Math.sin(phase+i*Math.PI)*11;limb.group.setAttribute('transform',`rotate(${rotation.toFixed(4)} ${limb.root.join(' ')})`)}
     const p=a.index===35?smooth((heroY-90)/450):smooth((y+vh*.65-top)/(h+vh*.35));
     const x=a.index===35?251-306*p:280*(1-p),rise=a.index===35?170-280*p:150-220*p,bob=onScreen?Math.abs(Math.sin(phase))*3:0;
     a.node.style.transform=`translate(${(x*scale).toFixed(3)}px,${((rise-bob)*scale).toFixed(3)}px)`;
     a.node.style.opacity=smooth(p/.3).toFixed(4);
    }
    continue;
   }
   if(a.glyphs){for(let i=0;i<a.glyphs.length;i++){const p=smooth((heroY-20-i*40)/100);a.glyphs[i].style.opacity=p.toFixed(4);a.glyphs[i].style.filter=p>0&&p<1?`blur(${((1-p)*1.5).toFixed(2)}px)`:''}continue}
   if(a.kite){const wind=Math.sin(playTime*1.05);a.kite.setAttribute('transform',`translate(${(wind*6).toFixed(3)} 0) rotate(${(wind*3).toFixed(3)} 550 194)`);a.node.style.opacity=smooth((heroY-100)/220).toFixed(4);continue}
   if(a.roadStops){const p=roadProgress;a.roadStops[0].setAttribute('offset',clamp(p-.035).toFixed(5));a.roadStops[1].setAttribute('offset',clamp(p+.035).toFixed(5));a.roadStops[1].setAttribute('stop-color',p>=.999?'white':'black');a.node.style.opacity=p===0?'0':'1';continue}
   if(a.path){const p=clamp((y+vh*.86-top)/(h*.65+vh*.35));a.path.setAttribute('stroke-dashoffset',(1-p).toFixed(5));continue}
   if(blocks.has(a.index)||a.index===50||a.index===58){const phase=playTime*3.8+(a.index%2)*Math.PI,sign=a.index===50?-1:1,size=1+Math.sin(phase)*(blocks.has(a.index)?.13:.09)*sign,rise=Math.sin(phase)*6*scale;a.node.style.transform=`translateY(${rise.toFixed(3)}px) scale(${size.toFixed(5)})`;continue}
   if(a.index===123){const p=ease((heroY-760)/300);a.node.style.transform=`translateY(${(135*(1-p)*scale).toFixed(3)}px)`;a.node.style.opacity=p.toFixed(4);continue}
   if(a.index===127||a.index===128||a.index===129){const p=smooth((heroY-50)/430),x=(a.index===127?-645:547)*(1-p),drop=(a.index===127?-300:-260)*(1-p);a.node.style.transform=`translate(${(x*scale).toFixed(3)}px,${(drop*scale).toFixed(3)}px)`;a.node.style.opacity=p.toFixed(4);continue}
   if(a.index===30){a.node.style.opacity=smooth((heroY-80)/160).toFixed(4);continue}
   if([80,114,116,119,120,226].includes(a.index)){a.node.style.opacity=ease((y+vh*.85-2210)/(vh*.45)).toFixed(4);if(a.index!==80)a.node.style.mixBlendMode='multiply'}
  }
  root.style.visibility='visible';
  for(const carousel of window.TRAVEL_CAROUSELS||[])carousel.tick(t,dt,modal);
 }
 function frame(t){
  if(window.TRAVEL_MOTION_BOOT?.fallback)return;
  requestAnimationFrame(frame);if(lastFrame&&t-lastFrame<32)return;const dt=lastFrame?Math.min((t-lastFrame)/1000,.1):0;lastFrame=t;
  if(document.hidden){goal=scrollY;return}
  const modal=!document.querySelector('#result').hidden||document.querySelector('#dialog').open;
  if(!modal)playTime+=dt;
  const max=document.documentElement.scrollHeight-innerHeight;
  if(!enabled)updateControl('paused');
  else if(modal){goal=scrollY;manualUntil=t+resumeDelay;updateControl('modal')}
  else if(holding||t<manualUntil){goal=scrollY;updateControl('waiting')}
  else if(scrollY>=max-1){goal=scrollY;updateControl('bottom')}
  else{goal=Math.min(max,goal+speed*dt);lastWritten=goal;lastAutoAt=t;window.scrollTo(0,goal);updateControl('playing')}
  paint(t,dt,modal);
 }
 // Start as soon as the first scene is ready. Later SVG images load independently.
 const heroLayers=new Set([14,28,29,30,35,123,127,128,129]);
 const sources=[...new Set(data.filter(a=>heroLayers.has(a.index)).map(a=>`assets/motion/layer-${a.index}.png`)),'assets/motion/clean-poster.jpg'];
 Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.fetchPriority='high';im.onload=resolve;im.onerror=reject;im.src=src}))).then(()=>{
  if(window.TRAVEL_MOTION_BOOT?.fallback)return;
  poster.insertBefore(root,poster.querySelector('.carousel'));background.src='assets/motion/clean-poster.jpg';poster.classList.add('motion-ready');document.querySelector('.second-row-background').hidden=true;
  document.documentElement.classList.add('has-motion');goal=scrollY;manualUntil=performance.now()+900;
  addEventListener('wheel',manual,{passive:true});addEventListener('touchmove',manual,{passive:true});
  addEventListener('pointerdown',()=>{holding=true;manual()},{passive:true});
  const release=()=>{holding=false;manual()};addEventListener('pointerup',release,{passive:true});addEventListener('pointercancel',release,{passive:true});
  addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))manual()});
  addEventListener('scroll',()=>{if(Math.abs(scrollY-lastWritten)>2||performance.now()-lastAutoAt>180)manual()},{passive:true});
  addEventListener('resize',manual,{passive:true});updateControl('waiting');paint(performance.now(),0,false);window.TRAVEL_MOTION_BOOT?.finish('ready');requestAnimationFrame(frame);
 }).catch(()=>{if(window.TRAVEL_MOTION_BOOT)window.TRAVEL_MOTION_BOOT.fail('asset-error');else background.src='assets/poster.jpg';console.warn('Motion assets unavailable; using the complete static poster.')});
})();

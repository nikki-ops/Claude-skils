// Оформление серии 3 (поверх canvas): табло с 3 живыми счётчиками и всплывающей дельтой, плашка + красный штамп,
// итог голосования барами, карточка комментария зрителя, субтитры по словам с цветным ключевым словом (**слово**).
window.UI=(function(){let R,W,H,s,E={};
 const C={dark:['linear-gradient(#222845,#141829)','#fff'],red:['#d8263a','#fff'],gold:['#f7c24a','#1a1410']},SC={gold:'#ffd860',red:'#ff5a6a',green:'#5dff8a',tq:'#4fd6e8'};
 function init(root,w,h){R=root;W=w;H=h;s=W/1080;R.style.cssText=`position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;font-family:Rubik,sans-serif;overflow:hidden`;
  R.innerHTML='<div style="position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(rgba(10,8,20,0),rgba(10,8,20,.45) 45%,rgba(10,8,20,.6))"></div>'+
   ['uTab','uPl','uSt','uDel','uVote','uKom','uSub'].map(i=>`<div id="${i}" style="position:absolute;left:0;right:0"></div>`).join('')+
   '<div id="uFade" style="position:absolute;inset:0;background:#000;opacity:0"></div><div id="uFlash" style="position:absolute;inset:0;background:#fff3d0;opacity:0"></div>';
  ['uTab','uDel','uPl','uSt','uVote','uKom','uSub','uFade','uFlash'].forEach(i=>E[i]=R.querySelector('#'+i));E.uTab.style.inset='0'}
 const pop=a=>{const k=Math.min(1,a/.18);return .6+.4*k+(k<1?0:Math.max(0,.08*Math.sin(Math.min(1,(a-.18)/.25)*Math.PI)))};
 const fadeOut=l=>Math.max(0,Math.min(1,l/.2));
 function tablo3(el,o){const days=o.days,budget=o.budget.toLocaleString('ru-RU').replace(/\s/g,' '),ready=o.ready,gl=o.glow||{};
  const glow=(c,k)=>k>0?`0 0 ${40*k*s}px ${c}`:'none';
  el.innerHTML=`<div style="position:absolute;left:${40*s}px;right:${40*s}px;top:${200*s}px;height:${150*s}px;border-radius:${22*s}px;background:linear-gradient(#11162a,#0a0d1a);border:${5*s}px solid #2b3556;box-shadow:0 ${8*s}px 0 rgba(0,0,0,.35);display:flex;align-items:center;gap:${22*s}px;padding:0 ${26*s}px;box-sizing:border-box">
  <div style="text-align:center;transform:scale(${1+(gl.d||0)*.25})"><div style="font-family:'Courier New',monospace;font-weight:900;font-size:${66*s}px;line-height:1;color:#ff4a4a;text-shadow:0 0 ${14*s}px rgba(255,60,60,.8)">${days}</div>
   <div style="color:#8fa0c8;font-weight:700;font-size:${19*s}px;line-height:1.15;margin-top:${6*s}px">${days%10===1&&days%100!==11?'ДЕНЬ':(days%10>=2&&days%10<=4&&(days%100<10||days%100>=20))?'ДНЯ':'ДНЕЙ'}<br>ДО СТАРТА</div></div>
  <div style="flex:1;border-radius:${12*s}px;box-shadow:${glow(gl.rc||'#5dff8a',gl.r||0)}"><div style="color:#8fa0c8;font-weight:700;font-size:${22*s}px;letter-spacing:${2*s}px;display:flex;justify-content:space-between"><span>ГОТОВНОСТЬ</span><span style="color:#ffd860;font-size:${(26+(gl.r||0)*14)*s}px">${ready}%</span></div>
   <div style="height:${30*s}px;margin-top:${8*s}px;border-radius:${15*s}px;background:#1d2440;overflow:hidden;border:${3*s}px solid #2b3556"><div style="height:100%;width:${Math.max(3,ready)}%;background:repeating-linear-gradient(90deg,#ffd860 0 ${18*s}px,#f7a83a ${18*s}px ${24*s}px)"></div></div></div>
  <div style="text-align:right;transform:scale(${1+(gl.b||0)*.12});transform-origin:right center"><div style="color:#8fa0c8;font-weight:700;font-size:${22*s}px;letter-spacing:${3*s}px">БЮДЖЕТ</div>
   <div style="font-family:'Courier New',monospace;font-weight:900;font-size:${44*s}px;line-height:1.2;color:${gl.bc&&gl.b>0&&Math.floor(o.t*8)%2?gl.bc:'#5dff8a'};text-shadow:0 0 ${12*s}px rgba(80,255,130,.7)">${budget}₽</div></div></div>`}
 function words(text,col,age){const parts=[];let prevRaw='';text.split(/(\*\*[^*]+\*\*)/).forEach(p=>{if(!p)return;const kw=p.startsWith('**');p.replace(/\*\*/g,'').split(/(\s+)/).forEach(w=>{if(!w.trim())return;if(/^[.,!?…»:;—-]+$/.test(w)&&parts.length&&!/^\s/.test(w)&&p.indexOf(w)===0&&!/\s$/.test(prevRaw)){parts[parts.length-1].w+=w;return}parts.push({w,kw})});prevRaw=p});
  const kc=SC[col]||SC.gold;return parts.map((p,i)=>{const a=age-i*.07;if(a<0)return `<span style="display:inline-block;margin:0 .13em;opacity:0">${p.w}</span>`;const k=Math.min(1,a/.14);
   return `<span style="display:inline-block;margin:0 .13em;transform:translateY(${(1-k)*18*s}px) scale(${p.kw?.9+.1*k+(a<.4&&p.kw?.08*Math.sin(a/.4*Math.PI):0):1});opacity:${k};color:${p.kw?kc:'#fff'}">${p.w}</span>`}).join('')}
 function update(t,S){
  // табло + подсветка изменённого счётчика
  const d=S.delta(t),gl={};if(d){const k=Math.max(0,1-d.age/1.4);if(/%/.test(d.text)){gl.r=k;gl.rc=d.col==='red'?'#ff5a6a':'#5dff8a'}else{gl.b=k;gl.bc=d.col==='red'?'#ff5a6a':'#bfffcf'}}
  const dd=S.DAY.find(q=>q[0]>0&&t>=q[0]&&t<q[0]+1);if(dd)gl.d=Math.max(0,1-(t-dd[0]));
  E.uTab.innerHTML='';
  if(d){const c=d.col==='red'?'#ff5a6a':'#5dff8a',k=Math.min(1,d.age/.2),o=Math.min(1,(1.8-d.age)/.3);E.uDel.style.top=(360+d.age*-20)*s+'px';E.uDel.style.opacity=o;E.uDel.style.textAlign=/%/.test(d.text)?'center':'right';E.uDel.style.right=60*s+'px';
   E.uDel.innerHTML=`<span style="display:inline-block;transform:scale(${.6+.4*k});font-family:'Courier New',monospace;font-weight:900;font-size:${50*s}px;color:${c};background:#0a0d1a;border:${4*s}px solid ${c};border-radius:${14*s}px;padding:${4*s}px ${16*s}px;margin-right:${/%/.test(d.text)?0:20*s}px">${d.text}</span>`}else E.uDel.innerHTML='';
  // плашка
  const p=S.plq(t);if(p){const c=C[p.st]||C.dark;E.uPl.style.top=190*s+'px';E.uPl.style.textAlign='center';E.uPl.style.opacity=fadeOut(p.left);
   E.uPl.innerHTML=`<span style="display:inline-block;transform:scale(${pop(p.age)});background:${c[0]};color:${c[1]};font-weight:900;font-size:${Math.min(60,1400/p.text.length)*s}px;padding:${12*s}px ${38*s}px;white-space:nowrap;border-radius:${20*s}px;border:${6*s}px solid #fff;box-shadow:0 ${10*s}px 0 rgba(0,0,0,.3)">${p.text}</span>`}else E.uPl.innerHTML='';
  // штамп (красный/зелёный, наклонный, падает сверху)
  const st=S.stamp(t);if(st){const k=Math.min(1,st.age/.16),sc=1.7-.7*k,col=st.st==='green'?'#1f9a4a':'#d8263a';E.uSt.style.top=(p?305:220)*s+'px';E.uSt.style.textAlign='center';E.uSt.style.opacity=Math.min(k*1.5,fadeOut(st.left));
   E.uSt.innerHTML=`<span style="display:inline-block;transform:rotate(-6deg) scale(${sc});background:${col};color:#fff;font-weight:900;font-size:${Math.min(56,1300/st.text.length)*s}px;padding:${10*s}px ${30*s}px;white-space:nowrap;border-radius:${10*s}px;border:${6*s}px dashed rgba(255,255,255,.9);box-shadow:0 ${8*s}px 0 rgba(0,0,0,.35);letter-spacing:${2*s}px">${st.text}</span>`}else E.uSt.innerHTML='';
  // итог голосования
  const v=S.vote(t);if(v){const k=S.ease(Math.min(1,v.age/1.1)),mx=Math.max(...v.rows.map(r=>r[1]));E.uVote.style.top=540*s+'px';E.uVote.style.zoom=1.25;E.uVote.style.opacity=Math.min(1,v.age/.2,fadeOut(v.left));
   E.uVote.innerHTML=`<div style="margin:0 ${60*s}px;background:rgba(14,18,34,.92);border:${5*s}px solid #2b3556;border-radius:${26*s}px;padding:${24*s}px ${34*s}px;box-shadow:0 ${10*s}px 0 rgba(0,0,0,.35)">
    <div style="color:#8fa0c8;font-weight:900;font-size:${34*s}px;letter-spacing:${3*s}px;margin-bottom:${14*s}px">${v.title}</div>`+
    v.rows.map(r=>{const win=r[1]===mx&&v.age>1.1;return `<div style="display:flex;align-items:center;gap:${18*s}px;margin:${12*s}px 0"><div style="width:${330*s}px;color:#fff;font-weight:900;font-size:${34*s}px">${r[0]}</div>
     <div style="flex:1;height:${62*s}px;background:#1d2440;border-radius:${16*s}px;overflow:hidden"><div style="height:100%;width:${r[1]*k}%;background:${r[2]};border-radius:${16*s}px;${win?`box-shadow:inset 0 0 0 ${5*s}px #fff`:''}"></div></div>
     <div style="width:${110*s}px;text-align:right;font-weight:900;font-size:${48*s}px;color:${r[2]};transform:scale(${win?1+.12*Math.max(0,Math.sin((v.age-1.1)*6)):1})">${Math.round(r[1]*k)}%</div></div>`}).join('')+'</div>'}else E.uVote.innerHTML='';
  // карточка комментария
  const m=S.kom(t);if(m){const k=S.ease(Math.min(1,m.age/.3)),lk=Math.round(m.likes*Math.min(1,m.age/1.2));E.uKom.style.top=(470+(1-k)*50)*s+'px';E.uKom.style.zoom=1.25;E.uKom.style.opacity=Math.min(k,fadeOut(m.left));
   E.uKom.innerHTML=`<div style="margin:0 ${70*s}px;transform:rotate(-1.5deg) scale(${.9+.1*k});background:#fff;border-radius:${30*s}px;padding:${26*s}px ${32*s}px;box-shadow:0 ${14*s}px 0 rgba(0,0,0,.3);border:${5*s}px solid #1b1426">
    <div style="color:#8a8f9a;font-weight:700;font-size:${24*s}px;margin-bottom:${10*s}px">ИЗ ВАШИХ КОММЕНТАРИЕВ</div>
    <div style="display:flex;gap:${20*s}px;align-items:flex-start"><div style="flex:none;width:${84*s}px;height:${84*s}px;border-radius:50%;background:linear-gradient(#f7c24a,#e8902a);color:#1b1426;font-weight:900;font-size:${44*s}px;display:flex;align-items:center;justify-content:center">${(m.nik[0]||'?').toUpperCase()}</div>
     <div style="flex:1"><div style="font-weight:900;font-size:${32*s}px;color:#1b1426">@${m.nik}</div><div style="font-weight:700;font-size:${38*s}px;line-height:1.2;color:#1b1426;margin-top:${6*s}px">${m.text}</div>
      <div style="margin-top:${12*s}px;font-weight:900;font-size:${32*s}px;color:#e8283a">♥ ${lk.toLocaleString('ru-RU')}</div></div></div></div>`}else E.uKom.innerHTML='';
  // субтитры
  const sb=S.sub(t);if(sb&&sb.text){E.uSub.style.top=1440*s+'px';E.uSub.style.left='4%';E.uSub.style.right='4%';E.uSub.style.textAlign='center';
   E.uSub.innerHTML=`<div style="font-weight:900;font-size:${74*s}px;line-height:1.12;color:#fff;-webkit-text-stroke:${13*s}px #141829;paint-order:stroke fill;text-shadow:0 ${8*s}px 0 #141829">${words(sb.text,sb.col,sb.age)}</div>`}else E.uSub.innerHTML='';
  E.uFade.style.opacity=Math.max(0,Math.min(1,(t-(S.END-.6))/.6))+(t<.2?1-t/.2:0);
  const fl=(S.FLASH||[]).reduce((m,q)=>Math.max(m,t>=q&&t<q+.25?.55*(1-(t-q)/.25):0),0);E.uFlash.style.opacity=fl}
 return{init,update}})();

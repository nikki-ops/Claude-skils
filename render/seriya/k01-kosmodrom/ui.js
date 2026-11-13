// Оформление поверх картинки (общее для 2D и 3D): табло ЦУП, плашки, ценники, субтитры, вспышка/затемнение.
window.UI=(function(){let R,W,H,s,E={};
 const C={dark:['linear-gradient(#222845,#141829)','#fff'],red:['#d8263a','#fff'],gold:['#f7c24a','#1a1410']},SC={gold:'#ffd860',red:'#ff5a6a',green:'#5dff8a',tq:'#4fd6e8'};
 function init(root,w,h){R=root;W=w;H=h;s=W/1080;R.style.cssText=`position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;font-family:Rubik,sans-serif;overflow:hidden`;
  R.innerHTML='<div id="uTab" style="position:absolute;inset:0"></div><div id="uPl" style="position:absolute;left:0;right:0;text-align:center"></div><div id="uTag" style="position:absolute;left:0;right:0;text-align:center"></div><div style="position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(rgba(10,8,20,0),rgba(10,8,20,.45) 45%,rgba(10,8,20,.6))"></div><div id="uSub" style="position:absolute;left:4%;right:4%;text-align:center"></div><div id="uFade" style="position:absolute;inset:0;background:#000;opacity:0"></div><div id="uFlash" style="position:absolute;inset:0;background:#fff3d0;opacity:0"></div>';
  ['uTab','uPl','uTag','uSub','uFade','uFlash'].forEach(i=>E[i]=R.querySelector('#'+i))}
 const pop=a=>{const k=Math.min(1,a/.18);return (.6+.4*k+(k<1?0:Math.max(0,.08*Math.sin(Math.min(1,(a-.18)/.25)*Math.PI))))};
 function update(t,S){
  // табло
  E.uTab.innerHTML='';if(t>=S.TAB_FROM){const a=Math.min(1,(t-S.TAB_FROM)/.35);E.uTab.style.opacity=a;E.uTab.style.transform=`translateY(${(1-a)*-40*s}px)`;tablo(E.uTab,{days:S.day(t),ready:S.ready(t),budget:S.budget(t)})}
  // плашка
  const p=S.plq(t);if(p){const c=C[p.st]||C.dark,o=Math.min(1,p.left/.2);E.uPl.style.top=380*s+'px';E.uPl.style.opacity=o;
   E.uPl.innerHTML=`<span style="display:inline-block;transform:scale(${pop(p.age)});background:${c[0]};color:${c[1]};font-weight:900;font-size:${Math.min(62,1700/p.text.length)*s}px;padding:${14*s}px ${40*s}px;white-space:nowrap;border-radius:${22*s}px;border:${6*s}px solid #fff;box-shadow:0 ${10*s}px 0 rgba(0,0,0,.3)">${p.text}</span>`}else E.uPl.innerHTML='';
  // ценник
  const g=S.tag(t);if(g){const fall=Math.min(1,g.age/.35),y=(1-fall)*-200*s,o=Math.min(1,(2.2-g.age)/.3);E.uTag.style.top=(1290*s+y)+'px';E.uTag.style.opacity=o;
   E.uTag.innerHTML=`<span style="display:inline-block;transform:rotate(${-4+Math.sin(g.age*6)*2*Math.max(0,1-g.age)}deg) scale(${pop(g.age)});background:#d8263a;color:#fff;font-weight:900;font-size:${54*s}px;padding:${12*s}px ${30*s}px;border-radius:${14*s}px;border:${6*s}px dashed #fff;box-shadow:0 ${8*s}px 0 rgba(0,0,0,.35)">${g.text}</span>`}else E.uTag.innerHTML='';
  // субтитры
  const sb=S.sub(t);if(sb&&sb.text){E.uSub.style.top=1440*s+'px';const col=SC[sb.col]||'#fff',k=Math.min(1,sb.age/.12);
   E.uSub.innerHTML=`<span style="display:inline-block;transform:scale(${.85+.15*k});font-weight:900;font-size:${70*s}px;line-height:1.1;color:${col};-webkit-text-stroke:${13*s}px #141829;paint-order:stroke fill;text-shadow:0 ${8*s}px 0 #141829">${sb.text}</span>`}else E.uSub.innerHTML='';
  // затемнение в конце и вспышки на ударах
  E.uFade.style.opacity=Math.max(0,Math.min(1,(t-(S.END-.6))/.6))+(t<.25?1-t/.25:0);
  const fl=[1.5,8,16.3,37.6,45].reduce((m,q)=>Math.max(m,t>=q&&t<q+.25?.5*(1-(t-q)/.25):0),0);E.uFlash.style.opacity=fl}
 return{init,update}})();

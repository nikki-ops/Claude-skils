// Серия 11 «777 домов на Марсе» (ДЕНЬ 10). window.seek(t) рисует кадр на секунде t.
// Тайминги субтитров примерные — после озвучки подогнать массив SUB (секунды).
const END=38;
// [время, слово, цвет]
const SUB=[[0,'этот'],[.5,'город'],[1,'строят'],[1.5,'подписчики','tq'],[2.4,'каждый'],[3.2,'подписался'],[4.3,'комментарий','red'],
[5.5,'назавтра'],[6.3,'свой дом','gold'],[7.2,'с ником'],[7.8,'над крышей'],[8.5,'я лёг спать'],[9.4,'в деревне'],[10.2,'а проснулся'],[11,'в городе','tq'],
[12,'777 жителей','gold'],[14,'аэропорт'],[15.5,'небоскрёбы'],[17,'дом-ракету'],[18.5,'целый район','tq'],
[20,'дом-пончик'],[22,'планета марс'],[23.2,'на марсе','gold'],[24,'библиотека'],[26,'найди свой ник','tq'],[28,'пиши ник'],[29.3,'что построить','red'],[30.2,'с другом','tq'],
[31,'цель — 1000'],[32.4,'золотой дом','gold'],[34,'мне страшно…','red'],[35.2,'а знаешь'],[36,'кто строит'],[36.8,'этот город?'],[37.4,'ты','gold']];
// камера: [t0,t1, от{tx,tz,d,yaw,p}, до{...}] — внутри отрезка плавно, на границе — склейка
const Z=(tx,tz,d,yaw,p)=>({tx,tz,d,yaw,p});
const START=Z(105,70,62,.25,.55);
const CAM=[
[0,2.4,START,Z(150,20,82,.55,.6)],
[2.4,5.5,Z(150,20,90,.55,.7),Z(160,0,110,.65,.75)],
[5.5,8.5,Z(162,-84,30,.3,.42),Z(162,-84,22,.45,.38)],
[8.5,10.2,Z(162,-84,46,.6,.45),Z(162,-84,40,.7,.42)],
[10.2,12,Z(162,-84,40,.7,.42),Z(162,-64,320,.5,.9)],
[12,14,Z(162,-64,320,.5,.9),Z(162,-64,420,.6,.95)],
[14,15.5,Z(320,263,52,.2,.5),Z(320,263,44,.35,.45)],
[15.5,17,Z(200,-125,130,.9,.35),Z(200,-125,115,1.05,.33)],
[17,18.5,Z('DIKOP',0,30,.4,.42),Z('DIKOP',0,24,.6,.38)],
[18.5,20,Z(95,-338,120,.4,.7),Z(95,-338,250,.6,.95)],
[20,22,Z('DOORSSIANEN',0,26,.3,.45),Z('DOORSSIANEN',0,21,.5,.42)],
[22,24,Z('KSB',0,28,.3,.45),Z('KSB',0,23,.5,.42)],
[24,26,Z('^Bee$',0,30,0,.55),Z('^Bee$',0,26,.15,.5)],
[26,26.4,Z(129,41,140,.5,1.05),Z(129,41,138,.5,1.05)],
[26.4,26.8,Z(95,-338,140,.5,1.05),Z(95,-338,138,.5,1.05)],
[26.8,27.2,Z(162,-84,120,.5,1.05),Z(162,-84,118,.5,1.05)],
[27.2,27.6,Z(282,-108,120,.5,1.05),Z(282,-108,118,.5,1.05)],
[27.6,28,Z(222,60,130,.5,1.05),Z(222,60,128,.5,1.05)],
[28,31,Z(95,-338,200,.5,.8),Z(95,-338,170,.7,.75)],
[31,35,Z(162,-64,300,.4,.8),Z(162,-64,280,.8,.75)],
[35,38,Z(150,20,82,.55,.6),START]];
const ss=u=>u*u*(3-2*u),cl=(a,b,x)=>Math.max(a,Math.min(b,x));
const $=id=>document.getElementById(id);
function show(id,on,s){const e=$(id);e.style.display=on?'block':'none';if(on&&s!=null)e.style.transform='scale('+s+')'}
function pop(t,t0){const k=(t-t0)/.12;return k>=1?1:k<0?1:(k<.5?1+.24*k:1.12-.24*(k-.5))}
let lastNight=null,ready=false;
// цели по нику: дома могли переехать при перепланировке — берём координаты из карты
function prep(w){const L=w.MLIST||w.eval('MLIST');CAM.forEach(c=>[c[2],c[3]].forEach(z=>{if(typeof z.tx==='string'){const re=new RegExp(z.tx),h=L.find(h=>re.test(h.n)&&h.g&&h.day<=10);if(h){z.tx=h.x;z.tz=h.z}else{console.log('нет дома',z.tx);z.tx=162;z.tz=-64}}}));
 // в видео без названий платформ у районов
 try{w.eval("DL.forEach(d=>{if(d.e&&/YOUTUBE|TIKTOK/i.test(d.e.textContent))d.e.style.visibility='hidden'})")}catch(e){console.log('DL',e.message)}
 ready=true}
window.seek=function(t){
 const w=$('map').contentWindow,MP=w&&w.MP;if(!MP)return false;if(!ready)prep(w);
 const c=CAM.find(a=>t>=a[0]&&t<a[1])||CAM[CAM.length-1],u=ss(cl(0,1,(t-c[0])/(c[1]-c[0])));
 for(const k of['tx','tz','d','yaw','p'])MP.K[k]=c[2][k]+(c[3][k]-c[2][k])*u;
 const night=t>=8.5&&t<10.2;if(night!==lastNight){MP.night(night);lastNight=night}
 MP.setAll(t>=26&&t<28);
 const d=w.document;d.body.classList.toggle('nolab',t>=5.5&&t<8.5||t>=2.4&&t<5.5||t>=28&&t<31);
 if(!d.getElementById('vcs')){const s=d.createElement('style');s.id='vcs';s.textContent='body.nolab .mpn{display:none!important}body.mpall .mpn{font-size:1.5em!important}';d.head.appendChild(s)}
 d.body.classList.toggle('mpall',t>=26&&t<28);
 MP.draw();
 // слой 2D
 const sb=[...SUB].reverse().find(a=>t>=a[0]);const S=$('sub');S.textContent=sb?sb[1]:'';S.className='o '+(sb&&sb[2]||'');S.style.transform='scale('+(sb?pop(t,sb[0]):1)+')';
 show('day',t<12||t>=35);
 const ph=(t>=2.4&&t<5.5)||(t>=28&&t<31);show('phone',ph);
 $('map').style.filter=ph?'blur(14px) brightness(.8)':'none';
 if(ph){$('pbtn').className='btn'+(t>=3.3&&t<5.5?' on':'');$('pbtn').textContent=t>=3.3&&t<5.5?'Вы подписаны ✓':'Подписаться';
  const txt=t<5.5?'хочу дом-пончик 🍩':'@мой_ник — дом-ракету 🚀';const t0=t<5.5?4.0:28.6;const n=cl(0,txt.length,Math.floor((t-t0)*16));$('pcm').innerHTML=[...txt].slice(0,n).join('')+'<i></i>'}
 show('badge',t>=6.2&&t<8.5,pop(t,6.2));
 const cn=t>=12&&t<14?Math.round(177+600*ss(cl(0,1,(t-12)/1.2))):0;show('cnt',(t>=12&&t<14)||(t>=31&&t<35));
 $('cnt').firstChild.innerHTML=t<14?'ЖИТЕЛЕЙ: <b>'+cn+'</b>':'ЖИТЕЛЕЙ: <b>777</b> / 1000';
 $('flash').style.opacity=t>=13.2&&t<13.6?(1-(t-13.2)/.4)*.7:(Math.abs(t-26)<.06||Math.abs(t-10.2)<.08)?.5:0;
 show('plq',t>=20&&t<26);show('pause',t>=26&&t<28);show('cta',t>=28.4&&t<35);
 show('gold',t>=32.4&&t<35,1+.05*Math.sin(t*6));
 return true};
window.END=END;

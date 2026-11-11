// Серия 10 «777 домов на Марсе» (ДЕНЬ 10). window.seek(t) рисует кадр на секунде t.
// Тайминги субтитров примерные — после озвучки подогнать массив SUB (секунды).
const END=42;
// [время, слово, цвет]
const SUB=[[0,'этот'],[.45,'город'],[1.13,'строят'],[1.6,'подписчики','tq'],[2.71,'каждый'],[3.4,'подписался'],[4.1,'комментарий','red'],[5.3,'назавтра'],[6.1,'свой дом','gold'],[7.32,'с ником'],[7.8,'над крышей'],
[8.86,'я лёг спать'],[9.5,'в деревне'],[10.47,'а проснулся'],[11.56,'в городе','tq'],[12.48,'777','gold'],[14.78,'за ночь'],[15.6,'аэропорт'],[16.89,'небоскрёбы'],[17.86,'дом-ракету'],[18.98,'целый район','tq'],
[20.36,'по просьбе'],[21.53,'дом-пончик'],[22.56,'планета марс'],[23.64,'на марсе','gold'],[24.57,'библиотека'],[25.6,'для одного'],[26.77,'найди свой ник','tq'],[28.02,'нет тебя?'],[28.9,'пиши ник'],[29.6,'что построить','red'],
[30.72,'рядом с другом','tq'],[32.27,'пишите вместе'],[33.41,'цель — тысяча'],[35.38,'тысячный'],[36.3,'золотой дом','gold'],[37.94,'мне страшно…','red'],[39.48,'а знаешь'],[40.32,'кто строит'],[41,'этот город?']];
// голос golos/10-777-domov.mp3 (42 с): [время голоса, время сцены] — камера и плашки идут по сцене
const AN=[[0,0],[1.13,1],[2.71,2.4],[5.3,5],[7.32,7.2],[8.86,8.5],[10.47,10.2],[11.56,11],[12.48,12],[14.78,14],[16.89,15.5],[17.86,17],[18.98,18.5],[20.36,20],[22.56,22],[24.57,24],[26.77,26],[28.9,28.4],[30.72,30.2],[33.41,31],[35.38,32.4],[37.94,34],[39.48,35.2],[40.32,36],[42,38]];
// плавный ремап (монотонный кубический сплайн): скорость сцены меняется без скачков в опорных точках
const AM=(()=>{const n=AN.length,h=[],d=[],m=[];for(let i=0;i<n-1;i++){h[i]=AN[i+1][0]-AN[i][0];d[i]=(AN[i+1][1]-AN[i][1])/h[i]}
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i]);return m})();
const MAPT=v=>{for(let i=1;i<AN.length;i++)if(v<=AN[i][0]){const a=AN[i-1],b=AN[i],h=b[0]-a[0],s=(v-a[0])/h,s2=s*s,s3=s2*s;
 return(2*s3-3*s2+1)*a[1]+(s3-2*s2+s)*h*AM[i-1]+(-2*s3+3*s2)*b[1]+(s3-s2)*h*AM[i]}return 38};
// камера: [t0,t1, от{tx,tz,d,yaw,p}, до{...}] — внутри отрезка плавно, на границе — склейка
const Z=(tx,tz,d,yaw,p)=>({tx,tz,d,yaw,p});
const START=Z(118,48,48,.2,.5);
const CAM=[
[0,2.4,START,Z(150,20,135,.55,.85)],
[2.4,5.0,Z(150,20,120,.55,.85),Z(130,40,60,.9,.6)],
[5.0,5.9,Z(162,-84,75,2.6,.7),Z(162,-84,50,2.7,.6)],
[5.9,7.1,Z(162,-84,34,2.7,.55),Z(162,-84,28,2.85,.5)],
[7.1,8.5,Z(162,-84,28,2.85,.5),Z(162,-84,40,3.1,.7)],
[8.5,9.4,Z(162,-84,36,2.6,.5),Z(162,-84,30,2.7,.45)],
[9.4,10.2,Z(162,-84,30,2.9,.45),Z(162,-84,26,3.0,.42)],
[10.2,11.1,Z(162,-84,26,3.0,.42),Z(162,-84,110,3.0,.75)],
[11.1,12,Z(162,-64,140,3.0,.85),Z(162,-64,220,3.0,.9)],
[12,14,Z(162,-64,180,3.0,.88),Z(162,-64,400,3.1,.95)],
[14,14.7,Z(240,120,160,.4,.75),Z(290,220,120,.3,.7)],[14.7,15.5,Z(320,263,56,.2,.5),Z(320,263,44,.35,.45)],
[15.5,16.25,Z(200,-125,130,.9,.35),Z(200,-125,100,1.0,.33)],
[16.25,17,Z(200,-125,70,-.5,.25),Z(200,-125,60,-.4,.22)],
[17,18.5,Z('DIKOP',0,26,.2,.32),Z('DIKOP',0,22,1.3,.30)],
[18.5,20,Z(95,-338,120,.4,.7),Z(95,-338,250,.6,.95)],
[20,21,Z('DOORSSIANEN',0,24,.3,.32),Z('DOORSSIANEN',0,19,.45,.30)],
[21,22,Z('DOORSSIANEN',0,40,-.5,.55),Z('DOORSSIANEN',0,34,-.4,.50)],
[22,23,Z('KSB',0,30,.3,.30),Z('KSB',0,24,.45,.28)],
[23,24,Z('KSB',0,44,-.6,.50),Z('KSB',0,38,-.5,.45)],
[24,25,Z('^Bee$',0,46,3.0,.60),Z('^Bee$',0,40,3.1,.55)],
[25,26,Z('^Bee$',0,26,3.3,.45),Z('^Bee$',0,22,3.4,.42)],
[26,26.7,Z(129,41,75,.5,.85),Z(129,41,70,.5,.85)],
[26.7,27.4,Z(95,-338,75,.5,.85),Z(95,-338,70,.5,.85)],
[27.4,28,Z(282,-108,75,.5,.85),Z(282,-108,70,.5,.85)],
[28,29.5,Z(129,41,120,.3,.75),Z(129,41,90,.6,.65)],
[29.5,31,Z(70,60,100,.2,.7),Z(100,20,80,.5,.6)],
[31,32.4,Z(162,-64,300,.4,.88),Z(162,-64,200,.9,.8)],
[32.4,33.7,Z(130,20,130,.3,.8),Z(130,20,80,.4,.72)],
[33.7,35,Z(130,20,80,.4,.72),Z(162,-64,260,.5,.9)],
[35,36.5,Z(150,20,135,.55,.85),Z(120,50,70,.35,.55)],
[36.5,38,Z(120,50,70,.35,.55),START]];
const ss=u=>u*u*(3-2*u),cl=(a,b,x)=>Math.max(a,Math.min(b,x));
const $=id=>document.getElementById(id);
function show(id,on,s){const e=$(id);e.style.display=on?'block':'none';if(on&&s!=null)e.style.transform='scale('+s+')'}
function pop(t,t0){const k=(t-t0)/.12;return k>=1?1:k<0?1:(k<.5?1+.24*k:1.12-.24*(k-.5))}
let lastNight=null,ready=false,LT=null;
// свет и туман только для видео (карта для зрителей не меняется)
function look(w,night){const sc=w.eval('sc'),T=w.THREE;if(!LT){LT=[];sc.traverse(o=>{if(o.isLight)LT.push([o,o.intensity,o.color.getHex()])});
  const wl=new T.PointLight(0xf7c24a,0,45);wl.position.set(162,6,-84);sc.add(wl);LT.wl=wl}
 LT.forEach(([o,i,c])=>{o.intensity=night?i*.45:i;if(o.color)o.color.setHex(c)});LT.wl.intensity=night?2.5:0;
 if(sc.fog){sc.fog.color.setHex(night?0x2a2050:0xe8a98a);sc.fog.near=520;sc.fog.far=1100}
 const sky=sc.children.find(o=>o.isMesh&&o.material&&o.material.side===T.BackSide);if(sky)sky.material.color.setHex(night?0x3a3068:0xffffff)}
// цели по нику: дома могли переехать при перепланировке — берём координаты из карты
function prep(w){const L=w.MLIST||w.eval('MLIST');CAM.forEach(c=>[c[2],c[3]].forEach(z=>{if(typeof z.tx==='string'){const re=new RegExp(z.tx),h=L.find(h=>re.test(h.n)&&h.g&&h.day<=10);if(h){z.tx=h.x;z.tz=h.z}else{console.log('нет дома',z.tx);z.tx=162;z.tz=-64}}}));
 // в видео без названий платформ у районов
 try{w.eval("DL.forEach(d=>{if(d.e&&/YOUTUBE|TIKTOK/i.test(d.e.textContent))d.e.style.visibility='hidden'})")}catch(e){console.log('DL',e.message)}
 look(w,false);lastNight=false;
 ready=true}
window.seek=function(tv){const t=MAPT(tv);
 const w=$('map').contentWindow,MP=w&&w.MP;if(!MP)return false;if(!ready)prep(w);
 // анимации карты (дым, летающие дома, кристаллы) — по времени ролика, а не по часам компьютера
 if(!w.__vt){w.__vt=true;w.performance.now=()=>w.__VT*1000}w.__VT=tv;
 // внутри плана камера едет с постоянной скоростью: без торможения до нуля перед склейкой
 const c=CAM.find(a=>t>=a[0]&&t<a[1])||CAM[CAM.length-1],u=cl(0,1,(t-c[0])/(c[1]-c[0]));
 for(const k of['tx','tz','d','yaw','p'])MP.K[k]=c[2][k]+(c[3][k]-c[2][k])*u;
 if(t>=34&&t<35)MP.K.yaw+=.02*Math.sin(t*95);
 const night=t>=8.5&&t<10.2;if(night!==lastNight){look(w,night);lastNight=night}
 MP.setAll(t>=26&&t<28);
 const d=w.document;d.body.classList.toggle('nolab',t>=5&&t<8.5||t>=2.4&&t<5||t>=28&&t<31);
 if(!d.getElementById('vcs')){const s=d.createElement('style');s.id='vcs';s.textContent='body.nolab .mpn{display:none!important}body.mpall .mpn{font-size:1.5em!important}';d.head.appendChild(s)}
 d.body.classList.toggle('mpall',t>=26&&t<28);
 MP.draw();
 d.querySelectorAll('.mpn').forEach(e=>{if(e.style.display==='none')return;const r=e.getBoundingClientRect(),m=Math.min(r.left-24,1056-r.right,r.top-290,1700-r.bottom);e.style.visibility='visible';e.style.opacity=cl(0,1,m/80).toFixed(2)});
 // слой 2D
 const sb=[...SUB].reverse().find(a=>tv>=a[0]);const S=$('sub');S.textContent=sb?sb[1]:'';S.className='o '+(sb&&sb[2]||'');S.style.transform='scale('+(sb?pop(tv,sb[0]):1)+')';
 show('day',t<12||t>=35);
 const ph=t>=2.4&&t<5;show('phone',ph);$('phone').classList.toggle('nophone',t>=28);
 $('map').style.filter=t>=2.4&&t<5?'blur('+(Math.min(1,(t-2.4)/.3)*14).toFixed(1)+'px) brightness(.8)':'none';
 if(ph){$('pbtn').className='btn'+(t>=3.3&&t<5?' on':'');$('pbtn').textContent=t>=3.3&&t<5?'Вы подписаны ✓':'Подписаться';
  const txt=t<5?'хочу дом-пончик 🍩':'@мой_ник — дом-ракету 🚀';const t0=t<5?3.8:28.4;const n=cl(0,txt.length,Math.floor((t-t0)*16));$('pcm').innerHTML=[...txt].slice(0,n).join('')+'<i></i>'}
 show('badge',t>=5.9&&t<7.1,pop(t,5.9));if(t>=5.9&&t<7.1){try{const cam=w.eval('cam'),v=new w.THREE.Vector3(162,8,-84).project(cam);$('badge').style.top=Math.round((-v.y*.5+.5)*1920-120)+'px'}catch(e){}}
 const cn=t>=12&&t<14?Math.round(177+600*ss(cl(0,1,(t-12)/1.2))):0;show('cnt',(t>=12&&t<14)||(t>=31&&t<35));
 $('cnt').firstChild.innerHTML=t<14?'ЖИТЕЛЕЙ: <b>'+cn+'</b>':'ЖИТЕЛЕЙ: <b>777</b> / 1000';
 $('flash').style.opacity=t>=13.2&&t<13.6?(1-(t-13.2)/.4)*.35:Math.abs(t-26)<.06?.4:0;
 show('plq',t>=20&&t<26);show('pause',t>=26&&t<28);show('cta',t>=28.4&&t<35);
 show('gold',false);
 return true};
window.END=END;

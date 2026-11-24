// Персонажи-фасолинки по образцу (stsenarii/razbor-ghost-army-stil.md §1, уточнено по крупным кадрам).
// Фирменное лицо: глаза + две тонкие линии буквой V от глаз к маленькому рту в вершине.
// drawHero(ctx, {type, face, t, wave, talk}) — холст 512×1280. type: 'us'|'de'|'fr'|'thief'; face: 'smug'|'happy'|'laugh'|'shock'|'worry'
(function(){
const K='#24161b';// обводка: очень тёмная, коричнево-бордовая
const PAL={us:{a:'#7d8d33',b:'#5c6a22',c:'#3f4a14',btn:'#2b2412',btnHollow:false},de:{a:'#666b5c',b:'#4c5044',c:'#33362d',btn:'#1d1f19'},fr:{a:'#4b8be0',b:'#2f6cc4',c:'#1f4f98',btn:'#1f4f98',btnHollow:true},thief:{a:'#33353c',b:'#202227',c:'#111215',btn:'#000'}};
window.drawHero=function(x,o){const W=512,H=1280;x.clearRect(0,0,W,H);x.lineJoin=x.lineCap='round';
 const P=PAL[o.type]||PAL.us,t=o.t||0,bob=Math.sin(t*4.2)*3;
 const HR=122,HX=256,HY=232+bob;
 const BW=HR*.8,BT=HY+HR*.72,BB=BT+HR*2*1.7;// тело-капсула: ширина 2*BW, от BT до BB
 const LW=8.5;
 // ноги
 const legTop=BB-24,legBot=H-14;x.strokeStyle='#4a3524';x.lineWidth=12;
 x.beginPath();x.moveTo(HX-BW*.42,legTop);x.lineTo(HX-BW*.48,legBot);x.moveTo(HX+BW*.42,legTop);x.lineTo(HX+BW*.48,legBot);x.stroke();
 // руки — тонкие, висят вдоль тела, снаружи
 x.strokeStyle='#3a2a1e';x.lineWidth=7.5;const ay=BT+HR*.2;
 const hand=(hx,hy)=>{x.fillStyle=K;x.beginPath();x.arc(hx,hy,11,0,7);x.fill()};
 x.beginPath();x.moveTo(HX-BW*1.0,ay);x.quadraticCurveTo(HX-BW*1.3,ay+(BB-BT)*.3,HX-BW*1.26,BT+(BB-BT)*.62);x.stroke();hand(HX-BW*1.26,BT+(BB-BT)*.62);
 if(o.wave){const k=Math.sin(t*12)*.25,ex=HX+BW*1.5+Math.cos(-1.2+k)*20,ey=ay-HR*1.0+Math.sin(t*12)*10;x.beginPath();x.moveTo(HX+BW*.98,ay);x.quadraticCurveTo(HX+BW*1.5,ay-HR*.2,ex,ey);x.stroke();hand(ex,ey)}
 else{x.beginPath();x.moveTo(HX+BW*1.0,ay);x.quadraticCurveTo(HX+BW*1.3,ay+(BB-BT)*.3,HX+BW*1.26,BT+(BB-BT)*.62);x.stroke();hand(HX+BW*1.26,BT+(BB-BT)*.62)}
 // тело — капсула с прямыми боками
 const body=()=>{x.beginPath();x.moveTo(HX-BW,BT+BW);x.arc(HX,BT+BW,BW,Math.PI,0);x.lineTo(HX+BW,BB-BW);x.arc(HX,BB-BW,BW,0,Math.PI);x.closePath()};
 const g=x.createLinearGradient(HX-BW,0,HX+BW,0);g.addColorStop(0,P.a);g.addColorStop(.6,P.b);g.addColorStop(1,P.c);x.fillStyle=g;body();x.fill();
 x.save();body();x.clip();const g2=x.createLinearGradient(0,BT,0,BB);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g2;x.fillRect(0,BT,W,BB-BT);x.restore();
 x.lineWidth=LW;x.strokeStyle=K;body();x.stroke();
 for(let i=0;i<5;i++){const by=BT+HR*.55+i*(BB-BT-HR*.9)/4.6;if(P.btnHollow){x.lineWidth=4;x.strokeStyle=P.btn;x.beginPath();x.arc(HX,by,8,0,7);x.stroke()}else{x.fillStyle=P.btn;x.beginPath();x.arc(HX,by,8,0,7);x.fill()}}
 // голова — кожа с тенью снизу
 const sk=x.createRadialGradient(HX-HR*.25,HY-HR*.35,HR*.1,HX,HY+HR*.1,HR*1.15);sk.addColorStop(0,'#f7e7d2');sk.addColorStop(.55,'#efd3b2');sk.addColorStop(1,'#d9a676');
 x.fillStyle=sk;x.beginPath();x.arc(HX,HY,HR,0,7);x.fill();x.lineWidth=LW;x.strokeStyle=K;x.stroke();
 // лицо: глаза, брови, V-линии, рот в вершине
 const f=o.face||'smug',eY=HY+HR*.2,eX=HR*.34,mY=HY+HR*.68,talk=o.talk?Math.abs(Math.sin(t*15)):0;
 x.strokeStyle=K;x.fillStyle=K;
 const V=(top)=>{x.lineWidth=3.5;x.beginPath();x.moveTo(HX-eX-6,top);x.lineTo(HX,mY-4);x.lineTo(HX+eX+6,top);x.stroke()};
 if(f==='smug'){x.lineWidth=6;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*eX-20,eY);x.lineTo(HX+s*eX+20,eY);x.stroke()}V(eY+6);
  if(talk>.35){x.fillStyle='#8a1f24';x.beginPath();x.arc(HX,mY+6,7+talk*6,0,7);x.fill();x.lineWidth=4;x.stroke()}else{x.lineWidth=5;x.beginPath();x.arc(HX,mY-2,12,.2,Math.PI-.2);x.stroke()}}
 if(f==='happy'){x.lineWidth=6;for(const s of[-1,1]){x.beginPath();x.arc(HX+s*eX,eY+8,17,Math.PI*1.15,Math.PI*1.85);x.stroke()}V(eY+4);x.lineWidth=5;x.beginPath();x.arc(HX,mY-4,14,.15,Math.PI-.15);x.stroke()}
 if(f==='laugh'){x.lineWidth=6;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*eX-s*18,eY-12);x.lineTo(HX+s*eX+s*2,eY);x.lineTo(HX+s*eX-s*18,eY+12);x.stroke()}V(eY+10);
  x.fillStyle='#7d1b20';x.beginPath();x.moveTo(HX-30,mY-12);x.lineTo(HX+30,mY-12);x.quadraticCurveTo(HX+28,mY+30,HX,mY+30);x.quadraticCurveTo(HX-28,mY+30,HX-30,mY-12);x.fill();x.lineWidth=5;x.stroke();
  x.fillStyle='#f08a96';x.beginPath();x.ellipse(HX,mY+18,16,8,0,0,7);x.fill()}
 if(f==='shock'||f==='worry'){const r=f==='shock'?HR*.21:HR*.13;for(const s of[-1,1]){x.fillStyle='#fff';x.beginPath();x.arc(HX+s*eX,eY,r,0,7);x.fill();x.lineWidth=6.5;x.stroke();x.fillStyle=K;x.beginPath();x.arc(HX+s*eX+(f==='worry'?s*-3:0),eY+2,r*.36,0,7);x.fill()}
  x.lineWidth=6;for(const s of[-1,1]){x.beginPath();if(f==='shock'){x.moveTo(HX+s*eX-16,eY-r-14);x.quadraticCurveTo(HX+s*eX,eY-r-22,HX+s*eX+16,eY-r-14)}else{x.moveTo(HX+s*eX-s*18,eY-r-6);x.lineTo(HX+s*eX+s*14,eY-r-18)}x.stroke()}
  if(f==='shock'){x.fillStyle='#8a1f24';x.beginPath();x.ellipse(HX,mY+4,17,24,0,0,7);x.fill();x.lineWidth=5;x.stroke();x.fillStyle='#e0606a';x.beginPath();x.ellipse(HX,mY+16,9,6,0,0,7);x.fill()}
  else{x.lineWidth=4;x.beginPath();for(let i=0;i<=4;i++){const px=HX-20+i*10,py=mY+(i%2?5:-3);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
   x.fillStyle='#a9dcff';x.beginPath();x.moveTo(HX+HR*.8,HY-HR*.2);x.quadraticCurveTo(HX+HR*.93,HY+HR*.08,HX+HR*.8,HY+HR*.12);x.quadraticCurveTo(HX+HR*.67,HY+HR*.08,HX+HR*.8,HY-HR*.2);x.fill();x.lineWidth=4;x.stroke()}}
 if(o.type==='fr'){x.fillStyle='#6a4020';x.strokeStyle=K;x.lineWidth=3;x.beginPath();x.moveTo(HX-40,mY-10);x.quadraticCurveTo(HX-20,mY-30,HX,mY-18);x.quadraticCurveTo(HX+20,mY-30,HX+40,mY-10);x.quadraticCurveTo(HX+20,mY-18,HX,mY-10);x.quadraticCurveTo(HX-20,mY-18,HX-40,mY-10);x.fill();x.stroke()}
 // головной убор
 x.lineWidth=LW;x.strokeStyle=K;
 if(o.type==='us'){const by=HY-HR*.1;
  const hg=x.createLinearGradient(0,HY-HR*1.05,0,by);hg.addColorStop(0,'#8c9b3f');hg.addColorStop(1,'#56641f');x.fillStyle=hg;
  x.beginPath();x.ellipse(HX,by,HR*.98,HR*.98,0,Math.PI,0);x.closePath();x.fill();x.stroke();
  x.fillStyle='#62702a';x.beginPath();x.ellipse(HX,by+4,HR*1.28,HR*.12,0,0,7);x.fill();x.stroke();
  x.lineWidth=4;x.beginPath();x.moveTo(HX-HR*.45,by-HR*.18);x.lineTo(HX-HR*.1,by-HR*.16);x.moveTo(HX+HR*.05,by-HR*.17);x.lineTo(HX+HR*.4,by-HR*.19);x.stroke()}
 if(o.type==='de'){const hg=x.createLinearGradient(0,HY-HR*1.1,0,HY);hg.addColorStop(0,'#6a705f');hg.addColorStop(1,'#3d4136');x.fillStyle=hg;
  x.beginPath();x.moveTo(HX-HR*1.16,HY+HR*.02);x.quadraticCurveTo(HX-HR*1.08,HY-HR*1.2,HX,HY-HR*1.16);x.quadraticCurveTo(HX+HR*1.08,HY-HR*1.2,HX+HR*1.16,HY+HR*.02);x.lineTo(HX+HR*.98,HY-HR*.16);x.lineTo(HX-HR*.98,HY-HR*.16);x.closePath();x.fill();x.stroke()}
 if(o.type==='fr'){x.fillStyle='#1e2440';x.beginPath();x.ellipse(HX+6,HY-HR*.74,HR*1.02,HR*.34,-.06,0,7);x.fill();x.stroke();x.lineWidth=7;x.beginPath();x.moveTo(HX+8,HY-HR*1.07);x.lineTo(HX+12,HY-HR*1.26);x.stroke()}
 if(o.type==='thief'){x.fillStyle='#15161a';x.beginPath();x.ellipse(HX,HY-HR*.5,HR*.98,HR*.58,0,Math.PI,0);x.closePath();x.fill();x.stroke();x.beginPath();x.ellipse(HX+HR*.5,HY-HR*.5,HR*.62,HR*.11,0,0,7);x.fill();x.stroke()}
};
})();

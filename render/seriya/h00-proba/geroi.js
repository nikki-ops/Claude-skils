// Персонажи-фасолинки по спецификации stsenarii/razbor-ghost-army-stil.md (§1).
// drawHero(ctx, {type, face, t, wave, talk}) рисует фигуру в холсте 512×1280 (голова сверху, ноги до низа).
// type: 'us' | 'de' | 'fr' | 'thief'; face: 'smug' | 'laugh' | 'shock' | 'worry' | 'neutral'
(function(){
const K='#141414';
const PAL={us:{body:'#6e7d2c',hi:'#86973a',lo:'#4f5c1c',btn:'#2e3612'},de:{body:'#5a6050',hi:'#6e7564',lo:'#3e4337',btn:'#22251e'},fr:{body:'#2f6fd0',hi:'#4f8ae6',lo:'#2050a0',btn:'#163a78'},thief:{body:'#1d1f24',hi:'#30333a',lo:'#0e0f12',btn:'#000'}};
function grad(x,cx,cy,r,c1,c2){const g=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r*1.05);g.addColorStop(0,c1);g.addColorStop(1,c2);return g}
window.drawHero=function(x,o){const W=512,Hh=1280;x.clearRect(0,0,W,Hh);x.lineJoin=x.lineCap='round';
 const P=PAL[o.type]||PAL.us,t=o.t||0,bob=Math.sin(t*4.2)*4;
 const HR=118,HX=256,HY=250+bob;// голова: диаметр 236
 const BW=HR*.82,BH=HR*2*1.85,BY=HY+HR*.8+BH/2;// тело
 const LW=HR*.035*2;// толщина обводки ≈3.5% диаметра
 // ноги
 x.strokeStyle='#3e3220';x.lineWidth=13;const legTop=BY+BH*.44,legBot=Hh-18;
 x.beginPath();x.moveTo(HX-BW*.38,legTop);x.lineTo(HX-BW*.62,legBot);x.moveTo(HX+BW*.38,legTop);x.lineTo(HX+BW*.62,legBot);x.stroke();
 // руки (за телом)
 x.strokeStyle=K;x.lineWidth=7;
 const arm=(s,up)=>{const sx=HX+s*BW*.95,sy=BY-BH*.32;x.beginPath();x.moveTo(sx,sy);let ex,ey;
  if(up){const a=-2.2+Math.sin(t*12)*.35;ex=sx+Math.cos(a+Math.PI/2)*0+s*60;ey=sy-150+Math.sin(t*12)*14;x.quadraticCurveTo(sx+s*50,sy-40,ex,ey)}else{ex=sx+s*22;ey=sy+BH*.42;x.quadraticCurveTo(sx+s*30,sy+BH*.2,ex,ey)}
  x.stroke();x.fillStyle=K;x.beginPath();x.arc(ex,ey,10,0,7);x.fill()};
 arm(-1,false);arm(1,!!o.wave);
 // тело
 x.fillStyle=(()=>{const g=x.createLinearGradient(HX-BW,0,HX+BW,0);g.addColorStop(0,P.hi);g.addColorStop(.55,P.body);g.addColorStop(1,P.lo);return g})();
 x.beginPath();x.ellipse(HX,BY,BW,BH/2,0,0,7);x.fill();x.lineWidth=LW;x.strokeStyle=K;x.stroke();
 x.fillStyle=P.btn;for(let i=0;i<5;i++){x.beginPath();x.arc(HX,BY-BH*.28+i*BH*.13,8,0,7);x.fill()}
 // голова
 x.fillStyle=grad(x,HX,HY,HR,'#fbeedd','#e9cfae');x.beginPath();x.arc(HX,HY,HR,0,7);x.fill();x.lineWidth=LW;x.stroke();
 // лицо
 const f=o.face||'smug',ey=HY+HR*.2,ex=HR*.36,talk=o.talk?Math.abs(Math.sin(t*14)):0;
 x.fillStyle=K;x.strokeStyle=K;
 const brow=(s,ang,dy=0)=>{x.lineWidth=9;x.beginPath();const bx=HX+s*ex,by=ey-HR*.3+dy;x.moveTo(bx-s*20*Math.cos(ang)-20,by+s*20*Math.sin(ang)*0+(s>0?-ang*20:ang*20));x.lineTo(bx+20,by+(s>0?ang*20:-ang*20));x.stroke()};
 if(f==='smug'||f==='neutral'){x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-17,ey);x.lineTo(HX+s*ex+17,ey);x.stroke()}
  x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-18,ey-30+(f==='smug'?(s>0?-4:4):0));x.lineTo(HX+s*ex+18,ey-30+(f==='smug'?(s>0?4:-4):0));x.stroke()}
  if(talk>.3){x.fillStyle='#7a1a1a';x.beginPath();x.ellipse(HX,ey+HR*.42,12,10+talk*10,0,0,7);x.fill();x.lineWidth=6;x.stroke()}
  else{x.lineWidth=7;x.beginPath();if(f==='smug'){x.moveTo(HX-26,ey+HR*.42);x.quadraticCurveTo(HX,ey+HR*.52,HX+28,ey+HR*.36)}else{x.moveTo(HX-18,ey+HR*.45);x.lineTo(HX+18,ey+HR*.45)}x.stroke()}}
 if(f==='laugh'){x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-18,ey+8);x.lineTo(HX+s*ex,ey-8);x.lineTo(HX+s*ex+18,ey+8);x.stroke()}
  x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-18,ey-32);x.quadraticCurveTo(HX+s*ex,ey-42,HX+s*ex+18,ey-32);x.stroke()}
  x.fillStyle='#7a1a1a';x.beginPath();x.moveTo(HX-40,ey+HR*.3);x.lineTo(HX+40,ey+HR*.3);x.quadraticCurveTo(HX+38,ey+HR*.72,HX,ey+HR*.72);x.quadraticCurveTo(HX-38,ey+HR*.72,HX-40,ey+HR*.3);x.fill();x.lineWidth=7;x.stroke();
  x.fillStyle='#e05a5a';x.beginPath();x.ellipse(HX,ey+HR*.62,20,9,0,0,7);x.fill()}
 if(f==='shock'){for(const s of[-1,1]){x.fillStyle='#fff';x.beginPath();x.arc(HX+s*ex,ey,HR*.2,0,7);x.fill();x.lineWidth=8;x.stroke();x.fillStyle=K;x.beginPath();x.arc(HX+s*ex,ey+3,HR*.075,0,7);x.fill()}
  x.lineWidth=9;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-20,ey-HR*.38);x.quadraticCurveTo(HX+s*ex,ey-HR*.48,HX+s*ex+20,ey-HR*.38);x.stroke()}
  x.fillStyle='#8a1c1c';x.beginPath();x.ellipse(HX,ey+HR*.5,18,24,0,0,7);x.fill();x.lineWidth=7;x.stroke();x.fillStyle='#e05a5a';x.beginPath();x.ellipse(HX,ey+HR*.58,10,6,0,0,7);x.fill()}
 if(f==='worry'){x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(HX+s*ex-16,ey+2);x.lineTo(HX+s*ex+16,ey+2);x.stroke();x.beginPath();x.moveTo(HX+s*ex-s*20,ey-26);x.lineTo(HX+s*ex+s*18,ey-38);x.stroke()}
  x.lineWidth=6;x.beginPath();for(let i=0;i<=4;i++){const px=HX-28+i*14,py=ey+HR*.45+(i%2?6:-6);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
  x.fillStyle='#9fd8ff';x.beginPath();x.moveTo(HX+HR*.78,HY-HR*.3);x.quadraticCurveTo(HX+HR*.92,HY,HX+HR*.78,HY+6);x.quadraticCurveTo(HX+HR*.64,HY,HX+HR*.78,HY-HR*.3);x.fill();x.lineWidth=5;x.stroke()}
 if(o.type==='fr'){x.lineWidth=6;x.beginPath();for(let i=0;i<=6;i++){const px=HX-30+i*10,py=ey+HR*.3+(i%2?5:-3);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
 // головной убор
 x.lineWidth=LW;x.strokeStyle=K;
 if(o.type==='us'){const by=HY-HR*.12;// поля на ~40% головы
  x.fillStyle=(()=>{const g=x.createLinearGradient(0,HY-HR*1.05,0,by);g.addColorStop(0,'#8a9a3e');g.addColorStop(1,'#5d6b22');return g})();
  x.beginPath();x.ellipse(HX,by,HR*1.02,HR*.95,0,Math.PI,0);x.closePath();x.fill();x.stroke();
  x.fillStyle='#6b7a2e';x.beginPath();x.ellipse(HX,by+2,HR*1.3,HR*.13,0,0,7);x.fill();x.stroke();
  x.fillStyle='rgba(255,255,220,.22)';x.beginPath();x.ellipse(HX-HR*.35,by-HR*.6,HR*.3,HR*.1,-.35,0,7);x.fill()}
 if(o.type==='de'){x.fillStyle=(()=>{const g=x.createLinearGradient(0,HY-HR,0,HY);g.addColorStop(0,'#5f6656');g.addColorStop(1,'#3c4136');return g})();
  x.beginPath();x.moveTo(HX-HR*1.12,HY+HR*.05);x.quadraticCurveTo(HX-HR*1.1,HY-HR*1.15,HX,HY-HR*1.12);x.quadraticCurveTo(HX+HR*1.1,HY-HR*1.15,HX+HR*1.12,HY+HR*.05);x.lineTo(HX+HR*.95,HY-HR*.12);x.lineTo(HX-HR*.95,HY-HR*.12);x.closePath();x.fill();x.stroke()}
 if(o.type==='fr'){x.fillStyle='#16161a';x.beginPath();x.ellipse(HX+8,HY-HR*.78,HR*.95,HR*.32,-.08,0,7);x.fill();x.stroke();x.lineWidth=8;x.beginPath();x.moveTo(HX+10,HY-HR*1.08);x.lineTo(HX+18,HY-HR*1.25);x.stroke()}
 if(o.type==='thief'){x.fillStyle='#16161a';x.beginPath();x.ellipse(HX,HY-HR*.55,HR*.98,HR*.55,0,Math.PI,0);x.closePath();x.fill();x.stroke();x.beginPath();x.ellipse(HX+HR*.45,HY-HR*.55,HR*.65,HR*.1,0,0,7);x.fill();x.stroke()}
};
})();

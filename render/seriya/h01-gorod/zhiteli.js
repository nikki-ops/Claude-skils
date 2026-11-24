// Жители города подписчиков — фасолинки (стиль C), лицо №2: большие глаза с бликом.
// drawCitizen(ctx, {nick, t, mood, wave, talk}) рисует фигуру в холсте 512×1280.
// Вид (цвет одежды, кожа, причёска, аксессуар) детерминированно выводится из ника — один подписчик всегда выглядит одинаково.
// mood: 'smile' | 'laugh' | 'shock' | 'sly' ; look: override {body, skin, hair, hairColor, acc}
(function(){
const K='#1f1414';
const BODY=[['#e85a4f','#b8342c'],['#4f8fe8','#2c5fb8'],['#5fbf5a','#358a32'],['#f2b23a','#c4801a'],['#9b6ae0','#6a3cb0'],['#2fbfb0','#1a8a80'],['#f07ab0','#c04a80'],['#7a8794','#4e5a66'],['#3a3f4a','#1e2128'],['#f2efe6','#c9c2b0']];
const SKIN=[['#fbe3c8','#e7a466'],['#f6d2b0','#d9894a'],['#e8b48a','#b8703e'],['#c98a5c','#8e5530'],['#9a6440','#653a20']];
const HAIRC=['#2a1a12','#5a3420','#8a5a2a','#d8a24a','#e8d8b0','#b8402a','#1a1a1a'];
const HAIR=['short','bangs','spiky','bun','long','curly','bald','cap','beanie'];
const ACC=['none','none','none','glasses','none','headphones','none','scarf'];
const hash=(s)=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.codePointAt(0),16777619);return h>>>0};
window.citizenLook=function(nick){const h=hash(nick),r=(n,k)=>((h>>>k)%n);
 return {body:BODY[r(BODY.length,0)],skin:SKIN[r(SKIN.length,5)],hair:HAIR[r(HAIR.length,9)],hairColor:HAIRC[r(HAIRC.length,14)],acc:ACC[r(ACC.length,19)],capColor:BODY[r(BODY.length,23)][0]}};
window.drawCitizen=function(x,o){const W=512,H=1280;x.clearRect(0,0,W,H);x.lineJoin=x.lineCap='round';
 const L={...citizenLook(o.nick||'?'),...(o.look||{})},t=o.t||0,bob=Math.sin(t*4.2)*3;
 const HR=122,HX=256,HY=250+bob,BW=HR*.86,BT=HY+HR*.7,BB=BT+HR*2*1.55,LW=12;
 // ноги
 x.strokeStyle='#3e2e22';x.lineWidth=13;x.beginPath();x.moveTo(HX-BW*.38,BB-24);x.lineTo(HX-BW*.46,H-14);x.moveTo(HX+BW*.38,BB-24);x.lineTo(HX+BW*.46,H-14);x.stroke();
 x.strokeStyle=K;x.lineWidth=16;x.beginPath();x.moveTo(HX-BW*.46,H-14);x.lineTo(HX-BW*.46-26,H-12);x.moveTo(HX+BW*.46,H-14);x.lineTo(HX+BW*.46+26,H-12);x.stroke();
 // руки
 x.strokeStyle='#3a2a1e';x.lineWidth=8;const ay=BT+HR*.25,hand=(hx,hy)=>{x.fillStyle=K;x.beginPath();x.arc(hx,hy,12,0,7);x.fill()};
 x.beginPath();x.moveTo(HX-BW,ay);x.quadraticCurveTo(HX-BW*1.3,ay+(BB-BT)*.3,HX-BW*1.26,BT+(BB-BT)*.6);x.stroke();hand(HX-BW*1.26,BT+(BB-BT)*.6);
 if(o.wave){const ex=HX+BW*1.55,ey=ay-HR*1.05+Math.sin(t*12)*12;x.beginPath();x.moveTo(HX+BW,ay);x.quadraticCurveTo(HX+BW*1.5,ay-HR*.2,ex,ey);x.stroke();hand(ex,ey)}
 else{x.beginPath();x.moveTo(HX+BW,ay);x.quadraticCurveTo(HX+BW*1.3,ay+(BB-BT)*.3,HX+BW*1.26,BT+(BB-BT)*.6);x.stroke();hand(HX+BW*1.26,BT+(BB-BT)*.6)}
 // тело-яйцо (одежда)
 const body=()=>{const H2=BB-BT,cy=BT+H2*.5;x.beginPath();x.moveTo(HX,BT);x.bezierCurveTo(HX+BW*.95,BT,HX+BW*1.06,cy-H2*.15,HX+BW*1.04,cy+H2*.12);x.bezierCurveTo(HX+BW*1.02,BB-H2*.08,HX+BW*.6,BB,HX,BB);x.bezierCurveTo(HX-BW*.6,BB,HX-BW*1.02,BB-H2*.08,HX-BW*1.04,cy+H2*.12);x.bezierCurveTo(HX-BW*1.06,cy-H2*.15,HX-BW*.95,BT,HX,BT);x.closePath()};
 const g=x.createLinearGradient(HX-BW,0,HX+BW,0);g.addColorStop(0,L.body[0]);g.addColorStop(.65,L.body[0]);g.addColorStop(1,L.body[1]);x.fillStyle=g;body();x.fill();
 x.save();body();x.clip();x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.ellipse(HX-BW*.45,BT+HR*.9,BW*.18,HR*.7,0,0,7);x.fill();x.restore();
 x.lineWidth=LW;x.strokeStyle=K;body();x.stroke();
 if(L.acc==='scarf'){x.fillStyle='#e8402a';x.beginPath();x.ellipse(HX,BT+14,BW*.95,26,0,0,7);x.fill();x.lineWidth=7;x.stroke();x.fillRect(HX+BW*.3,BT+20,34,90);x.strokeRect(HX+BW*.3,BT+20,34,90)}
 // голова
 const sk=x.createRadialGradient(HX-HR*.25,HY-HR*.35,HR*.1,HX,HY+HR*.1,HR*1.15);sk.addColorStop(0,L.skin[0]);sk.addColorStop(1,L.skin[1]);
 x.fillStyle=sk;x.beginPath();x.arc(HX,HY,HR,0,7);x.fill();x.lineWidth=LW;x.stroke();
 // лицо №2
 const eY=HY+HR*.02,eX=HR*.38,mY=HY+HR*.5,m=o.mood||'smile',talk=o.talk?Math.abs(Math.sin(t*15)):0;
 const eyes=(rx,ry,pup)=>{[-1,1].forEach(s=>{x.fillStyle='#fff';x.beginPath();x.ellipse(HX+s*eX,eY,rx,ry,0,0,7);x.fill();x.lineWidth=7;x.strokeStyle=K;x.stroke();x.fillStyle=K;x.beginPath();x.arc(HX+s*eX+4,eY+ry*.22,pup,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(HX+s*eX+pup*.75,eY-ry*.05,pup*.38,0,7);x.fill()})};
 x.strokeStyle=K;
 if(m==='smile'){eyes(25,31,14);if(talk>.35){x.fillStyle='#7d1b20';x.beginPath();x.ellipse(HX,mY+4,16,8+talk*12,0,0,7);x.fill();x.lineWidth=6;x.stroke()}else{x.lineWidth=8;x.beginPath();x.arc(HX,mY-22,24,.3,Math.PI-.3);x.stroke()}}
 if(m==='laugh'){[-1,1].forEach(s=>{x.lineWidth=8;x.beginPath();x.arc(HX+s*eX,eY+10,20,Math.PI*1.1,Math.PI*1.9);x.stroke()});x.fillStyle='#7d1b20';x.beginPath();x.moveTo(HX-40,mY-24);x.lineTo(HX+40,mY-24);x.quadraticCurveTo(HX+36,mY+22,HX,mY+22);x.quadraticCurveTo(HX-36,mY+22,HX-40,mY-24);x.fill();x.lineWidth=7;x.stroke();x.fillStyle='#fff';x.fillRect(HX-30,mY-24,60,11);x.fillStyle='#f08a96';x.beginPath();x.ellipse(HX,mY+10,18,8,0,0,7);x.fill()}
 if(m==='shock'){eyes(30,36,10);x.fillStyle='#7d1b20';x.beginPath();x.ellipse(HX,mY,16,22,0,0,7);x.fill();x.lineWidth=7;x.stroke()}
 if(m==='sly'){eyes(25,20,12);x.lineWidth=10;[-1,1].forEach(s=>{x.beginPath();x.moveTo(HX+s*eX-26,eY-10);x.lineTo(HX+s*eX+26,eY-10);x.stroke()});x.lineWidth=8;x.beginPath();x.moveTo(HX-26,mY-10);x.quadraticCurveTo(HX+6,mY+6,HX+30,mY-24);x.stroke()}
 // аксессуары лица
 if(L.acc==='glasses'){x.lineWidth=7;x.strokeStyle=K;[-1,1].forEach(s=>{x.beginPath();x.arc(HX+s*eX,eY,36,0,7);x.stroke()});x.beginPath();x.moveTo(HX-eX+36,eY);x.lineTo(HX+eX-36,eY);x.stroke()}
 // причёска / головной убор
 const hc=L.hairColor;x.fillStyle=hc;x.strokeStyle=K;x.lineWidth=LW;
 const cap=(top)=>{x.beginPath();x.arc(HX,HY,HR+2,Math.PI*1.08,Math.PI*1.92);x.quadraticCurveTo(HX,HY-HR*top,HX-HR*.93,HY-HR*.38);x.closePath();x.fill();x.stroke()};
 if(L.hair==='short')cap(.55);
 if(L.hair==='bangs'){cap(.3);x.beginPath();x.moveTo(HX-HR*.7,HY-HR*.55);x.quadraticCurveTo(HX-HR*.2,HY-HR*.2,HX+HR*.4,HY-HR*.45);x.quadraticCurveTo(HX+HR*.1,HY-HR*.75,HX-HR*.7,HY-HR*.55);x.fill();x.lineWidth=7;x.stroke()}
 if(L.hair==='spiky'){x.beginPath();x.moveTo(HX-HR*.95,HY-HR*.3);for(let k=0;k<=6;k++){const a=Math.PI*(1.05+k*.15);x.lineTo(HX+Math.cos(a)*HR*1.38,HY+Math.sin(a)*HR*1.38);x.lineTo(HX+Math.cos(a+.075)*HR*.9,HY+Math.sin(a+.075)*HR*.9)}x.lineTo(HX+HR*.95,HY-HR*.3);x.closePath();x.fill();x.stroke()}
 if(L.hair==='bun'){cap(.45);x.beginPath();x.arc(HX,HY-HR*1.12,HR*.32,0,7);x.fill();x.stroke()}
 if(L.hair==='long'){x.beginPath();x.moveTo(HX-HR*1.05,HY+HR*.9);x.lineTo(HX-HR*1.1,HY-HR*.2);x.arc(HX,HY-HR*.1,HR*1.1,Math.PI,0);x.lineTo(HX+HR*1.05,HY+HR*.9);x.lineTo(HX+HR*.75,HY+HR*.9);x.lineTo(HX+HR*.8,HY-HR*.25);x.quadraticCurveTo(HX,HY-HR*.7,HX-HR*.8,HY-HR*.25);x.lineTo(HX-HR*.75,HY+HR*.9);x.closePath();x.fill();x.stroke()}
 if(L.hair==='curly'){for(let k=0;k<9;k++){const a=Math.PI*(1.0+k*.125);x.beginPath();x.arc(HX+Math.cos(a)*HR*.95,HY+Math.sin(a)*HR*.95,HR*.3,0,7);x.fill();x.lineWidth=7;x.stroke()}}
 if(L.hair==='cap'){x.fillStyle=L.capColor;x.beginPath();x.arc(HX,HY-HR*.18,HR*1.0,Math.PI,0);x.closePath();x.fill();x.stroke();x.beginPath();x.ellipse(HX+HR*.75,HY-HR*.2,HR*.62,HR*.13,-.08,0,7);x.fill();x.stroke()}
 if(L.hair==='hardhat'){const by=HY-HR*.36,hg=x.createLinearGradient(0,HY-HR*1.25,0,by);hg.addColorStop(0,'#ffb43a');hg.addColorStop(1,'#e8801a');x.fillStyle=hg;x.beginPath();x.ellipse(HX,by,HR*1.02,HR*.9,0,Math.PI,0);x.closePath();x.fill();x.stroke();x.fillStyle='#d8701a';x.beginPath();x.ellipse(HX,by+4,HR*1.25,HR*.11,0,0,7);x.fill();x.stroke();x.lineWidth=9;x.beginPath();x.moveTo(HX,by-HR*.88);x.lineTo(HX,by-HR*.1);x.stroke();x.fillStyle='rgba(255,255,230,.35)';x.beginPath();x.ellipse(HX-HR*.4,by-HR*.55,HR*.22,HR*.08,-.5,0,7);x.fill()}
 if(L.hair==='beanie'){x.fillStyle=L.capColor;x.beginPath();x.arc(HX,HY-HR*.2,HR*1.02,Math.PI,0);x.closePath();x.fill();x.stroke();x.fillRect(HX-HR*1.04,HY-HR*.34,HR*2.08,HR*.26);x.strokeRect(HX-HR*1.04,HY-HR*.34,HR*2.08,HR*.26);x.beginPath();x.arc(HX,HY-HR*1.26,HR*.2,0,7);x.fill();x.stroke()}
 if(L.acc==='headphones'){x.strokeStyle=K;x.lineWidth=16;x.beginPath();x.arc(HX,HY-HR*.1,HR*1.12,Math.PI*1.05,Math.PI*1.95);x.stroke();x.fillStyle='#2a2a30';[-1,1].forEach(s=>{x.beginPath();x.ellipse(HX+s*HR*1.02,HY+HR*.05,HR*.2,HR*.32,0,0,7);x.fill();x.lineWidth=7;x.stroke()})}
};
})();

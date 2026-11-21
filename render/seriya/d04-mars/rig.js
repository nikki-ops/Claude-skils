// «Один на Марсе» — риг персонажей (скелет, позы, мимика) и предметы. Рисует в текущих координатах canvas (x — контекст из prim.js).
// Позы — объекты чисел; lerpPose() плавно смешивает; KF() — ключевые кадры по времени.
const OL='#1b1426',RSK='#f1c39a',RSK2='#d9a47c',RHA='#3a2418',RHA2='#2a180e',RSC='#ea7a2c',RSD='#c45a18',RSL='#f59a52';
const rot=(x0,y0,a,l)=>[x0+Math.sin(a)*l,y0+Math.cos(a)*l];// a=0 — вниз
function seg2(x1,y1,x2,y2,w,c,c2){x.lineCap='round';x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.strokeStyle=OL;x.lineWidth=w+9;x.stroke();x.strokeStyle=c;x.lineWidth=w;x.stroke();
 if(c2){x.save();x.beginPath();x.moveTo(x1+w*.22,y1);x.lineTo(x2+w*.22,y2);x.strokeStyle=c2;x.lineWidth=w*.35;x.globalAlpha=.55;x.stroke();x.restore()}}
const ez=u=>u<0?0:u>1?1:u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
function lerpPose(a,b,u){u=ez(u);const o={};for(const k in a){const va=a[k],vb=b[k]===undefined?va:b[k];o[k]=(typeof va==='number'&&typeof vb==='number')?va+(vb-va)*u:(u<.5?va:vb)}for(const k in b)if(!(k in o))o[k]=b[k];return o}
function KF(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const [t0,p0]=keys[i-1],[t1,p1]=keys[i];return lerpPose(p0,p1,(t-t0)/Math.max(.001,t1-t0))}return keys[keys.length-1][1]}
// ---------- ГЕРОЙ (вид спереди) ----------
// поза: x,y (точка таза), s (масштаб), torso (наклон, рад), head (наклон головы), look (-1..1 зрачки), sit (0..1),
// shL,elL,shR,elR (углы плеча от вертикали и сгиба локтя), hipL,knL,hipR,knR, brow(-1 грусть..1 злость), eye(0..1 открыты), mouth('smile','flat','o','sad','sip','talk'), blink(bool авто)
const HERO0={x:0,y:0,s:1,torso:0,head:0,look:0,sit:0,shL:.12,elL:.1,shR:-.12,elR:-.1,hipL:.05,knL:0,hipR:-.05,knR:0,brow:0,eye:1,mouth:'smile',blink:1,breath:1};
function heroRig(P,o){o=o||{};const p=Object.assign({},HERO0,P);x.save();x.translate(p.x,p.y);x.scale(p.s,p.s);
 const br=p.breath?Math.sin(TT*2.2+p.x*.01)*.012:0;
 // ноги
 const legs=(sx,hip,kn)=>{const hx=sx*30,thigh=p.sit?82*(1-p.sit*.62):82;const [kx,ky]=rot(hx,0,hip,thigh);const [fx,fy]=rot(kx,ky,hip+kn,78);
  seg2(hx,0,kx,ky,40,RSD,null);seg2(kx,ky,fx,fy,36,RSD,null);x.beginPath();x.ellipse(fx+sx*8,fy+8,26,14,0,0,7);x.fillStyle='#3a3a46';x.fill();x.strokeStyle=OL;x.lineWidth=5;x.stroke();
  rr(fx-18,fy-10,36,10,3,'#e8ecf0')};
 legs(-1,p.hipL,p.knL);legs(1,p.hipR,p.knR);
 x.save();x.rotate(p.torso);x.scale(1,1+br);
 // спина руки (левая за телом не нужна — вид спереди)
 const S=[0,-196];const shoulder=sx=>[sx*66,-182];
 const arm=(sx,sh,el,front)=>{const [ax,ay]=shoulder(sx);const [ex,ey]=rot(ax,ay,sh,86);const [hx,hy]=rot(ex,ey,sh+el,78);seg2(ax,ay,ex,ey,34,RSC,RSL);seg2(ex,ey,hx,hy,30,RSC,RSL);rr(hx-17+Math.sin(sh+el)*-4,hy-16,34,12,4,'#e8ecf0',OL,3);
  circ(hx+Math.sin(sh+el)*14,hy+Math.cos(sh+el)*14,17,RSK,OL,4);return [hx+Math.sin(sh+el)*16,hy+Math.cos(sh+el)*16]};
 // торс
 x.beginPath();x.moveTo(-72,-196);x.quadraticCurveTo(-82,-90,-58,4);x.lineTo(58,4);x.quadraticCurveTo(82,-90,72,-196);x.quadraticCurveTo(0,-214,-72,-196);x.fillStyle=RSC;x.fill();x.strokeStyle=OL;x.lineWidth=7;x.stroke();
 x.save();x.clip();x.fillStyle=RSD;x.fillRect(28,-220,70,240);x.restore();
 rr(-60,-70,120,18,4,'#4a3a2e',OL,4);rr(-14,-72,28,22,4,'#c8a040',OL,3);// ремень
 rr(-50,-160,36,30,6,RSD,OL,3);line(-46,-150,-18,-150,OL,2);// карман
 circ(36,-150,15,'#2a5ab8',OL,3);txt('M',36,-149,14,'#fff');// нашивка
 poly([[-30,-196],[0,-164],[30,-196]],'#e8ecf0',OL,4);line(0,-164,0,-80,RSD,4);// воротник, молния
 // голова
 x.save();x.translate(0,-200);x.rotate(p.head);rr(-16,-26,32,30,8,RSK2);
 x.translate(0,-80);const hy=0;
 circ(-62,4,14,RSK,OL,4);circ(62,4,14,RSK,OL,4);// уши
 circ(0,0,64,RSK,OL,6);x.save();x.beginPath();x.arc(0,0,64,0,7);x.clip();x.fillStyle='rgba(200,120,80,.18)';x.fillRect(16,-70,60,140);x.restore();
 // волосы
 x.beginPath();x.moveTo(-66,6);x.quadraticCurveTo(-72,-58,-20,-70);x.quadraticCurveTo(30,-82,62,-40);x.quadraticCurveTo(72,-10,66,6);x.quadraticCurveTo(52,-30,30,-34);x.quadraticCurveTo(10,-14,-8,-36);x.quadraticCurveTo(-30,-22,-50,-28);x.quadraticCurveTo(-60,-10,-66,6);x.fillStyle=RHA;x.fill();x.strokeStyle=OL;x.lineWidth=5;x.stroke();
 line(-20,-60,-6,-44,RHA2,4);line(20,-66,30,-46,RHA2,4);
 // брови
 const b=p.brow;line(-40,-26+b*4,-14,-30-b*6,RHA2,7);line(40,-26+b*4,14,-30-b*6,RHA2,7);
 // глаза
 const bl=p.blink&&((TT+p.x*.0007)%3.6)<.12,eo=bl?0:p.eye;[-22,22].forEach(ex=>{if(eo<.15){line(ex-11,-6,ex+11,-6,OL,5);return}x.beginPath();x.ellipse(ex,-6,12,14*eo,0,0,7);x.fillStyle='#fff';x.fill();x.strokeStyle=OL;x.lineWidth=4;x.stroke();
  circ(ex+p.look*5,-5,7*Math.min(1,eo+.3),'#2a1a10');circ(ex+p.look*5-2.5,-8,2.5,'#fff')});
 line(0,4,4,16,'rgba(150,90,60,.8)',4);// нос
 circ(-36,14,9,'rgba(240,120,110,.3)');circ(36,14,9,'rgba(240,120,110,.3)');
 const m=p.mouth;x.lineCap='round';x.strokeStyle='#6a2a1a';x.lineWidth=5;x.beginPath();
 if(m==='o'){x.ellipse(0,32,9,12,0,0,7);x.fillStyle='#5a1a1a';x.fill()}else if(m==='sad'){x.arc(0,44,16,1.2*Math.PI,1.8*Math.PI);x.stroke()}else if(m==='flat'){x.moveTo(-14,32);x.lineTo(14,32);x.stroke()}
 else if(m==='talk'){x.ellipse(0,32,12,3+Math.abs(Math.sin(TT*13))*8,0,0,7);x.fillStyle='#5a1a1a';x.fill()}else if(m==='sip'){x.ellipse(0,32,7,6,0,0,7);x.fillStyle='#5a1a1a';x.fill()}else{x.arc(0,22,18,.18*Math.PI,.82*Math.PI);x.stroke()}
 if(p.tear){const q=(TT*.7)%1;circ(-28,6+q*40,5,'#9fd4ff')}
 x.restore();
 const handL=arm(-1,p.shL,p.elL),handR=arm(1,p.shR,p.elR);
 x.restore();x.restore();
 // мировые координаты кистей (для предметов)
 const W2=([hx,hy])=>{const c=Math.cos(p.torso),s2=Math.sin(p.torso);return [p.x+(hx*c-hy*s2)*p.s,p.y+(hx*s2+hy*c)*p.s*(1+br)]};return {hL:W2(handL),hR:W2(handR)}}
// ---------- ГЕРОЙ (вид со спины) ----------
function heroBack(P){const p=Object.assign({},HERO0,P);x.save();x.translate(p.x,p.y);x.scale(p.s,p.s);x.rotate(p.torso||0);
 x.beginPath();x.moveTo(-72,-196);x.quadraticCurveTo(-82,-90,-58,4);x.lineTo(58,4);x.quadraticCurveTo(82,-90,72,-196);x.quadraticCurveTo(0,-214,-72,-196);x.fillStyle=RSD;x.fill();x.strokeStyle=OL;x.lineWidth=7;x.stroke();
 rr(-60,-70,120,18,4,'#4a3a2e',OL,4);rr(-34,-170,68,60,10,'#e8ecf0',OL,4);txt('MARS',0,-140,20,RSD);
 [-1,1].forEach(sx=>{const [ex,ey]=rot(sx*66,-182,sx*(p.armOut||.25),86);const [hx,hy]=rot(ex,ey,sx*(p.armOut||.25)+sx*(p.elb||.4),70);seg2(sx*66,-182,ex,ey,34,RSD,null);seg2(ex,ey,hx,hy,30,RSD,null)});
 x.save();x.translate(0,-200);x.rotate(p.head||0);rr(-16,-26,32,30,8,RSK2);circ(-62,-76,14,RSK,OL,4);circ(62,-76,14,RSK,OL,4);circ(0,-80,64,RHA,OL,6);line(-30,-120,-10,-40,RHA2,5);line(24,-124,30,-44,RHA2,5);x.restore();x.restore()}
// ---------- КЛЮЧ (риг) ----------
// поза: x,y (центр низа гусениц), s, drive (сдвиг гусениц), lean, low (0..1 «присел»), shL,elL,shR,elR, grip (0 закрыт..1 открыт), face('smile','calm','talk','sad','blank'), look
const KL0={x:0,y:0,s:1,drive:0,lean:0,low:0,shL:.3,elL:.3,shR:-.3,elR:-.3,grip:.5,face:'smile',look:0};
function kluchRig(P){const p=Object.assign({},KL0,P);x.save();x.translate(p.x,p.y);x.scale(p.s,p.s);
 // гусеницы
 rr(-130,-76,260,76,38,'#2a2622',OL,7);for(let i=0;i<12;i++){const tx=-118+((i*22+p.drive*60)%260+260)%260;rr(tx,-8,12,10,2,'#5a5450')}
 [-86,-30,30,86].forEach(c=>{circ(c,-38,24,'#5a5450',OL,4);x.save();x.translate(c,-38);x.rotate(p.drive*2);line(-16,0,16,0,'#3a3430',5);line(0,-16,0,16,'#3a3430',5);x.restore()});
 x.save();x.translate(0,-76+p.low*30);x.rotate(p.lean);
 // корпус
 rr(-112,-196,224,200,22,'#b0582e',OL,7);rr(-112,-196,40,200,12,'#c8703e');rr(-88,-110,176,64,10,'#3a2a20',OL,4);[-54,-14,26].forEach((c,i)=>{const on=Math.sin(TT*(2+i)+i)>0;rr(c,-182,28,28,6,i==2?(on?'#ff5a3a':'#7a2a1a'):(on?'#ffd84a':'#7a6a2a'),OL,3)});
 for(let i=0;i<6;i++)line(-76+i*30,-96,-76+i*30,-60,'#5a4a3a',4);
 // руки
 const arm=(sx,sh,el)=>{const ax=sx*116,ay=-160;const [ex,ey]=rot(ax,ay,sh,80);const [hx,hy]=rot(ex,ey,sh+el,74);seg2(ax,ay,ex,ey,26,'#c86a3a','#e8905a');seg2(ex,ey,hx,hy,22,'#c86a3a','#e8905a');circ(ex,ey,14,'#7a7e86',OL,4);
  const a=sh+el,g=p.grip*.6+.15;x.save();x.translate(hx,hy);x.rotate(-a);line(-4,0,-14-g*18,26,'#7a7e86',9);line(4,0,14+g*18,26,'#7a7e86',9);x.restore();return rot(hx,hy,a,26)};
 const gL=arm(-1,p.shL,p.elL),gR=arm(1,p.shR,p.elR);
 // шея и голова-экран
 rr(-14,-246,28,54,6,'#2a2622',OL,4);x.save();x.translate(0,-246);x.rotate(Math.sin(TT*1.7+p.x*.01)*.04);
 rr(-124,-176,248,176,24,'#5a5e66',OL,7);const g=x.createRadialGradient(0,-88,10,0,-88,150);g.addColorStop(0,'#9ff8ff');g.addColorStop(1,'#1a8fd0');rr(-104,-158,208,140,16,p.face==='blank'?'#101a24':g);
 x.save();x.shadowColor='#7ff3ff';x.shadowBlur=p.face==='blank'?0:30;rr(-104,-158,208,140,16,'rgba(127,243,255,.08)');x.restore();
 if(p.face!=='blank'){const bl=((TT+.9)%3.1)<.12,ex=p.look*12;if(bl){line(-52+ex,-96,-24+ex,-96,'#0b2a44',8);line(24+ex,-96,52+ex,-96,'#0b2a44',8)}else{circ(-38+ex,-96,15,'#0b2a44');circ(38+ex,-96,15,'#0b2a44');circ(-42+ex,-101,4,'#bff');circ(34+ex,-101,4,'#bff')}
  x.beginPath();if(p.face==='talk'){x.ellipse(0,-56,26,4+Math.abs(Math.sin(TT*14))*14,0,0,7);x.fillStyle='#0b2a44';x.fill()}else if(p.face==='sad'){x.arc(0,-40,24,1.2*Math.PI,1.8*Math.PI);x.strokeStyle='#0b2a44';x.lineWidth=8;x.stroke()}
  else if(p.face==='calm'){x.moveTo(-20,-58);x.lineTo(20,-58);x.strokeStyle='#0b2a44';x.lineWidth=8;x.stroke()}else{x.arc(0,-70,30,.2*Math.PI,.8*Math.PI);x.strokeStyle='#0b2a44';x.lineWidth=8;x.stroke()}}
 x.save();x.globalAlpha=.92;poly([[24,-158],[104,-158],[104,-40],[64,-90],[36,-128]],'#1a2230');line(24,-158,64,-90,'#9fd4ff',4);line(64,-90,44,-50,'#9fd4ff',4);x.restore();// трещина экрана
 x.save();x.translate(64,-176);x.rotate(Math.sin(TT*3+p.drive)*.25);line(0,0,0,-80,'#9aa3ad',8);circ(0,-98,18,null,'#e8b84a',9);line(0,-80,0,-40,'#e8b84a',7);x.restore();
 x.restore();x.restore();x.restore();
 const W2=([hx,hy])=>{const c=Math.cos(p.lean),s2=Math.sin(p.lean);const lx=hx*c-hy*s2,ly=hx*s2+hy*c;return [p.x+lx*p.s,p.y+(-76+p.low*30)*p.s+ly*p.s]};return {gL:W2(gL),gR:W2(gR)}}
// ---------- предметы ----------
function mug(X,Y,s,steam){x.save();x.translate(X,Y);x.scale(s,s);rr(-26,-56,52,60,10,'#f4f6f8',OL,5);rr(-26,-40,52,10,0,'#d8283a');x.beginPath();x.arc(30,-28,14,-1.2,1.2);x.strokeStyle=OL;x.lineWidth=12;x.stroke();x.strokeStyle='#f4f6f8';x.lineWidth=5;x.stroke();
 if(steam)for(let i=0;i<3;i++){const q=(TT*.6+i/3)%1;x.globalAlpha=.6*(1-q);x.beginPath();x.moveTo(-10+i*10,-62-q*70);x.bezierCurveTo(-24+i*10,-80-q*70,6+i*10,-96-q*70,-10+i*10,-112-q*70);x.strokeStyle='#fff';x.lineWidth=5;x.stroke();x.globalAlpha=1}x.restore()}
function tablet(X,Y,s,rows){x.save();x.translate(X,Y);x.scale(s,s);rr(-90,-120,180,130,12,'#1a1f2a',OL,5);rr(-80,-110,160,110,6,'#0e2a3a');x.font="900 18px 'Courier New',monospace";x.textAlign='left';
 (rows||[]).forEach((r,i)=>{x.fillStyle=r[1];x.fillText(r[0],-72,-86+i*24)});x.restore()}

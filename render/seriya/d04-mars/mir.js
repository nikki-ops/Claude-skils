// «Один на Марсе» (d04) — мир и герои, 16:9 (1920×1080). Базовые примитивы и Ключ — из k02-kosmodrom/prim.js.
// Подключать после prim.js. Все функции рисуют в координатах кадра 1920×1080 (OFF=0).
const SK='#f2c9a0',SUIT='#f08a2a',SUITD='#c8641a',GLASS='#1d2a44';
// ---------- небо и поверхность ----------
function marsSky(mode){// mode: day | dusk | night | storm
 const g=x.createLinearGradient(0,0,0,H*.7);
 const P={day:['#f6c49a','#e88a6a','#c8643c'],dusk:['#3a2a5a','#a4507a','#f0905a'],night:['#070814','#1a1430','#3a2030'],storm:['#d8803a','#c86a2a','#a8501a']}[mode||'day'];
 g.addColorStop(0,P[0]);g.addColorStop(.6,P[1]);g.addColorStop(1,P[2]);x.fillStyle=g;x.fillRect(-W,-H,W*3,H*3);
 if(mode==='night')for(let i=0;i<140;i++)circ((i*997)%W,(i*571)%(H*.6),(i%3+1)*1.4,`rgba(255,255,255,${.35+(i%4)*.15})`);
 if(mode==='day'||mode==='dusk'){const sx=W*.78,sy=mode==='dusk'?H*.52:H*.2;circ(sx,sy,46,'#fff4d8');circ(sx,sy,80,'rgba(255,244,216,.25)');circ(sx,sy,130,'rgba(255,244,216,.1)')}
 if(mode==='night'){circ(W*.18,H*.16,22,'#e8e0d0');circ(W*.82,H*.24,12,'#d8c8b0')}}// Фобос и Деймос
function marsGround(y,mode){const dk=mode==='night'?.45:mode==='storm'?.8:1,C=(r,g,b)=>`rgb(${r*dk|0},${g*dk|0},${b*dk|0})`;
 x.fillStyle=C(168,74,48);x.beginPath();x.moveTo(-W,H);for(let i=-4;i<=16;i++){x.lineTo(i*W/12,y-60-Math.sin(i*1.9)*55-Math.cos(i*.7)*30)}x.lineTo(W*2,H);x.fill();
 x.fillStyle=C(200,100,60);x.beginPath();x.moveTo(-W,H);for(let i=-4;i<=16;i++){x.lineTo(i*W/10,y-Math.sin(i*1.3+1)*25)}x.lineTo(W*2,H);x.fill();
 x.fillStyle=C(214,118,72);x.fillRect(-W,y+20,W*3,H);
 for(let i=0;i<26;i++){const X=(i*373)%W,Y=y+40+((i*157)%(H-y-40)),r=6+(i%5)*5;x.beginPath();x.ellipse(X,Y,r*1.6,r*.7,0,0,7);x.fillStyle=C(150,64,40);x.fill()}}
// ---------- база ----------
function module(X,Y,w,h,o){o=o||{};rr(X-w/2,Y-h,w,h,h*.45,'#e8ecf0',OUT,6);rr(X-w/2,Y-h*.38,w,h*.12,0,SUIT);
 for(let i=0;i<(o.win||2);i++){const wx=X-w/2+w*(i+1)/((o.win||2)+1);circ(wx,Y-h*.62,h*.13,o.lit?'#ffd88a':'#2a3a5a',OUT,4)}
 rr(X-w/2-10,Y-12,w+20,14,4,'#9aa3ad',OUT,3)}
function dome(X,Y,r,o){o=o||{};x.beginPath();x.arc(X,Y,r,Math.PI,0);x.closePath();x.fillStyle=o.green?'rgba(150,230,170,.55)':'rgba(220,235,255,.55)';x.fill();x.strokeStyle=OUT;x.lineWidth=6;x.stroke();
 for(let i=1;i<4;i++){x.beginPath();x.arc(X,Y,r*i/4,Math.PI,0);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.stroke()}rr(X-r-8,Y-8,r*2+16,12,4,'#9aa3ad',OUT,3)}
function panel(X,Y,s,dust){x.save();x.translate(X,Y);x.scale(s,s);line(0,0,0,-70,'#5a5e66',8);x.save();x.translate(0,-80);x.rotate(-.25);rr(-90,-40,180,80,6,'#1d3a6a',OUT,5);
 for(let i=1;i<4;i++)line(-90+i*45,-40,-90+i*45,40,'#3a6ab8',3);line(-90,0,90,0,'#3a6ab8',3);if(dust>0){x.globalAlpha=Math.min(1,dust);rr(-90,-40,180,80,6,'#c8783a');x.globalAlpha=1}x.restore();x.restore()}
function antenna(X,Y,s,on,t){x.save();x.translate(X,Y);x.scale(s,s);line(0,0,0,-260,'#9aa3ad',10);line(0,-260,-60,0,'#7a7e86',4);line(0,-260,60,0,'#7a7e86',4);
 x.beginPath();x.ellipse(0,-270,70,26,-.3,0,7);x.fillStyle='#e8ecf0';x.fill();x.strokeStyle=OUT;x.lineWidth=5;x.stroke();circ(0,-280,8,on?'#5dff8a':'#d8263a');
 if(on)for(let i=0;i<3;i++){const q=((t||0)*.8+i/3)%1;x.globalAlpha=1-q;x.beginPath();x.arc(0,-280,40+q*220,-2.4,-.7);x.strokeStyle='#5dff8a';x.lineWidth=6;x.stroke();x.globalAlpha=1}x.restore()}
function base(X,Y,s,o){o=o||{};x.save();x.translate(X,Y);x.scale(s,s);module(-260,0,300,190,{lit:o.lit,win:2});module(80,0,360,220,{lit:o.lit,win:3});dome(390,0,120,{green:1});
 rr(-110,-110,60,110,8,'#c8ccd4',OUT,5);rr(-100,-90,40,70,6,'#2a3a5a');// шлюз
 if(!o.noAnt)antenna(200,-220,.6,o.ant,o.t);x.restore()}
// ---------- интерьер ----------
function interior(mode){const dark=mode==='dark',red=mode==='red';x.fillStyle=dark?'#141a24':'#2c3a4a';x.fillRect(-W,-H,W*3,H*3);
 x.fillStyle=dark?'#1a2230':'#38485a';x.fillRect(-W,H*.12,W*3,H*.62);for(let i=0;i<14;i++)line(i*150,H*.12,i*150,H*.74,dark?'#121820':'#2c3a4a',5);
 x.fillStyle=dark?'#0e131c':'#222c38';x.fillRect(-W,H*.74,W*3,H);for(let i=0;i<20;i++)line(i*110,H*.74,i*110-200,H,'#1a222c',3);
 rr(-W,H*.1,W*3,24,0,'#4a5a6c');rr(-W,H*.72,W*3,20,0,'#4a5a6c');
 if(red){x.fillStyle=`rgba(255,40,40,${.18+.12*Math.sin(TT*8)})`;x.fillRect(-W,-H,W*3,H*3)}}
function porthole(X,Y,r,sky,content){circ(X,Y,r+22,'#9aa3ad',OUT,6);for(let i=0;i<8;i++){const a=i/8*6.283;circ(X+Math.cos(a)*(r+11),Y+Math.sin(a)*(r+11),5,'#5a5e66')}
 x.save();x.beginPath();x.arc(X,Y,r,0,7);x.clip();const P={day:['#f6c49a','#e88a6a'],dusk:['#3a2a5a','#f0905a'],night:['#070814','#3a2030'],storm:['#e0904a','#a8501a']}[sky||'day'];
 const g=x.createLinearGradient(0,Y-r,0,Y+r);g.addColorStop(0,P[0]);g.addColorStop(1,P[1]);x.fillStyle=g;x.fillRect(X-r,Y-r,r*2,r*2);
 if(sky!=='storm'){x.fillStyle='#a84a30';x.beginPath();x.moveTo(X-r,Y+r);for(let i=0;i<=8;i++)x.lineTo(X-r+i*r/4,Y+r*.35-Math.sin(i*1.7)*r*.08);x.lineTo(X+r,Y+r);x.fill();x.fillStyle='#c8643c';x.fillRect(X-r,Y+r*.5,r*2,r)}
 else{for(let i=0;i<14;i++){const q=((TT*.7)+i/14)%1;x.beginPath();x.arc(X-r+q*r*2.4,Y-r*.6+((i*37)%(r*1.6)),r*.25+(i%3)*r*.1,0,7);x.fillStyle=i%2?'rgba(150,70,30,.35)':'rgba(230,150,90,.35)';x.fill()}}
 if(content)content(X,Y,r);x.restore();
 x.save();x.globalAlpha=.25;x.beginPath();x.arc(X-r*.3,Y-r*.3,r*.5,3.6,5.2);x.strokeStyle='#fff';x.lineWidth=14;x.stroke();x.restore();circ(X,Y,r,null,OUT,6)}
function wallTally(X,Y,n,o){o=o||{};// стена со счётом: большая «100» и чёрточки
 if(o.big){txt(String(o.big),X,Y,150,'rgba(255,255,255,.85)');if(o.cross){line(X-150,Y-40,X+150,Y+40,'#d8263a',14)}}
 for(let i=0;i<n;i++){const c=i%5,r=Math.floor(i/5),cx=X-280+(r%10)*58,cy=Y+110+Math.floor(r/10)*70;if(c<4)line(cx+c*11,cy,cx+c*11,cy+44,'rgba(255,255,255,.85)',5);else line(cx-6,cy+30,cx+40,cy+12,'rgba(255,255,255,.85)',5)}}
function shelf(X,Y){rr(X-140,Y-360,280,360,8,'#5a6a7c',OUT,5);for(let i=1;i<4;i++)rr(X-130,Y-360+i*90,260,10,2,'#3a4a5c')}
function box(X,Y,s,sprout,bush){x.save();x.translate(X,Y);x.scale(s,s);rr(-160,-90,320,90,8,'#8a5a32',OUT,6);rr(-150,-100,300,20,6,'#5a3a20');
 if(sprout>0){line(0,-100,0,-100-60*sprout,'#3aa04a',8);x.beginPath();x.ellipse(-22*sprout,-140*sprout-20,22*sprout,12*sprout,-.5,0,7);x.fillStyle='#4ac85a';x.fill()}
 if(bush>0){for(let i=0;i<9;i++){const a=i/9*Math.PI;circ(Math.cos(a)*120*bush,-120-Math.sin(a)*90*bush,40*bush,i%2?'#3aa04a':'#4ac85a',OUT,3)}}
 x.restore();line(X,Y-90*s-360*s,X,Y-90*s-240*s,'#9aa3ad',6);poly([[X-60*s,Y-330*s],[X+60*s,Y-330*s],[X+40*s,Y-360*s],[X-40*s,Y-360*s]],'#5a5e66',OUT,4);
 x.save();x.globalAlpha=.18;poly([[X-60*s,Y-330*s],[X+60*s,Y-330*s],[X+200*s,Y-90*s],[X-200*s,Y-90*s]],'#ffe8a8');x.restore()}
function gauge(X,Y,r,val,max,label){circ(X,Y,r,'#e8ecf0',OUT,8);circ(X,Y,r-14,'#fff');for(let i=0;i<=10;i++){const a=Math.PI*(.75+i*.15);line(X+Math.cos(a)*(r-30),Y+Math.sin(a)*(r-30),X+Math.cos(a)*(r-16),Y+Math.sin(a)*(r-16),i<3?'#d8263a':'#2a2a2e',5)}
 const a=Math.PI*(.75+1.5*val/max);line(X,Y,X+Math.cos(a)*(r-36),Y+Math.sin(a)*(r-36),'#d8263a',10);circ(X,Y,14,'#2a2a2e');txt(label||'',X,Y+r*.45,r*.22,'#2a2a2e');txt(String(Math.round(val)),X,Y+r*.72,r*.26,'#d8263a')}
// ---------- корабль ----------
function ship(X,Y,s,flame,t){x.save();x.translate(X,Y);x.scale(s,s);poly([[-60,0],[-90,40],[-30,20]],'#9aa3ad',OUT,4);poly([[60,0],[90,40],[30,20]],'#9aa3ad',OUT,4);
 rr(-55,-260,110,270,40,'#f4f6f8',OUT,6);x.beginPath();x.moveTo(-55,-230);x.quadraticCurveTo(0,-360,55,-230);x.fillStyle='#f4f6f8';x.fill();x.strokeStyle=OUT;x.lineWidth=6;x.stroke();
 circ(0,-180,22,'#4ab8e8',OUT,5);rr(-56,-80,112,20,0,SUIT);if(flame>0){const f=1+Math.sin((t||0)*40)*.1;poly([[-35,14],[0,14+160*flame*f],[35,14]],'#ffb03a');poly([[-18,14],[0,14+90*flame*f],[18,14]],'#fff3c0')}x.restore()}
// ---------- герой «ты» ----------
function hero(X,Y,s,o){o=o||{};x.save();x.translate(X,Y);x.scale((o.flip?-1:1)*s,s);const b=Math.sin(TT*2.4+X*.01)*.015;x.scale(1,1+b);
 const walk=o.walk?Math.sin(TT*9):0,suit=o.tshirt?'#6a7a8a':SUIT,sd=o.tshirt?'#4a5a6a':SUITD;
 rr(-44,-150-Math.max(0,walk)*14,38,150,14,sd,OUT,5);rr(6,-150-Math.max(0,-walk)*14,38,150,14,sd,OUT,5);rr(-50,-14,50,26,10,'#3a3a44',OUT,4);rr(0,-14,50,26,10,'#3a3a44',OUT,4);
 const arm=(sx,a)=>{x.save();x.translate(sx*62,-330);x.rotate(sx*a);rr(-18,0,36,150,16,o.tshirt?SK:suit,OUT,5);circ(0,158,20,o.helmet?'#e8ecf0':SK,OUT,4);x.restore()};
 arm(-1,(o.armL==null?.12:o.armL)+Math.sin(TT*2.2)*.05);
 rr(-66,-350,132,210,40,suit,OUT,6);if(!o.tshirt){rr(-66,-270,132,26,0,'#e8ecf0');rr(-30,-330,60,40,8,'#e8ecf0',OUT,3)}else rr(-66,-200,132,10,0,'#5a6a7a');
 if(o.helmet&&!o.flip)rr(-100,-340,40,150,14,'#d0d4dc',OUT,5);
 arm(1,(o.armR==null?.12:o.armR)-Math.sin(TT*2.2)*.05);
 // голова
 x.save();x.translate(0,-350);x.rotate((o.tilt||0)+Math.sin(TT*.8+X*.013)*.035);circ(0,-70,66,SK,OUT,6);
 x.beginPath();x.arc(0,-82,68,Math.PI*1.05,Math.PI*1.95);x.closePath();x.fillStyle='#3a2418';x.fill();x.strokeStyle=OUT;x.lineWidth=5;x.stroke();
 const e=o.eyes||'',ey=-70;if(e==='closed'||BL(X*.001)&&!e){line(-34,ey,-14,ey,'#1a1a1e',5);line(14,ey,34,ey,'#1a1a1e',5)}else{const r=e==='wide'?11:7;circ(-24,ey,r+5,'#fff',OUT,3);circ(24,ey,r+5,'#fff',OUT,3);circ(-24+(o.look||0)*4,ey+1,r*.7,'#1a1a1e');circ(24+(o.look||0)*4,ey+1,r*.7,'#1a1a1e')}
 if(o.sad){line(-36,ey-22,-14,ey-30,'#3a2418',5);line(36,ey-22,14,ey-30,'#3a2418',5)}
 const m=o.mouth||'';x.beginPath();if(m==='o'){x.ellipse(0,-32,12,16,0,0,7);x.fillStyle='#5a1a1a';x.fill()}else if(m==='sad'){x.arc(0,-20,16,1.2*Math.PI,1.8*Math.PI);x.strokeStyle='#5a1a1a';x.lineWidth=5;x.stroke()}else if(m==='grit'){rr(-20,-40,40,14,4,'#fff',OUT,3)}else{x.arc(0,-42,18,.2*Math.PI,.8*Math.PI);x.strokeStyle='#5a1a1a';x.lineWidth=5;x.stroke()}
 if(o.tear){const q=(TT*.8)%1;circ(-30,ey+20+q*50,6,'#9fd4ff')}
 if(o.helmet){circ(0,-70,104,'rgba(190,225,255,.22)',OUT,8);x.save();x.globalAlpha=.55;x.beginPath();x.arc(0,-70,84,1.15*Math.PI,1.45*Math.PI);x.strokeStyle='#fff';x.lineWidth=12;x.stroke();x.restore();if(o.visor){x.save();x.beginPath();x.arc(0,-70,96,0,7);x.clip();x.fillStyle='rgba(20,30,60,.85)';x.fillRect(-100,-170,200,200);x.restore();x.save();x.globalAlpha=.4;circ(-30,-110,24,'#fff');x.restore()}}
 x.restore();x.restore()}
// ---------- Ключ (марсианский): на одной гусенице, полу-разбитое лицо ----------
function kluchM(X,Y,s,scr,o){o=o||{};kluch(X,Y,s,scr,o);x.save();x.translate(X,Y);x.scale(s,s);x.translate(0,Math.sin(TT*5+X*.01)*5);
 if(!o.fixed){rr(-120,-70,110,70,30,'#141018');}// вторая гусеница отсутствует
 x.save();x.globalAlpha=.9;poly([[20,-452],[100,-452],[100,-330],[60,-380],[30,-420]],'#1a2230');line(20,-452,60,-380,'#9fd4ff',4);line(60,-380,40,-340,'#9fd4ff',4);x.restore();
 if(o.dust){x.save();x.globalAlpha=.55;[[-60,-200,60],[50,-150,50],[-40,-400,50]].forEach(a=>circ(a[0],a[1],a[2],'#c8783a'));x.restore()}x.restore()}
// ---------- табло ресурсов ----------
function tablo(o){// o:{day,water,food,air,energy,warn:['air']...}
 const X=W-520,Y=40,w=480,h=330;x.save();x.setTransform(1,0,0,1,0,0);rr(X,Y,w,h,26,'rgba(10,14,26,.88)','#2b3556',5);
 x.font="900 30px Rubik";x.textAlign='left';x.textBaseline='middle';x.fillStyle='#8fa0c8';x.fillText('ДЕНЬ',X+28,Y+48);
 x.font="900 92px 'Courier New',monospace";x.fillStyle='#ff4a4a';x.shadowColor='#ff3a3a';x.shadowBlur=18;x.fillText(String(o.day),X+130,Y+56);x.shadowBlur=0;
 x.font="900 26px Rubik";x.fillStyle='#8fa0c8';x.textAlign='right';x.fillText('из 100',X+w-28,Y+56);x.textAlign='left';
 const rows=[['ВОДА',o.water,300,' л','#4ab8e8','water'],['ЕДА',o.food,40,'','#f7c24a','food'],['ВОЗДУХ',o.air,40,' дн','#5dff8a','air'],['ЭНЕРГИЯ',o.energy,100,' %','#ff9a3a','energy']];
 rows.forEach((r,i)=>{const y=Y+120+i*52,warn=(o.warn||[]).includes(r[5]),bl=warn&&Math.floor(TT*4)%2;x.font="900 26px Rubik";x.fillStyle=bl?'#ff4a4a':'#c8d4f0';x.fillText(r[0],X+28,y);
  rr(X+170,y-14,190,28,14,'#1d2440');rr(X+170,y-14,Math.max(8,190*Math.min(1,(typeof r[1]==='number'?r[1]:0)/r[2])),28,14,warn?'#ff4a4a':r[4]);
  x.font="900 30px 'Courier New',monospace";x.fillStyle=warn?'#ff6a6a':'#fff';x.textAlign='right';x.fillText(String(r[1])+r[3],X+w-24,y+2);x.textAlign='left'});x.restore()}
function sub(t){x.save();x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,H*.72,0,H);g.addColorStop(0,'rgba(8,8,16,0)');g.addColorStop(1,'rgba(8,8,16,.7)');x.fillStyle=g;x.fillRect(0,H*.72,W,H*.28);
 x.font="900 54px Rubik";x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle='#0a0a14';x.lineWidth=12;x.strokeText(t,W/2,H*.9);x.fillStyle='#fff';x.fillText(t,W/2,H*.9);x.restore()}
function dayCard(n,a){// большая плашка «ДЕНЬ N» по центру (переходы)
 x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=a==null?1:a;rr(W/2-260,H*.42-80,520,160,30,'rgba(10,14,26,.9)','#ff4a4a',6);x.font="900 110px 'Courier New',monospace";x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ff4a4a';x.fillText('ДЕНЬ '+n,W/2,H*.42+4);x.restore()}
function storm(t,amt){x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle=`rgba(200,110,50,${.55*amt})`;x.fillRect(0,0,W,H);for(let i=0;i<160;i++){const q=((t*1.6)+i*.0137)%1,y=(i*67)%H;line(W*(1.1-q*1.3),y,W*(1.1-q*1.3)-60-(i%4)*30,y+8,`rgba(255,200,140,${.5*amt})`,3)}x.restore()}
// ---------- v2: живость ----------
// командир — отдельный персонаж: старше, седая борода, белый скафандр с синими полосами, нашивка
function captain(X,Y,s,o){o=o||{};x.save();x.translate(X,Y);x.scale((o.flip?-1:1)*s,s);x.scale(1,1+Math.sin(TT*2.1+X*.01)*.012);
 const suit='#eef1f5',stripe='#2a5ab8';rr(-50,-150,44,150,14,'#c8ccd4',OUT,5);rr(6,-150,44,150,14,'#c8ccd4',OUT,5);rr(-56,-14,56,26,10,'#2a2c34',OUT,4);rr(0,-14,56,26,10,'#2a2c34',OUT,4);
 const arm=(sx,a)=>{x.save();x.translate(sx*72,-340);x.rotate(sx*a);rr(-20,0,40,160,18,suit,OUT,5);rr(-20,60,40,14,0,stripe);circ(0,168,22,'#e8ecf0',OUT,4);x.restore()};
 arm(-1,(o.armL==null?.1:o.armL)+Math.sin(TT*2)*.04);rr(-76,-362,152,222,44,suit,OUT,6);rr(-76,-290,152,22,0,stripe);rr(-76,-250,152,10,0,stripe);
 circ(-38,-320,20,'#d8283a',OUT,3);txt('★',-38,-319,22,'#fff');rr(14,-336,46,26,4,'#2a5ab8',OUT,3);arm(1,(o.armR==null?.1:o.armR)-Math.sin(TT*2)*.04);
 x.save();x.translate(0,-362);x.rotate(o.tilt||0);const SKC='#e8b896';circ(0,-74,70,SKC,OUT,6);
 x.beginPath();x.arc(0,-86,72,Math.PI*1.08,Math.PI*1.92);x.closePath();x.fillStyle='#b8bcc4';x.fill();x.strokeStyle=OUT;x.lineWidth=5;x.stroke();// седина
 x.beginPath();x.moveTo(-58,-60);x.quadraticCurveTo(-60,10,0,18);x.quadraticCurveTo(60,10,58,-60);x.quadraticCurveTo(30,-30,0,-34);x.quadraticCurveTo(-30,-30,-58,-60);x.fillStyle='#c8ccd2';x.fill();x.strokeStyle=OUT;x.lineWidth=4;x.stroke();// борода
 line(-40,-104,-12,-100,'#8a8e96',7);line(40,-104,12,-100,'#8a8e96',7);// брови
 if(BL(X*.002+.5)){line(-32,-84,-14,-84,'#1a1a1e',5);line(14,-84,32,-84,'#1a1a1e',5)}else{circ(-23,-84,7,'#1a1a1e');circ(23,-84,7,'#1a1a1e')}
 line(-34,-74,-26,-70,'rgba(120,70,50,.6)',3);line(34,-74,26,-70,'rgba(120,70,50,.6)',3);// морщины
 const m=o.talk?Math.abs(Math.sin(TT*13))*12+3:3;x.beginPath();x.ellipse(0,-40,16,m,0,0,7);x.fillStyle='#5a1a1a';x.fill();
 if(o.helmet){circ(0,-74,108,'rgba(190,225,255,.22)',OUT,8)}x.restore();
 if(o.helmetHand){x.save();x.translate(110,-220);circ(0,0,70,'rgba(190,225,255,.35)',OUT,6);x.restore()}x.restore()}
// Ключ говорит: рот-экран открывается по слогам
function kluchTalk(X,Y,s,o){o=o||{};kluchM(X,Y,s,'',Object.assign({off:1},o));x.save();x.translate(X,Y);x.scale(s,s);x.translate(0,Math.sin(TT*5+X*.01)*5);x.translate(0,-300);x.rotate((o.tilt||0)+Math.sin(TT*2.2+X*.01)*.04);x.translate(0,300);
 const g=x.createRadialGradient(0,-385,10,0,-385,140);g.addColorStop(0,'#8ff6ff');g.addColorStop(1,'#1a8fd0');rr(-100,-452,200,140,14,g);
 circ(-38,-405,13,'#0b2a44');circ(38,-405,13,'#0b2a44');const m=o.talk?6+Math.abs(Math.sin(TT*14))*20:6;x.beginPath();x.ellipse(0,-360,32,m,0,0,7);x.fillStyle='#0b2a44';x.fill();
 x.save();x.globalAlpha=.9;poly([[20,-452],[100,-452],[100,-330],[60,-380],[30,-420]],'#1a2230');line(20,-452,60,-380,'#9fd4ff',4);x.restore();x.restore()}
// крупный план лица героя (эмоции)
function heroFace(mode,o){interior(mode);x.save();x.translate(W*.5,H*.5);const s=3.1+Math.sin(TT*.4)*.03;x.scale(s,s);hero(0,420,1,Object.assign({tshirt:1},o));x.restore()}
// пыль в воздухе
function motes(n,col){x.save();x.setTransform(1,0,0,1,0,0);for(let i=0;i<n;i++){const px=((i*421)+TT*(8+i%5*3))%W,py=((i*277)+Math.sin(TT*.5+i)*30)%H;x.globalAlpha=.25+.2*Math.sin(TT*2+i);circ(px,py,1.5+(i%3),col||'#fff')}x.restore()}
function leds(){x.save();x.setTransform(1,0,0,1,0,0);for(let i=0;i<9;i++){const on=Math.sin(TT*(1.3+i*.37)+i)>0;circ(110+i*210,H*.16,6,on?(i%3?'#5dff8a':'#ff6a4a'):'#2a3440')}x.restore()}

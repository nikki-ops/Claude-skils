// Общие 2D-примитивы «Космодрома» (скопированы из k01-kosmodrom/video2d.html).
const S=SER,W=S.W,H=S.H,K=1;const cv=document.getElementById('c');cv.width=W;cv.height=H;const x=cv.getContext('2d');
const ease=S.ease,seg=S.seg,OUT='#1b1426';
// ---------- примитивы ----------
const rr=(X,Y,w,h,r,f,st,lw)=>{x.beginPath();x.roundRect(X,Y,w,h,r);if(f){x.fillStyle=f;x.fill()}if(st){x.strokeStyle=st;x.lineWidth=lw||4;x.stroke()}};
const poly=(pts,f,st,lw)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();if(f){x.fillStyle=f;x.fill()}if(st){x.strokeStyle=st;x.lineWidth=lw||4;x.stroke()}};
const circ=(X,Y,r,f,st,lw)=>{x.beginPath();x.arc(X,Y,Math.max(.1,r),0,7);if(f){x.fillStyle=f;x.fill()}if(st){x.strokeStyle=st;x.lineWidth=lw||4;x.stroke()}};
const line=(a,b,c,d,col,lw)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';x.stroke()};
const txt=(t,X,Y,size,f,st)=>{x.font=`900 ${size}px Rubik, Arial Black`;x.textAlign='center';x.textBaseline='middle';if(st){x.lineJoin='round';x.strokeStyle=st;x.lineWidth=size*.22;x.strokeText(t,X,Y)}x.fillStyle=f;x.fillText(t,X,Y)};
let OFF=0;// сдвиг сцены вверх, чтобы низ кадра оставался под субтитры
function cam(z,cx,cy,dx,dy){x.setTransform(z,0,0,z,(1-z)*cx+(dx||0),(1-z)*cy+(dy||0)+OFF)}
const reset=()=>x.setTransform(1,0,0,1,0,OFF);
// ---------- фон ----------
function sky(night,dusk){const g=x.createLinearGradient(0,-200,0,H*.62);if(night){g.addColorStop(0,'#05050f');g.addColorStop(1,'#1e1430')}else{g.addColorStop(0,dusk?'#24184a':'#3b2a6e');g.addColorStop(.55,dusk?'#7a3a6a':'#b2507a');g.addColorStop(1,dusk?'#c8704a':'#f8a25a')}x.fillStyle=g;x.fillRect(-W,-H,W*3,H*3);
 if(!night){circ(W*.78,H*.5,110,'#ffd27a');circ(W*.78,H*.5,150,'rgba(255,210,122,.25)')}else for(let i=0;i<90;i++)circ((i*997)%W,(i*571)%(H*.6),(i%3+1)*1.6,`rgba(255,255,255,${.4+(i%4)*.15})`)}
function hills(y,col){x.fillStyle=col;x.beginPath();x.moveTo(-W,H*2);for(let i=-6;i<=18;i++){const X=i*W/12;x.lineTo(X,y-Math.sin(i*1.7)*40-Math.cos(i*.9)*25)}x.lineTo(W*2,H*2);x.fill()}
function ground(y,col,noGrass){x.fillStyle=col||'#d39a5a';x.fillRect(-W,y,W*3,H*2);x.fillStyle='rgba(120,70,30,.18)';for(let i=0;i<9;i++)x.fillRect(-W,y+30+i*i*14,W*3,6);
 if(!noGrass)for(let i=0;i<40;i++){const X=(i*263)%W,Y=y+40+((i*137)%Math.max(1,(H-y-60)));poly([[X,Y],[X+10,Y-34],[X+20,Y]],'#8a8a3a',OUT,2)}}
function world(night){sky(night);hills(H*.6,night?'#140e22':'#5a2a5a');ground(H*.64,night?'#3a2a2a':null)}
// ---------- объекты ----------
function tower(X,Y,h,lit){const w=110,c='#b0582e';line(X,Y,X+15,Y-h,c,10);line(X+w,Y,X+w-15,Y-h,c,10);
 for(let i=0;i<9;i++){const y1=Y-i*h/9,y2=Y-(i+1)*h/9;line(X+i*15/9,y1,X+w-(i+1)*15/9,y2,'#8a3a1a',5);line(X+w-i*15/9,y1,X+(i+1)*15/9,y2,'#8a3a1a',5);line(X+i*15/9,y1,X+w-i*15/9,y1,c,6)}
 rr(X-10,Y-h-24,w+20,24,4,'#5a3a2a',OUT,3);line(X+w,Y-h+40,X+w+150,Y-h+40,c,8);circ(X+w/2,Y-h-40,12,'#ff3a2a');
 if(lit){x.save();x.globalAlpha=.35*lit;[[X-10,Y-h],[X+w+10,Y-h]].forEach((p,i)=>poly([[p[0],p[1]],[p[0]+(i?420:-420),p[1]+520],[p[0]+(i?180:-180),p[1]+600]],'#ffe9a8'));x.restore();
  [[X-10,Y-h-12],[X+w+10,Y-h-12],[X+w/2,Y-h*.5]].forEach(p=>{circ(p[0],p[1],16,'#fff3c0');circ(p[0],p[1],34*lit,'rgba(255,240,180,.35)')})}}
function rocket(X,Y,s,rot,o){o=o||{};x.save();x.translate(X,Y);x.rotate(rot||0);x.scale(s,s);
 poly([[-70,0],[-110,-20],[-110,-150],[-70,-110]],'#d8283a',OUT,6);poly([[70,0],[110,-20],[110,-150],[70,-110]],'#d8283a',OUT,6);
 rr(-70,-560,140,560,30,o.dark?'#5a5a6a':'#f3f1ec',OUT,7);x.beginPath();x.moveTo(-70,-540);x.quadraticCurveTo(0,-760,70,-540);x.closePath();x.fillStyle=o.dark?'#5a5a6a':'#f3f1ec';x.fill();x.strokeStyle=OUT;x.lineWidth=7;x.stroke();
 rr(-72,-110,144,34,4,'#d8283a',OUT,5);rr(-72,-420,144,34,4,'#d8283a',OUT,5);poly([[-20,-646],[0,-705],[20,-646]],'#d8283a',OUT,5);
 [-330,-270,-210].forEach(y=>circ(0,y,24,o.dark?'#ffd27a':'#4ab8e8',OUT,6));
 if(!o.dark)[[-40,-180,50,26],[20,-470,40,22],[-30,-330,30,18]].forEach(a=>rr(a[0],a[1],a[2],a[3],8,'#b06a3a'));
 if(o.hatch){rr(-50,-100,100,80,8,'#120e14',OUT,5);for(let i=0;i<4;i++)circ(-38+i*25,-92,5,'#7a7e86')}
 rr(-60,0,120,40,10,'#5a5e66',OUT,6);x.restore()}
function kluch(X,Y,s,screen,o){o=o||{};x.save();x.translate(X,Y);x.scale(s,s);
 rr(-120,-70,240,70,35,'#2a2622',OUT,6);[-80,-27,27,80].forEach(c=>circ(c,-35,22,'#5a5450',OUT,4));
 rr(-110,-260,220,190,18,'#b0582e',OUT,7);rr(-85,-150,170,55,8,'#3a2a20');[-60,-25,10].forEach((c,i)=>rr(c,-235,26,26,5,i==2?'#d83a2a':'#e8c24a',OUT,3));rr(40,-200,40,30,6,'#8a3a1a');
 const arm=(sx,a)=>{x.save();x.translate(sx*115,-235);x.rotate(sx*a);rr(-15,0,30,110,12,'#b0582e',OUT,5);rr(-12,100,24,70,10,'#c9784a',OUT,5);line(-10,170,-18,200,'#5a5a5a',8);line(10,170,18,200,'#5a5a5a',8);x.restore()};
 arm(-1,o.armL==null?.25:o.armL);arm(1,o.armR==null?.25:o.armR);
 x.save();x.translate(0,0);x.rotate(o.tilt||0);rr(-14,-300,28,45,6,'#2a2622');rr(-120,-470,240,175,22,'#5a5e66',OUT,7);
 if(o.off){rr(-100,-452,200,140,14,'#1a2230')}else{const g=x.createRadialGradient(0,-385,10,0,-385,140);g.addColorStop(0,o.red?'#ff9a9a':'#8ff6ff');g.addColorStop(1,o.red?'#c01a2a':'#1a8fd0');rr(-100,-452,200,140,14,g);
  x.save();x.shadowColor=o.red?'#ff4a4a':'#7ff3ff';x.shadowBlur=50;rr(-100,-452,200,140,14,'rgba(127,243,255,.12)');x.restore();
  if(!screen||screen===':)'){circ(-38,-395,16,'#0b2a44');circ(38,-395,16,'#0b2a44');x.beginPath();x.arc(0,-385,45,.2*Math.PI,.8*Math.PI);x.strokeStyle='#0b2a44';x.lineWidth=10;x.stroke()}
  else{const L=screen.split('\n');L.forEach((l,i)=>txt(l,0,-382+(i-(L.length-1)/2)*40,L.length>1?34:46,'#0b2a44'))}}
 line(60,-470,60,-560,'#9aa3ad',8);circ(60,-585,24,null,'#e8b84a',10);line(60,-560,60,-510,'#e8b84a',8);line(60,-530,78,-530,'#e8b84a',7);line(60,-515,74,-515,'#e8b84a',7);x.restore();x.restore()}
function seryi(X,Y,s){x.save();x.translate(X,Y);x.scale(s,s);rr(-45,-90,35,90,6,'#1f2126',OUT,5);rr(10,-90,35,90,6,'#1f2126',OUT,5);
 poly([[-60,-430],[60,-430],[95,-80],[-95,-80]],'#5a5f68',OUT,7);line(0,-420,0,-90,'#3a3e46',6);[-330,-260,-190].forEach(y=>circ(14,y,6,'#1a1a1a'));
 rr(-110,-420,40,230,18,'#5a5f68',OUT,6);rr(70,-420,40,230,18,'#5a5f68',OUT,6);x.save();x.rotate(-.12);rr(60,-300,90,120,8,'#8a1a1a',OUT,6);rr(70,-290,70,100,4,'#f1e9d8');x.restore();
 rr(-50,-470,100,50,14,'#3a3e46',OUT,5);x.beginPath();x.ellipse(0,-510,45,55,0,0,7);x.fillStyle='#16171c';x.fill();x.strokeStyle=OUT;x.lineWidth=6;x.stroke();
 rr(-90,-560,180,20,10,'#2a2c32',OUT,5);rr(-50,-620,100,65,12,'#2a2c32',OUT,5);rr(-50,-575,100,12,0,'#14151a');x.restore()}
function vorona(X,Y,s,flip,wing){x.save();x.translate(X,Y);x.scale(flip?-s:s,s);x.beginPath();x.ellipse(0,-35,55,32,-.15,0,7);x.fillStyle='#15161a';x.fill();
 if(wing){poly([[-20,-50],[-60,-50-wing*80],[20,-55]],'#15161a')}poly([[-50,-30],[-100,-20],[-55,-15]],'#15161a');circ(45,-65,26,'#15161a');poly([[65,-70],[100,-60],[66,-56]],'#4a4a4a');circ(52,-72,6,'#ffd84a');if(!wing){line(-10,-5,-14,12,'#4a4a4a',5);line(10,-5,8,12,'#4a4a4a',5)}x.restore()}
function coin(X,Y,r,rot){x.save();x.translate(X,Y);x.rotate(rot||-.25);x.beginPath();x.ellipse(0,0,r,r*.92,0,0,7);x.fillStyle='#d9dde2';x.fill();x.strokeStyle=OUT;x.lineWidth=6;x.stroke();x.beginPath();x.ellipse(0,0,r*.8,r*.72,0,0,7);x.strokeStyle='#a9adb6';x.lineWidth=4;x.stroke();txt('1₽',0,4,r*.75,'#7a7e86');x.restore()}
function engine(X,Y,s,rust,rot){x.save();x.translate(X,Y);x.scale(s,s);x.rotate(rot!=null?rot:(rust?.2:0));
 poly([[-60,-120],[60,-120],[110,0],[-110,0]],rust?'#6a3a1a':'#8a8d92',OUT,6);rr(-70,-330,140,215,14,rust?'#8a4a2a':'#d8dce4',OUT,7);
 for(let i=-2;i<=2;i++)line(i*28,-320,i*28,-125,rust?'#5a2a10':'#e8b84a',8);rr(-80,-350,160,30,8,rust?'#5a3a22':'#9aa3ad',OUT,5);
 if(rust)[[-40,-260],[30,-180]].forEach(a=>rr(a[0],a[1],40,24,8,'#b06a3a'));else{x.save();x.globalAlpha=.6;line(-40,-300,-40,-150,'#fff',10);x.restore()}x.restore()}
function crane(X,Y,s,boomA){x.save();x.translate(X,Y);x.scale(s,s);rr(-160,-110,320,90,14,'#f2c230',OUT,7);[-110,-40,40,110].forEach(c=>circ(c,-20,30,'#2a2a2e',OUT,5));rr(-140,-220,110,110,10,'#f2c230',OUT,6);rr(-125,-205,80,50,6,'#8fd2ff');
 x.save();x.translate(60,-110);x.rotate(boomA==null?-1.15:boomA);rr(0,-22,760,44,8,'#f2c230',OUT,7);for(let i=40;i<740;i+=60)line(i,-18,i+30,18,'#c99a20',5);x.restore();x.restore()}
function craneTip(X,Y,s,boomA){const a=boomA==null?-1.15:boomA;return[X+(60+Math.cos(a)*740)*s,Y+(-110+Math.sin(a)*740)*s]}
function generator(X,Y,s,on,t){x.save();x.translate(X,Y);x.scale(s,s);rr(-110,-120,220,120,12,'#2f8f4a',OUT,6);for(let i=-80;i<=40;i+=24)rr(i,-100,10,70,3,'#1f6a3a');rr(60,-170,24,50,4,'#3a3a3a',OUT,4);
 if(on)for(let k=0;k<3;k++){const q=((t||0)*1.2+k/3)%1;circ(72+q*30,-190-q*80,12+q*20,`rgba(220,220,220,${.7*(1-q)})`)}x.restore()}
function tractor(X,Y,s){x.save();x.translate(X,Y);x.scale(s,s);rr(-120,-110,170,80,10,'#2f6fd0',OUT,6);rr(-40,-200,90,100,8,'#2f6fd0',OUT,6);rr(-25,-185,60,45,4,'#8fd2ff');circ(-80,-30,45,'#2a2a2e',OUT,6);circ(40,-25,30,'#2a2a2e',OUT,5);rr(60,-80,70,20,4,'#9aa3ad',OUT,4);x.restore()}
function scrap(X,Y,n,sh){for(let i=0;i<n;i++){const a=i*2.4,r=40+i*9,c=['#6a4a3a','#5a5e66','#8a4a2a','#4a4440'][i%4];x.save();x.translate(X+Math.cos(a)*r+(sh?Math.sin(i*7+sh*40)*6:0),Y-Math.abs(Math.sin(a))*r*.5);x.rotate(a);rr(-40,-20,80,40,6,c,OUT,3);x.restore()}}
function safe(X,Y,open){rr(X-200,Y-380,400,380,24,'#6a5a4a',OUT,8);rr(X-170,Y-350,340,320,14,'#2a2420',OUT,5);
 for(let r=0;r<3;r++)for(let c=0;c<4;c++){rr(X-150+c*76,Y-320+r*95,66,80,6,'#3f9a4a',OUT,4);txt('₽',X-117+c*76,Y-280+r*95,40,'#2a6a32')}
 const w=340*(1-open*.92);x.save();rr(X-170,Y-350,w,320,14,'#7a6a5a',OUT,6);if(w>60){circ(X-170+w/2,Y-190,50,'#9a8a7a',OUT,6);line(X-170+w/2-30,Y-190,X-170+w/2+30,Y-190,OUT,8)}x.restore()}
function contract(t){rr(140,520,800,1000,16,'#f4eedf',OUT,8);txt('ДОГОВОР',540,620,64,'#2a2a3a');for(let i=0;i<9;i++)rr(220,720+i*60,i%3==2?420:640,14,6,'#bcb3a0');
 txt('КОСМОДРОМ «РАССВЕТ» — 1 ₽',540,690,30,'#5a5a6a');const st=seg(t,8,8.25);if(st>0){x.save();x.translate(560,1260);x.rotate(-.18);x.scale(1.6-st*.6,1.6-st*.6);x.globalAlpha=Math.min(1,st*2);rr(-330,-80,660,160,14,null,'#d8263a',12);txt('ШТРАФ 50 000 000 ₽',0,4,52,'#d8263a');x.restore()}}
function warehouse(X,Y,flick,sil){rr(X-220,Y-300,440,300,10,'#2a2430',OUT,6);poly([[X-240,Y-300],[X,Y-420],[X+240,Y-300]],'#1e1a24',OUT,6);rr(X-60,Y-160,120,160,6,'#141018',OUT,4);rr(X+80,Y-230,90,70,6,flick||sil?'#ffe89a':'#141018',OUT,4);if(sil){circ(X+125,Y-205,14,'#141018');rr(X+108,Y-192,34,32,8,'#141018')}if(flick){x.save();x.globalAlpha=.25;poly([[X+80,Y-160],[X-100,Y+60],[X+260,Y+60],[X+170,Y-160]],'#ffe89a');x.restore()}}

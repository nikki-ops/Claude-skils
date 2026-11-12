// Серия 11 «За ночь IMEN захватила участки». window.seek(tv) рисует кадр на секунде голоса tv.
// Сцена = живая карта render/karta/index.html?video + стены, флаги, кот-мэр (Three.js) + 2D-слой (index.html).
// Всё ниже — во «времени сцены» (по таймлайну stsenarii/11-zahvat.md, 0–30 с).
// Голос привязывается таблицей AN: [время голоса, время сцены] — по паузам golos/11-zahvat.mp3.
const SCENE_END=30;
let AN=[[0,0],[1.40,1],[3.0,2],[4.7,3.5],[6.75,5],[8.95,6.5],[11.05,8],[12.8,9.5],[14.85,11],[16.55,12],[18.55,13.5],[20.9,15],[22.0,16.5],[24.6,19.5],[25.45,21],[27.2,22.5],[29.85,24.5],[31.6,26],[32.5,27.5],[34.4,29],[35.28,30]];
// субтитры по фразам озвучки (время голоса): [секунда, слово, цвет]
const SUBV=[[0,'за ночь'],[.75,'imen…','imen'],[1.47,'захватила'],[2.1,'участки!','red'],[3.12,'как?'],[3.88,'стеной','gold'],[4.82,'построила'],[5.45,'стену'],[5.85,'вокруг района'],
[6.85,'флаг на крыше…'],[8.09,'уже её','imen'],[9.09,'но ник…'],[9.93,'остался твоим','gold'],[11.18,'бункер дони'],[12.15,'внутри'],[12.94,'«вкусно и точка»'],[14.18,'внутри'],
[14.97,'кот-мэр'],[15.6,'уже на стене'],[16.74,'но это было'],[17.5,'только начало…','red'],[18.68,'вторая стена'],[19.7,'вокруг центра!','red'],[21.03,'а твой'],[21.4,'участок?','tq'],
[22.16,'проверь участок'],[23.0,'на карте'],[23.5,'в telegram','tq'],[24.29,'ссылка'],[24.7,'в профиле'],[25.53,'кот-мэр зовёт'],[26.4,'защитников','tq'],
[27.29,'защитить','tq'],[28.14,'или вступить','imen'],[29.13,'и ник!','gold'],[29.98,'лайк —'],[30.5,'щит городу','tq'],[31.78,'а утром…'],[32.4,''],[34.57,'завтра','gold']];
// [время сцены, слово, цвет]
const SUB=[[0,'за ночь'],[.5,'imen…','imen'],[1,'захватила'],[1.45,'участки!','red'],[2,'как?'],[2.7,'стеной','gold'],
[3.5,'построила'],[4,'стену'],[4.4,'вокруг района'],[5,'флаг на крыше…'],[5.9,'уже её','imen'],[6.5,'но ник…'],[7.2,'остался твоим','gold'],
[8,'бункер дони'],[8.9,'внутри'],[9.5,'«вкусно и точка»'],[10.4,'внутри'],[11,'кот-мэр'],[11.5,'уже на стене'],
[12.3,'но это было'],[12.9,'только начало…','red'],[13.5,'вторая стена'],[14.2,'вокруг центра!','red'],[15,'а твой'],[15.6,'участок?','tq'],
[16.5,'проверь участок'],[17.2,'на карте'],[17.7,'в telegram','tq'],[18.4,'ссылка'],[18.9,'в профиле'],[19.5,''],
[21,'кот-мэр зовёт'],[21.7,'защитников','tq'],[22.5,'защитить','tq'],[23.1,'или вступить','imen'],[23.9,'и ник!','gold'],
[24.5,'лайк —'],[25,'щит городу','tq'],[26,''],[26.2,'а утром…'],[27.5,''],[29,'завтра','gold']];
// звук на смене кадров (время сцены): [t, файл, громкость] — render.mjs переводит во время голоса
const SFXS=[[0,'wall',.55],[1.0,'siren',.3],[4,'flag',.5],[12,'siren',.3],[12.2,'wall',.45],[24.6,'shield',.6],[26.2,'drumroll',.45],[27.5,'boom',.65],[28.45,'whoosh2',.55],[0,'thump',.9],[.08,'whoosh2',.45],[1,'whoosh2',.55],[1.3,'thump',.75],[2,'swish',.5],[2.3,'pop',.3],[2.55,'pop',.3],[2.8,'pop',.3],[3.05,'pop',.3],[3.5,'thump',.55],
[5,'swish',.35],[5.65,'pop',.6],[5.75,'ping',.4],[6.6,'chime',.5],[8,'swish',.4],[9.5,'whoosh2',.4],[9.75,'ping',.35],[11,'swish',.4],
[12,'thump',.45],[12.25,'thump',.45],[12.6,'thump',.8],[13.5,'whoosh2',.5],[13.8,'pop',.3],[14.1,'pop',.3],[14.4,'pop',.3],[14.9,'thump',.7],
[15,'ping',.5],[16.5,'pop',.5],[18.05,'pop',.4],[18.3,'pop',.4],[18.9,'chime',.45],[19.5,'shimmer',.4],[21,'chime',.5],[21.2,'thump',.4],
[22.5,'pop',.5],[23,'pop',.5],[23.4,'pop',.5],[23.9,'chime',.45],[24.6,'ping',.35],[24.95,'ping',.35],[25.3,'ping',.35],[25.65,'ping',.35],
[26,'thump',.5],[27.5,'thump',.9],[27.8,'thump',.6],[29,'thump',.8],[29.1,'whoosh2',.4]];

// ---- время: голос → сцена (монотонный кубический сплайн по AN) ----
let AM=null;
function prepAN(){const n=AN.length,h=[],d=[],m=[];for(let i=0;i<n-1;i++){h[i]=AN[i+1][0]-AN[i][0];d[i]=(AN[i+1][1]-AN[i][1])/h[i]}
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i]);AM=m}
const MAPT=v=>{if(!AM)prepAN();for(let i=1;i<AN.length;i++)if(v<=AN[i][0]){const a=AN[i-1],b=AN[i],h=b[0]-a[0],s=Math.max(0,(v-a[0])/h),s2=s*s,s3=s2*s;
 return(2*s3-3*s2+1)*a[1]+(s3-2*s2+s)*h*AM[i-1]+(-2*s3+3*s2)*b[1]+(s3-s2)*h*AM[i]}return AN[AN.length-1][1]};
const INV=s=>{let lo=0,hi=AN[AN.length-1][0];for(let k=0;k<40;k++){const md=(lo+hi)/2;if(MAPT(md)<s)lo=md;else hi=md}return(lo+hi)/2};
window.END=AN[AN.length-1][0];
window.SFXV=()=>SFXS.map(([t,f,v])=>[+INV(t).toFixed(3),f,v]);

const ss=u=>u*u*(3-2*u),cl=(a,b,x)=>Math.max(a,Math.min(b,x)),lerp=(a,b,u)=>a+(b-a)*u,seg=(t,a,b)=>cl(0,1,(t-a)/(b-a));
const $=id=>document.getElementById(id);
function show(id,on,s){const e=$(id);e.style.display=on?'block':'none';if(on&&s!=null)e.style.transform='scale('+s+')'}
function pop(t,t0){const k=(t-t0)/.12;return k>=1?1:k<0?1:(k<.5?1+.24*k:1.12-.24*(k-.5))}

// ---- мир серии: стены, флаги, кот-мэр, защитники ----
const W={};
function mkCat(T){const g=new T.Group(),M=c=>new T.MeshLambertMaterial({color:c});
 const B=(w,h,d,c,x,y,z,p)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);(p||g).add(m);return m};
 // по референсу gotovo/kot-mer.jpg: рыже-красный блочный кот, чёрные очки, чёрный костюм, белая рубашка, красный галстук
 const SUIT=0x16161c,FUR=0xd0582a,DARK=0xa8441e;
 B(.6,2.0,.62,0x16161c,-.42,1.0,0);B(.6,2.0,.62,0x16161c,.42,1.0,0);B(.72,.26,.95,0x111111,-.42,.13,.16);B(.72,.26,.95,0x111111,.42,.13,.16);
 B(1.8,2.0,1.05,SUIT,0,3.0,0);B(.62,1.25,.06,0xffffff,0,3.4,.54);const tie=B(.24,1.05,.07,0xd8263a,0,3.22,.58);B(.32,.24,.08,0xd8263a,0,3.8,.58);
 B(.5,.5,.08,SUIT,-.55,3.65,.56).rotation.z=.5;B(.5,.5,.08,SUIT,.55,3.65,.56).rotation.z=-.5;
 const armL=new T.Group();armL.position.set(-1.1,3.8,0);g.add(armL);B(.48,1.5,.52,SUIT,0,-.7,0,armL);B(.48,.42,.48,FUR,0,-1.55,0,armL);
 const armR=new T.Group();armR.position.set(1.1,3.8,0);g.add(armR);B(.48,1.5,.52,SUIT,0,-.7,0,armR);B(.48,.42,.48,FUR,0,-1.55,0,armR);
 const sh=new T.Group();sh.position.set(.1,-1.5,.55);armR.add(sh);
 const sd=new T.Mesh(new T.CylinderGeometry(1.25,1.25,.22,6),M(0x2f8fff));sd.rotation.x=Math.PI/2;sh.add(sd);
 const se=new T.Mesh(new T.CylinderGeometry(.85,.85,.24,6),M(0xffffff));se.rotation.x=Math.PI/2;se.position.z=.02;sh.add(se);
 const sc2=new T.Mesh(new T.CylinderGeometry(.55,.55,.26,6),M(0x2f8fff));sc2.rotation.x=Math.PI/2;sc2.position.z=.04;sh.add(sc2);sh.visible=false;
 const head=new T.Group();head.position.set(0,4.85,0);g.add(head);
 B(2.0,1.75,1.65,FUR,0,0,0,head);B(1.15,.7,.22,0xf3d2b8,0,-.42,.84,head);
 [[-.62,1],[.62,1]].forEach(([x])=>{const e=new T.Mesh(new T.ConeGeometry(.45,.85,4),M(FUR));e.position.set(x,1.15,0);e.rotation.y=Math.PI/4;head.add(e);
  const ei=new T.Mesh(new T.ConeGeometry(.25,.5,4),M(0xff9ab0));ei.position.set(x,1.08,.18);ei.rotation.y=Math.PI/4;head.add(ei)});
 B(.25,.08,1.67,DARK,0,.79,0,head);B(.25,.08,1.67,DARK,-.45,.79,0,head);B(.25,.08,1.67,DARK,.45,.79,0,head);
 // лицо: очки (от удивления съезжают на нос), глаза под ними, брови, три рта — эмоции меняются по сюжету
 const gl=new T.Group();head.add(gl);B(.72,.4,.08,0x0a0a0a,-.45,.18,.88,gl);B(.72,.4,.08,0x0a0a0a,.45,.18,.88,gl);B(1.9,.1,.06,0x0a0a0a,0,.3,.87,gl);
 const eyes=new T.Group();head.add(eyes);[-1,1].forEach(k=>{B(.44,.44,.05,0xffffff,k*.45,.2,.83,eyes);B(.2,.26,.06,0x111111,k*.43,.22,.85,eyes)});eyes.visible=false;
 const bL=B(.58,.13,.08,0x5a220a,-.45,.55,.86,head),bR=B(.58,.13,.08,0x5a220a,.45,.55,.86,head);
 B(.2,.15,.08,0xd23a4a,0,-.18,.96,head);
 const mS=new T.Group();head.add(mS);B(.4,.07,.07,0x3a1a0a,0,-.52,.96,mS);B(.1,.07,.07,0x3a1a0a,-.24,-.47,.96,mS);B(.1,.07,.07,0x3a1a0a,.24,-.47,.96,mS);
 const mF=new T.Group();head.add(mF);B(.4,.07,.07,0x3a1a0a,0,-.5,.96,mF);B(.1,.07,.07,0x3a1a0a,-.24,-.55,.96,mF);B(.1,.07,.07,0x3a1a0a,.24,-.55,.96,mF);mF.visible=false;
 const mO=new T.Group();mO.position.set(0,-.5,.96);head.add(mO);B(.36,.3,.07,0x3a1a0a,0,0,0,mO);B(.2,.1,.08,0xff7a9a,0,-.08,.01,mO);mO.visible=false;
 [[-1,.06],[-1,-.12],[1,.06],[1,-.12]].forEach(([k,y])=>{const w=B(.9,.04,.04,0x222222,k*.85,-.3+y,.9,head);w.rotation.z=k*y*1.5});
 const tail=B(.32,.32,1.7,FUR,0,2.2,-.95);tail.rotation.x=-.7;
 // рост ≈ 2,4 — как человек рядом со стеной 3,4
 g.userData={head,armR,armL,tie,sh,gl,eyes,bL,bR,mS,mF,mO,tail};g.scale.setScalar(.36);return g}
function mkMan(T,i){const g=new T.Group(),M=c=>new T.MeshLambertMaterial({color:c}),B=(w,h,d,c,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);g.add(m);return m};
 const sk=[0xf2c9a0,0xd9a77a,0xffd8b0][i%3],cl2=[0x2f6fd0,0x3f9a5a,0xe0e4ea,0x1d2a44][i%4];
 B(.32,.9,.36,0x1d2238,-.2,.45,0);B(.32,.9,.36,0x1d2238,.2,.45,0);B(.9,1.1,.5,cl2,0,1.45,0);B(.7,.7,.7,sk,0,2.35,0);B(.16,.16,.05,0x111111,-.16,2.4,.36);B(.16,.16,.05,0x111111,.16,2.4,.36);
 const s=new T.Mesh(new T.CylinderGeometry(.6,.6,.12,6),M(0x2f8fff));s.rotation.x=Math.PI/2;s.position.set(.1,1.4,.42);g.add(s);
 const s2=new T.Mesh(new T.CylinderGeometry(.35,.35,.14,6),M(0xffffff));s2.rotation.x=Math.PI/2;s2.position.set(.1,1.4,.44);g.add(s2);
 if(i%3===0){const p=B(.08,3,.08,0xd8dce4,-.6,2,0);const f=B(1.2,.75,.05,0x2f8fff,-.0,3.1,0)}
 g.scale.setScalar(.75);return g}
function texIMEN(w){const cv=w.document.createElement('canvas');cv.width=256;cv.height=160;const x=cv.getContext('2d');
 x.fillStyle='#7b2fbe';x.fillRect(0,0,256,160);x.fillStyle='#d8263a';x.fillRect(0,112,256,48);x.fillStyle='#f7c24a';x.fillRect(0,104,256,8);
 x.fillStyle='#fff';x.font='900 72px Arial Black, Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('IMEN',128,58);return new w.THREE.CanvasTexture(cv)}
function texScroll(w){const cv=w.document.createElement('canvas');cv.width=320;cv.height=420;const x=cv.getContext('2d');
 x.fillStyle='#f1dfb4';x.fillRect(10,30,300,360);x.fillStyle='#c9a86a';x.fillRect(0,10,320,34);x.fillRect(0,376,320,34);
 x.fillStyle='#5a2a10';x.textAlign='center';x.font='900 40px Arial Black, Arial';x.fillText('ИМПЕРИЯ',160,110);x.fillText('IMEN',160,160);
 x.font='900 54px Arial Black, Arial';x.fillStyle='#b01a2a';x.fillText('ВОЙНА',160,240);
 x.beginPath();x.arc(160,320,38,0,7);x.fillStyle='#b01a2a';x.fill();x.fillStyle='#f7c24a';x.font='900 30px Arial Black, Arial';x.fillText('I',160,332);return new w.THREE.CanvasTexture(cv)}
// стена кольцом из каменных блоков: зубцы, башни с флагами IMEN, ворота
function mkWall(w,r,gateA){const T=w.THREE,sc=W.sc,n=Math.max(40,Math.round(2*Math.PI*r.R/2.7));
 const im=new T.InstancedMesh(new T.BoxGeometry(2.75,3.4,1.9),new T.MeshLambertMaterial({color:0x8d7a68}),n);
 const ie=new T.InstancedMesh(new T.BoxGeometry(1.05,1.0,1.95),new T.MeshLambertMaterial({color:0x76665a}),n);
 const bl=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;let da=Math.abs(((a-gateA)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);bl.push({a,gate:gateA!=null&&da*r.R<3.6})}
 sc.add(im);sc.add(ie);
 const tw=[],ft=W.ftex,step=Math.round(n/10);
 for(let i=0;i<n;i+=step){const b=bl[i];if(b.gate)continue;const g=new T.Group();
  const c=new T.Mesh(new T.CylinderGeometry(1.9,2.1,5.6,8),new T.MeshLambertMaterial({color:0x7d6b5c}));c.position.y=2.8;g.add(c);
  const top=new T.Mesh(new T.CylinderGeometry(2.3,2.3,.6,8),new T.MeshLambertMaterial({color:0x6a5a4c}));top.position.y=5.9;g.add(top);
  const pole=new T.Mesh(new T.CylinderGeometry(.09,.09,4.6,6),new T.MeshLambertMaterial({color:0xd8dce4}));pole.position.y=8.3;g.add(pole);
  const fl=new T.Mesh(new T.BoxGeometry(3.2,2,.06),new T.MeshLambertMaterial({map:ft}));fl.position.set(1.62,9.5,0);g.add(fl);
  g.position.set(r.cx+Math.cos(b.a)*r.R,0,r.cz+Math.sin(b.a)*r.R);g.userData={i,fl};sc.add(g);tw.push(g)}
 let gate=null;if(gateA!=null){gate=new T.Group();gate.position.set(r.cx+Math.cos(gateA)*r.R,0,r.cz+Math.sin(gateA)*r.R);gate.rotation.y=-gateA-Math.PI/2;
  const M=new T.MeshLambertMaterial({color:0x5a3a22}),dl=new T.Group(),dr=new T.Group();dl.position.x=-3.4;dr.position.x=3.4;
  const a1=new T.Mesh(new T.BoxGeometry(3.4,4.4,.45),M);a1.position.set(1.7,2.2,0);dl.add(a1);const a2=new T.Mesh(new T.BoxGeometry(3.4,4.4,.45),M);a2.position.set(-1.7,2.2,0);dr.add(a2);
  [dl,dr].forEach(d=>gate.add(d));const arch=new T.Mesh(new T.BoxGeometry(8.4,1.2,2.1),new T.MeshLambertMaterial({color:0x6a5a4c}));arch.position.y=5;gate.add(arch);
  const af=new T.Mesh(new T.BoxGeometry(3,1.9,.06),new T.MeshLambertMaterial({map:ft}));af.position.set(0,6.7,0);gate.add(af);gate.userData={dl,dr};sc.add(gate)}
 // захваченная зона — полупрозрачный фиолетовый круг (виден на общих планах)
 const zone=new T.Mesh(new T.CircleGeometry(r.R,64),new T.MeshBasicMaterial({color:0x8a3fe0,transparent:true,opacity:0,depthWrite:false}));zone.rotation.x=-Math.PI/2;zone.position.set(r.cx,.25,r.cz);sc.add(zone);
 // контур стены для общих планов сверху (сами блоки оттуда слишком тонкие)
 const line=new T.Mesh(new T.RingGeometry(r.R-3.2,r.R+3.2,96),new T.MeshBasicMaterial({color:0x6a1fc0,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));line.rotation.x=-Math.PI/2;line.position.set(r.cx,6,r.cz);sc.add(line);
 return {r,n,bl,im,ie,tw,gate,zone,line,start:0}}
const MX=()=>new W.T.Matrix4();
// k: доля построенного (0…1), порядок — от точки start по кругу в обе стороны, замыкание напротив
function setWall(Wl,k,open,flagK){const T=W.T,m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3(),{r,n,bl}=Wl;
 for(let i=0;i<n;i++){const b=bl[i];let da=Math.abs(((b.a-Wl.start)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/Math.PI;// 0 — старт, 1 — замыкание
  const u=b.gate?0:cl(0,1,(k*1.12-da)/.12),h=ss(u);
  e.set(0,-b.a-Math.PI/2,0);q.setFromEuler(e);
  p.set(r.cx+Math.cos(b.a)*r.R,1.7*h,r.cz+Math.sin(b.a)*r.R);s.set(1,Math.max(.001,h),1);m.compose(p,q,s);Wl.im.setMatrixAt(i,m);
  const nc=Wl.catA!=null&&Math.abs(((b.a-Wl.catA)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)*r.R<4.5;p.y=3.4*h+.5;s.set(i%2&&!nc?1:.001,Math.max(.001,h),1);m.compose(p,q,s);Wl.ie.setMatrixAt(i,m)}
 Wl.im.instanceMatrix.needsUpdate=true;Wl.ie.instanceMatrix.needsUpdate=true;
 Wl.tw.forEach(g=>{const b=bl[g.userData.i];const da=Math.abs(((b.a-Wl.start)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/Math.PI;const h=ss(cl(0,1,(k*1.12-da)/.12));
  g.scale.set(1,Math.max(.001,h),1);g.userData.fl.visible=flagK>0;g.userData.fl.scale.setScalar(Math.max(.001,flagK))});
 if(Wl.gate){Wl.gate.visible=k>.98;const o=ss(open)*1.35;Wl.gate.userData.dl.rotation.y=o;Wl.gate.userData.dr.rotation.y=-o}}
const inR=(h,r)=>Math.hypot(h.x-r.cx,h.z-r.cz)<r.R-2;
function prep(w){const T=w.THREE,sc=w.eval('sc'),L=w.MLIST||w.eval('MLIST');Object.assign(W,{T,sc,L,cam:w.eval('cam')});const MAP0=[...sc.children];
 const F=re=>L.find(h=>re.test(h.n)&&h.g);
 const H={yo:F(/^yo_meepo$/i),goku:F(/^oooominot$/i),doni:F(/^Doni03015$/i),vit:F(/^cartonsstorm$/i),max:F(/^Max verstappen$/i),gg:F(/^ggelv2$/i),kot:F(/^KAPAOKE_KOT$/)};
 for(const k in H)if(!H[k]){console.log('нет дома',k);H[k]={x:162,z:-64,top:6,n:k}}W.H=H;
 const ring=(hs,pad)=>{const cx=hs.reduce((s,h)=>s+h.x,0)/hs.length,cz=hs.reduce((s,h)=>s+h.z,0)/hs.length;return{cx,cz,R:Math.max(...hs.map(h=>Math.hypot(h.x-cx,h.z-cz)))+pad}};
 const r1=ring([H.yo,H.goku,H.doni],22),r2=ring([H.kot,H.vit,H.max],22);W.r1=r1;W.r2=r2;
 {const keep=new Set(Object.values(H).map(h=>h.g)),band=(x,z)=>[r1,r2].some(r=>Math.abs(Math.hypot(x-r.cx,z-r.cz)-r.R)<7);let nh=0;
  L.forEach(h=>{if(h.g&&!keep.has(h.g)&&band(h.x,h.z)){h.g.visible=false;h.hid=true;nh++}});
  const bx=new T.Box3(),sz=new T.Vector3(),v=new T.Vector3();
  MAP0.forEach(o=>{if(!o.visible||keep.has(o)||o.isLight||o.isInstancedMesh)return;o.getWorldPosition(v);if(!v.x&&!v.z)return;if(!band(v.x,v.z))return;
   bx.setFromObject(o);bx.getSize(sz);if(Math.max(sz.x,sz.z)<24&&sz.y<40){o.visible=false;nh++}});console.log('убрано у стен',nh)}
 W.aYo=Math.atan2(H.yo.z-r1.cz,H.yo.x-r1.cx);W.aG=Math.atan2(r2.cz-r1.cz,r2.cx-r1.cx);
 W.ftex=texIMEN(w);
 W.w1=mkWall(w,r1,W.aG);W.w1.start=W.aYo+Math.PI;
 {const ta=W.w1.tw.map(g=>W.w1.bl[g.userData.i].a).sort((a,b)=>a-b),mids=ta.map((a,i)=>i<ta.length-1?(a+ta[i+1])/2:(a+ta[0]+2*Math.PI)/2),dA=(a,b)=>Math.abs(((a-b)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);
  W.aCat=mids.filter(a=>dA(a,W.aG)>.12).sort((a,b)=>dA(a,W.aG+.3)-dA(b,W.aG+.3))[0]}W.w2=mkWall(w,r2,null);W.w2.start=Math.atan2(r1.cz-r2.cz,r1.cx-r2.cx)+Math.PI;
 // флаги на крышах: голубой — город, фиолетовый — IMEN
 const FL=L.filter(h=>h.g&&!h.hid&&!h.anon&&!h.site&&!h.bld&&h.day<=10&&h.top);W.FL=FL;
 FL.forEach(h=>{h.r1=inR(h,r1);h.r2=!h.r1&&inR(h,r2);h.im=h.district==='Страна Imen'});
 W.N1=FL.filter(h=>h.r1).length;W.N2=FL.filter(h=>h.r2).length;console.log('участков внутри стен',W.N1,W.N2);
 W.pole=new T.InstancedMesh(new T.CylinderGeometry(.08,.08,1,5),new T.MeshLambertMaterial({color:0xe8ecf2}),FL.length);
 W.cloth=new T.InstancedMesh(new T.BoxGeometry(2.3,1.45,.07),new T.MeshLambertMaterial({color:0xffffff}),FL.length);
 const c0=new T.Color(0x3fa8ff);FL.forEach((h,i)=>W.cloth.setColorAt(i,c0));sc.add(W.pole);sc.add(W.cloth);
 // кот-мэр и защитники
 W.w1.catA=W.aCat;W.cat=mkCat(T);W.cat.visible=false;sc.add(W.cat);
 // постамент у ворот Imen — кот выше субтитров
 W.ped=new T.Mesh(new T.BoxGeometry(2.8,1.9,2.8),new T.MeshLambertMaterial({color:0x8d7a68}));W.ped.position.set(42,.95,90);W.ped.visible=false;sc.add(W.ped);
 W.men=[];for(let i=0;i<10;i++){const g=mkMan(T,i);g.visible=false;sc.add(g);W.men.push(g)}
 // подсветка дома ggelv2 и свиток войны на воротах Страны Imen
 W.hl=new T.Mesh(new T.RingGeometry(6.5,8,48),new T.MeshBasicMaterial({color:0xf7c24a,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));W.hl.rotation.x=-Math.PI/2;W.hl.position.set(H.gg.x,.4,H.gg.z);sc.add(W.hl);
 W.scroll=new T.Mesh(new T.PlaneGeometry(7,9.2),new T.MeshLambertMaterial({map:texScroll(w),side:T.DoubleSide}));W.scroll.position.set(42,14.6,108.6);W.scroll.rotation.y=Math.PI;W.scroll.visible=false;sc.add(W.scroll);
 // в видео без названий платформ у районов
 try{w.eval("DL.forEach(d=>{if(d.e&&/YOUTUBE|TIKTOK/i.test(d.e.textContent))d.e.style.visibility='hidden'})")}catch(e){}
 // камера: цель на высоте ty (кот на стене выше земли)
 W.ty=0;const cam=W.cam;cam.lookAt=function(x,y,z){this.position.y+=W.ty;T.Object3D.prototype.lookAt.call(this,x,y+W.ty,z)};
 // свет: запомнить исходный
 W.LT=[];sc.traverse(o=>{if(o.isLight)W.LT.push([o,o.intensity,o.color.clone(),o.groundColor?o.groundColor.clone():null])});W.sky=sc.children.find(o=>o.isMesh&&o.material&&o.material.side===T.BackSide);
 W.ready=true}
// ночь (индиго) → рассвет (оранжевый) → день
function look(night,dawn){const T=W.T,sc=W.sc,c=new T.Color(),c2=new T.Color();
 const IND=new T.Color(0x4a52ff),IND2=new T.Color(0x1c1a5a);
 W.LT.forEach(([o,i,col,gcol])=>{o.intensity=i*(1-.28*night)*(1+.1*dawn);o.color.copy(col).lerp(IND,.88*night);if(gcol)o.groundColor.copy(gcol).lerp(IND2,.9*night)});
 if(sc.fog){c.setHex(0xe8a98a).lerp(c2.setHex(0xff8a4a),dawn).lerp(c2.setHex(0x1e1f66),night);sc.fog.color.copy(c);sc.fog.near=520;sc.fog.far=1100}
 if(W.sky){c.setHex(0xffffff).lerp(c2.setHex(0xffb080),dawn).lerp(c2.setHex(0x2a2f9a),night);W.sky.material.color.copy(c)}}

// ---- камера: [t0,t1, от, до]; Z(цель x, z, дистанция, поворот, наклон, высота цели) ----
const Z=(tx,tz,d,yaw,p,ty=0)=>({tx,tz,d,yaw,p,ty});
let CAM=null;
function buildCam(){const {H,r1,r2,aYo,aG,aCat}=W,yo=H.yo;
 const out=a=>Math.PI/2-a,inYaw=(h,r)=>Math.atan2(r.cx-h.x,r.cz-h.z),onW=(r,a,R=r.R)=>({x:r.cx+Math.cos(a)*R,z:r.cz+Math.sin(a)*R});
 // хук и финал — изнутри кольца: дом yo_meepo на фоне стены (снаружи его закрывает небоскрёб)
 const y0=inYaw(yo,r1),cat=onW(r1,aCat),gt=onW(r1,aG,r1.R+40),wd=onW(r1,Math.atan2(H.doni.z-r1.cz,H.doni.x-r1.cx)),mid={x:(r1.cx+r2.cx)/2,z:(r1.cz+r2.cz)/2};
 const o1=onW(r1,aYo+.9),o2=onW(r1,aYo+1.7);W.catW=cat;
 CAM=[
 [0,1,Z(yo.x,yo.z,115,y0,1.0,2),Z(yo.x,yo.z,52,y0+.12,.5,3)],
 [1,2,Z(yo.x,yo.z,62,y0+.35,.42,3),Z(yo.x,yo.z,72,y0+.45,.5,3)],
 [2,3.5,Z(r1.cx,r1.cz,150,.3,1.0),Z(r1.cx,r1.cz,240,.42,1.3)],
 [3.5,5,Z(o1.x,o1.z,36,out(aYo+.9),.3,3),Z(o2.x,o2.z,34,out(aYo+1.7),.3,3)],
 [5,6.5,Z(H.goku.x,H.goku.z,38,inYaw(H.goku,r1)-.75,.38,H.goku.top+3),Z(H.goku.x,H.goku.z,32,inYaw(H.goku,r1)-.6,.34,H.goku.top+3)],
 [6.5,8,Z(H.goku.x,H.goku.z,30,inYaw(H.goku,r1)-.5,.32,H.goku.top+3),Z(H.goku.x,H.goku.z,26,inYaw(H.goku,r1)-.4,.3,H.goku.top+3)],
 [8,9.5,Z(wd.x,wd.z,40,inYaw(H.doni,r1)+.5,.4,2),Z(H.doni.x,H.doni.z,28,inYaw(H.doni,r1)+.2,.42,3)],
 [9.5,11,Z(H.vit.x,H.vit.z,70,.9,.55,3),Z(H.vit.x,H.vit.z,38,1.0,.42,5)],
 [11,12,Z(cat.x,cat.z,6.2,out(aCat)+.15,.18,4.4),Z(cat.x,cat.z,5.2,out(aCat)+.25,.16,4.5)],
 [12,13.5,Z(gt.x,gt.z,95,Math.atan2(-Math.cos(aG),-Math.sin(aG)),.36,4),Z(gt.x,gt.z,82,Math.atan2(-Math.cos(aG),-Math.sin(aG)),.32,4)],
 [13.5,15,Z(r2.cx,r2.cz,170,.5,1.1),Z(r2.cx,r2.cz,240,.6,1.3)],
 [15,16.5,Z(H.max.x,H.max.z,40,inYaw(H.max,r2),.38,H.max.top+3),Z(H.max.x,H.max.z,34,inYaw(H.max,r2)+.15,.34,H.max.top+3)],
 [16.5,18,Z(H.gg.x+40,H.gg.z+30,170,.3,1.2),Z(H.gg.x,H.gg.z,100,.32,1.25)],
 [18,19.5,Z(H.gg.x,H.gg.z,62,.35,1.15),Z(H.gg.x,H.gg.z,42,.4,1.05)],
 [19.5,21,Z(mid.x,mid.z,430,.4,1.25),Z(mid.x,mid.z,390,.5,1.2)],
 [21,22.5,Z(cat.x,cat.z,14,out(aCat)+Math.PI+.1,.3,2.6),Z(cat.x,cat.z,11.5,out(aCat)+Math.PI+.2,.28,2.8)],
 [22.5,24.5,Z(r1.cx,r1.cz,150,y0+.5,.75),Z(r1.cx,r1.cz,135,y0+.7,.72)],
 [24.5,26,Z(cat.x,cat.z,8,out(aCat)+Math.PI-.1,.22,4.2),Z(cat.x,cat.z,7,out(aCat)+Math.PI,.2,4.3)],
 [26,27.5,Z(yo.x,yo.z,44,y0,.36,yo.top+3),Z(yo.x,yo.z,38,y0+.1,.34,yo.top+3)],
 [27.5,29,Z(42,96,15,Math.PI,.2,3.2),Z(42,96,12.5,Math.PI+.1,.22,3.5)],
 [29,30.5,Z(cat.x,cat.z,10,out(aCat)+.1,.24,4.3),Z(cat.x,cat.z,6,out(aCat)+.2,.16,4.5)]]}

// ---- 2D-слой: плашки, ники над домами ----
const PLQ=[[0,1,'ЗА НОЧЬ',''],[1,2,'IMEN ЗАХВАТИЛА УЧАСТКИ!','red'],[3.5,5,'СТЕНА','imen'],[5,6.5,'ФЛАГ → IMEN','imen'],[6.5,8,'НИК ОСТАЁТСЯ <b>ТВОИМ</b>',''],
 [11,12,'КОТ-МЭР',''],[12,13.5,'ЭТО ТОЛЬКО НАЧАЛО','red'],[15,16.5,'?','big'],[19.5,21,'<span class=c>ГОЛУБОЙ</span> — ГОРОД<br><span class=p>ФИОЛЕТОВЫЙ</span> — IMEN',''],
 [21,22.5,'ЗАЩИТНИКИ ГОРОДА','blue'],[22.5,24.5,'НАПИШИ В КОММЕНТАРИИ',''],[24.5,26,'ЛАЙК = +1 ЩИТ ГОРОДУ','blue'],[27.5,29,'ИМПЕРИЯ ОБЪЯВИЛА ВОЙНУ','red'],[29,30.5,'СЕРИЯ 12 — ЗАВТРА','gold']];
const NK=[[0,2,'yo','',''],[5,6.5,'goku','',''],[6.5,8,'goku','gold',''],[8,9.5,'doni','',''],[9.5,11,'vit','',''],[15,16.5,'max','city',' ?'],[18,19.5,'gg','gold',''],[26,27.5,'yo','city','']];
const NAME={yo:'@yo_meepo',goku:'@oooominot',doni:'@Doni03015',vit:'@cartonsstorm',max:'@Max verstappen',gg:'@ggelv2'};
let hearts=null;

window.seek=function(tv){const t=MAPT(tv),E=window.END,LU=ss(seg(tv,E-1.5,E-.02)),t2D=tv>=E-.2?0:t,tvS=tv>=E-.2?0:tv;
 const w=$('map').contentWindow,MP=w&&w.MP;if(!MP)return false;if(!W.ready)prep(w);if(!CAM)buildCam();
 // анимации карты — по времени ролика, а не по часам компьютера
 if(!w.__vt){w.__vt=true;w.performance.now=()=>w.__VT*1000}w.__VT=tv*(1-LU);
 const T=W.T,{H,r1,r2}=W;
 // камера: внутри плана — постоянная скорость
 const c=CAM.find(a=>t>=a[0]&&t<a[1])||CAM[CAM.length-1],u=cl(0,1,(t-c[0])/(c[1]-c[0]));
 for(const k of['tx','tz','d','yaw','p'])MP.K[k]=c[2][k]+(c[3][k]-c[2][k])*u;W.ty=lerp(c[2].ty,c[3].ty,u);
 // петля: последние 1,5 с камера плавно возвращается в стартовую точку CAM[0] — последний кадр = первый
 if(LU>0){if(!W.KB){const tb=MAPT(E-1.5),cb=CAM.find(a=>tb>=a[0]&&tb<a[1])||CAM[CAM.length-1],ub=cl(0,1,(tb-cb[0])/(cb[1]-cb[0]));W.KB={};for(const k of['tx','tz','d','yaw','p','ty'])W.KB[k]=cb[2][k]+(cb[3][k]-cb[2][k])*ub}
  const S0=CAM[0][2],KB=W.KB,dy=((S0.yaw-KB.yaw)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI,arc=Math.sin(Math.PI*LU);
  MP.K.tx=lerp(KB.tx,S0.tx,LU);MP.K.tz=lerp(KB.tz,S0.tz,LU);MP.K.d=lerp(KB.d,S0.d,LU)+170*arc;MP.K.yaw=KB.yaw+dy*LU;MP.K.p=lerp(KB.p,S0.p,LU)+.25*arc;W.ty=lerp(KB.ty,S0.ty,LU)}
 if(LU===0&&t>=1&&t<1.9){const a=1-seg(t,1,1.9);MP.K.yaw+=.018*a*Math.sin(t*93);MP.K.p+=.012*a*Math.sin(t*71)}
 if(t>=27.5&&t<28){const a=1-seg(t,27.5,28);MP.K.yaw+=.012*a*Math.sin(t*90)}
 // свет
 let night=t<.9?1:t<1.6?1-seg(t,.9,1.6):t>=29?1:0,dawn=t<.9?0:t<2.4?Math.sin(Math.PI*seg(t,.9,2.4)):0;if(LU>0){night=LU;dawn=0}
 const lk=night.toFixed(2)+dawn.toFixed(2);if(lk!==W.lk){look(night,dawn);W.lk=lk}
 // стены: первая растёт за ночь (0–1,4), вторая — на ре-хуке (12,7–14,9)
 const k1=(t<1.4?ss(seg(t,0,1.4)):1)*(1-LU),f1=(t<1.3?0:ss(seg(t,1.3,1.5)))*(1-LU);
 setWall(W.w1,k1,seg(t,12.3,13.3)*(t<29?1:0),f1);
 const k2=seg(t,12.7,14.9)*(1-LU),f2=(t<14.9?0:ss(seg(t,14.9,15.1)))*(1-LU);setWall(W.w2,k2,0,f2);W.w2.im.visible=W.w2.ie.visible=k2>0;
 const wide=(t>=2&&t<3.5)||(t>=13.5&&t<15)||(t>=19.5&&t<21)||(t>=22.5&&t<24.5);
 W.w1.zone.material.opacity=wide&&t>=1.3?.32:0;W.w2.zone.material.opacity=wide&&t>=14.9?.32:0;
 W.w1.line.material.opacity=wide&&k1>.99?.9:0;W.w2.line.material.opacity=wide?.9*k2:0;
 // ночь — индиго поверх карты
 $('night').style.opacity=(night*.3).toFixed(2);
 // флаги на крышах
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3(),cB=new T.Color(0x3fa8ff),cP=new T.Color(0xa64dff),cc=new T.Color();
 const fs=t>=19.5&&t<21?4.2:wide?2.2:1;
 W.FL.forEach((h,i)=>{let im=h.im;if(h.r1)im=t>=1.3;if(h.r2)im=t>=14.9;let k=im?1:0;
  if(h===H.goku)k=t<5.6?0:ss(seg(t,5.6,5.8));if(h===H.vit)k=t>=9.7?1:0;if(h===H.max&&t>=15&&t<16.5)k=Math.floor(t*5)%2;if(h===H.yo&&t>=26.6)k=1-ss(seg(t,26.6,26.8));
  if(!h.im||h.r1||h.r2)k*=1-LU;
  const big=(h===H.goku||h===H.vit||h===H.max||h===H.yo)?1.9:1,sc2=big*fs;
  cc.copy(cB).lerp(cP,k);W.cloth.setColorAt(i,cc);
  e.set(0,.3*Math.sin(2*Math.PI*Math.round(E/3)*tv/E+i),0);q.setFromEuler(e);
  p.set(h.x,h.top+1.6*sc2,h.z);s.set(sc2,3.2*sc2,sc2);m.compose(p,new T.Quaternion(),s);W.pole.setMatrixAt(i,m);
  p.set(h.x+Math.cos(e.y)*1.15*sc2,h.top+2.55*sc2,h.z-Math.sin(e.y)*1.15*sc2);s.set(sc2,sc2,sc2);m.compose(p,q,s);W.cloth.setMatrixAt(i,m)});
 W.pole.instanceMatrix.needsUpdate=true;W.cloth.instanceMatrix.needsUpdate=true;W.cloth.instanceColor.needsUpdate=true;
 // кот-мэр: на стене с 11 с, у Страны Imen 27,5–29, в финале на стене у дома yo_meepo
 const cat=W.cat,ud=cat.userData;let cp=null;
 if(t>=11&&t<27.5||t>=29)cp={x:W.catW.x,z:W.catW.z,y:3.4};else if(t>=27.5&&t<29)cp={x:42,z:90,y:1.9};
 // положение камеры этого кадра (W.cam ещё с прошлого кадра — на склейке кот смотрел бы не туда)
 const K=MP.K,cpk=Math.cos(K.p),cm={x:K.tx+Math.sin(K.yaw)*cpk*K.d,z:K.tz+Math.cos(K.yaw)*cpk*K.d};
 cat.visible=!!cp&&LU<.3;cat.scale.setScalar(.36*Math.max(.001,1-ss(seg(LU,.06,.28))));if(cp){cat.position.set(cp.x,cp.y,cp.z);cat.rotation.y=Math.atan2(cm.x-cp.x,cm.z-cp.z);
  // 11 — хмурится, руки скрещены; 21 — кричит, машет защитникам; 22,5–27,5 — гордо держит щит; 27,5 — шок, очки съехали; 29 — решительно, кулак вверх
  const E=t<12?'angry':t<22.5?'shout':t<27.5?'proud':t<29?'shock':'brave';
  ud.mS.visible=E==='proud'||E==='brave';ud.mF.visible=E==='angry';ud.mO.visible=E==='shout'||E==='shock';
  ud.mO.scale.set(1,E==='shout'?.55+.65*Math.abs(Math.sin(t*9)):1.3,1);
  const sk=E==='shock'?ss(seg(t,27.6,27.85)):0;ud.gl.position.y=-.4*sk;ud.eyes.visible=sk>.3;ud.eyes.scale.set(1,1+.3*sk,1);
  const bA={angry:.45,shout:.35,proud:0,shock:-.28,brave:.3}[E],bY={angry:.47,shout:.5,proud:.55,shock:.74,brave:.5}[E];
  ud.bL.rotation.z=-bA;ud.bR.rotation.z=bA;ud.bL.position.y=ud.bR.position.y=bY;
  ud.tie.rotation.z=.15*Math.sin(t*7);ud.tail.rotation.z=.35*Math.sin(t*(E==='angry'?10:3));
  const shield=t>=21&&t<27.5||t>=29;ud.sh.visible=shield;
  const aR=ud.armR.rotation,aL=ud.armL.rotation;aR.set(0,0,0);aL.set(0,0,0);
  if(E==='angry'){aL.set(-1.2,0,.75);aR.set(-1.2,0,-.75)}
  if(shield)aR.x=-1.6*ss(seg(t,t>=29?29:21,(t>=29?29:21)+.35));
  if(E==='shout')aL.z=-1.6-.45*Math.sin(t*11);
  if(E==='proud')aL.z=-.35;
  if(E==='shock'){aL.z=-2.5;aR.z=2.5}
  if(E==='brave')aL.z=-2.7*ss(seg(t,29.25,29.5));
  const h=ud.head.rotation;h.set(0,0,0);
  if(E==='angry'){h.x=.12;h.z=.06*Math.sin(t*16)}
  if(E==='shout')h.x=-.15+.08*Math.sin(t*9);
  if(E==='proud'){h.x=-.12+.06*Math.sin(t*3);h.z=.1}
  if(E==='shock')h.x=-.5;
  cat.position.y+=E==='shout'||E==='proud'?.08*Math.abs(Math.sin(t*6)):E==='brave'?.25*Math.sin(Math.PI*seg(t,29.2,29.5)):0}
 // защитники бегут к коту (21–22,5), стоят со щитами до 27,5, у Страны Imen 27,5–29
 W.men.forEach((g,i)=>{let on=false;const side=(i%2?1:-1)*(1+Math.floor(i/2))*.04;
  if(t>=21&&t<27.5){on=true;const a=W.aCat+side*.6,R0=r1.R-3-(i%3)*1.8,run=1-ss(seg(t,21,22.4)),R=R0-run*24;g.position.set(r1.cx+Math.cos(a)*R,0,r1.cz+Math.sin(a)*R);g.position.y=run>0?Math.abs(Math.sin(t*14+i))*.6:0}
  else if(t>=27.5&&t<29){on=true;g.position.set(42+(i<5?-1:1)*(2.4+(i%5)*1.7),0,95+(i%5)*1.4)}
  g.visible=on&&LU<.3;g.scale.setScalar(.75*Math.max(.001,1-ss(seg(LU,.06,.28))));if(on){g.rotation.y=Math.atan2(cm.x-g.position.x,cm.z-g.position.z)}});
 W.hl.material.opacity=t>=18.3&&t<19.5?.9:0;W.hl.scale.setScalar(1+.08*Math.sin(t*12));
 W.scroll.visible=t>=27.5&&t<29;W.ped.visible=W.scroll.visible;
 // ники карты в серии не нужны — свои крупные плашки
 const d=w.document;if(!d.getElementById('vcs')){const st=d.createElement('style');st.id='vcs';st.textContent='.mpn{display:none!important}';d.head.appendChild(st)}
 MP.draw();
 // ---- 2D ---- (в последние 0,2 с — как в первом кадре, чтобы петля была без склейки)
 {const t=t2D;
 const sb=[...SUBV].reverse().find(a=>tvS>=a[0]);const S=$('sub'),tx=sb?sb[1]:'';S.textContent=tx;S.className='o '+(sb&&sb[2]||'');
 S.style.fontSize=(tx.length>12?Math.max(78,Math.round(118*12/tx.length)):118)+'px';S.style.transform='scale('+(sb?pop(tvS,sb[0]):1)+')';
 const pq=PLQ.find(a=>t>=a[0]&&t<a[1]);show('plq',!!pq,pq?pop(t,pq[0]):1);if(pq){$('plq').className='o '+pq[3];$('plq').firstChild.innerHTML=pq[2]}
 // счётчик участков
 const cn=t>=2&&t<3.5?'<b>'+Math.round(W.N1*ss(seg(t,2.1,3.2)))+'</b> УЧАСТКОВ':t>=13.5&&t<15?W.N1+' → <b>'+Math.round(W.N1+W.N2*ss(seg(t,13.6,14.9)))+'</b> УЧАСТКОВ':'';
 show('cnt',!!cn);if(cn)$('cnt').firstChild.innerHTML=cn;
 // ник над крышей
 const nk=NK.find(a=>t>=a[0]&&t<a[1]);show('nick',!!nk);
 if(nk){const h=H[nk[2]],v=new T.Vector3(h.x,h.top+(h===H.yo?6:4.5),h.z).project(W.cam),N=$('nick');N.className='o '+nk[3];N.firstChild.textContent=NAME[nk[2]]+nk[4];
  const wd=N.firstChild.offsetWidth,x=cl(40+wd/2,1040-wd/2,(v.x*.5+.5)*1080),y=cl(560,1150,(-v.y*.5+.5)*1920);
  N.style.transform='translate('+Math.round(x-wd/2)+'px,'+Math.round(y-130)+'px) scale('+pop(t,nk[0])+')'}
 // телефон: карта в Telegram
 const ph=t>=16.5&&t<20.2;show('tg',ph);if(ph){const sl=ss(seg(t,19.5,20.2));$('tg').style.transform='translateY('+Math.round(sl*1700)+'px)';$('tg').style.boxShadow='0 0 0 3000px rgba(8,10,20,'+(.62*(1-sl)).toFixed(2)+'),0 30px 80px rgba(0,0,0,.5)';
  const q2='ggelv2',n2=t<18?0:cl(0,q2.length,Math.floor((t-18)*14));$('tgs').innerHTML='🔍 '+(n2?q2.slice(0,n2):'<span style="color:#8a8fa3">ник жителя</span>')+'<i></i>'}
 // выбор
 const vt=t>=22.5&&t<24.5;show('vote',vt,vt?pop(t,22.5):1);if(vt){const q3='@твой_ник',n3=cl(0,q3.length,Math.floor((t-22.6)*10));$('vin').innerHTML='<em>ник:</em> '+q3.slice(0,n3)+'<i></i>';
  $('vb1').style.transform='scale('+(Math.abs(t-23.05)<.12?.9:1)+')';$('vb2').style.transform='scale('+(Math.abs(t-23.45)<.12?.9:1)+')'}
 // лайк = +1 щит
 const lk2=t>=24.5&&t<26;show('like',lk2,lk2?pop(t,24.5):1);
 if(lk2){const f=ss(seg(t,24.6,25.9));$('lfill').setAttribute('y',String(440-440*f));$('lpl').textContent='+'+(1+Math.floor(seg(t,24.6,25.9)*4))+' 🛡';
  if(!hearts){hearts=[];for(let i=0;i<4;i++){const e2=document.createElement('div');e2.className='hrt';e2.textContent='❤️';$('like').appendChild(e2);hearts.push(e2)}}
  hearts.forEach((e2,i)=>{const t0=24.6+i*.35,k=seg(t,t0,t0+.45);e2.style.display=t>=t0&&k<1?'block':'none';e2.style.transform='translate('+(540+(i%2?120:-170)-55)+'px,'+Math.round(900-k*420)+'px) scale('+(1-.5*k)+')'})}
 // комментарий yo_meepo
 show('cmt',t>=26.1&&t<27.5,t>=26.1?pop(t,26.1):1);
 // плашка Telegram в финале
 show('tgp',t>=27.5,t>=27.5?pop(t,27.5):1);
 // затемнение и вспышки
 const dark=t>=26&&t<27.5?.5:t>=12&&t<12.4?.55:1;$('map').style.filter=dark<1?'brightness('+dark+')':(t>=22.5&&t<26?'blur(5px) brightness(.72)':'none');
 $('flash').style.opacity=t>=1.3&&t<1.6?(1-seg(t,1.3,1.6))*.45:t>=14.9&&t<15.15?(1-seg(t,14.9,15.15))*.35:t>=27.5&&t<27.7?(1-seg(t,27.5,27.7))*.4:0;
 }
 return true};

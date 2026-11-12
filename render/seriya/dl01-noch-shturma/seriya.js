// ДЕМО длинного ролика «Ночь штурма» (stsenarii/dlinnyy-01-noch-shturma.md), 1920×1080, без озвучки, ~100 с.
// window.seek(t) рисует кадр на секунде t. Сцена = живая карта + стена вокруг центра, золотой дом, кот-мэр (KARAOKE_KOT),
// катапульты с краской и желе, водомёты, осадные башни и таран, пролом, солдаты IMEN, дирижабли с десантом, робот Империи.
const END=100;window.END=END;
const ss=u=>u*u*(3-2*u),cl=(a,b,x)=>Math.max(a,Math.min(b,x)),lerp=(a,b,u)=>a+(b-a)*u,seg=(t,a,b)=>cl(0,1,(t-a)/(b-a));
const $=id=>document.getElementById(id);
function show(id,on,s){const e=$(id);e.style.display=on?'block':'none';if(on&&s!=null)e.style.transform='scale('+s+')'}
function pop(t,t0){const k=(t-t0)/.12;return k>=1?1:k<0?1:(k<.5?1+.24*k:1.12-.24*(k-.5))}
const dA=(a,b)=>Math.abs(((a-b)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);

// ---- субтитры (вместо голоса в демо), плашки, подсказки ----
const SUB=[[0,'Одна ночь. Империя идёт на золотой дом.','red'],[4,'Я кот-мэр. До рассвета я не сплю.'],[8,'Щиты — всем жителям!','tq'],[12,'Перекличка! Найди свой ник','gold'],
[18,'Катапульты! Краска и желе!','imen'],[24,'Дома фиолетовые… но ник остаётся твоим','gold'],[30,'Водомёты — огонь! Смываем!','tq'],[34,'Идёт что-то большое и деревянное…'],
[40,'Тараны бьют в ворота!','red'],[46,'Пролом! Сто двадцать шесть мест!','red'],[52,'Тишина… на востоке гудят дирижабли'],[58,'Десант с неба!','imen'],[66,'Щиты вверх!','tq'],
[70,'Это… робот Империи','red'],[79,'Все водомёты — залп!','tq'],[84,'Рассвет. Мы выстояли.','gold'],[88,'874 → 1000: закрой пролом своим домом','gold'],[92,'Отбить или договориться? Пиши ник','tq'],[97,'А у стены на рассвете стояла Тень…','imen']];
const PLQ=[[0,4,'ОДНА НОЧЬ','red'],[12,18,'ПЕРЕКЛИЧКА','blue'],[18,24,'ВОЛНА 1: КАТАПУЛЬТЫ','imen'],[34,46,'ВОЛНА 2: ТАРАНЫ И БАШНИ','imen'],[46,52,'ПРОЛОМ: 126 МЕСТ','red'],
[58,70,'ВОЛНА 3: ДЕСАНТ','imen'],[70,84,'ВОЛНА 4: РОБОТ','red'],[84,92,'РАССВЕТ','gold']];
const WAVE=[[0,.1],[18,.3],[34,.55],[52,.45],[58,.7],[70,1],[84,0]];

// ---- модели ----
const W={};
const MAT=(T,c,e)=>new T.MeshLambertMaterial(e?{color:c,emissive:c,emissiveIntensity:e}:{color:c});
function box(T,p,w,h,d,c,x,y,z,e){const m=new T.Mesh(new T.BoxGeometry(w,h,d),MAT(T,c,e));m.position.set(x,y,z);p.add(m);return m}
function cyl(T,p,r1,r2,h,c,x,y,z,seg=8,e){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg),MAT(T,c,e));m.position.set(x,y,z);p.add(m);return m}
function mkCat(T){const g=new T.Group(),B=(w,h,d,c,x,y,z,p)=>box(T,p||g,w,h,d,c,x,y,z);
 const SUIT=0x16161c,FUR=0xd0582a,DARK=0xa8441e;
 B(.6,2.0,.62,SUIT,-.42,1.0,0);B(.6,2.0,.62,SUIT,.42,1.0,0);B(.72,.26,.95,0x111111,-.42,.13,.16);B(.72,.26,.95,0x111111,.42,.13,.16);
 B(1.8,2.0,1.05,SUIT,0,3.0,0);B(.62,1.25,.06,0xffffff,0,3.4,.54);const tie=B(.24,1.05,.07,0xd8263a,0,3.22,.58);
 const armL=new T.Group();armL.position.set(-1.1,3.8,0);g.add(armL);B(.48,1.5,.52,SUIT,0,-.7,0,armL);B(.48,.42,.48,FUR,0,-1.55,0,armL);
 const armR=new T.Group();armR.position.set(1.1,3.8,0);g.add(armR);B(.48,1.5,.52,SUIT,0,-.7,0,armR);B(.48,.42,.48,FUR,0,-1.55,0,armR);
 const sh=new T.Group();sh.position.set(.1,-1.5,.55);armR.add(sh);const sd=cyl(T,sh,1.25,1.25,.22,0x2f8fff,0,0,0,6);sd.rotation.x=Math.PI/2;const se=cyl(T,sh,.75,.75,.24,0xffffff,0,0,.02,6);se.rotation.x=Math.PI/2;
 const head=new T.Group();head.position.set(0,4.85,0);g.add(head);B(2.0,1.75,1.65,FUR,0,0,0,head);B(1.15,.7,.22,0xf3d2b8,0,-.42,.84,head);
 [-.62,.62].forEach(x=>{const e=new T.Mesh(new T.ConeGeometry(.45,.85,4),MAT(T,FUR));e.position.set(x,1.15,0);e.rotation.y=Math.PI/4;head.add(e)});
 B(.25,.08,1.67,DARK,0,.79,0,head);B(.72,.4,.08,0x0a0a0a,-.45,.18,.88,head);B(.72,.4,.08,0x0a0a0a,.45,.18,.88,head);B(1.9,.1,.06,0x0a0a0a,0,.3,.87,head);
 B(.2,.15,.08,0xd23a4a,0,-.18,.96,head);const mO=B(.36,.28,.07,0x3a1a0a,0,-.5,.96,head);
 g.userData={head,armR,armL,tie,mO};g.scale.setScalar(.36);return g}
function mkMan(T,col,shield){const g=new T.Group(),B=(w,h,d,c,x,y,z)=>box(T,g,w,h,d,c,x,y,z);
 B(.32,.9,.36,0x1d2238,-.2,.45,0);B(.32,.9,.36,0x1d2238,.2,.45,0);B(.9,1.1,.5,col,0,1.45,0);B(.7,.7,.7,0xf2c9a0,0,2.35,0);B(.16,.16,.05,0x111111,-.16,2.4,.36);B(.16,.16,.05,0x111111,.16,2.4,.36);
 if(shield){const s=cyl(T,g,.6,.6,.12,shield,.1,1.4,.42,6);s.rotation.x=Math.PI/2}
 g.scale.setScalar(.75);return g}
function texIMEN(w){const cv=w.document.createElement('canvas');cv.width=256;cv.height=160;const x=cv.getContext('2d');
 x.fillStyle='#7b2fbe';x.fillRect(0,0,256,160);x.fillStyle='#d8263a';x.fillRect(0,112,256,48);x.fillStyle='#fff';x.font='900 72px Arial Black, Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('IMEN',128,58);
 return new w.THREE.CanvasTexture(cv)}
function mkCatapult(T){const g=new T.Group();box(T,g,4,1,6,0x6b4a2a,0,1,0);[[-2.2,-2],[2.2,-2],[-2.2,2],[2.2,2]].forEach(([x,z])=>{const w=cyl(T,g,.9,.9,.5,0x3a2a1a,x,.9,z,10);w.rotation.z=Math.PI/2});
 box(T,g,.5,3,.5,0x6b4a2a,-1.4,2.5,0);box(T,g,.5,3,.5,0x6b4a2a,1.4,2.5,0);box(T,g,3.3,.4,.4,0x6b4a2a,0,3.9,0);
 const arm=new T.Group();arm.position.set(0,3.9,0);g.add(arm);box(T,arm,.45,.45,7,0x8a6a40,0,0,-2.5);box(T,arm,1.4,.6,1.4,0x7b2fbe,0,.3,-6);g.userData.arm=arm;return g}
function mkTower(T,ft){const g=new T.Group();[0,1,2,3].forEach(i=>box(T,g,6-i*.6,4,6-i*.6,i%2?0x7a5634:0x6b4a2a,0,2+i*4,0));box(T,g,3,.3,8,0x8a6a40,0,13,-3.5).rotation.x=-.5;
 [[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6]].forEach(([x,z])=>{const w=cyl(T,g,1,1,.6,0x3a2a1a,x,1,z,10);w.rotation.z=Math.PI/2});
 cyl(T,g,.1,.1,5,0xd8dce4,0,19,0,6);const f=new T.Mesh(new T.BoxGeometry(3.2,2,.06),new T.MeshLambertMaterial({map:ft}));f.position.set(1.6,20.5,0);g.add(f);return g}
function mkRam(T){const g=new T.Group();box(T,g,4,3,9,0x5a3a22,0,3,0);box(T,g,4.6,.5,9.6,0x7b2fbe,0,4.7,0);const log=cyl(T,g,.8,.8,11,0x8a6a40,0,2,1.5,10);log.rotation.x=Math.PI/2;
 box(T,g,1.8,1.8,1.8,0x3a3a44,0,2,7.2);[[-2.2,-3],[2.2,-3],[-2.2,3],[2.2,3]].forEach(([x,z])=>{const w=cyl(T,g,.9,.9,.5,0x3a2a1a,x,.9,z,10);w.rotation.z=Math.PI/2});return g}
function mkAirship(T,ft){const g=new T.Group();const b=new T.Mesh(new T.SphereGeometry(5,16,10),MAT(T,0x5a2a9a));b.scale.set(1,1,2.4);g.add(b);
 box(T,g,3,2,5,0x3a2a1a,0,-6,0);const f=new T.Mesh(new T.BoxGeometry(5,3,.08),new T.MeshLambertMaterial({map:ft}));f.position.set(0,0,-12.5);f.rotation.y=Math.PI/2;g.add(f);
 const pr=new T.Group();pr.position.set(0,-6,-3);g.add(pr);box(T,pr,6,.3,.3,0x222222,0,0,0);box(T,pr,.3,6,.3,0x222222,0,0,0);g.userData.pr=pr;return g}
function mkPara(T){const g=new T.Group();box(T,g,.9,1.4,.6,0x7b2fbe,0,0,0);box(T,g,.7,.7,.7,0xf2c9a0,0,1.1,0);const c=new T.Mesh(new T.SphereGeometry(2,10,6,0,Math.PI*2,0,Math.PI/2),MAT(T,0xd8263a));c.position.y=4;g.add(c);g.userData.c=c;return g}
function mkRobot(T,ft){const g=new T.Group(),G=0x8a5ad0,D=0x5a3a8a;
 const legL=box(T,g,4,10,4,D,-3,5,0),legR=box(T,g,4,10,4,D,3,5,0);box(T,g,12,10,7,G,0,15,0);
 const armL=box(T,g,3,10,3,D,-8,14,0),armR=box(T,g,3,10,3,D,8,14,0);box(T,g,7,5,6,G,0,22.5,0);
 const eyes=[box(T,g,1.6,1,.4,0xff2020,-1.6,23,3.1,1.4),box(T,g,1.6,1,.4,0xff2020,1.6,23,3.1,1.4)];
 const em=new T.Mesh(new T.PlaneGeometry(6,3.75),new T.MeshLambertMaterial({map:ft}));em.position.set(0,16,3.55);g.add(em);
 cyl(T,g,.15,.15,4,0xd8dce4,0,27,0,6);g.userData={legL,legR,armL,armR,eyes};return g}
function mkGold(T){const g=new T.Group(),Gc=0xf7c24a;box(T,g,7,5,7,Gc,0,2.5,0,.35);const r=new T.Mesh(new T.ConeGeometry(5.6,4,4),MAT(T,0xffd860,.45));r.position.y=7;r.rotation.y=Math.PI/4;g.add(r);
 box(T,g,1.6,2.6,.2,0x8a5a10,0,1.3,3.55);box(T,g,1.4,1.4,.2,0xfff3b0,-2,3,3.55,.8);box(T,g,1.4,1.4,.2,0xfff3b0,2,3,3.55,.8);
 const l=new T.PointLight(0xffc040,1.6,40);l.position.y=6;g.add(l);g.userData.l=l;return g}
function mkCannon(T){const g=new T.Group();box(T,g,1.4,1,1.4,0x2f6fd0,0,.5,0);const p=cyl(T,g,.35,.45,2.2,0x9fb8d8,0,1.3,.7,8);p.rotation.x=Math.PI/2.6;return g}

// стена кольцом с воротами
function mkWall(T,sc,r,gateA,ft){const n=Math.round(2*Math.PI*r.R/2.7),bl=[];
 const im=new T.InstancedMesh(new T.BoxGeometry(2.75,3.4,1.9),MAT(T,0x8d7a68),n),ie=new T.InstancedMesh(new T.BoxGeometry(1.05,1,1.95),MAT(T,0x76665a),n);sc.add(im);sc.add(ie);
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2;bl.push({a,gate:dA(a,gateA)*r.R<3.6})}
 const tw=[];for(let i=0;i<n;i+=Math.round(n/12)){if(bl[i].gate)continue;const g=new T.Group();cyl(T,g,1.9,2.1,5.6,0x7d6b5c,0,2.8,0);cyl(T,g,2.3,2.3,.6,0x6a5a4c,0,5.9,0);
  cyl(T,g,.09,.09,4.6,0xd8dce4,0,8.3,0,6);const f=new T.Mesh(new T.BoxGeometry(3.2,2,.06),MAT(T,0x2f8fff));f.position.set(1.62,9.5,0);g.add(f);
  g.position.set(r.cx+Math.cos(bl[i].a)*r.R,0,r.cz+Math.sin(bl[i].a)*r.R);sc.add(g);tw.push({g,i})}
 const gate=new T.Group();gate.position.set(r.cx+Math.cos(gateA)*r.R,0,r.cz+Math.sin(gateA)*r.R);gate.rotation.y=-gateA-Math.PI/2;
 const dl=new T.Group(),dr=new T.Group();dl.position.x=-3.4;dr.position.x=3.4;box(T,dl,3.4,4.4,.5,0x5a3a22,1.7,2.2,0);box(T,dr,3.4,4.4,.5,0x5a3a22,-1.7,2.2,0);gate.add(dl,dr);
 box(T,gate,8.4,1.2,2.1,0x6a5a4c,0,5,0);sc.add(gate);return {r,n,bl,im,ie,tw,gate}}
function setWall(Wl,t,breachA){const T=W.T,m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3(),{r,n,bl}=Wl;
 for(let i=0;i<n;i++){const b=bl[i];e.set(0,-b.a-Math.PI/2,0);q.setFromEuler(e);
  let x=r.cx+Math.cos(b.a)*r.R,z=r.cz+Math.sin(b.a)*r.R,y=1.7,sc=b.gate?0:1;
  const db=dA(b.a,breachA)*r.R;if(db<9&&t>=46){const u=seg(t,46+db*.03,47.3+db*.03),k=(1-db/9);x-=Math.cos(b.a)*u*9*k;z-=Math.sin(b.a)*u*9*k;y+=Math.sin(Math.PI*u)*7*k;sc=Math.max(0,1-u)}
  if(db<9&&t<46&&t>=40){const hit=[40.5,42,43.5,45].some(h=>t>=h&&t<h+.25);if(hit){x+=Math.sin(t*90)*.15}}
  p.set(x,y,z);s.set(1,Math.max(.001,sc),1);m.compose(p,q,s);Wl.im.setMatrixAt(i,m);p.y=y+2.2;s.set(i%2&&sc>0?1:.001,Math.max(.001,sc),1);m.compose(p,q,s);Wl.ie.setMatrixAt(i,m)}
 Wl.im.instanceMatrix.needsUpdate=true;Wl.ie.instanceMatrix.needsUpdate=true;
 const o=t>=40&&t<46?.08*Math.sin(t*40)*([40.5,42,43.5,45].some(h=>t>=h&&t<h+.3)?1:0):0;Wl.gate.children[0].rotation.y=o;Wl.gate.children[1].rotation.y=-o}

function prep(w){const T=w.THREE,sc=w.eval('sc'),L=w.MLIST||w.eval('MLIST');Object.assign(W,{T,sc,L,cam:w.eval('cam')});const MAP0=[...sc.children];
 const F=re=>L.find(h=>re.test(h.n)&&h.g);
 const kot=F(/^KAPAOKE_KOT$/)||{x:162,z:-84},vit=F(/^cartonsstorm$/i)||{x:172,z:-12},max=F(/^Max verstappen$/i)||{x:125,z:-25};
 const cx=(kot.x+vit.x+max.x)/3,cz=(kot.z+vit.z+max.z)/3,R=Math.max(...[kot,vit,max].map(h=>Math.hypot(h.x-cx,h.z-cz)))+22,r={cx,cz,R};W.r=r;
 const aI=Math.atan2(176-cz,42-cx),aB=aI+.22,P=(a,d)=>({x:cx+Math.cos(a)*d,z:cz+Math.sin(a)*d});Object.assign(W,{aI,aB,P,kot});
 const G=P(aI,R*.38);W.G=G;
 // расчистить: полоса стены, площадка золотого дома, поле осады снаружи у ворот
 const clear=(x,z)=>{const d=Math.hypot(x-cx,z-cz),a=Math.atan2(z-cz,x-cx);return Math.abs(d-R)<7||Math.hypot(x-G.x,z-G.z)<10||(d>R+3&&d<R+95&&dA(a,aI)<.5)};
 L.forEach(h=>{if(h.g&&h!==kot&&clear(h.x,h.z)){h.g.visible=false;h.hid=true}});
 const bx=new T.Box3(),v=new T.Vector3(),sz=new T.Vector3();
 MAP0.forEach(o=>{if(!o.visible||o.isLight||o.isInstancedMesh||o===kot.g)return;o.getWorldPosition(v);if(!v.x&&!v.z)return;if(!clear(v.x,v.z))return;bx.setFromObject(o);bx.getSize(sz);if(Math.max(sz.x,sz.z)<30&&sz.y<45)o.visible=false});
 W.ft=texIMEN(w);
 W.wall=mkWall(T,sc,r,aI,W.ft);
 W.gold=mkGold(T);W.gold.position.set(G.x,0,G.z);sc.add(W.gold);
 // кот-мэр на стене у ворот, защитники внутри
 W.aCat=aI-.14;const cp=P(W.aCat,R);W.catP=cp;W.cat=mkCat(T);W.cat.position.set(cp.x,3.4,cp.z);sc.add(W.cat);
 W.def=[];for(let i=0;i<10;i++){const g=mkMan(T,[0x2f6fd0,0x3f9a5a,0xe0e4ea][i%3],0x2f8fff),a=W.aCat+(i-4.5)*.05,q=P(a,R-4-(i%3)*1.8);g.position.set(q.x,0,q.z);sc.add(g);W.def.push(g)}
 // катапульты, башни, таран, прожекторы
 W.cats=[];for(let i=0;i<6;i++){const g=mkCatapult(T),q=P(aI+(i-2.5)*.11,R+40+(i%2)*6);g.position.set(q.x,0,q.z);g.rotation.y=Math.atan2(cx-q.x,cz-q.z)+Math.PI;sc.add(g);W.cats.push(g)}
 W.towers=[-.3,.3].map(o=>{const g=mkTower(T,W.ft);g.userData.a=aI+o;sc.add(g);return g});
 W.ram=mkRam(T);sc.add(W.ram);
 W.lights=[];for(let i=0;i<4;i++){const g=new T.Group(),q=P(aI+(i-1.5)*.2,R+52);g.position.set(q.x,0,q.z);cyl(T,g,.8,1,3,0x2a2238,0,1.5,0);
  const beam=new T.Mesh(new T.CylinderGeometry(.6,9,70,16,1,true),new T.MeshBasicMaterial({color:0xfff2a0,transparent:true,opacity:.13,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
  beam.geometry.translate(0,35,0);const piv=new T.Group();piv.position.y=3;piv.add(beam);g.add(piv);g.userData.piv=piv;sc.add(g);W.lights.push(g)}
 // цели краски: дома внутри стены ближе к воротам
 const gate=P(aI,R);W.targets=L.filter(h=>h.g&&!h.hid&&h.g.visible&&h!==kot&&Math.hypot(h.x-cx,h.z-cz)<R-8).sort((a,b)=>Math.hypot(a.x-gate.x,a.z-gate.z)-Math.hypot(b.x-gate.x,b.z-gate.z)).slice(0,10);
 W.paint=W.targets.map((h,i)=>{bx.setFromObject(h.g);bx.getSize(sz);bx.getCenter(v);const m=new T.Mesh(new T.BoxGeometry(sz.x+.4,sz.y+.3,sz.z+.4),new T.MeshLambertMaterial({color:i%2?0xff6ad5:0x9b3dff,transparent:true,opacity:0}));m.position.copy(v);sc.add(m);return m});
 W.blobs=W.targets.map((h,i)=>{const m=new T.Mesh(new T.SphereGeometry(1.5,10,8),MAT(T,i%2?0xff6ad5:0x9b3dff,.3));m.visible=false;sc.add(m);return m});
 // водомёты на стене и струи
 W.can=[];for(let k=0;k<5;k++){const q=P(aI+(k-2)*.09,R-1.4),g=mkCannon(T);g.position.set(q.x,3.4,q.z);sc.add(g);
  const jet=new T.Mesh(new T.CylinderGeometry(.35,.6,1,8,1,true),new T.MeshBasicMaterial({color:0x7fdcff,transparent:true,opacity:.75,depthWrite:false}));jet.geometry.translate(0,.5,0);jet.visible=false;sc.add(jet);W.can.push({g,jet,x:q.x,z:q.z})}
 // солдаты IMEN, дирижабли, десант, робот
 W.sold=[];for(let i=0;i<16;i++){const g=mkMan(T,0x7b2fbe,0xa64dff);g.visible=false;sc.add(g);W.sold.push(g)}
 W.ships=[0,1,2].map(k=>{const g=mkAirship(T,W.ft);g.visible=false;sc.add(g);return g});
 W.paras=[];for(let i=0;i<9;i++){const g=mkPara(T);g.visible=false;sc.add(g);W.paras.push(g)}
 W.robot=mkRobot(T,W.ft);W.robot.visible=false;sc.add(W.robot);
 // перекличка: самый густой квартал
 {const H=L.filter(h=>h.g&&h.g.visible&&!h.anon&&!h.site&&!h.bld),Gm=new Map();H.forEach(h=>{const k=Math.floor(h.x/45)+','+Math.floor(h.z/45);if(!Gm.has(k))Gm.set(k,[]);Gm.get(k).push(h)});
  const g=[...Gm.values()].sort((a,b)=>b.length-a.length)[0];W.dense={x:g.reduce((s,h)=>s+h.x,0)/g.length,z:g.reduce((s,h)=>s+h.z,0)/g.length}}
 try{w.eval("DL.forEach(d=>{if(d.e&&/YOUTUBE|TIKTOK/i.test(d.e.textContent))d.e.style.visibility='hidden'})")}catch(e){}
 W.ty=0;W.cam.lookAt=function(x,y,z){this.position.y+=W.ty;T.Object3D.prototype.lookAt.call(this,x,y+W.ty,z)};
 W.LT=[];sc.traverse(o=>{if(o.isLight&&o!==W.gold.userData.l)W.LT.push([o,o.intensity,o.color.clone(),o.groundColor?o.groundColor.clone():null])});W.sky=sc.children.find(o=>o.isMesh&&o.material&&o.material.side===T.BackSide);
 W.ready=true}
function look(night,dawn){const T=W.T,sc=W.sc,c=new T.Color(),c2=new T.Color(),IND=new T.Color(0x4a52ff),IND2=new T.Color(0x1c1a5a);
 W.LT.forEach(([o,i,col,g])=>{o.intensity=i*(1-.3*night)*(1+.1*dawn);o.color.copy(col).lerp(IND,.85*night);if(g)o.groundColor.copy(g).lerp(IND2,.9*night)});
 if(sc.fog){c.setHex(0xe8a98a).lerp(c2.setHex(0xff8a4a),dawn).lerp(c2.setHex(0x1e1f66),night);sc.fog.color.copy(c);sc.fog.near=520;sc.fog.far=1100}
 if(W.sky){c.setHex(0xffffff).lerp(c2.setHex(0xffb080),dawn).lerp(c2.setHex(0x2a2f9a),night);W.sky.material.color.copy(c)}}

// ---- камера ----
const Z=(tx,tz,d,yaw,p,ty=0)=>({tx,tz,d,yaw,p,ty});let CAM=null;
function buildCam(){const {r,aI,aB,P,G,catP,dense,aCat}=W,out=a=>Math.PI/2-a,inn=a=>Math.PI/2-a+Math.PI;
 const f40=P(aI,r.R+40),gw=P(aI,r.R+4),br=P(aB,r.R-6),mid=P(aI,r.R*.3),rb=P(aI,r.R+20),c=W.targets.reduce((s,h)=>({x:s.x+h.x/10,z:s.z+h.z/10}),{x:0,z:0});
 CAM=[
 [0,4,Z(f40.x,f40.z,170,inn(aI)+.2,.42,4),Z(f40.x,f40.z,150,inn(aI)+.1,.38,4)],
 [4,8,Z(G.x,G.z,44,inn(aI)+.9,.26,4),Z(G.x,G.z,32,inn(aI)+.55,.22,4)],
 [8,12,Z(catP.x,catP.z,8,out(aCat)+.15,.2,4.4),Z(catP.x,catP.z,6.5,out(aCat)+.25,.18,4.5)],
 [12,18,Z(dense.x,dense.z,105,.45,1.25),Z(dense.x,dense.z,96,.5,1.25)],
 [18,24,Z(f40.x,f40.z,58,out(aI)+.25,.32,6),Z(f40.x,f40.z,48,out(aI)+.4,.3,7)],
 [24,30,Z(c.x,c.z,62,inn(aI)+.4,.7),Z(c.x,c.z,52,inn(aI)+.55,.62)],
 [30,34,Z(gw.x,gw.z,30,inn(aI)+.6,.42,4),Z(gw.x,gw.z,26,inn(aI)+.75,.38,4)],
 [34,40,Z(rb.x,rb.z,125,out(aI)+1.25,.45),Z(rb.x,rb.z,110,out(aI)+1.05,.4)],
 [40,46,Z(gw.x,gw.z,32,out(aI)+.6,.3,3),Z(gw.x,gw.z,27,out(aI)+.7,.28,3)],
 [46,52,Z(br.x,br.z,44,inn(aB)+.35,.45,2),Z(br.x,br.z,38,inn(aB)+.45,.42,2)],
 [52,58,Z(catP.x,catP.z,9,out(aCat)-.2,.12,5),Z(catP.x,catP.z,8,out(aCat)-.1,.1,5.5)],
 [58,66,Z(mid.x,mid.z,110,inn(aI)+.1,.28,24),Z(mid.x,mid.z,95,inn(aI)+.25,.24,26)],
 [66,70,Z(catP.x,catP.z,10,out(aCat)+.2,.22,4.4),Z(catP.x,catP.z,8.5,out(aCat)+.3,.2,4.5)],
 [70,79,Z(rb.x,rb.z,62,inn(aI)+.35,.14,15),Z(rb.x,rb.z,52,inn(aI)+.25,.12,17)],
 [79,84,Z(gw.x,gw.z,70,inn(aI)-.3,.3,10),Z(gw.x,gw.z,62,inn(aI)-.2,.28,10)],
 [84,92,Z(r.cx,r.cz,270,.5,.9),Z(r.cx,r.cz,230,.6,.85)],
 [92,100.5,Z(G.x,G.z,42,inn(aI)+.3,.3,3),Z(G.x,G.z,36,inn(aI)+.4,.28,3)]]}

// ---- траектории ----
const PT=i=>19+i*1.15;// время попадания i-го комка
function jetTo(j,x,y,z,on){const T=W.T,c=W.can[j],s=new T.Vector3(c.x,4.6,c.z),e=new T.Vector3(x,y,z),d=e.clone().sub(s),L=d.length();
 c.jet.visible=on&&L>1;if(!c.jet.visible)return;c.jet.position.copy(s);c.jet.scale.set(1,L,1);c.jet.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize())}

window.seek=function(t){const w=$('map').contentWindow,MP=w&&w.MP;if(!MP)return false;if(!W.ready)prep(w);if(!CAM)buildCam();
 if(!w.__vt){w.__vt=true;w.performance.now=()=>w.__VT*1000}w.__VT=t;
 const T=W.T,{r,aI,aB,P}=W;
 const c=CAM.find(a=>t>=a[0]&&t<a[1])||CAM[CAM.length-1],u=cl(0,1,(t-c[0])/(c[1]-c[0]));
 for(const k of['tx','tz','d','yaw','p'])MP.K[k]=c[2][k]+(c[3][k]-c[2][k])*u;W.ty=lerp(c[2].ty,c[3].ty,u);
 // тряска: удары тарана, пролом, шаги робота
 let sh=0;[40.5,42,43.5,45].forEach(h=>{if(t>=h&&t<h+.35)sh=Math.max(sh,1-seg(t,h,h+.35))});if(t>=46&&t<47)sh=Math.max(sh,1-seg(t,46,47));
 if(t>=73&&t<79){const ph=((t-73)/.9)%1;if(ph<.25)sh=Math.max(sh,.7*(1-ph/.25))}if(t>=81&&t<82)sh=Math.max(sh,1-seg(t,81,82));
 MP.K.yaw+=.02*sh*Math.sin(t*97);MP.K.p+=.012*sh*Math.sin(t*71);
 // свет: ночь до 84 с, рассвет 84–92
 const night=t<84?1:1-ss(seg(t,84,91)),dawn=t<84?0:Math.sin(Math.PI*seg(t,84,96));const lk=night.toFixed(2)+dawn.toFixed(2);if(lk!==W.lk){look(night,dawn);W.lk=lk}
 $('night').style.opacity=(night*.3).toFixed(2);
 setWall(W.wall,t,aB);
 W.gold.userData.l.intensity=1.4+.4*Math.sin(t*3)+(t>=84?1.5*seg(t,84,88):0);
 // прожекторы
 W.lights.forEach((g,i)=>{g.userData.piv.rotation.z=.45*Math.sin(t*.7+i*1.7);g.userData.piv.rotation.x=-.5+.25*Math.sin(t*.5+i);g.visible=t<84});
 // катапульты и комки краски/желе
 W.cats.forEach((g,i)=>{let rot=-.9;W.targets.forEach((h,k)=>{if(k%6!==i)return;const t0=PT(k)-1.6;if(t>=t0&&t<t0+1.4)rot=t<t0+.25?lerp(-.9,.7,ss(seg(t,t0,t0+.25))):lerp(.7,-.9,ss(seg(t,t0+.25,t0+1.4)))});g.userData.arm.rotation.x=rot});
 W.targets.forEach((h,k)=>{const b=W.blobs[k],ti=PT(k),t0=ti-1.6,cp=W.cats[k%6].position;const fly=t>=t0+.2&&t<ti;b.visible=fly;
  if(fly){const q=seg(t,t0+.2,ti);b.position.set(lerp(cp.x,h.x,q),5+Math.sin(Math.PI*q)*38+lerp(0,h.top||5,q),lerp(cp.z,h.z,q))}
  // покраска и смыв водой (30–34 с)
  const wash=30+k*.38;W.paint[k].material.opacity=t<ti?0:t<wash?.82:.82*(1-seg(t,wash,wash+.5))});
 // водомёты
 W.can.forEach((cn,k)=>{let tg=null;
  if(t>=30&&t<34.5){const h=W.targets[Math.min(9,Math.floor((t-30)/.38)+k)%10];tg=[h.x,(h.top||5)*.6,h.z]}
  else if(t>=47.5&&t<51.5){const s=W.sold[(k*3)%16];tg=[s.position.x,1.5,s.position.z]}
  else if(t>=64&&t<68.5){const p=W.paras[(k*2)%9];tg=[p.position.x,p.position.y+1,p.position.z]}
  else if(t>=79&&t<81.6){const rp=W.robot.position;tg=[rp.x,16,rp.z]}
  jetTo(k,tg?tg[0]:0,tg?tg[1]:0,tg?tg[2]:0,!!tg)});
 // осадные башни (34–42) и таран (36–46)
 W.towers.forEach((g,i)=>{const a=g.userData.a,d=lerp(r.R+75,r.R+6,ss(seg(t,34,42))),q=P(a,d);g.position.set(q.x,0,q.z);g.rotation.y=Math.PI/2-a+Math.PI;g.visible=t>=33&&t<84});
 {const hit=[40.5,42,43.5,45].reduce((s,h)=>t>=h-.5&&t<h+.4?(t<h?seg(t,h-.5,h):1-seg(t,h,h+.4)):s,0),d=t<40?lerp(r.R+55,r.R+9,ss(seg(t,36,40))):r.R+9-hit*3.5,q=P(aI,d);
  W.ram.position.set(q.x,0,q.z);W.ram.rotation.y=Math.PI/2-aI+Math.PI;W.ram.visible=t>=35.5&&t<52}
 // солдаты IMEN через пролом (46,5–51,5), их смывает
 W.sold.forEach((g,i)=>{const t0=46.5+(i%8)*.12,a=aB+(i%5-2)*.025,d=lerp(r.R+6,r.R-10-(i%4)*2,ss(seg(t,t0,t0+2))),q=P(a,d),wsh=seg(t,48+(i%8)*.35,48.6+(i%8)*.35);
  g.position.set(q.x,wsh*1.5,q.z);g.rotation.y=Math.PI/2-a+Math.PI;g.scale.setScalar(.75*Math.max(.001,1-wsh));g.visible=t>=t0&&wsh<1&&t<52});
 // дирижабли (56–70) и десант (61–68,5)
 W.ships.forEach((g,k)=>{const s=P(aI+(k-1)*.25,r.R+170),e=P(aI+(k-1)*.3,r.R*.25),q=ss(seg(t,56,64)),x=lerp(s.x,e.x,q),z=lerp(s.z,e.z,q);g.position.set(x,44+k*3+Math.sin(t+k),z);
  g.rotation.y=Math.atan2(e.x-s.x,e.z-s.z);g.userData.pr.rotation.z=t*12;g.visible=t>=55&&t<72});
 W.paras.forEach((p,i)=>{const sh=W.ships[i%3],td=61+i*.45,q=seg(t,td,td+4),wsh=seg(t,64.5+i*.35,65.1+i*.35),ox=((i*7)%5-2)*2.5;
  p.position.set(sh.position.x+ox,lerp(sh.position.y-6,0,q),sh.position.z+ox*.6);p.scale.setScalar(Math.max(.001,1-wsh));p.visible=t>=td&&wsh<1&&t<70});
 // робот (70–84,5): поднимается, шагает к воротам, залп водомётов — замыкание
 {const rg=W.robot,ud=rg.userData,up=ss(seg(t,70,73)),walk=seg(t,73,79),q=P(aI,lerp(r.R+62,r.R+14,walk)),down=ss(seg(t,81,84.5));
  rg.visible=t>=70&&t<84.5;rg.position.set(q.x,0,q.z);rg.rotation.y=Math.PI/2-aI+Math.PI;rg.scale.set(1,Math.max(.001,up*(1-down*.85)),1);rg.rotation.x=-.35*down;
  const st=Math.sin((t-73)/.9*Math.PI);ud.legL.position.y=5+(walk>0&&walk<1?Math.max(0,st)*1.5:0);ud.legR.position.y=5+(walk>0&&walk<1?Math.max(0,-st)*1.5:0);
  ud.armL.rotation.x=.3*st;ud.armR.rotation.x=-.3*st;const blink=t>=81&&t<84?(Math.floor(t*14)%2):1;ud.eyes.forEach(e=>e.material.emissiveIntensity=1.4*blink)}
 // кот-мэр смотрит в камеру, машет щитом
 {const K=MP.K,pc=Math.cos(K.p),cm={x:K.tx+Math.sin(K.yaw)*pc*K.d,z:K.tz+Math.cos(K.yaw)*pc*K.d},cat=W.cat,ud=cat.userData;
  cat.rotation.y=Math.atan2(cm.x-W.catP.x,cm.z-W.catP.z);ud.armR.rotation.x=-1.6;ud.armL.rotation.z=t>=66&&t<70||t>=79&&t<84?-1.6-.4*Math.sin(t*11):-.3;ud.tie.rotation.z=.15*Math.sin(t*7);
  ud.mO.scale.set(1,t>=8&&t<12||t>=66&&t<70||t>=79&&t<84?.6+.7*Math.abs(Math.sin(t*9)):.4,1);ud.head.rotation.x=t>=52&&t<58?-.45:0;
  W.def.forEach(g=>{g.rotation.y=Math.atan2(cm.x-g.position.x,cm.z-g.position.z)})}
 // ники карты: только на перекличке (12–18 с) — крупно, все
 const d=w.document;if(!d.getElementById('vcs')){const st=d.createElement('style');st.id='vcs';st.textContent='body.nolab .mpn{display:none!important}body.mpall .mpn{font-size:2.3em!important;font-weight:900!important}';d.head.appendChild(st)}
 const all=t>=12&&t<18;MP.setAll(all);if(all!==W.all){d.body.classList.toggle('mpall',all);d.body.classList.toggle('nolab',!all);MP.L.forEach(h=>{h.w=0;h.h=0});W.all=all}
 MP.draw();
 // ---- 2D ----
 const sb=[...SUB].reverse().find(a=>t>=a[0]);const S=$('sub'),tx=sb?sb[1]:'';S.textContent=tx;S.className='o '+(sb&&sb[2]||'');S.style.fontSize=(tx.length>30?Math.round(76*30/tx.length):76)+'px';S.style.transform='scale('+(sb?pop(t,sb[0]):1)+')';
 const pq=PLQ.find(a=>t>=a[0]&&t<a[1]);show('plq',!!pq,pq?pop(t,pq[0]):1);if(pq){$('plq').className='o '+pq[3];$('plq').firstChild.textContent=pq[2]}
 const mins=Math.round(t/END*600),hh=(22+Math.floor(mins/60))%24,mm=mins%60;$('clock').textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
 let wv=0;for(let i=0;i<WAVE.length;i++)if(t>=WAVE[i][0]){const pv=i?WAVE[i-1][1]:0;wv=lerp(pv,WAVE[i][1],ss(seg(t,WAVE[i][0],WAVE[i][0]+2)))}$('wv').style.width=Math.round(wv*100)+'%';
 const hn=t>=13&&t<18;show('hint',hn);if(hn)$('hint').firstChild.innerHTML='⏸ ПАУЗА — НАЙДИ СЕБЯ <b>'+Math.max(1,5-Math.floor(t-13))+'</b>';
 const cn=t>=86&&t<92;show('cnt',cn);if(cn)$('cnt').firstChild.innerHTML='ЖИТЕЛЕЙ: <b>'+Math.round(874+126*ss(seg(t,86.5,90)))+'</b> / 1000';
 show('vote',t>=92&&t<97,t>=92?pop(t,92):1);
 $('flash').style.opacity=t>=46&&t<46.4?(1-seg(t,46,46.4))*.25:t>=81&&t<81.5?Math.sin(Math.PI*seg(t,81,81.5))*.3:0;
 return true};

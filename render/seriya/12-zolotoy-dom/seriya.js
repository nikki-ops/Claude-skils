// Серия 12 «777 → 1000: Золотой дом». Живая карта + золотая башня (100 этажей) + кот-мэр + 2D-слой.
// Ник тысячного: ?nik=ИМЯ в адресе страницы или NIK ниже. window.seek(tv) рисует кадр на секунде голоса tv.
const NIK=(new URLSearchParams(location.search).get('nik'))||'ТЫСЯЧНЫЙ';
// AN: [время голоса, время сцены]; до озвучки — 1:1 (сцена 32 с)
let AN=[[0,0],[32,32]];
const SUBV=[[0,'нас было 777...'],[1.5,'а стало...'],[2.2,'тысяча!','gold'],[3,'и я обещал...'],[5,'тысячному —'],[5.8,'золотой дом','gold'],[7,'строим...'],[10,'100 этажей'],[10.9,'золотого стекла!','gold'],[12,'самый высокий'],[12.8,'дом на марсе'],[14,'и он...'],[14.8,'твой...'],[15.5,'@'+NIK,'gold'],[17.5,'ты — тысячный'],[18.2,'житель марса','gold'],[19,'а теперь...'],[20,'новая цель'],[21,'3000 подписчиков'],[23.5,'все дома станут'],[24.6,'коттеджами','gold'],[26,'хочешь дом'],[26.9,'рядом с башней?'],[28.5,'подпишись'],[29.5,'и напиши ник!','red'],[31,'']];
const SFXS=[[0,'swish',.4],[1.6,'drumroll',.35],[2.2,'boom',.5],[2.25,'chime',.5],[3.1,'shimmer',.4],[5.8,'chime',.4],[7,'wall',.45],[8.2,'thump',.3],[9.4,'thump',.3],[10.4,'shimmer',.5],[12,'whoosh2',.4],[14,'heartbeat',.7],[15.5,'boom',.5],[15.5,'chime',.6],[17.5,'pop',.4],[21,'drumroll',.3],[23.6,'swish',.4],[24.6,'chime',.4],[26.1,'pop',.4],[28.6,'thump',.4]];
let AM=null;
function prepAN(){const n=AN.length,h=[],d=[],m=[];for(let i=0;i<n-1;i++){h[i]=AN[i+1][0]-AN[i][0];d[i]=(AN[i+1][1]-AN[i][1])/h[i]}
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i]);AM=m}
const MAPT=v=>{if(!AM)prepAN();for(let i=1;i<AN.length;i++)if(v<=AN[i][0]){const a=AN[i-1],b=AN[i],h=b[0]-a[0],s=Math.max(0,(v-a[0])/h),s2=s*s,s3=s2*s;
 return(2*s3-3*s2+1)*a[1]+(s3-2*s2+s)*h*AM[i-1]+(-2*s3+3*s2)*b[1]+(s3-s2)*h*AM[i]}return AN[AN.length-1][1]};
const INV=s=>{let lo=0,hi=AN[AN.length-1][0];for(let k=0;k<40;k++){const md=(lo+hi)/2;if(MAPT(md)<s)lo=md;else hi=md}return(lo+hi)/2};
window.END=AN[AN.length-1][0];
window.SFXV=()=>[...SFXS.map(([t,f,v])=>[+INV(t).toFixed(3),f,v])];

const ss=u=>u*u*(3-2*u),cl=(a,b,x)=>Math.max(a,Math.min(b,x)),lerp=(a,b,u)=>a+(b-a)*u,seg=(t,a,b)=>cl(0,1,(t-a)/(b-a));
const $=id=>document.getElementById(id);
function show(id,on,s){const e=$(id);e.style.display=on?'block':'none';if(on&&s!=null)e.style.transform='scale('+s+')'}
function pop(t,t0){const k=(t-t0)/.12;return k>=1?1:k<0?1:(k<.5?1+.24*k:1.12-.24*(k-.5))}
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

// ---- золотая башня: 100 этажей, закрученные грани (как башни делового квартала), золотое стекло ----
const TP={x:282,z:-108};// район Сити
function mkTower(T){const g=new T.Group(),FL=[],N=100,FH=.84,W0=13;
 const glass=new T.MeshPhongMaterial({color:0xf2c14e,emissive:0x5a3a08,specular:0xfff3c0,shininess:90});
 const glass2=new T.MeshPhongMaterial({color:0xd99a2a,emissive:0x3a2406,specular:0xffe9a0,shininess:60});
 const frame=new T.MeshLambertMaterial({color:0x6a5426});
 const pod=new T.Mesh(new T.BoxGeometry(30,4,30),new T.MeshLambertMaterial({color:0x3a3f48}));pod.position.y=2;g.add(pod);
 const st=new T.Mesh(new T.BoxGeometry(34,.6,34),new T.MeshLambertMaterial({color:0xd8cdb8}));st.position.y=.3;g.add(st);
 for(let i=0;i<N;i++){const u=i/N,w=W0*(1-.35*u),f=new T.Group();const m=new T.Mesh(new T.BoxGeometry(w,FH*.86,w),i%2?glass:glass2);f.add(m);
  const r=new T.Mesh(new T.BoxGeometry(w+.25,FH*.14,w+.25),frame);r.position.y=FH*.5;f.add(r);
  f.position.y=4+i*FH+FH/2;f.rotation.y=u*1.2;g.add(f);FL.push(f)}
 const top=new T.Group();const cr=new T.Mesh(new T.ConeGeometry(W0*.45,9,4),glass);cr.position.y=4.5;cr.rotation.y=Math.PI/4;top.add(cr);
 const sp=new T.Mesh(new T.CylinderGeometry(.25,.25,10,6),frame);sp.position.y=13;top.add(sp);
 const lt=new T.Mesh(new T.SphereGeometry(1,10,8),new T.MeshBasicMaterial({color:0xfff2b0}));lt.position.y=18.5;top.add(lt);
 top.position.y=4+N*FH;top.rotation.y=1.2;g.add(top);
 const c=document.createElement('canvas');c.width=640;c.height=156;const x=c.getContext('2d');x.fillStyle='#141829';x.fillRect(0,0,640,156);x.strokeStyle='#f7c24a';x.lineWidth=10;x.strokeRect(5,5,630,146);x.fillStyle='#ffd860';x.font='900 72px Rubik, Arial Black';x.textAlign='center';x.textBaseline='middle';x.fillText('ЖИТЕЛЬ № 1000',320,80);
 const sign=new T.Mesh(new T.PlaneGeometry(14,3.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));sign.position.set(0,3,15.1);g.add(sign);
 g.position.set(TP.x,0,TP.z);g.userData={FL,top,N,FH,H:4+N*FH+18};return g}
const W={};
function prep(w){const T=w.THREE,sc=w.eval('sc'),L=w.MLIST||w.eval('MLIST');Object.assign(W,{T,sc,L,cam:w.eval('cam'),w});
 const near=(x,z,R)=>Math.hypot(x-TP.x,z-TP.z)<R;
 L.forEach(h=>{if(h.g&&near(h.x,h.z,24)){h.g.visible=false;h.hid=1}});
 const v=new T.Vector3();sc.children.slice().forEach(o=>{if(!o.visible||o.isLight||o.isInstancedMesh)return;o.getWorldPosition(v);if((v.x||v.z)&&near(v.x,v.z,22)){const b=new T.Box3().setFromObject(o),s=new T.Vector3();b.getSize(s);if(Math.max(s.x,s.z)<40)o.visible=false}});
 W.tower=mkTower(T);sc.add(W.tower);
 W.cat=mkCat(T);W.cat.scale.setScalar(.55);sc.add(W.cat);W.catP={x:TP.x-6,z:TP.z+24};
 const key=new T.Group(),km=new T.MeshBasicMaterial({color:0xffd860}),kr=new T.Mesh(new T.TorusGeometry(.35,.1,8,16),km);kr.position.y=.5;key.add(kr);key.add(new T.Mesh(new T.BoxGeometry(.12,.9,.12),km));
 key.position.set(0,-1.6,.3);W.cat.userData.armL.add(key);W.key=key;
 const R=L.filter(h=>h.g&&!h.hid&&!h.site&&!h.bld&&h.n);W.fresh=R.filter((h,i)=>i%9===0).slice(0,120);
 W.yt=R.filter(h=>h.district==='Район YouTube');const cc=W.yt.reduce((a,h)=>[a[0]+h.x,a[1]+h.z],[0,0]);W.ytC={x:cc[0]/W.yt.length,z:cc[1]/W.yt.length};
 W.ty=0;W.cam.lookAt=function(x,y,z){this.position.y+=W.ty;T.Object3D.prototype.lookAt.call(this,x,y+W.ty,z)};
 W.ready=true}
const Z=(tx,tz,d,yaw,p,ty=0)=>({tx,tz,d,yaw,p,ty});let CAM=null;
function buildCam(){const t=TP,c=W.catP,y=W.ytC,HT=W.tower.userData.H;
 CAM=[[0,1.5,Z(162,-64,640,.4,1.3),Z(170,-70,600,.45,1.28)],
 [1.5,3,Z(170,-70,600,.45,1.28),Z(190,-80,520,.5,1.2)],
 [3,5,Z(c.x,c.z,11,.1,.2,1.8),Z(c.x,c.z,9.5,.2,.18,1.9)],
 [5,7,Z(t.x,t.z,140,.3,.95),Z(t.x,t.z,110,.4,.8)],
 [7,10,Z(t.x,t.z,150,.5,.32,20),Z(t.x,t.z,175,.9,.3,45)],
 [10,12,Z(t.x,t.z,200,1.0,.28,50),Z(t.x,t.z,215,1.2,.26,55)],
 [12,14,Z(t.x,t.z+30,32,0,.02,30),Z(t.x,t.z+30,30,.05,.02,70)],
 [14,15.5,Z(t.x,t.z,55,.4,.35,HT-6),Z(t.x,t.z,48,.5,.4,HT-4)],
 [15.5,17.5,Z(t.x,t.z,70,.5,.45,HT-8),Z(t.x,t.z,62,.6,.42,HT-8)],
 [17.5,19,Z(t.x,t.z+16,16,0,.12,3),Z(t.x,t.z+16,13,.05,.12,3)],
 [19,21,Z(c.x,c.z,10.5,-.15,.2,1.9),Z(c.x,c.z,9.5,-.05,.18,1.9)],
 [21,23.5,Z(162,-64,560,.3,1.25),Z(162,-64,520,.35,1.2)],
 [23.5,26,Z(y.x,y.z,160,.6,.9),Z(y.x,y.z,130,.7,.8)],
 [26,28.5,Z(t.x,t.z,90,.9,.7,10),Z(t.x,t.z,80,1.05,.62,12)],
 [28.5,31,Z(c.x,c.z,10,.25,.16,1.9),Z(c.x,c.z,8.5,.3,.14,1.9)],
 [31,32,Z(c.x,c.z,8.5,.3,.14,1.9),Z(162,-64,640,.4,1.3)]]}
const PLQ=[[0,1.5,'НАС БЫЛО 777',''],[3,5,'ОБЕЩАЛ — <b>СДЕЛАЛ</b>',''],[7,10,'СТРОИМ',''],[10,12,'100 ЭТАЖЕЙ','gold'],[17.5,19,'ЖИТЕЛЬ № 1000','gold'],[23.5,26,'ВСЕ ДОМА → <b>КОТТЕДЖИ</b>',''],[26,28.5,'УЧАСТКИ У БАШНИ <b>СВОБОДНЫ</b>',''],[28.5,31,'ПОДПИШИСЬ + НИК 👇','red']];
window.seek=function(tv){const t=MAPT(tv);const w=$('map').contentWindow,MP=w&&w.MP;if(!MP)return false;if(!W.ready)prep(w);if(!CAM)buildCam();
 if(!w.__vt){w.__vt=true;w.performance.now=()=>w.__VT*1000}w.__VT=tv;
 const T=W.T,c=CAM.find(a=>t>=a[0]&&t<a[1])||CAM[CAM.length-1],lin=cl(0,1,(t-c[0])/(c[1]-c[0])),u=c[0]>=31?ss(lin):lin;
 for(const k of['tx','tz','d','yaw','p'])MP.K[k]=c[2][k]+(c[3][k]-c[2][k])*u;W.ty=lerp(c[2].ty,c[3].ty,u);
 if(t>=2.2&&t<2.7){const a=1-seg(t,2.2,2.7);MP.K.yaw+=.02*a*Math.sin(t*90);MP.K.p+=.01*a*Math.sin(t*70)}
 if(t>=15.5&&t<16){const a=1-seg(t,15.5,16);MP.K.yaw+=.012*a*Math.sin(t*90)}
 const TU=W.tower.userData,grow=t<7?0:ss(seg(t,7,10));W.tower.visible=grow>0&&t<31.6;
 TU.FL.forEach((f,i)=>{const k=cl(0,1,grow*TU.N-i);f.visible=k>0;f.scale.set(1,Math.max(.001,k),1)});TU.top.visible=grow>=1;
 const cat=W.cat,ud=cat.userData,cp=W.catP,K=MP.K,cpk=Math.cos(K.p),cm={x:K.tx+Math.sin(K.yaw)*cpk*K.d,z:K.tz+Math.cos(K.yaw)*cpk*K.d};
 cat.position.set(cp.x,.15*Math.abs(Math.sin(t*5)),cp.z);cat.rotation.y=Math.atan2(cm.x-cp.x,cm.z-cp.z);
 ud.mS.visible=!(t>=28.5&&t<31&&Math.floor(t*6)%2===0);ud.mF.visible=false;ud.mO.visible=!ud.mS.visible;ud.sh.visible=false;ud.eyes.visible=false;
 const aR=ud.armR.rotation,aL=ud.armL.rotation;aR.set(0,0,0);aL.set(0,0,0);
 W.key.visible=t<19;if(t<19)aL.set(-1.3,0,-.2+.1*Math.sin(t*4));
 if(t>=19&&t<21)aR.z=2.6+.3*Math.sin(t*10);if(t>=28.5)aR.set(-1.55,0,0);
 ud.head.rotation.set(-.1+.05*Math.sin(t*3),0,.08*Math.sin(t*2));ud.tail.rotation.z=.35*Math.sin(t*3);ud.tie.rotation.z=.15*Math.sin(t*7);
 W.fresh.forEach((h,i)=>{const t0=2.2+(i%10)*.06,k=t>=t0&&t<t0+.6?1+.5*Math.sin(Math.PI*seg(t,t0,t0+.6)):1;h.g.scale.y=k});
 W.yt.forEach(h=>{const d=Math.hypot(h.x-W.ytC.x,h.z-W.ytC.z),t0=23.8+d/140,k=t>=t0&&t<t0+.6?1+.35*Math.sin(Math.PI*seg(t,t0,t0+.6)):1;h.g.scale.y=k});
 const d=w.document;if(!d.getElementById('vcs')){const st=d.createElement('style');st.id='vcs';st.textContent='.mpn{display:none!important}';d.head.appendChild(st)}
 MP.draw();
 const sb=[...SUBV].reverse().find(a=>tv>=a[0]);const S=$('sub'),tx=sb?sb[1]:'';S.textContent=tx;S.className='o '+(sb&&sb[2]||'');S.style.textTransform=tx.startsWith('@')?'none':'lowercase';
 S.style.fontSize=(tx.length>12?Math.max(70,Math.round(118*12/tx.length)):118)+'px';S.style.transform='scale('+(sb?pop(tv,sb[0]):1)+')';
 const pq=PLQ.find(a=>t>=a[0]&&t<a[1]);show('plq',!!pq,pq?pop(t,pq[0]):1);if(pq){$('plq').className='o '+pq[3];$('plq').firstChild.innerHTML=pq[2]}
 let cn='';if(t>=1.5&&t<3)cn='<b>'+Math.round(lerp(777,1000,ss(seg(t,1.55,2.2))))+'</b><small>жителей на Марсе</small>';
 if(t>=21&&t<23.5)cn='1000 → <b>3000</b><small>новая цель</small>';
 show('cnt',!!cn,cn?pop(t,t>=21?21:1.5):1);if(cn)$('cnt').firstChild.innerHTML=cn;
 const nk=t>=15.5&&t<17.5;show('nick',nk);if(nk){const v=new T.Vector3(TP.x,TU.H+6,TP.z).project(W.cam),N=$('nick');N.firstChild.textContent='@'+NIK;
  const wd=N.firstChild.offsetWidth,X=cl(30+wd/2,1050-wd/2,(v.x*.5+.5)*1080),Y=cl(560,1100,(-v.y*.5+.5)*1920);N.style.transform='translate('+Math.round(X-wd/2)+'px,'+Math.round(Y-130)+'px) scale('+pop(t,15.5)+')'}
 $('gold').style.opacity=t>=10&&t<12?.6*Math.sin(Math.PI*seg(t,10,12)):t>=15.5&&t<17.5?.8*(1-seg(t,15.5,17.5)*.6):0;
 $('flash').style.opacity=t>=2.2&&t<2.5?.35*(1-seg(t,2.2,2.5)):t>=15.5&&t<15.8?.45*(1-seg(t,15.5,15.8)):0;
 const cv=$('conf'),x=cv.getContext('2d');x.clearRect(0,0,1080,1920);
 if(t>=15.5&&t<18.5||t>=2.2&&t<3.4){const t0=t>=15?15.5:2.2;for(let i=0;i<140;i++){const s=((i*7919)%1000)/1000,s2=((i*104729)%1000)/1000,k=t-t0,X=(s*1080+Math.sin(k*3+i)*40+1080)%1080,Y=-60+k*(500+s2*600)+s2*200;if(Y>1950)continue;x.save();x.translate(X,Y);x.rotate(k*6+i);x.fillStyle=['#ffd860','#f7c24a','#ff5a6a','#4fd6e8','#fff'][i%5];x.fillRect(-9,-5,18,10);x.restore()}}
 return true};

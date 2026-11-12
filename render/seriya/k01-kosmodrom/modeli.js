// «Космодром за 1 рубль» — low-poly модели героев и объектов (Three.js r128). Используются в концептах и сериях.
(function(){
const T=THREE;
const M=c=>new T.MeshLambertMaterial({color:c});
const B=(g,w,h,d,c,x,y,z,mat)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat||M(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
const C=(g,rt,rb,h,c,x,y,z,seg,mat)=>{const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||16),mat||M(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
function canvasTex(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);const t=new T.CanvasTexture(cv);t.anisotropy=4;return t}
// экран Ключа: голубое свечение, текст/глаза
function screenTex(txt){return canvasTex(512,320,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,20,w/2,h/2,w*.6);g.addColorStop(0,'#7ff3ff');g.addColorStop(1,'#1a8fd0');x.fillStyle=g;x.fillRect(0,0,w,h);
 x.fillStyle='rgba(255,255,255,.08)';for(let y=0;y<h;y+=8)x.fillRect(0,y,w,3);
 x.fillStyle='#0b2a44';x.textAlign='center';x.textBaseline='middle';
 if(!txt||txt===':)'){x.beginPath();x.arc(w*.32,h*.42,34,0,7);x.arc(w*.68,h*.42,34,0,7);x.fill();x.lineWidth=18;x.strokeStyle='#0b2a44';x.beginPath();x.arc(w/2,h*.55,90,.2*Math.PI,.8*Math.PI);x.stroke();return}
 const lines=txt.split('\n'),fs=lines.length>1?70:88;x.font='900 '+fs+'px Rubik, Arial Black, Arial';lines.forEach((l,i)=>x.fillText(l,w/2,h/2+(i-(lines.length-1)/2)*fs*1.1))})}
// ===== Ключ — робот-сторож =====
function kluch(o){o=o||{};const g=new T.Group(),R=0x8a4a2a,R2=0x6a3418,DK=0x2a2622;
 // гусеницы
 [-.75,.75].forEach(x=>{B(g,.55,.6,1.6,DK,x,.3,0);for(let z=-.7;z<=.7;z+=.35)B(g,.6,.1,.12,0x4a4440,x,.62,z)});
 B(g,1.2,.25,1,0x4a4440,0,.7,0);
 // корпус
 const body=B(g,1.5,1.5,1.1,R,0,1.6,0);B(g,1.3,.5,.06,0x3a2a20,0,1.4,.57);[[-.45,1.9],[.5,1.25],[-.2,1.15]].forEach(a=>B(g,.32,.22,.04,R2,a[0],a[1],.57));
 for(let i=0;i<4;i++)B(g,.12,.12,.04,0xc9a24a,-.5+i*.33,2.15,.57); // кнопки
 C(g,.1,.1,.06,0xd83a2a,.5,2.15,.58,10).rotation.x=Math.PI/2;
 // руки-манипуляторы
 [-1,1].forEach(s=>{const a=new T.Group();C(a,.18,.18,.25,DK,0,0,0,10).rotation.z=Math.PI/2;B(a,.22,.75,.22,R,0,-.45,0);B(a,.2,.6,.2,0x9a5a3a,0,-1.05,.1).rotation.x=-.3;
  const cl=new T.Group();B(cl,.08,.3,.08,0x5a5a5a,-.08,0,0);B(cl,.08,.3,.08,0x5a5a5a,.08,0,0);cl.position.set(0,-1.45,.2);a.add(cl);a.position.set(s*.88,2.15,0);a.rotation.z=s*(o.wave&&s>0?-2.3:.12);g.add(a)});
 // шея и голова-монитор
 C(g,.12,.16,.35,DK,0,2.5,0,10);
 const head=new T.Group();B(head,1.3,.95,.75,0x5a5e66,0,0,0);B(head,1.36,1.01,.1,0x3a3d44,0,0,.36);
 const scr=new T.Mesh(new T.PlaneGeometry(1.12,.72),new T.MeshBasicMaterial({map:screenTex(o.text)}));scr.position.set(0,0,.42);head.add(scr);
 const glow=new T.PointLight(0x7ff3ff,o.glow||1.2,5);glow.position.set(0,0,1);head.add(glow);
 // антенна-ключ (талисман имени)
 C(head,.04,.04,.6,0x9aa3ad,.35,.75,0,6);const ring=new T.Mesh(new T.TorusGeometry(.17,.05,8,16),M(0xd8b04a));ring.position.set(.35,1.15,0);head.add(ring);
 B(head,.05,.28,.05,0xd8b04a,.35,.88,0);B(head,.12,.05,.05,0xd8b04a,.42,.82,0);B(head,.09,.05,.05,0xd8b04a,.4,.92,0);
 head.position.set(0,3.15,0);head.rotation.z=o.tilt||0;g.add(head);
 // заплатки/ржавчина
 [[.6,1.9,.3],[-.6,1.3,-.2]].forEach(a=>B(g,.06,.35,.35,R2,a[0]*1.26,a[1],a[2]));
 g.userData={head,scr,setText:t=>{scr.material.map=screenTex(t);scr.material.needsUpdate=true}};return g}
// ===== Серый из Агентства =====
function seryi(){const g=new T.Group(),G=0x5a5f68,D=0x3a3e46;
 [-.25,.25].forEach(x=>{B(g,.28,.8,.3,0x1f2126,x,.4,0);B(g,.32,.15,.45,0x111214,x,.08,.08)});
 C(g,.42,.75,2.1,G,0,1.75,0,10); // пальто
 B(g,.08,1.6,.04,D,0,1.75,.62); // борт
 [.5,1,1.5].forEach(y=>B(g,.08,.08,.04,0x1a1a1a,.12,y+.6,.6));
 [-1,1].forEach(s=>{const a=C(g,.15,.18,1.2,G,s*.62,2.05,.05,8);a.rotation.z=s*.12;B(g,.18,.22,.18,0x1a1a1a,s*.7,1.42,.1)});
 C(g,.5,.45,.3,D,0,2.85,0,10); // воротник
 const hd=C(g,.32,.3,.5,0x2a2a2e,0,3.2,0,12); // голова в тени
 C(g,.75,.75,.06,0x2a2c32,0,3.45,0,20);C(g,.38,.42,.42,0x2a2c32,0,3.68,0,16);B(g,.8,.06,.3,0x14151a,0,3.46,0); // шляпа
 // папка
 const f=new T.Group();B(f,.7,.9,.06,0x8a1a1a,0,0,0);B(f,.6,.8,.02,0xf1e9d8,0,0,.04);f.position.set(.55,1.7,.45);f.rotation.set(.2,-.3,.1);g.add(f);
 return g}
// ===== Ворона =====
function vorona(){const g=new T.Group(),K=0x15161a;B(g,.35,.3,.6,K,0,.3,0);B(g,.25,.25,.25,K,0,.52,.32);B(g,.08,.06,.22,0x3a3a3a,0,.5,.52);[-.18,.18].forEach(x=>B(g,.06,.22,.45,K,x,.35,-.05));B(g,.2,.05,.3,K,0,.3,-.42);
 [-.08,.08].forEach(x=>B(g,.05,.05,.05,0xffd84a,x,.57,.45));return g}
// ===== Ракета =====
function raketa(o){o=o||{};const g=new T.Group(),W=0xeef0f2,R=0xd8283a;
 C(g,1.6,1.6,12,W,0,7,0,20);C(g,1.62,1.62,.8,R,0,3,0,20);C(g,1.62,1.62,.8,R,0,10.5,0,20);
 const n=new T.Mesh(new T.ConeGeometry(1.6,4,20),M(W));n.position.y=15;n.castShadow=true;g.add(n);const tip=new T.Mesh(new T.ConeGeometry(.5,1.3,16),M(R));tip.position.y=16.4;g.add(tip);
 C(g,1.3,1.7,1.4,0x5a5e66,0,.3,0,16);
 for(let i=0;i<4;i++){const f=B(g,.15,3,2,R,0,1.8,0);f.position.set(Math.cos(i*Math.PI/2)*1.9,1.8,Math.sin(i*Math.PI/2)*1.9);f.rotation.y=-i*Math.PI/2+Math.PI/2}
 for(let i=0;i<3;i++){const w=new T.Mesh(new T.CircleGeometry(.38,16),M(0x4ab8e8));w.position.set(0,8.5+i*1.3,1.61);g.add(w)}
 if(o.rust)[[.9,5,1.2],[-1.1,8,.9],[.4,12,1.4]].forEach(a=>{const r=B(g,.9,.6,.08,0xa0522d,a[0],a[1],a[2]);r.lookAt(0,a[1],0)});
 if(o.name){const t=canvasTex(512,128,(x,w,h)=>{x.fillStyle='#d8283a';x.font='900 84px Rubik, Arial Black';x.textAlign='center';x.textBaseline='middle';x.fillText(o.name,w/2,h/2)});const p=new T.Mesh(new T.PlaneGeometry(2.4,.6),new T.MeshBasicMaterial({map:t,transparent:true}));p.position.set(0,6,1.62);g.add(p)}
 return g}
// ===== Стартовая башня (ржавая ферма) =====
function bashnya(h){h=h||22;const g=new T.Group(),R=0xa0522d,R2=0x7a3a1a;
 [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(a=>B(g,.35,h,.35,R,a[0],h/2,a[1]));
 for(let y=2;y<h;y+=3){B(g,3.5,.25,.25,R2,0,y,-1.6);B(g,3.5,.25,.25,R2,0,y,1.6);B(g,.25,.25,3.5,R2,-1.6,y,0);B(g,.25,.25,3.5,R2,1.6,y,0);
  const d=B(g,.18,4.2,.18,R,0,y+1.5,1.6);d.rotation.z=(y%6?1:-1)*.85;const e=B(g,.18,4.2,.18,R,1.6,y+1.5,0);e.rotation.x=(y%6?1:-1)*.85}
 B(g,4.2,.4,4.2,0x5a3a2a,0,h,0);[-1,1].forEach(s=>B(g,6,.3,.3,R2,s*0+3.5,h-3+s*1.5,0));
 const lamp=new T.Mesh(new T.SphereGeometry(.35,8,6),new T.MeshBasicMaterial({color:0xff3a2a}));lamp.position.set(0,h+.6,0);g.add(lamp);return g}
// ===== Стартовый стол =====
function stol(){const g=new T.Group();B(g,14,1.2,14,0x7a7468,0,.6,0);B(g,5,1.25,5,0x2a2622,0,.62,0);for(let i=0;i<8;i++)B(g,.8,.05,2.6,i%2?0x1a1a1a:0xf2c230,-4.2+i*1.2,1.23,-5.5);
 [[4,3],[-3,-4],[2,-5]].forEach(a=>B(g,1.4,.08,1,0xa0522d,a[0],1.22,a[1]));return g}
// ===== Ангар =====
function angar(){const g=new T.Group();const half=new T.Mesh(new T.CylinderGeometry(9,9,22,20,1,true,0,Math.PI),new T.MeshLambertMaterial({color:0x8a8d92,side:T.DoubleSide}));half.rotation.z=Math.PI/2;half.rotation.y=Math.PI/2;half.position.y=0;g.add(half);
 B(g,18,.3,22,0x5a5650,0,.15,0);return g}
// ===== Генератор, трактор, кран =====
function generator(){const g=new T.Group();B(g,3,1.8,1.6,0x2f8f4a,0,1,0);B(g,3.1,.2,1.7,0x1f6a3a,0,1.95,0);C(g,.2,.2,.8,0x3a3a3a,1,2.3,0,8);for(let i=0;i<5;i++)B(g,.1,1,.04,0x1f6a3a,-1+i*.3,1,.82);return g}
function kran(){const g=new T.Group(),Y=0xf2c230;B(g,4,1.4,8,Y,0,1.2,0);[-1.6,1.6].forEach(x=>[-3,0,3].forEach(z=>{const w=C(g,.6,.6,.5,0x1a1a1a,x,.6,z,12);w.rotation.z=Math.PI/2}));B(g,2.2,2,2.2,Y,0,2.9,-2.5);
 const boom=B(g,.7,.7,22,Y,0,10,3);boom.rotation.x=-1.05;return g}
// ===== Монета 1 ₽ =====
function moneta(){const g=new T.Group();const c=C(g,.9,.9,.14,0xd9dde2,0,0,0,28);const t=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#d9dde2';x.fillRect(0,0,w,h);x.fillStyle='#7a7e86';x.font='900 140px Rubik, Arial Black';x.textAlign='center';x.textBaseline='middle';x.fillText('1₽',w/2,h/2+6)});
 const f=new T.Mesh(new T.CircleGeometry(.86,28),new T.MeshBasicMaterial({map:t}));f.rotation.x=-Math.PI/2;f.position.y=.08;g.add(f);return g}
// ===== Сцена: степь на закате =====
function stepScene(renderer,o){o=o||{};const sc=new T.Scene();sc.fog=new T.Fog(o.fog||0xe0866a,60,260);
 sc.add(new T.HemisphereLight(0xffd0b0,0x6a3a4a,.8));const sun=new T.DirectionalLight(0xffc890,1.1);sun.position.set(-40,30,-20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sh=sun.shadow.camera;sh.left=-40;sh.right=40;sh.top=40;sh.bottom=-40;sh.far=200;sc.add(sun);
 const gr=new T.Mesh(new T.PlaneGeometry(600,600,60,60),M(o.ground||0xb8935a));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
 // трава пучками
 const tm=M(0x8a8a3a),tg=new T.ConeGeometry(.25,1.1,4);for(let i=0;i<500;i++){const a=i*2.399,r=6+Math.sqrt(i)*4.5,m=new T.Mesh(tg,i%3?tm:M(0x9a9a4a));m.position.set(Math.cos(a)*r,.5,Math.sin(a)*r);m.scale.y=.6+(i%5)*.25;sc.add(m)}
 renderer.shadowMap.enabled=true;return {sc,sun}}
window.KM={kluch,seryi,vorona,raketa,bashnya,stol,angar,generator,kran,moneta,stepScene,B,C,M,canvasTex,screenTex};
})();

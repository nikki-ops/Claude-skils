// «Один на Марсе» — новые интерьеры/экстерьеры в качестве пробы дня 82 (координаты мира 1920×1080).
function wallBase(c1,c2){const g=x.createLinearGradient(0,0,0,820);g.addColorStop(0,c1||'#2e3a4c');g.addColorStop(1,c2||'#3e4c60');x.fillStyle=g;x.fillRect(-400,-200,2720,1020);
 for(let i=-2;i<16;i++){line(i*150,40,i*150,820,'#2a3546',4);for(let j=0;j<6;j++)circ(i*150+12,90+j*130,3,'#5a6a80')}rr(-400,600,2720,14,0,'#2a3546');
 x.fillStyle='#1e2632';x.fillRect(-400,-200,2720,240);rr(-400,40,2720,26,6,'#5a6a7c',OL,4);rr(-400,74,2720,14,4,'#8a5a3a',OL,3);for(let i=0;i<14;i++)rr(-300+i*190,30,20,60,4,'#3a4656',OL,3)}
function floorBase(){x.fillStyle='#232c38';x.fillRect(-400,820,2720,500);for(let i=-8;i<26;i++)line(960+(i-9)*120,820,960+(i-9)*220,1300,'#1c2430',4);for(let j=0;j<4;j++)line(-400,850+j*j*40,2320,850+j*j*40,'#1c2430',3)}
function alarmLamp(X,Y,on){rr(X-34,Y-20,68,40,10,'#3a3a44',OL,4);circ(X,Y,22,on?'#ff3a2a':'#5a1a1a',OL,4);if(on){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.35;circ(X,Y,90,'#ff3a2a');x.restore()}}
function redWash(k){x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle=`rgba(255,30,30,${k})`;x.fillRect(0,0,W,H);x.restore()}
// КАЮТА: койка, одеяло, шкафчик, маленький иллюминатор, тревожная лампа
function cabin(o){o=o||{};wallBase('#2a3446','#36435a');floorBase();
 // иллюминатор
 const PX=1350,PY=330;circ(PX,PY,120,'#8a96a6',OL,6);x.save();x.beginPath();x.arc(PX,PY,96,0,7);x.clip();const sg=x.createLinearGradient(0,PY-96,0,PY+96);
 if(o.storm){sg.addColorStop(0,'#c8783a');sg.addColorStop(1,'#8a4a1a')}else{sg.addColorStop(0,'#080a18');sg.addColorStop(1,'#2a1a30')}x.fillStyle=sg;x.fillRect(PX-100,PY-100,200,200);
 if(!o.storm){for(let i=0;i<14;i++)circ(PX-90+(i*37)%180,PY-90+(i*53)%120,1.6,'#fff')}else for(let i=0;i<8;i++){const q=(TT*.6+i/8)%1;circ(PX-100+q*220,PY-60+(i*29)%120,20,'rgba(255,190,120,.25)')}x.restore();circ(PX,PY,96,null,OL,6);
 // шкафчик
 rr(1560,180,260,640,10,'#4a5a6c',OL,6);rr(1580,200,100,600,6,'#56687c',OL,4);rr(1700,200,100,600,6,'#56687c',OL,4);circ(1665,500,7,'#9aa3ad');circ(1715,500,7,'#9aa3ad');rr(1600,230,60,40,4,'#d8c8a0',OL,3);
 // койка
 rr(160,560,980,40,10,'#5a6a7c',OL,6);rr(160,600,980,26,6,'#3a4656',OL,4);rr(170,626,24,194,4,'#3a4656',OL,4);rr(1106,626,24,194,4,'#3a4656',OL,4);
 rr(180,500,980-40,70,26,'#e8ecf0',OL,5);// матрас
 rr(200,456,240,80,30,'#f4f6f8',OL,5);// подушка
 rr(160,240,80,330,8,'#4a5a6c',OL,5);// изголовье
 // полка с вещами
 rr(400,230,420,20,4,'#6a5a4a',OL,4);rr(420,180,60,50,8,'#9fdcff',OL,3);rr(500,170,40,60,6,'#d8283a',OL,3);rr(560,190,120,40,6,'#f7c24a',OL,3);txt('ЗЕМЛЯ',620,210,16,OL);
 alarmLamp(960,150,o.alarm&&Math.floor(TT*3)%2===0)}
function blanket(X,Y,w){x.beginPath();x.moveTo(X,Y-40);x.bezierCurveTo(X+w*.3,Y-90,X+w*.7,Y-60,X+w,Y-50);x.lineTo(X+w,Y+10);x.lineTo(X,Y+10);x.closePath();x.fillStyle='#3a6ab8';x.fill();x.strokeStyle=OL;x.lineWidth=5;x.stroke();
 for(let i=1;i<5;i++)line(X+w*i/5,Y-60+Math.sin(i)*8,X+w*i/5,Y+8,'#2a5aa0',4)}
// герой лёжа (голова слева): поверх матраса, одеяло сверху
function heroLying(X,Y,s,P){x.save();x.translate(X,Y);x.rotate(-Math.PI/2);heroRig(Object.assign({x:0,y:0,s},P));x.restore()}
// ШЛЮЗ: круглый люк со штурвалом, иллюминатор с трещиной, полосы, манометр
function airlock(o){o=o||{};wallBase('#2a3242','#343e52');floorBase();
 for(let i=0;i<10;i++)poly([[300+i*140,820],[370+i*140,820],[300+i*140+40,760],[300+i*140-30,760]],i%2?'#f2c230':'#1a1a1e');
 const HX=960,HY=420;circ(HX,HY,300,'#5a6476',OL,8);circ(HX,HY,260,'#8a96a6',OL,6);for(let i=0;i<12;i++){const a=i/12*6.283;circ(HX+Math.cos(a)*280,HY+Math.sin(a)*280,10,'#3a4252',OL,3)}
 circ(HX,HY+90,110,'#5a6476',OL,6);x.save();x.translate(HX,HY+90);x.rotate(o.wheel||0);for(let i=0;i<6;i++){x.rotate(Math.PI/3);line(0,0,0,-100,'#c8ccd4',14)}circ(0,0,26,'#2a2c34',OL,4);x.restore();
 // окно люка с трещиной
 circ(HX,HY-120,80,'#1a2232',OL,6);x.save();x.beginPath();x.arc(HX,HY-120,74,0,7);x.clip();x.fillStyle='#3a1a1a';x.fillRect(HX-80,HY-200,160,160);if(o.crack){x.beginPath();[[0,-60],[-20,-20],[10,10],[-14,40],[12,74]].forEach((p,i)=>i?x.lineTo(HX+p[0],HY-120+p[1]):x.moveTo(HX+p[0],HY-120+p[1]));x.strokeStyle='#ff6a5a';x.lineWidth=6;x.stroke()}x.restore();
 if(o.frost){x.save();x.globalAlpha=.5*o.frost;circ(HX,HY-120,90,'#cfe8ff');x.restore()}
 rr(1360,250,180,240,12,'#3a4252',OL,5);txt('ШЛЮЗ',1450,290,34,'#f2c230');txt('O₂',1450,360,60,'#5dff8a');
 alarmLamp(960,90,o.alarm&&Math.floor(TT*3)%2===0)}
function hissFx(X,Y,t,n){for(let i=0;i<(n||9);i++){const q=(t*1.6+i/(n||9))%1;x.save();x.globalAlpha=.75*(1-q);x.beginPath();x.moveTo(X,Y+i*6-20);x.quadraticCurveTo(X+q*160,Y-40+i*10,X+q*320,Y-q*80+i*8);x.strokeStyle='#e8f4ff';x.lineWidth=5;x.stroke();x.restore()}}
// НОЧНАЯ кают-компания: свет выключен, только терминал
function terminal(X,Y,s,txt1,txt2){x.save();x.translate(X,Y);x.scale(s,s);rr(-150,-230,300,230,16,'#2a3242',OL,6);rr(-130,-210,260,150,10,'#061a10');x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.35;circ(0,-130,220,'#5dff8a');x.restore();
 x.font="900 46px 'Courier New',monospace";x.textAlign='left';x.textBaseline='middle';x.fillStyle='#5dff8a';x.shadowColor='#5dff8a';x.shadowBlur=16;x.fillText((txt1||'> SOUTH')+(Math.floor(TT*2)%2?'_':''),-118,-160);x.shadowBlur=0;
 x.font="700 22px 'Courier New',monospace";x.fillStyle='rgba(93,255,138,.65)';x.fillText(txt2||'RX 03:12  LINK OK',-118,-104);rr(-100,-40,200,26,6,'#1a2030',OL,3);for(let i=0;i<8;i++)circ(-80+i*22,-27,5,Math.sin(TT*3+i)>0?'#5dff8a':'#1a3a2a');x.restore()}
function nightGrade(){x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='multiply';x.fillStyle='#4a5a9a';x.globalAlpha=.75;x.fillRect(0,0,W,H);x.restore()}
// СНАРУЖИ: база подробно
function baseExt(mode,o){o=o||{};marsSky(mode);marsGround(H*.72,mode);
 const M=(X,Y,w,h,win)=>{rr(X-w/2,Y-h,w,h,h*.45,'#e8ecf0',OL,6);rr(X-w/2,Y-h*.4,w,h*.12,0,'#ea7a2c');for(let i=0;i<win;i++)rr(X-w/2+w*(i+1)/(win+1)-h*.14,Y-h*.78,h*.28,h*.2,6,o.lit?'#ffd88a':'#2a3a5a',OL,4);for(let i=0;i<4;i++)rr(X-w/2+20+i*(w-40)/3,Y-14,20,14,3,'#9aa3ad',OL,2)};
 M(560,800,360,210,3);M(960,800,320,240,2);dome(1260,800,140,{green:1});rr(760,760,80,60,8,'#c8ccd4',OL,5);rr(1100,770,60,40,8,'#c8ccd4',OL,4);
 line(300,740,820,740,'#9aa3ad',6);antenna(1420,640,.7,o.ant,TT);
 for(let i=0;i<4;i++)panel(160+i*170,880,1.1,o.dust||0);for(let i=0;i<3;i++)panel(1560+i*150,880,1,o.dust||0)}

// ---------- ИНТЕРЬЕР: кают-компания ----------
function lounge(sunK,o){o=o||{};
 // стена
 const gw=x.createLinearGradient(0,0,0,820);gw.addColorStop(0,'#2e3a4c');gw.addColorStop(1,'#3e4c60');x.fillStyle=gw;x.fillRect(-400,-200,2720,1020);
 for(let i=-2;i<16;i++){line(i*150,40,i*150,820,'#2a3546',4);for(let j=0;j<6;j++)circ(i*150+12,90+j*130,3,'#5a6a80')}
 rr(-400,600,2720,14,0,'#2a3546');rr(-400,330,2720,8,0,'#36445a');
 // потолок, трубы, вентилятор
 x.fillStyle='#1e2632';x.fillRect(-400,-200,2720,240);rr(-400,40,2720,26,6,'#5a6a7c',OL,4);rr(-400,74,2720,14,4,'#8a5a3a',OL,3);for(let i=0;i<14;i++)rr(-300+i*190,30,20,60,4,'#3a4656',OL,3);
 x.save();x.translate(1760,170);circ(0,0,62,'#1a2028',OL,5);x.rotate(TT*6);for(let i=0;i<4;i++){x.rotate(Math.PI/2);poly([[0,0],[14,-50],[-14,-50]],'#5a6a7c')}x.restore();
 // лампы
 [[300,96],[1500,96]].forEach(([lx,ly])=>{rr(lx-60,ly,120,22,8,'#9aa3ad',OL,4);x.save();x.globalAlpha=.12;poly([[lx-60,ly+22],[lx+60,ly+22],[lx+260,820],[lx-260,820]],'#ffe8b0');x.restore();rr(lx-50,ly+16,100,8,4,'#fff3c0')});
 // окно-иллюминатор
 const WX=700,WY=410,RW=380,RH=230;x.save();x.beginPath();x.ellipse(WX,WY,RW,RH,0,0,7);x.clip();
 const sg=x.createLinearGradient(0,WY-RH,0,WY+RH);if(o.storm){sg.addColorStop(0,'#e08a3a');sg.addColorStop(1,'#a8501a')}else if(o.night){sg.addColorStop(0,'#05060f');sg.addColorStop(1,'#1a1430')}else{sg.addColorStop(0,'#2a2050');sg.addColorStop(.5,'#b8507a');sg.addColorStop(1,'#f8a050')}x.fillStyle=sg;x.fillRect(WX-RW,WY-RH,RW*2,RH*2);
 for(let i=0;i<30;i++)circ(WX-RW+(i*157)%(RW*2),WY-RH+(i*89)%(RH*.8),1.6,`rgba(255,255,255,${.3+(i%3)*.2})`);circ(WX-220,WY-120,16,'#e8e0d0');
 if(o.storm){x.fillStyle=sg;x.fillRect(WX-RW,WY-RH,RW*2,RH*2);for(let i=0;i<26;i++){const q=(TT*.5+i/26)%1;circ(WX-RW+q*RW*2.4,WY-RH+(i*47)%(RH*2),40+(i%4)*24,i%2?'rgba(150,70,30,.35)':'rgba(240,160,90,.3)')}}const sy=o.storm||o.night?9999:WY-40+sunK*170;circ(WX+60,sy,52,'#fff4d8');circ(WX+60,sy,96,'rgba(255,230,180,.3)');circ(WX+60,sy,160,'rgba(255,200,140,.15)');
 x.fillStyle='#6a2a3a';x.beginPath();x.moveTo(WX-RW,WY+RH);for(let i=0;i<=12;i++)x.lineTo(WX-RW+i*RW/6,WY+60-Math.sin(i*1.4)*40-Math.cos(i*.7)*20);x.lineTo(WX+RW,WY+RH);x.fill();
 x.fillStyle='#4a1e2a';x.beginPath();x.moveTo(WX-RW,WY+RH);for(let i=0;i<=10;i++)x.lineTo(WX-RW+i*RW/5,WY+130-Math.sin(i*2.1+1)*22);x.lineTo(WX+RW,WY+RH);x.fill();
 for(let i=0;i<8;i++){const q=(TT*.05+i/8)%1;circ(WX-RW+q*RW*2,WY+100+(i%3)*20,30+i%3*14,'rgba(240,150,90,.12)')}x.restore();
 x.beginPath();x.ellipse(WX,WY,RW+30,RH+30,0,0,7);x.lineWidth=40;x.strokeStyle='#8a96a6';x.stroke();x.lineWidth=6;x.strokeStyle=OL;x.beginPath();x.ellipse(WX,WY,RW+50,RH+50,0,0,7);x.stroke();x.beginPath();x.ellipse(WX,WY,RW+10,RH+10,0,0,7);x.stroke();
 for(let i=0;i<16;i++){const a=i/16*6.283;circ(WX+Math.cos(a)*(RW+30),WY+Math.sin(a)*(RH+30),7,'#5a6476',OL,2)}
 x.save();x.globalAlpha=.18;x.beginPath();x.ellipse(WX-150,WY-90,120,50,-.4,0,7);x.fillStyle='#fff';x.fill();x.restore();
 // скамья под окном
 rr(380,700,640,40,10,'#5a4a3e',OL,5);rr(392,676,616,34,14,'#a8463a',OL,5);rr(400,740,30,90,6,'#3a3036',OL,4);rr(970,740,30,90,6,'#3a3036',OL,4);
 // стена слева: доска со счётом, огнетушитель, кабели
 rr(-60,170,300,330,10,'#3e4e60',OL,6);for(let i=0;i<(o.marks||82);i++){const c=i%5,r=Math.floor(i/5),cx=-36+(r%5)*56,cy=196+Math.floor(r/5)*80;if(c<4)line(cx+c*9,cy,cx+c*9,cy+40,'rgba(255,255,255,.85)',5);else line(cx-4,cy+28,cx+40,cy+10,'#ff6a5a',5)}
 rr(280,560,46,110,16,'#d8263a',OL,5);rr(292,540,22,26,4,'#2a2a2e',OL,3);x.beginPath();x.moveTo(-100,90);x.bezierCurveTo(100,240,60,420,240,560);x.strokeStyle='#1a1f28';x.lineWidth=10;x.stroke();
 // справа: стеллаж с ящиками и горшок с картошкой
 rr(1260,200,560,22,4,'#6a5a4a',OL,4);rr(1260,360,560,22,4,'#6a5a4a',OL,4);rr(1270,222,20,380,4,'#5a4a3e',OL,3);rr(1790,222,20,380,4,'#5a4a3e',OL,3);
 [['ВОДА','#4ab8e8',1290],['ЕДА','#f7c24a',1420],['O₂','#5dff8a',1550]].forEach(([l,c,bx])=>{rr(bx,240,116,118,10,'#5a6a7c',OL,5);rr(bx+10,286,96,30,6,c);txt(l,bx+58,302,22,OL)});
 x.save();x.translate(1720,358);rr(-46,-70,92,70,10,'#a8663a',OL,5);for(let i=0;i<7;i++){const a=-1.2+i*.4;x.beginPath();x.ellipse(Math.cos(a-1.57)*40,-90+Math.sin(a-1.57)*30,22,12,a,0,7);x.fillStyle=i%2?'#3aa04a':'#4ac85a';x.fill();x.strokeStyle=OL;x.lineWidth=3;x.stroke()}x.restore();
 [[1300,382],[1380,382],[1460,382]].forEach(([jx,jy],i)=>{rr(jx,jy,60,70,12,'rgba(200,230,255,.5)',OL,4);rr(jx+6,jy+30,48,34,8,['#c8a060','#f7c24a','#9fdcff'][i])});
 // пол
 x.fillStyle='#232c38';x.fillRect(-400,820,2720,500);for(let i=-8;i<26;i++)line(960+(i-9)*120,820,960+(i-9)*220,1300,'#1c2430',4);for(let j=0;j<4;j++)line(-400,850+j*j*40,2320,850+j*j*40,'#1c2430',3);
 // свет из окна на полу
 x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.14+.04*Math.sin(TT*.5);poly([[WX-300,WY+180],[WX+300,WY+180],[WX+520,1080],[WX-380,1080]],'#ff9a5a');x.restore()}
function table(){rr(1220,690,520,34,8,'#7a6050',OL,5);rr(1236,724,488,90,6,'#5a4638',OL,4);rr(1250,724,26,100,6,'#4a3a32',OL,4);rr(1690,724,26,100,6,'#4a3a32',OL,4)}
function shadowAt(X,Y,w){x.save();x.beginPath();x.ellipse(X,Y,w,w*.18,0,0,7);x.fillStyle='rgba(0,0,0,.35)';x.fill();x.restore()}
function stool(X,Y){rr(X-60,Y-24,120,24,8,'#5a6a7c',OL,4);rr(X-8,Y,16,100,4,'#3a4656',OL,3);rr(X-50,Y+92,100,12,4,'#3a4656',OL,3)}
function grade(c,a){x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='multiply';x.fillStyle=c;x.globalAlpha=a;x.fillRect(0,0,W,H);x.restore();x.save();x.setTransform(1,0,0,1,0,0);const g=x.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*1.1);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=g;x.fillRect(0,0,W,H);x.restore()}

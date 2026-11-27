// Pier at dusk: plank deck (y=0, z>-3), railing, table; sea y=-2.2 under height fog;
// masts poking out of the fog; cape with a red-white lighthouse far away.
// params: rx ry rz tx ty tz lens  flash (0..1 red lamp flash)  lamp (0..1 steady white light)  fogH (fog top, ~-0.6)
//         fsharp (0..1: hard near/far split for the 2D card)  bx bz (Lastochka position)  sx sz stilt (steamer position, aground tilt 0..1)
float sdCone(vec3 p, float h, float r0, float r1){ float q=length(p.xz); float k=clamp(p.y/h,0.0,1.0); return max(q-mix(r0,r1,k), abs(p.y-0.5*h)-0.5*h); }
const vec3 LH=vec3(13.0,7.0,-62.0);
float barge(vec3 b, out float id){
  float bx=b.x;
  float hw=0.8*(1.0-0.86*pow(clamp((bx-0.9)/1.55,0.0,1.0),1.6));
  hw*=mix(0.72,1.0,clamp(b.y/0.35,0.0,1.0));
  float top=0.66+0.22*smoothstep(0.9,2.45,bx)+0.06*smoothstep(-1.6,-2.4,bx);
  float outer=max(max(abs(b.z)-hw,max(-b.y,b.y-top)),abs(bx)-2.45)*0.7;
  float inner=max(max(abs(b.z)-(hw-0.06),0.5-b.y),abs(bx)-2.37);
  float hull=max(outer,-inner); id=7.0; float d=hull;
  float deck=max(max(abs(b.z)-hw+0.02,abs(b.y-0.47)-0.03),abs(bx)-2.4)*0.7; if(deck<d){d=deck;id=19.0;}
  float cab=sdRoundBox(b-vec3(-1.25,0.9,0.0),vec3(0.48,0.38,0.5),0.04); if(cab<d){d=cab;id=12.0;}
  float roof=sdRoundBox(b-vec3(-1.25,1.32,0.0),vec3(0.58,0.04,0.6),0.02); if(roof<d){d=roof;id=19.0;}
  float fun=sdCylinder(b-vec3(-0.45,1.35,0.0),0.8,0.17+0.03*clamp(1.0-(b.y-0.55)/1.6,0.0,1.0));
  if(fun<d){d=fun; id=(b.y>2.0)?13.0:((b.y>1.6&&b.y<1.78)?14.0:25.0);}
  float mast=sdCylinder(b-vec3(1.05,1.45,0.0),0.95,0.03); if(mast<d){d=mast;id=19.0;}
  float yard=sdCapsule(b,vec3(1.05,2.05,-0.35),vec3(1.05,2.05,0.35),0.02); if(yard<d){d=yard;id=19.0;}
  float stay=min(sdCapsule(b,vec3(1.05,2.35,0.0),vec3(2.4,0.9,0.0),0.008),sdCapsule(b,vec3(1.05,2.35,0.0),vec3(-0.45,2.1,0.0),0.008)); if(stay<d){d=stay;id=19.0;}
  float lan=sdSphere(b-vec3(1.05,2.43,0.0),0.06); if(lan<d){d=lan;id=20.0;}
  vec3 lb=b-vec3(-1.25,0.92,0.53); float buoy=sdTorus(vec3(lb.x,lb.z,lb.y),vec2(0.13,0.04)); if(buoy<d){d=buoy;id=17.0;}
  for(int i=0;i<3;i++){ float tx=-0.6+0.75*float(i); float hz=0.8*(1.0-0.86*pow(clamp((tx-0.9)/1.55,0.0,1.0),1.6));
    vec3 tq=b-vec3(tx,0.34,hz+0.03); float tire=sdTorus(vec3(tq.x,tq.z,tq.y),vec2(0.1,0.045)); if(tire<d){d=tire;id=18.0;} }
  return d;
}
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // railing at z=-2.7 (posts + top rail)
  vec3 q=p-vec3(0.0,0.0,-2.7); float px=q.x-0.9*floor(q.x/0.9+0.5);
  float posts=sdRoundBox(vec3(px,q.y-0.5,q.z),vec3(0.045,0.5,0.045),0.01);
  float rail=sdRoundBox(q-vec3(0.0,1.02,0.0),vec3(30.0,0.04,0.07),0.02);
  float rail2=sdRoundBox(q-vec3(0.0,0.55,0.0),vec3(30.0,0.025,0.03),0.01);
  r=opU(r,vec2(min(min(posts,rail),rail2),2.0));
  // round table + lantern (near camera, right)
  vec3 t=p-vec3(1.15,0.0,-1.4);
  r=opU(r,vec2(sdCylinder(t-vec3(0.0,0.74,0.0),0.025,0.45),3.0));
  r=opU(r,vec2(sdCylinder(t-vec3(0.0,0.37,0.0),0.37,0.04),4.0));
  r=opU(r,vec2(sdRoundBox(t-vec3(0.12,0.86,0.05),vec3(0.07,0.1,0.07),0.02),5.0));
  // schooners in the fog: sharp wooden hull, bowsprit, two masts with gaff sails set along the hull
  for(int i=0;i<4;i++){ float fi=float(i);
    vec3 m=p-vec3(-7.0+fi*4.3,-2.2,-24.0-fi*6.0); m.y-=0.05*sin(u_time*1.4+fi);
    if(length(m)<8.0){
      float mx=m.x; float hw=0.55*(1.0-0.9*pow(clamp((mx-0.4)/1.8,0.0,1.0),1.5))*mix(0.6,1.0,clamp(m.y/0.4,0.0,1.0));
      float hl=max(max(abs(m.z)-hw,max(-m.y,m.y-(0.55+0.15*smoothstep(0.6,2.2,mx)))),abs(mx)-2.2)*0.7;
      r=opU(r,vec2(hl,26.0));
      r=opU(r,vec2(sdCapsule(m,vec3(2.1,0.65,0.0),vec3(3.2,0.95,0.0),0.035),6.0));
      for(int j=0;j<2;j++){ float px=-0.9+1.4*float(j); float h=2.6+0.3*fi-0.25*float(j);
        vec3 q=m-vec3(px,0.0,0.0);
        r=opU(r,vec2(sdCylinder(q-vec3(0.0,h*0.5+0.5,0.0),h*0.5,0.04),6.0));
        // gaff sail: trapezoid in the xy plane behind the mast, slightly bellied
        vec3 sq=q-vec3(-0.6,0.6+h*0.45,0.08*sin(q.x*2.0));
        float slant=0.25*(sq.y/(h*0.45));
        float sail=max(max(abs(sq.x+slant)-0.55,abs(sq.y)-h*0.42),abs(sq.z)-0.035);
        r=opU(r,vec2(sail,27.0)); }
      // jib
      vec3 jq=m-vec3(1.6,1.4,0.0); float jib=max(max(abs(jq.x-0.25*jq.y)-0.35,abs(jq.y)-0.75),abs(jq.z)-0.035);
      r=opU(r,vec2(max(jib,-(jq.x+0.45*(0.75-jq.y))),27.0));
    } }
  // the Lastochka: detailed rusty tug-barge at (u_bx,-2.2,u_bz) heading +x
  vec3 b=p-vec3(u_bx,-2.2,u_bz); b.y-=0.04*sin(u_time*2.0); b.xy=rot(0.02*sin(u_time*1.3))*b.xy;
  if(length(b)<6.5){ float bid; float d=barge(b,bid); r=opU(r,vec2(d,bid));
    for(int i=0;i<4;i++){ float fi=float(i); float ph=fract(u_time*0.45+fi*0.25);
      vec3 sm=b-vec3(-0.45-ph*1.6,2.15+ph*1.4,0.0);
      r=opU(r,vec2(sdSphere(sm,0.12+ph*0.3)+0.08*noise2(sm.xy*5.0+fi),15.0)); } }
  // the new steamer at (u_sx,-2.2,u_sz), tilts when aground
  vec3 sv=p-vec3(u_sx,-2.2,u_sz); sv.xy=rot(-0.12*u_stilt)*sv.xy; sv.yz=rot(0.18*u_stilt)*sv.yz;
  if(length(sv)<9.0){
    float sx=sv.x;
    float hw=1.0*(1.0-0.92*pow(clamp((sx-1.6)/2.4,0.0,1.0),1.5))*(1.0-0.25*pow(clamp((-sx-3.0)/1.0,0.0,1.0),2.0));
    hw*=mix(0.75,1.0,clamp(sv.y/0.5,0.0,1.0));
    float top=1.1+0.3*smoothstep(1.8,4.0,sx);
    float sh=max(max(abs(sv.z)-hw,max(-sv.y,sv.y-top)),abs(sx)-4.0)*0.7;
    r=opU(r,vec2(sh,21.0));
    float s1=sdRoundBox(sv-vec3(-0.6,1.45,0.0),vec3(2.0,0.33,0.72),0.05);
    float s2=sdRoundBox(sv-vec3(-0.2,2.05,0.0),vec3(1.2,0.26,0.6),0.05);
    float br=sdRoundBox(sv-vec3(0.8,2.5,0.0),vec3(0.35,0.2,0.55),0.04);
    r=opU(r,vec2(min(min(s1,s2),br),22.0));
    vec3 fq=sv-vec3(-0.6,2.9,0.0); fq.xy=rot(0.18)*fq.xy; float f1=sdCylinder(fq,0.7,0.27);
    vec3 fq2=sv-vec3(-1.8,2.8,0.0); fq2.xy=rot(0.18)*fq2.xy; float f2=sdCylinder(fq2,0.7,0.27);
    r=opU(r,vec2(min(f1,f2),23.0));
    for(int k=0;k<2;k++){ float bz=0.68*(2.0*float(k)-1.0);
      r=opU(r,vec2(sdCapsule(sv,vec3(-1.6,2.38,bz),vec3(-0.6,2.38,bz),0.12),28.0)); }
    float mf=sdCylinder(sv-vec3(2.6,2.4,0.0),1.2,0.04), ma=sdCylinder(sv-vec3(-2.9,2.2,0.0),1.0,0.04);
    float stay=min(sdCapsule(sv,vec3(2.6,3.55,0.0),vec3(3.9,1.4,0.0),0.012),sdCapsule(sv,vec3(2.6,3.55,0.0),vec3(-2.9,3.15,0.0),0.012));
    r=opU(r,vec2(min(min(mf,ma),stay),19.0)); }
  // the shoal: a jagged reef just breaking the water
  vec3 rr=p-vec3(10.0,-2.2,-30.0);
  if(length(rr)<7.0){ float reef=1e5;
    for(int i=0;i<6;i++){ float fi=float(i); vec3 rk=rr-vec3(-3.0+fi*1.2,0.0,0.7*sin(fi*2.3));
      reef=smin(reef,sdEllipsoid(rk,vec3(0.55+0.25*sin(fi*1.3),0.45+0.35*abs(cos(fi*1.7)),0.5)),0.35); }
    reef=(reef+0.12*noise2(rr.xy*4.0)+0.08*noise2(rr.xz*7.0))*0.8;
    r=opU(r,vec2(reef,24.0)); }
  // cape + lighthouse only behind z=-45 (cheap bound elsewhere)
  if(p.z>-45.0){ float bd=p.z+45.05; if(bd<r.x) r=vec2(bd,0.0); return r; }
  vec3 c=p-vec3(18.0,-6.0,-64.0);
  float cape=smin(sdEllipsoid(c,vec3(16.0,13.0,9.0)),sdEllipsoid(c-vec3(-9.0,4.0,3.0),vec3(8.0,7.0,6.0)),3.0);
  cape=(cape+0.35*noise2(p.xz*0.25)+0.15*noise2(p.xy*0.9))*0.8;
  r=opU(r,vec2(cape,8.0));
  // lighthouse
  vec3 l=p-LH;
  float tower=sdCone(l,8.0,1.25,0.85);
  float gal=sdCylinder(l-vec3(0.0,8.1,0.0),0.12,1.25);
  float room=sdCylinder(l-vec3(0.0,8.8,0.0),0.6,0.75);
  float roof=sdCone(l-vec3(0.0,9.35,0.0),0.9,0.9,0.05);
  float base=sdCylinder(l-vec3(0.0,-1.6,0.0),2.0,1.55); r=opU(r,vec2(min(base,sdCylinder(l-vec3(0.0,0.2,0.0),0.25,1.45)),29.0));
  r=opU(r,vec2(tower,9.0)); r=opU(r,vec2(gal,10.0)); r=opU(r,vec2(room,11.0)); r=opU(r,vec2(roof,10.0));
  // gallery railing: top ring, mid ring and posts around the lamp room
  if(length(l-vec3(0.0,8.6,0.0))<2.0){
    vec3 g=l-vec3(0.0,8.22,0.0);
    float ring=min(sdTorus(g-vec3(0.0,0.62,0.0),vec2(1.18,0.03)),sdTorus(g-vec3(0.0,0.32,0.0),vec2(1.18,0.018)));
    float an=atan(g.z,g.x); float sect=6.28318/20.0; float a2=an-sect*floor(an/sect+0.5);
    vec3 pp=vec3(length(g.xz)*cos(a2),g.y,length(g.xz)*sin(a2));
    float post=sdCylinder(pp-vec3(1.18,0.31,0.0),0.31,0.022);
    r=opU(r,vec2(min(ring,post)*0.9,10.0)); }
  return r;
}
vec3 skyD(vec3 rd){
  float h=clamp(rd.y,0.0,1.0);
  vec3 c=mix(hexc(255.0,178.0,130.0),hexc(214.0,110.0,180.0),smoothstep(0.0,0.16,h));
  c=mix(c,hexc(58.0,30.0,140.0),smoothstep(0.18,0.6,h));
  vec3 sunD=normalize(vec3(-0.75,0.06,-0.65));
  float s=max(dot(rd,sunD),0.0);
  c+=hexc(255.0,200.0,120.0)*pow(s,24.0)*1.5+hexc(255.0,150.0,90.0)*pow(s,4.0)*0.35;
  // cumulus band
  float az=atan(rd.x,-rd.z), el=asin(clamp(rd.y,-1.0,1.0));
  vec2 cu=vec2(az*3.0, el*9.0);
  float b=noise2(cu)*0.55+noise2(cu*2.3+1.7)*0.3+noise2(cu*5.1)*0.15;
  float band=smoothstep(0.04,0.12,el)*(1.0-smoothstep(0.3,0.5,el));
  float cl=smoothstep(0.52,0.6,b*band+0.25*band);
  float belly=smoothstep(0.0,0.6,1.0-(b-0.45)*3.0);
  vec3 cc=mix(hexc(255.0,196.0,170.0),hexc(150.0,96.0,170.0),belly);
  return mix(c,cc,cl*0.9);
}
vec3 fogCol(vec3 rd){
  vec3 sunD=normalize(vec3(-0.75,0.06,-0.65));
  float s=max(dot(normalize(vec3(rd.x,0.0,rd.z)),normalize(vec3(sunD.x,0.0,sunD.z))),0.0);
  return mix(hexc(170.0,140.0,200.0),hexc(255.0,186.0,150.0),pow(s,3.0));
}
vec3 shadeF(vec3 pos, vec3 n, vec3 alb, vec3 L, vec3 keyC, vec3 fillC, vec3 bounceC, vec3 shT, float aoS, float t){
  if(t<30.0) return shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,aoS);
  float lit=smoothstep(-0.10,0.30,dot(n,L));
  vec3 c=alb*(keyC*lit+fillC*(0.5+0.5*n.y)+bounceC*max(0.0,-n.y)*0.6);
  return c*mix(shT,vec3(1.0),lit);
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  vec3 L=normalize(vec3(-0.7,0.35,-0.6));
  vec3 keyC=hexc(255.0,170.0,110.0)*1.1, fillC=hexc(150.0,110.0,200.0)*0.55, bounceC=hexc(200.0,110.0,70.0)*0.2;
  vec3 shT=vec3(0.55,0.42,0.68);
  float tDeck=(rd.y<0.0)?(0.0-ro.y)/rd.y:1e5; vec3 pD=ro+rd*tDeck; if(pD.z<-2.85) tDeck=1e5;
  float tSea=(rd.y<0.0)?(-2.2-ro.y)/rd.y:1e5;
  bool nearL=u_layer>1.5;
  vec3 m=march(ro,rd,nearL?u_focus*1.4:110.0,0.0045);
  if(nearL && m.x<0.0) return vec4(0.0);
  float tObj=m.x>0.0?m.x:1e5;
  float tt=min(tObj,min(tDeck,tSea));
  vec3 col=skyD(rd); float ink=(tSea<tObj&&tSea<tDeck)?0.0:m.z;
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb; float em=0.0;
    if(tt==tObj){ n=calcNormal(pos); float id=m.y;
      if(id<2.5) alb=hexc(236.0,226.0,214.0);
      else if(id<3.5) alb=hexc(150.0,60.0,32.0);
      else if(id<4.5) alb=hexc(60.0,40.0,40.0);
      else if(id<5.5){ alb=hexc(255.0,210.0,120.0); em=1.0; }
      else if(id<6.5) alb=hexc(70.0,50.0,60.0);
      else if(id<7.5){ vec3 lb=pos-vec3(u_bx,-2.2,u_bz); float hy=lb.y;
        alb=hexc(46.0,74.0,92.0);                                            // old navy paint
        float rs=noise2(vec2(lb.x*9.0,hy*1.2))*0.6+noise2(lb.xy*20.0)*0.4;     // vertical rust streaks
        alb=mix(alb,hexc(190.0,92.0,40.0),smoothstep(0.45,0.75,rs)*smoothstep(0.62,0.2,hy));
        alb=mix(alb,hexc(140.0,64.0,36.0),smoothstep(0.7,0.78,noise2(lb.xy*3.0+7.0))*0.8);   // patches
        if(hy<0.14) alb=mix(hexc(150.0,40.0,36.0),hexc(110.0,46.0,30.0),rs);                  // antifouling
        if(abs(hy-0.17)<0.025) alb=hexc(236.0,226.0,214.0);                                 // white boot stripe
        float seam=smoothstep(0.012,0.0,abs(fract(lb.x/0.55)-0.5)-0.488); alb*=1.0-0.35*seam;
        vec2 rv=vec2(fract(lb.x/0.09)-0.5,(hy-0.42)/0.09); float riv=step(length(rv),0.22)+step(length(vec2(rv.x,(hy-0.24)/0.09)),0.22); alb=mix(alb,hexc(30.0,24.0,30.0),clamp(riv,0.0,1.0)*0.6);
        for(int k=0;k<4;k++){ float px=-1.7+0.7*float(k); float pr=length(vec2(lb.x-px,hy-0.33)); if(pr<0.075){ alb=(pr<0.055)?hexc(60.0,80.0,110.0):hexc(214.0,170.0,80.0); } }
        if(hy>0.62) alb=hexc(236.0,226.0,214.0); }
      else if(id<8.5){ float g=smoothstep(0.45,0.7,n.y);
        float strata=0.5+0.5*sin(pos.y*2.2+noise2(pos.xz*0.3)*3.0);
        vec3 rock=mix(hexc(168.0,112.0,92.0),hexc(112.0,72.0,84.0),strata*0.7+0.3*noise2(pos.xy*1.5));
        vec3 grass=mix(hexc(60.0,130.0,64.0),hexc(110.0,170.0,84.0),noise2(pos.xz*0.6));
        alb=mix(rock,grass,g); }
      else if(id<9.5){ float y=pos.y-LH.y; alb=(mod(floor(y/1.6),2.0)<0.5)?hexc(240.0,236.0,230.0):hexc(214.0,52.0,58.0); }
      else if(id<10.5) alb=hexc(50.0,40.0,50.0);
      else if(id<11.5){ alb=mix(hexc(255.0,240.0,200.0),hexc(255.0,70.0,60.0),u_flash); em=max(u_lamp,u_flash); }
      else if(id<12.5){ alb=hexc(230.0,214.0,190.0); float wnd=step(abs(pos.y+2.2-0.98),0.12)*step(0.12,abs(fract((pos.x-u_bx)*2.6)-0.5)); alb=mix(alb,hexc(255.0,200.0,110.0),wnd); em=wnd*0.6; }
      else if(id<13.5) alb=hexc(60.0,44.0,48.0);
      else if(id<14.5) alb=hexc(214.0,52.0,58.0);
      else if(id<15.5){ alb=mix(hexc(250.0,230.0,240.0),hexc(200.0,180.0,215.0),noise2(pos.xy*3.0)); em=0.25; }
      else if(id<17.5){ vec3 lb=pos-vec3(u_bx-1.25,-2.2+0.92,u_bz+0.53); float a=atan(lb.y,lb.x); alb=(mod(floor(a/0.785+4.0),2.0)<0.5)?hexc(226.0,52.0,52.0):hexc(245.0,240.0,232.0); }
      else if(id<18.5) alb=hexc(30.0,28.0,34.0);
      else if(id<19.5) alb=hexc(110.0,72.0,50.0);
      else if(id<20.5){ alb=hexc(255.0,210.0,120.0); em=1.2; }
      else if(id<21.5){ vec3 sq=pos-vec3(u_sx,-2.2,u_sz); float hy=sq.y;
        alb=hexc(32.0,40.0,70.0); if(hy<0.3) alb=hexc(176.0,44.0,44.0); if(hy>0.85) alb=hexc(245.0,244.0,240.0);
        if(abs(hy-0.82)<0.03) alb=hexc(214.0,170.0,80.0);
        float pr=length(vec2(fract(sq.x/0.38)-0.5,(hy-0.62)/0.38)); if(pr<0.14) alb=(pr<0.1)?hexc(255.0,214.0,140.0):hexc(214.0,170.0,80.0); em=(pr<0.1)?0.6:0.0;
        alb*=1.0-0.25*smoothstep(0.012,0.0,abs(fract(sq.x/0.7)-0.5)-0.49); }
      else if(id<22.5){ alb=hexc(250.0,246.0,236.0); float hy=pos.y+2.2; float row=max(step(abs(hy-1.5),0.09),step(abs(hy-2.08),0.08));
        float w=row*step(abs(fract((pos.x-u_sx)*3.0)-0.5),0.26); alb=mix(alb,hexc(255.0,206.0,120.0),w); em=w*0.7;
        if(abs(hy-1.8)<0.03||abs(hy-2.33)<0.03) alb=hexc(150.0,110.0,80.0); }
      else if(id<23.5){ float hy=pos.y+2.2; alb=(hy>3.35)?hexc(30.0,28.0,34.0):hexc(240.0,196.0,60.0); if(abs(hy-3.0)<0.08) alb=hexc(196.0,40.0,44.0); }
      else if(id<24.5){ alb=mix(hexc(52.0,44.0,58.0),hexc(104.0,90.0,100.0),noise2(pos.xz*3.0)*0.7+0.3*smoothstep(0.3,0.9,n.y)); if(pos.y<-2.05) alb=mix(alb,hexc(60.0,90.0,70.0),0.5); }
      else if(id<25.5) alb=hexc(54.0,40.0,44.0);
      else if(id<26.5){ float hy=pos.y+2.2; alb=mix(hexc(96.0,58.0,40.0),hexc(70.0,40.0,32.0),noise2(pos.xy*vec2(1.0,12.0)));
        if(abs(hy-0.42)<0.03) alb=hexc(220.0,200.0,150.0); if(hy<0.12) alb=hexc(40.0,30.0,34.0); }
      else if(id<27.5){ alb=mix(hexc(250.0,238.0,214.0),hexc(226.0,204.0,176.0),noise2(pos.xy*3.0)); alb*=1.0-0.12*smoothstep(0.4,0.0,abs(fract(pos.y*2.2)-0.5)); em=0.45; ink*=0.3; }
      else if(id<28.5) alb=hexc(245.0,240.0,232.0);
      else { vec3 bq=pos-LH; float br=step(0.5,fract(bq.y*3.0))*0.5; float bk=smoothstep(0.06,0.0,abs(fract(bq.y*3.0)-0.5)-0.44)+smoothstep(0.04,0.0,abs(fract(atan(bq.z,bq.x)*3.0+br)-0.5)-0.46); alb=mix(hexc(150.0,136.0,140.0),hexc(116.0,104.0,112.0),noise2(bq.xy*4.0)); alb*=1.0-0.4*clamp(bk,0.0,1.0); }
      col=shadeF(pos,n,alb,L,keyC,fillC,bounceC,shT,0.3,tt)+alb*em*2.5;
      float rim=pow(clamp(1.0+dot(n,rd),0.0,1.0),3.0)*smoothstep(-0.2,0.6,dot(n,L));
      col+=keyC*alb*rim*0.6;
    } else if(tt==tDeck){ n=vec3(0.0,1.0,0.0);
      float w=0.14, pk=floor(pos.x/w), fx=fract(pos.x/w);
      float off=hash2(vec2(pk,7.0))*3.0, fz=fract(pos.z/1.6+off);
      vec3 base=mix(hexc(170.0,80.0,46.0),hexc(150.0,66.0,38.0),hash2(vec2(pk,3.0)));
      base*=0.9+0.16*hash2(vec2(pk,floor(pos.z/1.6+off)));
      base*=1.0-0.12*smoothstep(0.6,1.0,sin(pos.x*260.0+noise2(vec2(pos.x*30.0,pos.z*3.0))*6.0));
      float gap=max(smoothstep(0.045,0.0,min(fx,1.0-fx)),smoothstep(0.012,0.0,min(fz,1.0-fz)));
      alb=mix(base,hexc(50.0,22.0,24.0),gap);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.35);
      // lantern pool of light on deck
      col+=hexc(255.0,190.0,110.0)*exp(-dot(pos.xz-vec2(1.27,-1.35),pos.xz-vec2(1.27,-1.35))*1.5)*0.5;
      ink=max(ink,smoothstep(0.02,0.0,min(fx,1.0-fx))*clamp(1.2-tt*0.15,0.0,1.0));
    } else {
      vec2 q=pos.xz; float tm=u_time;
      float h0=noise2(q*vec2(0.12,0.9)+vec2(tm*0.25,0.0)), h1=noise2(q*vec2(0.35,2.6)-vec2(tm*0.15,tm*0.35)), h2=noise2(q*vec2(0.9,6.5)+vec2(tm*0.6,tm*0.2));
      float e=0.05, fade=exp(-tSea*0.03);
      float hx=noise2((q+vec2(e,0.0))*vec2(0.35,2.6)-vec2(tm*0.15,tm*0.35))-h1, hz=noise2((q+vec2(0.0,e))*vec2(0.35,2.6)-vec2(tm*0.15,tm*0.35))-h1;
      float hx2=noise2((q+vec2(e,0.0))*vec2(0.9,6.5)+vec2(tm*0.6,tm*0.2))-h2, hz2=noise2((q+vec2(0.0,e))*vec2(0.9,6.5)+vec2(tm*0.6,tm*0.2))-h2;
      n=normalize(vec3(-(hx*1.2+hx2*0.5)*fade*2.2,1.0,-(hz*1.2+hz2*0.5)*fade*2.2));
      vec3 rf=reflect(rd,n); rf.y=abs(rf.y);
      float fr=0.04+0.96*pow(1.0-max(dot(-rd,n),0.0),5.0);
      vec3 deep=mix(hexc(22.0,30.0,84.0),hexc(52.0,44.0,118.0),smoothstep(4.0,60.0,tSea));
      col=mix(deep*(0.8+0.4*h0),lin(skyD(rf))*0.8,clamp(fr*1.1,0.0,0.7));
      vec3 sunD=normalize(vec3(-0.75,0.06,-0.65));
      col+=hexc(255.0,190.0,120.0)*pow(max(dot(rf,sunD),0.0),90.0)*3.0;            // sun glitter path
      float crest=smoothstep(0.76,0.82,h1*0.6+h2*0.4)*fade;                           // whitecaps
      float dr=length((pos.xz-vec2(10.0,-30.0))*vec2(0.32,0.9));
      crest=max(crest,smoothstep(1.6,1.1,dr)*smoothstep(0.35,0.6,noise2(pos.xz*3.0+vec2(u_time,0.0))));
      col=mix(col,hexc(250.0,230.0,240.0),crest*0.55);
      ink=max(ink,smoothstep(0.8,0.82,h1*0.6+h2*0.4)*fade*0.25);
    }
    // height fog: thick near the sea, thin above fogH
    float fd=0.0;
    if(tt>3.0){
      float y0=ro.y, k=1.6;
      float a=exp(-(max(y0,u_fogH)-u_fogH)*k);
      float dy=rd.y*k; float e=abs(dy)>1e-4 ? (1.0-exp(-(tt-3.0)*dy))/dy : (tt-3.0);
      fd=1.0-exp(-0.28*a*e);
      float below=smoothstep(u_fogH+0.5,u_fogH-0.5,pos.y);
      float patch=0.55+0.45*noise2(pos.xz*0.09+vec2(u_time*0.03,0.0))*noise2(pos.xz*0.21-vec2(0.0,u_time*0.02))*2.0;
      bool isSea=(tt==tSea);
      if(isSea){ below=0.0; fd*=0.6; }
      fd=clamp(max(fd,below*smoothstep(3.0,16.0,tt)*0.75)*patch,0.0,isSea?0.55:0.8);
    }
    col=mix(col,fogCol(rd),fd);
    col=mix(col,hexc(230.0,170.0,190.0),clamp((tt-40.0)*0.005,0.0,0.25));
    col=pow(max(col,0.0),vec3(0.4545));
  }
  // lamp glow + star rays + beams
  vec3 lamp=LH+vec3(0.0,8.8,0.0); vec3 w0=lamp-ro; float t0=dot(w0,rd);
  if(t0>0.0){
    float d0=length(w0-rd*t0)/t0;
    vec3 lc=mix(vec3(1.0,0.92,0.75),vec3(1.0,0.18,0.14),u_flash);
    float g=max(u_lamp*0.5,u_flash);
    col+=lc*(exp(-d0*d0*9000.0)*1.6+exp(-d0*120.0)*0.6)*g;
    // rays
    vec3 up=vec3(0.0,1.0,0.0); vec3 ax=normalize(cross(rd,up)); vec3 ay=cross(ax,rd);
    vec2 sp2=vec2(dot(w0-rd*t0,ax),dot(w0-rd*t0,ay))/t0;
    float ang=atan(sp2.y,sp2.x);
    float ray=pow(abs(cos(ang*7.0)),40.0)*exp(-d0*60.0)+pow(abs(cos(ang*7.0+0.22)),80.0)*exp(-d0*30.0)*0.6;
    col+=lc*ray*u_flash*1.2;
    // horizontal beam sweeping over the fog
    float bm=exp(-abs(sp2.y)*400.0)*exp(-abs(sp2.x)*4.0)*step(0.0,-sp2.x*0.0+1.0);
    col+=lc*bm*g*0.5;
  }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.9);
  col=post(col,1.18,1.08,vec3(30.0,12.0,40.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=(tt==tDeck)?0.0:1.0-smoothstep(u_focus,u_focus*mix(1.35,1.03,u_fsharp),tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

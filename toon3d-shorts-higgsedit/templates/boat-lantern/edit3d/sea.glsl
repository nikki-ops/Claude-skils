// Open sea with yachts moving along +x; camera on +z. Sea y=0.
// params: rx ry rz tx ty tz lens  a1 a2 a3 a7 (x offsets)  cap (0..1 leaders capsized)  storm (0..1)  dusk (0..1)
float sdTri2(vec2 p, vec2 a, vec2 b, vec2 c){ vec2 e0=b-a,e1=c-b,e2=a-c,v0=p-a,v1=p-b,v2=p-c;
  vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.0,1.0), pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.0,1.0), pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.0,1.0);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y); }
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h); }
// yacht local: hull along x, mast at x=0, sails in xy plane
float yacht(vec3 p, out float part){
  float hull=sdRoundBox(p-vec3(0.0,0.15,0.0),vec3(1.1-0.25*clamp(p.x,0.0,1.0),0.16,0.32-0.22*clamp(p.x-0.3,0.0,1.0)),0.06);
  float deck=sdRoundBox(p-vec3(-0.1,0.36,0.0),vec3(0.5,0.08,0.18),0.03);
  float mast=sdCylinder(p-vec3(0.05,1.25,0.0),1.05,0.03);
  float main=max(sdTri2(p.xy,vec2(0.1,0.45),vec2(0.1,2.25),vec2(1.0,0.5)),abs(p.z)-0.012);
  float jib=max(sdTri2(p.xy,vec2(0.0,0.45),vec2(0.0,1.9),vec2(-0.8,0.5)),abs(p.z+0.02)-0.012);
  float d=hull; part=1.0;
  if(deck<d){d=deck;part=2.0;} if(mast<d){d=mast;part=3.0;} if(main<d){d=main;part=4.0;} if(jib<d){d=jib;part=5.0;}
  return d;
}
vec3 yPos(int i){ if(i==0) return vec3(-1.5+u_a1,0.0,-6.0); if(i==1) return vec3(-3.6+u_a2,0.0,-8.5); if(i==2) return vec3(-5.5+u_a3,0.0,-11.0); return vec3(-9.0+u_a7,0.0,-4.5); }
float capRot(int i){ return i<3 ? u_cap*1.45*(1.0-0.12*float(i)) : 0.0; }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  for(int i=0;i<4;i++){
    vec3 q=p-yPos(i);
    q.y-=0.05*sin(u_time*1.7+float(i));
    q.xy=rot(capRot(i))*q.xy;
    float part; float d=yacht(q,part);
    if(d<r.x) r=vec2(d,float(i)*10.0+part+1.0);
  }
  // finish line: two poles with flags + rope buoys at x=u_fin
  if(u_fin>-50.0){
    vec3 f1=p-vec3(u_fin,0.0,-3.0), f2=p-vec3(u_fin,0.0,-9.0);
    float poles=min(sdCylinder(f1-vec3(0.0,1.2,0.0),1.2,0.05),sdCylinder(f2-vec3(0.0,1.2,0.0),1.2,0.05));
    float flags=min(sdRoundBox(f1-vec3(0.45,2.1,0.0),vec3(0.42,0.28,0.01),0.005),sdRoundBox(f2-vec3(0.45,2.1,0.0),vec3(0.42,0.28,0.01),0.005));
    vec3 bq=p-vec3(u_fin,0.08,-6.0); bq.z-=1.0*floor(bq.z/1.0+0.5); float buoy=max(sdSphere(bq,0.14),abs(p.z+6.0)-3.0);
    r=opU(r,vec2(poles,60.0)); r=opU(r,vec2(flags,61.0)); r=opU(r,vec2(buoy,62.0));
  }
  // smoke puffs behind No.7
  vec3 sm=p-yPos(3)-vec3(-1.3,0.9,0.0);
  float puff=min(sdSphere(sm-vec3(-0.3*sin(u_time),0.2*fract(u_time*0.7),0.0),0.22),sdSphere(sm-vec3(-0.6,0.5,0.0),0.3));
  r=opU(r,vec2(puff,50.0));
  return r;
}
vec3 skyS(vec3 rd){
  float h=clamp(rd.y*1.6,0.0,1.0);
  vec3 day=mix(vec3(181,220,250)/255.0,vec3(92,156,251)/255.0,smoothstep(0.0,0.4,h)); day=mix(day,vec3(58,124,232)/255.0,smoothstep(0.4,1.0,h));
  vec3 dk=mix(vec3(246,192,185)/255.0,vec3(217,178,207)/255.0,smoothstep(0.0,0.3,h)); dk=mix(dk,vec3(175,146,199)/255.0,smoothstep(0.3,1.0,h));
  vec3 st=mix(vec3(138,154,184)/255.0,vec3(59,74,110)/255.0,h);
  vec3 c=mix(mix(day,dk,u_dusk),st,u_storm);
  float az=atan(rd.x,-rd.z), el=asin(clamp(rd.y,-1.0,1.0));
  vec2 cu=vec2(az*3.2+u_time*0.01*(1.0+u_storm*8.0), el*9.0);
  float base_=noise2(cu*vec2(1.0,1.0))*0.55+noise2(cu*2.3+1.7)*0.3+noise2(cu*5.1)*0.15;
  float bandC=smoothstep(0.03,0.12,el)*(1.0-smoothstep(0.32,0.55,el));
  float cl=smoothstep(0.5-0.25*u_storm,0.58-0.2*u_storm,base_*bandC+0.25*bandC+u_storm*0.3*smoothstep(0.05,0.3,el));
  float belly=smoothstep(0.0,0.6,1.0-(base_-0.45)*3.0)*smoothstep(0.5,0.0,el*3.0);
  vec3 cc=mix(mix(vec3(255,245,220)/255.0,vec3(232,168,194)/255.0,u_dusk), mix(vec3(201,195,224)/255.0,vec3(181,152,203)/255.0,u_dusk), belly);
  cc=mix(cc,mix(vec3(110,118,140)/255.0,vec3(60,66,90)/255.0,belly),u_storm);
  return mix(c,cc,cl);
}
float digitD(vec2 p, int d){ // p in [-0.5,0.5]x[-0.7,0.7]
  vec2 A=vec2(-0.3,0.55),B=vec2(0.3,0.55),C=vec2(0.3,0.0),D=vec2(0.3,-0.55),E=vec2(-0.3,-0.55),F=vec2(-0.3,0.0);
  float s=1e5;
  if(d==1){ s=sdSeg(p,vec2(0.05,0.55),vec2(0.05,-0.55)); s=min(s,sdSeg(p,vec2(0.05,0.55),vec2(-0.2,0.35))); }
  if(d==2){ s=min(sdSeg(p,A,B),min(sdSeg(p,B,C),min(sdSeg(p,C,F),min(sdSeg(p,F,E),sdSeg(p,E,D))))); }
  if(d==3){ s=min(sdSeg(p,A,B),min(sdSeg(p,B,D),min(sdSeg(p,F,C),sdSeg(p,E,D)))); }
  if(d==7){ s=min(sdSeg(p,A,B),sdSeg(p,B,vec2(-0.05,-0.55))); }
  return s;
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  vec3 L=normalize(mix(vec3(0.5,0.75,0.5),vec3(-0.7,0.18,-0.6),u_dusk));
  vec3 keyC=mix(hexc(255.0,241.0,214.0)*1.15,hexc(255.0,176.0,112.0)*0.95,u_dusk)*(1.0-0.6*u_storm);
  vec3 fillC=mix(hexc(143.0,184.0,255.0)*0.4,hexc(181.0,152.0,203.0)*0.45,u_dusk)*(1.0+0.4*u_storm);
  vec3 bounceC=hexc(74.0,144.0,216.0)*0.12;
  vec3 shT=mix(vec3(0.55,0.5,0.7),vec3(0.6,0.4,0.55),u_dusk);
  float tSea=rd.y<0.0?(0.0-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,40.0,0.004);
  float tO=m.x>0.0?m.x:1e5;
  float tt=min(tO,tSea);
  vec3 col=skyS(rd); float ink=m.z;
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb;
    if(tt==tO){ n=calcNormal(pos); float id=m.y; int yi=int(floor((id-1.0)/10.0)); float part=id-1.0-float(yi)*10.0;
      bool old=(yi==3);
      if(id>59.5 && id<60.5) alb=hexc(240.0,236.0,224.0);
      else if(id>60.5 && id<61.5){ vec2 cq=floor((pos.xy-vec2(u_fin,0.0))*9.0); alb=mod(cq.x+cq.y,2.0)<0.5?hexc(20.0,20.0,26.0):hexc(245.0,245.0,245.0); }
      else if(id>61.5 && id<62.5) alb=hexc(230.0,60.0,50.0);
      else if(id>49.0){ alb=vec3(0.6,0.6,0.66); }
      else if(part<1.5){ alb=old?hexc(122.0,80.0,50.0):hexc(244.0,240.0,230.0);
        vec3 q=pos-yPos(yi); if(!old && abs(q.y-0.12)<0.035) alb=yi==0?hexc(200.0,50.0,46.0):(yi==1?hexc(31.0,58.0,106.0):hexc(46.0,140.0,80.0));
        if(old && fract(q.x*3.0)<0.08) alb*=0.7; }
      else if(part<2.5) alb=hexc(176.0,112.0,62.0);
      else if(part<3.5) alb=hexc(217.0,210.0,196.0);
      else { alb=old?hexc(214.0,196.0,150.0):(yi==1?hexc(255.0,233.0,168.0):hexc(255.0,246.0,226.0));
        vec3 q=pos-yPos(yi); q.xy=rot(capRot(yi))*q.xy;
        if(old){ if(abs(q.x-0.6)<0.15&&abs(q.y-1.0)<0.15) alb=hexc(168.0,139.0,94.0); }
        if(part<4.5){ vec2 c=vec2(q.x-0.38,q.y-1.05); float badge=length(c)-0.2; if(badge<0.0){ alb=hexc(255.0,255.0,255.0);
          int dg=yi==0?1:(yi==1?2:(yi==2?3:7)); if(digitD(c/0.26,dg)<0.13) alb=old?hexc(140.0,42.0,26.0):hexc(30.0,58.0,110.0); }
          if(abs(badge)<0.015) alb=hexc(31.0,18.0,37.0); }
      }
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.25);
      if(u_dusk>0.0) col+=hexc(255.0,200.0,144.0)*0.6*u_dusk*pow(clamp(1.0+dot(n,rd),0.0,1.0),3.0);
    } else { n=vec3(0.0,1.0,0.0);
      float d=tSea; vec2 w2=pos.xz*vec2(0.45,1.3);
      float sp_=1.0+2.0*u_storm;
      float wv=noise2(w2+vec2(u_time*0.25*sp_,0.0))*0.6+noise2(w2*2.7-vec2(0.0,u_time*0.35*sp_))*0.4;
      vec3 near=mix(mix(hexc(31.0,111.0,196.0),hexc(78.0,74.0,120.0),u_dusk),hexc(44.0,70.0,110.0),u_storm);
      vec3 far=mix(mix(hexc(111.0,178.0,236.0),hexc(231.0,178.0,192.0),u_dusk),hexc(110.0,124.0,150.0),u_storm);
      col=mix(near,far,smoothstep(3.0,70.0,d))*(0.9+0.2*wv);
      float sh=softSh(pos+vec3(0.0,0.02,0.0),L,10.0); col*=mix(shT,vec3(1.0),sh);
      col+=hexc(244.0,248.0,255.0)*smoothstep(0.8-0.1*u_storm,0.86-0.1*u_storm,wv)*(0.9+u_storm)*exp(-d*0.015);
      if(u_dusk>0.0){ float gl=pow(max(dot(reflect(rd,n),L),0.0),40.0); col+=hexc(255.0,208.0,144.0)*gl*1.5*u_dusk*step(0.7,wv*0.5+noise2(pos.xz*4.0)*0.6); }
    }
    vec3 fogc=mix(mix(hexc(181.0,220.0,250.0),hexc(240.0,188.0,192.0),u_dusk),hexc(138.0,154.0,184.0),u_storm);
    col=mix(col,fogc,clamp((tt-8.0)*0.01,0.0,0.45));
    col=pow(max(col,0.0),vec3(0.4545));
  }
  // cape on the horizon (right side)
  float az=atan(rd.x,-rd.z);
  float band=smoothstep(0.08,0.2,az)*(1.0-smoothstep(0.4,0.6,az));
  float capeH=band*(0.04+0.012*noise2(vec2(az*25.0,1.0)));
  if(rd.y>-0.002&&rd.y<capeH&&tt>200.0){
    vec3 cc=mix(vec3(74,111,138)/255.0,vec3(95,154,124)/255.0,smoothstep(capeH-0.015,capeH,rd.y));
    cc=mix(cc,vec3(70,60,95)/255.0,u_dusk*0.7); cc=mix(cc,vec3(70,80,100)/255.0,u_storm);
    col=mix(cc,mix(vec3(181,220,250)/255.0,vec3(240,188,192)/255.0,u_dusk),0.35);
  }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.95);
  col=post(col,mix(1.15,1.1,u_dusk),mix(1.1,0.95,u_dusk),mix(vec3(27.0,10.0,26.0),vec3(48.0,20.0,42.0),u_dusk)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

// Bookie room. Back wall z=-3, floor y=0, counter front at z=0.6 (top y=1.05, depth 0.7). Camera on +z.
// params: rx ry rz tx ty tz lens lamp
float sdCone0(vec3 p){ vec2 q=vec2(length(p.xz),p.y); float h=0.16; float r1=0.3, r2=0.07; vec2 k1=vec2(r2,h), k2=vec2(r2-r1,2.0*h); vec2 ca=vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h); vec2 cb=q-k1+k2*clamp(dot(k1-q,k2)/dot(k2,k2),0.0,1.0); float s=(cb.x<0.0&&ca.y<0.0)?-1.0:1.0; return s*sqrt(min(dot(ca,ca),dot(cb,cb)))-0.005; }
float fbm(vec2 p){ return noise2(p)*0.5+noise2(p*2.1)*0.25+noise2(p*4.3)*0.125+noise2(p*8.7)*0.0625; }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // counter body + felt top + front panels
  float body=sdRoundBox(p-vec3(0.0,0.5,0.25),vec3(3.2,0.5,0.35),0.02);
  float top=sdRoundBox(p-vec3(0.0,1.03,0.25),vec3(3.25,0.03,0.4),0.015);
  float rim=sdRoundBox(p-vec3(0.0,1.0,0.66),vec3(3.25,0.05,0.03),0.01);
  r=opU(r,vec2(body,3.0)); r=opU(r,vec2(top,4.0)); r=opU(r,vec2(rim,5.0));
  // pilasters on the back wall
  vec3 q=p; q.x=q.x-1.6*floor(q.x/1.6+0.5);
  float pil=sdRoundBox(q-vec3(0.0,1.6,-2.92),vec3(0.09,1.6,0.08),0.01);
  r=opU(r,vec2(pil,6.0));
  // army radio on the felt (u_radio)
  if(u_radio>0.5){
    vec3 rp=p-vec3(0.55,1.29,0.25); rp.x+=0.006*sin(u_time*70.0)*u_shake; rp.y-=0.004*abs(sin(u_time*55.0))*u_shake;
    float body=sdRoundBox(rp,vec3(0.34,0.21,0.17),0.03);
    float knobs=min(sdCylinder(vec3(rp.x-0.2,rp.z-0.18,rp.y+0.1).xzy,0.03,0.035),sdCylinder(vec3(rp.x-0.08,rp.z-0.18,rp.y+0.1).xzy,0.03,0.035));
    float dial=sdCylinder(vec3(rp.x-0.17,rp.z-0.17,rp.y-0.06).xzy,0.015,0.08);
    float ant=sdCapsule(rp,vec3(0.25,0.2,-0.05),vec3(0.42,0.75,-0.05),0.012);
    float handle=sdTorus((rp-vec3(0.0,0.24,0.0)).xzy,vec2(0.12,0.018));
    r=opU(r,vec2(body,10.0)); r=opU(r,vec2(min(knobs,handle),11.0)); r=opU(r,vec2(dial,12.0)); r=opU(r,vec2(ant,11.0));
  }
  // notice board frame
  float nb=sdRoundBox(p-vec3(-0.9,1.85,-2.96),vec3(0.95,0.65,0.04),0.01);
  r=opU(r,vec2(nb,9.0));
  // wainscot rail
  float wr=sdRoundBox(p-vec3(0.0,0.95,-2.93),vec3(6.0,0.04,0.07),0.01);
  r=opU(r,vec2(wr,5.0));
  // hanging lamps
  vec3 lp=p; lp.x=lp.x-2.2*floor(lp.x/2.2+0.5);
  float shade_=sdCone0(lp-vec3(0.0,2.55,-0.8));
  float cord=sdCylinder(lp-vec3(0.0,3.2,-0.8),0.6,0.008);
  r=opU(r,vec2(shade_,7.0)); r=opU(r,vec2(cord,6.0));
  float bulb=sdSphere(lp-vec3(0.0,2.42,-0.8),0.07);
  r=opU(r,vec2(bulb,8.0));
  return r;
}

vec3 lampLight(vec3 pos, vec3 n){
  vec3 acc=vec3(0.0);
  for(int i=-2;i<=2;i++){ vec3 lp=vec3(float(i)*2.2,2.42,-0.8); vec3 d=lp-pos; float dl=length(d);
    acc+=hexc(255.0,200.0,120.0)*1.6*max(dot(n,d/dl),0.0)/(1.0+dl*dl*0.8); }
  return acc*u_lamp;
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  float tF=rd.y<0.0?-ro.y/rd.y:1e5, tW=rd.z<0.0?(-3.0-ro.z)/rd.z:1e5, tC=rd.y>0.0?(3.4-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,12.0,0.005);
  float tO=m.x>0.0?m.x:1e5;
  float tt=min(tO,min(tF,min(tW,tC)));
  vec3 pos=ro+rd*tt, n, alb; float ink=m.z; float emis=0.0;
  if(tt==tO){ n=calcNormal(pos); float id=m.y;
    if(id<3.5){ alb=mix(hexc(59.0,28.0,26.0),hexc(90.0,42.0,36.0),fbm(pos.xy*6.0));
      float px=abs(fract(pos.x/0.9)-0.5), py=abs(pos.y-0.5);
      if(pos.z>0.55 && (px>0.42 || py>0.38)) alb*=0.6; }
    else if(id<4.5){ float pk=floor(pos.x/0.22); alb=mix(hexc(120.0,70.0,40.0),hexc(150.0,92.0,52.0),hash2(vec2(pk,4.0))); alb*=0.9+0.15*sin(pos.x*140.0+fbm(pos.xz*12.0)*6.0); alb*=1.0-0.4*smoothstep(0.02,0.0,abs(fract(pos.x/0.22)-0.5)-0.47); }
    else if(id<5.5) alb=hexc(201.0,160.0,64.0);
    else if(id<6.5) alb=hexc(94.0,47.0,34.0);
    else if(id<7.5) alb=hexc(168.0,96.0,44.0);
    else if(id<8.5){ alb=hexc(255.0,243.0,192.0); emis=1.0; }
    else if(id>9.5 && id<10.5){ alb=hexc(107.0,122.0,74.0); vec3 rp=pos-vec3(0.55,1.29,0.25); if(rp.z>0.15 && rp.x<0.02 && abs(rp.y)<0.15 && rp.x>-0.3){ alb=mix(hexc(62.0,74.0,44.0),hexc(40.0,48.0,30.0),step(0.5,fract(rp.y*28.0))); } }
    else if(id>10.5 && id<11.5){ alb=hexc(40.0,40.0,44.0); }
    else if(id>11.5 && id<12.5){ alb=hexc(217.0,207.0,168.0); emis=0.15*u_shake; }
    else { alb=hexc(70.0,38.0,30.0); vec2 g=vec2((pos.x+1.85)/0.32,(pos.y-1.2)/0.26); vec2 c=fract(g)-0.5; float note=step(abs(c.x),0.36)*step(abs(c.y),0.34)*step(0.35,hash2(floor(g)));
      float hh=hash2(floor(g)+3.0); vec3 glass=hh<0.33?hexc(46.0,120.0,70.0):(hh<0.66?hexc(190.0,110.0,30.0):hexc(110.0,50.0,40.0));
      float neck=step(abs(c.x),0.12)*step(c.y,0.34)*step(-0.05,c.y); float body=step(abs(c.x),0.3)*step(c.y,0.0)*step(-0.34,c.y);
      float bottle=max(neck,body)*step(0.35,hash2(floor(g))); alb=mix(alb,glass,bottle); emis=max(emis,bottle*0.25*step(0.8,fract(c.x*3.0+0.2)));
      if(abs(c.y+0.36)<0.03) alb=hexc(90.0,50.0,32.0); }
  } else if(tt==tW){ n=vec3(0.0,0.0,1.0);
    if(pos.y<0.95){ alb=mix(hexc(94.0,47.0,34.0),hexc(141.0,89.0,65.0),fbm(pos.xy*4.0)*0.6); float pp=abs(fract(pos.x/0.8)-0.5); if(pp>0.46||abs(pos.y-0.47)>0.4) alb*=0.65; }
    else { alb=hexc(149.0,79.0,81.0)*(0.92+0.16*fbm(pos.xy*7.0)); float dm=fract(pos.x*1.6+(pos.y)*0.0)-0.5; float pat=smoothstep(0.08,0.0,abs(length(vec2(fract(pos.x*1.4)-0.5,fract(pos.y*1.1)-0.5))-0.22)); alb*=1.0-0.12*pat; }
  } else if(tt==tC){ n=vec3(0.0,-1.0,0.0); alb=hexc(50.0,72.0,87.0);
  } else { n=vec3(0.0,1.0,0.0);
    float w=0.18, pk=floor(pos.x/w+pos.z*0.0), fx=fract(pos.x/w); float off=hash2(vec2(pk,2.0))*3.0, fz=fract(pos.z/1.2+off);
    alb=mix(hexc(134.0,90.0,69.0),hexc(178.0,133.0,108.0),hash2(vec2(pk,floor(pos.z/1.2+off))));
    float gap=max(smoothstep(0.05,0.0,min(fx,1.0-fx)),smoothstep(0.015,0.0,min(fz,1.0-fz)));
    alb=mix(alb,hexc(58.0,34.0,25.0),gap);
    float lit_=step(0.82,noise2(pos.xz*5.0));
    alb=mix(alb,hexc(232.0,213.0,176.0),lit_*0.7);
  }
  vec3 col;
  if(emis>0.5) col=vec3(1.0,0.96,0.78)*2.0;
  else {
    vec3 L=normalize(vec3(0.3,0.9,0.6));
    float ao=calcAO(pos,n);
    col=alb*(hexc(232.0,201.0,160.0)*0.85*mix(1.0,ao,0.6) + lampLight(pos,n)*softSh(pos+n*0.02,normalize(vec3(0.0,2.42,-0.8)-pos),6.0));
    float corner=smoothstep(0.5,0.0,min(abs(pos.y),abs(pos.z+3.0)));
    col*=mix(vec3(1.0),hexc(47.0,27.0,27.0)*3.0,corner*0.4);
  }
  col=pow(max(col,0.0),vec3(0.4545));
  // lamp bloom (screen-space approx: distance of ray to lamp centres)
  for(int i=-2;i<=2;i++){ vec3 lp=vec3(float(i)*2.2,2.42,-0.8); vec3 v=lp-ro; float tp=dot(v,rd); if(tp>0.0 && tp<tt+0.3){ float d=length(v-rd*tp); col+=vec3(1.0,0.85,0.55)*0.35*exp(-d*d*40.0)*u_lamp; } }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.95);
  col=post(col,1.05,1.15,vec3(34.0,25.0,30.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

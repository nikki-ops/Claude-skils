// Seaside terrace. y up, camera looks toward -z (sea). Deck y=0 for z>-5; sea y=-2.2.
// params: rx ry rz tx ty tz lens
float sdCone(vec3 p, float h, float r1, float r2){ vec2 q=vec2(length(p.xz),p.y); vec2 k1=vec2(r2,h), k2=vec2(r2-r1,2.0*h);
  vec2 ca=vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h); vec2 cb=q-k1+k2*clamp(dot(k1-q,k2)/dot(k2,k2),0.0,1.0);
  float s=(cb.x<0.0&&ca.y<0.0)?-1.0:1.0; return s*sqrt(min(dot(ca,ca),dot(cb,cb))); }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // railing at z=-5: balusters + top rail + bottom rail
  vec3 q=p-vec3(0.0,0.0,-5.0);
  float bx=q.x-0.42*floor(q.x/0.42+0.5);
  float bal=sdRoundBox(vec3(bx,q.y-0.5,q.z),vec3(0.035,0.5,0.035),0.02);
  float rail=sdRoundBox(q-vec3(0.0,1.04,0.0),vec3(30.0,0.06,0.09),0.03);
  float rail2=sdRoundBox(q-vec3(0.0,0.12,0.0),vec3(30.0,0.04,0.06),0.02);
  r=opU(r,vec2(min(bal,min(rail,rail2)),2.0));
  // umbrella at (-2.0,0,-2.8)
  vec3 u=p-vec3(-2.0,0.0,-2.8);
  float pole=sdCylinder(u-vec3(0.0,1.2,0.0),1.2,0.04);
  vec3 c=u-vec3(0.0,2.35,0.0);
  float can=sdCone(c,0.22,1.45,0.05)-0.02;
  r=opU(r,vec2(pole,3.0)); r=opU(r,vec2(can,4.0));
  // table with cloth at (0.9,0,-2.2)
  vec3 t=p-vec3(0.9,0.0,-2.2);
  float top=sdCylinder(t-vec3(0.0,0.74,0.0),0.035,0.5)-0.02;
  float cloth=1e5;
  float leg=sdCylinder(t-vec3(0.0,0.35,0.0),0.35,0.04);
  float base=sdCylinder(t-vec3(0.0,0.02,0.0),0.02,0.25);
  r=opU(r,vec2(min(top,cloth),5.0)); r=opU(r,vec2(min(leg,base),6.0));
  // chairs
  vec3 ch=p-vec3(1.8,0.0,-2.0);
  float seat=sdRoundBox(ch-vec3(0.0,0.45,0.0),vec3(0.22,0.03,0.22),0.02);
  float back=sdRoundBox(ch-vec3(0.2,0.75,0.0),vec3(0.03,0.3,0.22),0.02);
  vec3 lg=vec3(abs(ch.x)-0.18,ch.y-0.22,abs(ch.z)-0.18);
  float legs=sdRoundBox(lg,vec3(0.02,0.22,0.02),0.01);
  r=opU(r,vec2(min(seat,min(back,legs)),7.0));
  return r;
}
vec3 skyC(vec3 rd){
  float h=clamp(rd.y*1.6,0.0,1.0);
  vec3 c=mix(vec3(169,212,251)/255.0, vec3(108,170,252)/255.0, smoothstep(0.0,0.25,h));
  c=mix(c, vec3(75,141,247)/255.0, smoothstep(0.25,0.6,h));
  c=mix(c, vec3(49,111,229)/255.0, smoothstep(0.6,1.0,h));
  vec2 cu=rd.xz/max(rd.y+0.06,0.07)*0.55;
  float n1=noise2(cu*1.1+vec2(3.0,1.0))*0.6+noise2(cu*2.6)*0.3+noise2(cu*6.0)*0.1;
  float cl=smoothstep(0.56,0.66,n1)*smoothstep(0.02,0.12,rd.y);
  float belly=smoothstep(0.62,0.8,noise2(cu*1.1+vec2(3.0,0.82))*0.6+noise2(cu*2.6+vec2(0.0,-0.1))*0.4);
  vec3 cc=mix(vec3(255,245,220)/255.0, vec3(201,195,224)/255.0, belly);
  return mix(c,cc,cl);
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  vec3 L=normalize(vec3(0.55,0.75,0.45));
  vec3 keyC=hexc(255.0,241.0,214.0)*1.15, fillC=hexc(143.0,184.0,255.0)*0.35, bounceC=hexc(224.0,112.0,64.0)*0.15;
  vec3 shT=vec3(0.55,0.50,0.70);
  float tDeck=(rd.y<0.0)?(0.0-ro.y)/rd.y:1e5; vec3 pD=ro+rd*tDeck; if(pD.z<-5.0) tDeck=1e5;
  float tSea=(rd.y<0.0)?(-2.2-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,25.0,0.0045);
  float tObj=m.x>0.0?m.x:1e5;
  vec3 col=skyC(rd);
  float tt=min(tObj,min(tDeck,tSea));
  float ink=m.z;
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb;
    if(tt==tObj){ n=calcNormal(pos);
      float id=m.y;
      if(id<2.5) alb=hexc(240.0,236.0,224.0);
      else if(id<3.5) alb=hexc(107.0,58.0,32.0);
      else if(id<4.5){ float a=atan(pos.z+2.8,pos.x+2.0); bool st=mod(floor(a*10.0/6.28318*2.0),2.0)<0.5; alb=st?hexc(226.0,58.0,58.0):hexc(255.0,243.0,224.0); if(n.y<0.0) alb*=st?vec3(0.75,0.6,0.75):vec3(0.75,0.7,0.85); }
      else if(id<5.5){ vec3 tq=pos-vec3(0.9,0.0,-2.2); float pk=floor(tq.x/0.16); float fx=fract(tq.x/0.16); alb=mix(hexc(189.0,68.0,29.0),hexc(221.0,76.0,20.0),hash2(vec2(pk,5.0))); alb*=0.9+0.12*sin(tq.z*90.0+noise2(tq.xz*20.0)*5.0); if(n.y>0.5) alb=mix(alb,hexc(42.0,20.0,24.0),smoothstep(0.06,0.0,min(fx,1.0-fx))); else alb=hexc(128.0,40.0,26.0); }
      else if(id<6.5) alb=hexc(60.0,40.0,40.0);
      else alb=hexc(176.0,112.0,62.0);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.35);
    } else if(tt==tDeck){ n=vec3(0.0,1.0,0.0);
      float w=0.14, pk=floor(pos.x/w), fx=fract(pos.x/w);
      float off=hash2(vec2(pk,7.0))*3.0, seg=floor(pos.z/1.6+off), fz=fract(pos.z/1.6+off);
      vec3 base=mix(hexc(194.0,85.0,42.0),hexc(177.0,72.0,33.0),hash2(vec2(pk,3.0)));
      base*=0.93+0.14*hash2(vec2(pk,seg));
      float grain=sin(pos.x*260.0+noise2(vec2(pos.x*30.0,pos.z*3.0))*6.0);
      base*=1.0-0.12*smoothstep(0.6,1.0,grain);
      float gap=max(smoothstep(0.045,0.0,min(fx,1.0-fx)), smoothstep(0.012,0.0,min(fz,1.0-fz)));
      alb=mix(base,hexc(58.0,26.0,20.0),gap);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.35);
      ink=max(ink, smoothstep(0.02,0.0,min(fx,1.0-fx))*clamp(1.2-tt*0.15,0.0,1.0));
    } else { n=vec3(0.0,1.0,0.0);
      float d=tSea; vec2 w2=pos.xz*vec2(0.5,1.4);
      float wv=noise2(w2+vec2(u_time*0.25,0.0))*0.6+noise2(w2*2.7-vec2(0.0,u_time*0.35))*0.4;
      alb=mix(hexc(47.0,127.0,214.0),hexc(90.0,168.0,232.0),smoothstep(5.0,80.0,d));
      col=alb*(0.92+0.16*wv)*1.2;
      col+=hexc(244.0,248.0,255.0)*smoothstep(0.80,0.86,wv)*0.9*exp(-d*0.015);
    }
    vec3 fogc=hexc(169.0,212.0,251.0);
    col=mix(col,fogc,clamp((tt-6.0)*0.008,0.0,0.4));
    col=pow(max(col,0.0),vec3(0.4545));
  }
  float az=atan(rd.x,-rd.z);
  float band=smoothstep(0.05,0.16,az)*(1.0-smoothstep(0.34,0.5,az));
  float capeH=band*(0.028+0.01*noise2(vec2(az*30.0,1.0)));
  if(rd.y>-0.002&&rd.y<capeH&&tt>200.0){
    vec3 cc=mix(vec3(74,111,138)/255.0,vec3(95,154,124)/255.0,smoothstep(capeH-0.012,capeH,rd.y));
    col=mix(cc,vec3(169,212,251)/255.0,0.4);
  }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.95);
  col=post(col,1.15,1.1,vec3(27.0,10.0,26.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

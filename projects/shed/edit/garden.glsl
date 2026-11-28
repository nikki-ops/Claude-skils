// London back garden with a wooden shed. Lawn y=0, shed front face z=-2.0 (door faces +z), fence z=-5.5, brick terraces behind.
// params: rx ry rz tx ty tz lens  night (0 day .. 1 night)  lights (string lights 0..1)  table (dinner table in front of the shed 0/1)
//         dawn (0..1 sunrise sky)  sign (restaurant sign over the door 0/1)
float fbm(vec2 p){ return noise2(p)*0.5+noise2(p*2.1)*0.25+noise2(p*4.3)*0.125; }
float roofD(vec3 p){                       // gable roof, ridge along z (gable faces the camera)
  vec3 q=p-vec3(0.0,2.0,-3.0); q.x=abs(q.x);
  vec2 d=vec2(0.9086,-0.4176), n=vec2(0.4176,0.9086);   // slope ~24.7 deg
  vec2 o=q.xy-vec2(0.0,0.66);
  return sdRoundBox(vec3(dot(o,d)-0.82,dot(o,n)-0.03,q.z),vec3(0.84,0.035,1.12),0.01);
}
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // shed body, door, window, sign
  r=opU(r,vec2(sdRoundBox(p-vec3(0.0,1.0,-3.0),vec3(1.35,1.0,1.0),0.01),1.0));
  r=opU(r,vec2(max(sdRoundBox(p-vec3(0.0,2.3,-3.0),vec3(1.35,0.32,1.0),0.0),(p.y-2.0)+abs(p.x)*0.459-0.62),1.0)); // gable infill
  r=opU(r,vec2(roofD(p),2.0));
  r=opU(r,vec2(sdRoundBox(p-vec3(-0.35,0.88,-1.98),vec3(0.36,0.84,0.03),0.01),3.0));   // door
  r=opU(r,vec2(sdRoundBox(p-vec3(0.78,1.25,-1.98),vec3(0.32,0.28,0.025),0.01),4.0));   // window
  if(u_sign>0.5) r=opU(r,vec2(sdRoundBox(p-vec3(-0.35,1.98,-1.94),vec3(0.62,0.16,0.03),0.02),5.0));
  r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.05,-1.75),vec3(0.6,0.05,0.25),0.01),6.0));      // step
  // fence
  r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.9,-5.5),vec3(9.0,0.9,0.05),0.01),7.0));
  // tree on the right
  r=opU(r,vec2(sdCylinder(p-vec3(3.2,1.0,-3.8),1.0,0.14),8.0));
  r=opU(r,vec2(sdEllipsoid(p-vec3(3.2,2.6,-3.8),vec3(1.2,1.0,1.1))-0.08*noise2(p.xy*5.0),9.0));
  // bush on the left
  r=opU(r,vec2(sdEllipsoid(p-vec3(-2.4,0.35,-2.6),vec3(0.7,0.5,0.6))-0.06*noise2(p.xz*7.0),9.0));
  // string-light posts
  r=opU(r,vec2(sdCylinder(p-vec3(1.9,1.1,0.6),1.1,0.04),10.0));
  r=opU(r,vec2(sdCylinder(p-vec3(-1.9,1.1,0.6),1.1,0.04),10.0));
  // dinner table with white cloth + two benches
  if(u_table>0.5){
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.74,-0.4),vec3(1.1,0.04,0.42),0.02),11.0));
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.55,-0.4),vec3(1.12,0.2,0.44),0.01)+0.005,11.0));
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.42,-1.05),vec3(1.0,0.03,0.14),0.01),12.0));
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.42,0.25),vec3(1.0,0.03,0.14),0.01),12.0));
  }
  // terraced houses behind (one big bound, id 0 outside)
  vec3 h=p-vec3(0.0,0.0,-9.5);
  float hb=sdRoundBox(h-vec3(0.0,2.6,0.0),vec3(12.0,2.6,1.5),0.02);
  float hr=max(sdRoundBox(h-vec3(0.0,5.4,0.0),vec3(12.0,0.8,1.5),0.0),(h.y-5.2)+abs(h.z)*0.9-0.6);
  r=opU(r,vec2(min(hb,hr),13.0));
  return r;
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  float N=u_night, D=u_dawn;
  vec3 L=normalize(mix(vec3(0.55,0.7,0.45),vec3(-0.4,0.45,0.6),N)); if(D>0.0) L=normalize(mix(L,vec3(0.9,0.25,0.3),D));
  vec3 keyC=mix(mix(hexc(255.0,236.0,205.0)*1.15,hexc(255.0,170.0,120.0)*1.2,D),hexc(110.0,130.0,220.0)*0.35,N);
  vec3 fillC=mix(hexc(160.0,190.0,240.0)*0.75,hexc(60.0,60.0,140.0)*0.45,N);
  vec3 bounceC=hexc(120.0,170.0,90.0)*0.15;
  vec3 shT=mix(vec3(0.55,0.5,0.72),vec3(0.3,0.3,0.6),N);
  float tF=(rd.y<0.0)?(0.0-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,40.0,0.004);
  float tO=m.x>0.0?m.x:1e5; float tt=min(tO,tF); float ink=(tF<tO)?0.0:m.z;
  // sky
  float sy=clamp(rd.y*1.6+0.2,0.0,1.0);
  vec3 sky=mix(hexc(200.0,225.0,250.0),hexc(110.0,170.0,240.0),sy);
  sky=mix(sky,mix(hexc(255.0,190.0,140.0),hexc(150.0,160.0,230.0),sy),D);
  sky=mix(sky,mix(hexc(40.0,36.0,90.0),hexc(12.0,14.0,46.0),sy),N);
  vec3 col=sky;
  // clouds / stars
  if(tt>1e4){ vec2 cq=rd.xz/max(rd.y,0.05); float cl=smoothstep(0.55,0.8,fbm(cq*0.6+vec2(3.0,0.0)));
    col=mix(col,mix(hexc(255.0,255.0,255.0),hexc(255.0,210.0,190.0),D),cl*0.8*(1.0-N));
    col+=vec3(1.0)*N*step(0.996,hash2(floor(rd.xy*400.0)))*0.8; }
  // string lights: two catenaries from the shed eaves to the posts
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb; float em=0.0;
    if(tt==tO){ n=calcNormal(pos); float id=m.y;
      if(id<1.5){ float pk=floor(pos.x*7.0+(abs(n.x)>0.5?pos.z*7.0:0.0)); float fx=fract(pos.x*7.0+(abs(n.x)>0.5?pos.z*7.0:0.0));
        alb=mix(hexc(120.0,150.0,110.0),hexc(104.0,134.0,96.0),hash2(vec2(pk,2.0)))*(0.92+0.12*fbm(pos.xy*vec2(3.0,10.0)));
        alb=mix(alb,hexc(60.0,70.0,50.0),smoothstep(0.08,0.0,min(fx,1.0-fx))); }
      else if(id<2.5){ float row=fract(pos.z*5.0); alb=mix(hexc(70.0,64.0,72.0),hexc(54.0,50.0,60.0),step(0.85,row)); }
      else if(id<3.5){ alb=hexc(196.0,92.0,64.0); if(abs(pos.x+0.08)<0.03&&abs(pos.y-0.9)<0.03) alb=hexc(240.0,200.0,80.0); }
      else if(id<4.5){ alb=mix(hexc(170.0,210.0,240.0),hexc(255.0,210.0,120.0),N); em=N*0.8+u_lights*0.4;
        vec2 w=pos.xy-vec2(0.78,1.25); if(abs(w.x)<0.015||abs(w.y)<0.015) { alb=hexc(240.0,236.0,226.0); em=0.0; } }
      else if(id<5.5){ alb=hexc(40.0,32.0,40.0); if(pos.z>-1.92) alb=hexc(212.0,40.0,52.0); }
      else if(id<6.5) alb=hexc(170.0,160.0,150.0);
      else if(id<7.5){ float pk=floor(pos.x*5.0), fx=fract(pos.x*5.0); alb=mix(hexc(150.0,104.0,66.0),hexc(128.0,88.0,56.0),hash2(vec2(pk,4.0)));
        alb=mix(alb,hexc(70.0,44.0,30.0),smoothstep(0.06,0.0,min(fx,1.0-fx))); if(pos.y>1.75) alb*=0.8; }
      else if(id<8.5) alb=hexc(110.0,76.0,52.0);
      else if(id<9.5) alb=mix(hexc(80.0,150.0,80.0),hexc(120.0,186.0,90.0),fbm(pos.xy*4.0+pos.z));
      else if(id<10.5) alb=hexc(80.0,60.0,50.0);
      else if(id<11.5){ alb=hexc(250.0,248.0,240.0); if(n.y<0.5 && fract(pos.x*6.0)<0.5) alb=hexc(240.0,232.0,222.0); }
      else if(id<12.5) alb=hexc(150.0,104.0,66.0);
      else { vec2 b=vec2(pos.x*4.0+step(0.5,fract(pos.y*6.0))*0.5,pos.y*6.0); vec2 fb=fract(b);
        alb=mix(hexc(170.0,92.0,70.0),hexc(150.0,80.0,62.0),hash2(floor(b)));
        alb=mix(alb,hexc(200.0,190.0,180.0),max(smoothstep(0.08,0.0,fb.y),smoothstep(0.05,0.0,fb.x)));
        if(pos.y>5.0) alb=hexc(80.0,74.0,84.0);
        vec2 wq=vec2(fract(pos.x/1.6)-0.5,pos.y); bool win=abs(wq.x)<0.18&&((wq.y>1.2&&wq.y<2.2)||(wq.y>3.2&&wq.y<4.2));
        if(win){ alb=mix(hexc(170.0,200.0,230.0),hexc(255.0,210.0,130.0),N*step(0.45,hash2(vec2(floor(pos.x/1.6),floor(pos.y/2.0))))); em=N*0.9*step(0.45,hash2(vec2(floor(pos.x/1.6),floor(pos.y/2.0)))); } }
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4)+alb*em*1.6;
    } else { n=vec3(0.0,1.0,0.0);
      vec2 g=pos.xz; float stone=0.0;
      if(abs(pos.x+0.35)<0.4&&pos.z>-1.6){ vec2 s=fract(vec2(pos.x*2.2,pos.z*1.6))-0.5; stone=step(length(s),0.38); }
      alb=mix(hexc(96.0,160.0,70.0),hexc(122.0,182.0,80.0),fbm(g*3.0));
      alb*=0.9+0.2*step(0.5,fract((pos.z+pos.x*0.1)*1.2));                  // mowing stripes
      alb=mix(alb,hexc(190.0,184.0,170.0),stone);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4);
    }
    // warm pool of the string lights
    if(u_lights>0.0){ float dl=length((ro+rd*tt).xz-vec2(0.0,-0.6)); col+=alb*hexc(255.0,190.0,110.0)*u_lights*0.9*exp(-dl*0.9); }
    // haze into the distance
    col=mix(col,sky,clamp((tt-12.0)/40.0,0.0,0.5));
    col=pow(max(col,0.0),vec3(0.4545));
  } else col=pow(max(col,0.0),vec3(0.4545));
  // bulbs: 9 per strand, strands shed-left-eave -> left post, shed-right-eave -> right post
  if(u_lights>0.0){ for(int s=0;s<2;s++){ float sx=s==0?-1.0:1.0;
    for(int i=0;i<9;i++){ float u=(float(i)+0.5)/9.0; vec3 a=vec3(sx*1.2,2.05,-2.0), b=vec3(sx*1.9,2.2,0.6);
      vec3 bp=mix(a,b,u)-vec3(0.0,0.35*4.0*u*(1.0-u),0.0); vec3 w0=bp-ro; float t0=dot(w0,rd);
      if(t0>0.0&&t0<tt+0.05){ float d0=length(w0-rd*t0)/t0; col+=hexc(255.0,215.0,140.0)*(smoothstep(0.012,0.006,d0)*1.2+exp(-d0*90.0)*0.5)*u_lights; } } } }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.9);
  col=post(col,1.15,1.06,vec3(24.0,14.0,36.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=(tt==tF||tt>1e4)?0.0:1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

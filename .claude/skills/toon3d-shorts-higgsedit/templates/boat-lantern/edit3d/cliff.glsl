// Cliff top on the cape. Cliff edge along x at z=0 (sea toward -z, 30 m below). Searchlight at (0.6,0,0.6).
// params: rx ry rz tx ty tz lens dusk storm beam (0..1) aim (beam yaw)
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // cliff block: top y=0 for z>edge, edge wobbles
  float edge=-0.15*sin(p.x*1.3)+0.1*noise2(vec2(p.x*2.0,0.0));
  float top=p.y-0.04*noise2(p.xz*3.0);
  float face=edge-p.z;              // >0 means outside (sea side)
  float cliff=max(top,face);
  cliff=max(cliff,-p.y-30.0);
  r=opU(r,vec2(cliff,1.0));
  // rocks on top
  vec3 rk=p-vec3(-1.6,0.1,1.2); r=opU(r,vec2(sdEllipsoid(rk,vec3(0.35,0.22,0.3)),2.0));
  vec3 rk2=p-vec3(2.2,0.08,1.8); r=opU(r,vec2(sdEllipsoid(rk2,vec3(0.25,0.16,0.22)),2.0));
  // searchlight on tripod
  vec3 s=p-vec3(0.7,0.0,0.7);
  float legs=min(sdCapsule(s,vec3(-0.3,0.0,0.25),vec3(0.0,0.75,0.0),0.025),min(sdCapsule(s,vec3(0.3,0.0,0.25),vec3(0.0,0.75,0.0),0.025),sdCapsule(s,vec3(0.0,0.0,-0.3),vec3(0.0,0.75,0.0),0.025)));
  r=opU(r,vec2(legs,3.0));
  vec3 d=s-vec3(0.0,0.95,0.0); d.xz=rot(u_aim)*d.xz;
  float drum=sdCylinder(vec3(d.x,d.z,d.y),0.32,0.24); // axis along z (toward sea -z)
  drum=max(drum,-sdCylinder(vec3(d.x,d.z+0.33,d.y),0.05,0.2));
  float ring=sdTorus(vec3(d.x,d.z+0.31,d.y).xzy,vec2(0.235,0.03));
  float yoke=sdRoundBox(d-vec3(0.0,-0.18,0.0),vec3(0.3,0.04,0.06),0.02);
  r=opU(r,vec2(drum,4.0)); r=opU(r,vec2(ring,5.0)); r=opU(r,vec2(yoke,3.0));
  float lens=sdCylinder(vec3(d.x,d.z+0.3,d.y),0.012,0.21);
  r=opU(r,vec2(lens,6.0));
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

vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  vec3 L=normalize(mix(vec3(0.5,0.75,0.5),vec3(-0.7,0.18,-0.6),u_dusk));
  vec3 keyC=mix(hexc(255.0,241.0,214.0)*1.15,hexc(255.0,176.0,112.0)*0.95,u_dusk);
  vec3 fillC=mix(hexc(143.0,184.0,255.0)*0.4,hexc(181.0,152.0,203.0)*0.45,u_dusk);
  vec3 bounceC=hexc(200.0,120.0,70.0)*0.15;
  vec3 shT=mix(vec3(0.55,0.5,0.7),vec3(0.6,0.4,0.55),u_dusk);
  float tSea=rd.y<0.0?(-30.0-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,60.0,0.004);
  float tO=m.x>0.0?m.x:1e5;
  float tt=min(tO,tSea);
  vec3 col=skyS(rd); float ink=m.z;
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb; float em=0.0;
    if(tt==tO){ n=calcNormal(pos); float id=m.y;
      if(id<1.5){
        if(n.y>0.6){ float g=noise2(pos.xz*1.5)*0.6+noise2(pos.xz*5.0)*0.4; alb=mix(hexc(46.0,136.0,49.0),hexc(92.0,181.0,80.0),g); float bl=smoothstep(0.62,0.8,noise2(pos.xz*vec2(30.0,8.0))); alb=mix(alb,hexc(143.0,208.0,112.0),bl*0.5); }
        else { alb=mix(hexc(201.0,154.0,106.0),hexc(150.0,104.0,80.0),noise2(pos.xy*vec2(2.0,0.6))); float strata=smoothstep(0.08,0.0,abs(fract(pos.y*0.9+noise2(pos.xy)*0.4)-0.5)); alb=mix(alb,hexc(80.0,50.0,50.0),strata*0.4); if(pos.y>-0.25) alb=hexc(70.0,150.0,60.0); }
      } else if(id<2.5) alb=hexc(150.0,140.0,140.0);
      else if(id<3.5) alb=hexc(70.0,60.0,48.0);
      else if(id<4.5) alb=hexc(94.0,107.0,58.0);
      else if(id<5.5) alb=hexc(201.0,212.0,160.0);
      else { alb=mix(hexc(201.0,212.0,160.0),hexc(255.0,246.0,200.0),u_beam); em=u_beam; }
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.3)+alb*em*3.0;
    } else { n=vec3(0.0,1.0,0.0); float d=tSea;
      float wv=noise2(pos.xz*vec2(0.3,0.9)+vec2(u_time*0.2,0.0))*0.6+noise2(pos.xz*1.5)*0.4;
      vec3 near=mix(hexc(31.0,111.0,196.0),hexc(78.0,74.0,120.0),u_dusk), far=mix(hexc(111.0,178.0,236.0),hexc(231.0,178.0,192.0),u_dusk);
      col=mix(near,far,smoothstep(20.0,200.0,d))*(0.9+0.2*wv);
      col+=hexc(244.0,248.0,255.0)*smoothstep(0.8,0.86,wv)*0.8;
      float foam=smoothstep(2.5,0.0,abs(pos.z-(-0.15*sin(pos.x*1.3)))-0.0); col=mix(col,hexc(244.0,248.0,255.0),foam*0.6*(0.6+0.4*noise2(pos.xz*3.0+u_time)));
    }
    vec3 fogc=mix(hexc(181.0,220.0,250.0),hexc(240.0,188.0,192.0),u_dusk);
    col=mix(col,fogc,clamp((tt-10.0)*0.004,0.0,0.45));
    col=pow(max(col,0.0),vec3(0.4545));
  }
  // beam: cone from lamp toward -z (yawed)
  if(u_beam>0.0){
    vec3 lo=vec3(0.7,0.95,0.7)+vec3(0.0,0.0,-0.33); vec3 dir=normalize(vec3(-sin(u_aim),0.12,-cos(u_aim)));
    vec3 v=lo-ro; float tp=max(dot(-v,-rd),0.0);
    // distance from ray to beam axis (approx by sampling)
    float g=0.0;
    for(int i=0;i<12;i++){ float s=float(i)*1.5; vec3 bp=lo+dir*s; vec3 w=bp-ro; float tq=dot(w,rd); if(tq>0.0 && tq<tt){ float dd=length(w-rd*tq); g+=exp(-dd*dd/(0.05+0.02*s*s))*0.25; } }
    col+=vec3(1.0,0.95,0.75)*g*u_beam;
    vec3 w0=lo-ro; float t0=dot(w0,rd); if(t0>0.0){ float d0=length(w0-rd*t0); col+=vec3(1.0,0.97,0.85)*exp(-d0*d0*120.0)*1.2*u_beam; }
  }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.95);
  col=post(col,1.15,mix(1.1,0.95,u_dusk),mix(vec3(27.0,10.0,26.0),vec3(48.0,20.0,42.0),u_dusk)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

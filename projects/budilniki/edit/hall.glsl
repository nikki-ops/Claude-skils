// University auditorium, morning. Floor y=0, front wall z=-4 with a long blackboard, teacher's desk, rows of student desks toward +z.
// params: rx ry rz tx ty tz lens  sun (0..1 morning sun shafts)
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  r=opU(r,vec2(p.z+4.0,1.0));                                            // front wall
  r=opU(r,vec2(p.x+4.5,2.0)); r=opU(r,vec2(4.5-p.x,2.0));               // side walls
  r=opU(r,vec2(sdRoundBox(p-vec3(0.0,1.55,-3.95),vec3(2.3,0.65,0.04),0.01),3.0)); // blackboard
  r=opU(r,vec2(sdRoundBox(p-vec3(0.0,0.86,-3.92),vec3(2.35,0.03,0.08),0.01),4.0)); // chalk ledge
  vec3 d=p-vec3(-1.4,0.0,-2.7);                                          // teacher desk
  r=opU(r,vec2(sdRoundBox(d-vec3(0.0,0.76,0.0),vec3(0.9,0.04,0.42),0.01),5.0));
  r=opU(r,vec2(sdRoundBox(d-vec3(0.0,0.38,0.0),vec3(0.86,0.36,0.38),0.01),6.0));
  // student desks: 3 rows x 3, each row a step higher
  for(int i=0;i<3;i++){ float fi=float(i); float z=-1.2+fi*1.3, y=fi*0.25;
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,y+0.12,z+0.55),vec3(4.4,0.12,0.6),0.01),7.0));    // step
    for(int j=0;j<3;j++){ float x=-2.6+float(j)*2.6;
      r=opU(r,vec2(sdRoundBox(p-vec3(x,y+0.98,z),vec3(1.05,0.04,0.32),0.01),5.0));
      r=opU(r,vec2(sdRoundBox(p-vec3(x,y+0.62,z+0.28),vec3(1.05,0.36,0.03),0.01),6.0)); } }
  return r;
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  vec3 L=normalize(vec3(0.7,0.6,0.4));
  vec3 keyC=hexc(255.0,238.0,205.0)*1.15, fillC=hexc(170.0,195.0,245.0)*0.7, bounceC=hexc(210.0,150.0,90.0)*0.2, shT=vec3(0.58,0.52,0.72);
  float tF=(rd.y<0.0)?(0.0-ro.y)/rd.y:1e5;
  float tC=(rd.y>0.0)?(3.6-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,30.0,0.004);
  float tO=m.x>0.0?m.x:1e5; if(tC<tO) tO=1e5;
  float tt=min(min(tO,tF),tC); float ink=(tO<tF&&tO<tC)?m.z:0.0;
  vec3 col=hexc(236.0,232.0,220.0);
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb;
    if(tt==tO){ n=calcNormal(pos); float id=m.y;
      if(id<1.5){ alb=(pos.y<1.0)?hexc(120.0,150.0,190.0):hexc(236.0,224.0,196.0); if(abs(pos.y-1.0)<0.02) alb=hexc(250.0,246.0,236.0); }
      else if(id<2.5){ alb=(pos.y<1.0)?hexc(120.0,150.0,190.0):hexc(236.0,224.0,196.0);
        // tall windows on the right wall with morning light
        if(pos.x>4.0 && abs(fract(pos.z*0.45)-0.5)<0.22 && pos.y>1.1 && pos.y<3.0) alb=mix(hexc(190.0,225.0,250.0),hexc(255.0,240.0,200.0),0.4); }
      else if(id<3.5){ alb=mix(hexc(40.0,72.0,60.0),hexc(54.0,90.0,74.0),noise2(pos.xy*4.0));
        float chalk=step(0.6,noise2(vec2(pos.x*6.0,floor(pos.y*7.0))))*step(abs(fract(pos.y*7.0)-0.5),0.06); alb=mix(alb,hexc(220.0,226.0,214.0),chalk*0.7); }
      else if(id<4.5) alb=hexc(150.0,100.0,62.0);
      else if(id<5.5) alb=mix(hexc(196.0,140.0,86.0),hexc(170.0,118.0,72.0),noise2(pos.xz*vec2(8.0,2.0)));
      else if(id<6.5) alb=hexc(150.0,98.0,60.0);
      else alb=hexc(170.0,120.0,84.0);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4);
    } else if(tt==tF){ n=vec3(0.0,1.0,0.0); float ch=step(0.5,fract(pos.x*1.2))+step(0.5,fract(pos.z*1.2)); alb=(mod(ch,2.0)<0.5)?hexc(200.0,190.0,170.0):hexc(176.0,164.0,146.0);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4);
    } else { col=hexc(240.0,236.0,226.0)*0.85; }
    // sun shafts from the right windows
    col+=hexc(255.0,220.0,160.0)*u_sun*0.12*smoothstep(0.3,1.0,noise2(vec2(pos.z*0.45+pos.y*0.3,1.0)));
    col=pow(max(col,0.0),vec3(0.4545));
  }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.9);
  col=post(col,1.12,1.06,vec3(24.0,14.0,36.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=(tt==tF||tt==tC)?0.0:1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

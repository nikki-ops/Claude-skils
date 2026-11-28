// Dorm room 13. Floor y=0, back wall z=-3 (shared wall with professor's room), left wall x=-2.4 with door, window right.
// params: rx ry rz tx ty tz lens  night (0 day .. 1 night)  lamp (desk lamp 0..1)  cut (0 normal .. 1 cutaway: back wall removed,
//         professor's room visible behind it)  pbed (professor jumps 0..1)  prof (1 = this is the professor's room: lilac walls, no poster)
float fbm(vec2 p){ return noise2(p)*0.5+noise2(p*2.1)*0.25+noise2(p*4.3)*0.125+noise2(p*8.7)*0.0625; }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,0.0);
  // walls: back (shared) wall becomes a thin cut slab in cutaway mode
  float back=(u_cut>0.5)? sdRoundBox(p-vec3(0.0,0.65,-3.05),vec3(3.0,0.65,0.06),0.01) : (p.z+3.0);
  r=opU(r,vec2(back,1.0));
  r=opU(r,vec2(p.x+2.4,2.0));                                   // left wall
  r=opU(r,vec2(sdRoundBox(p-vec3(2.6,1.4,-1.0),vec3(0.05,1.4,2.5),0.01),2.0)); // right wall
  // door frame on the left wall
  r=opU(r,vec2(sdRoundBox(p-vec3(-2.37,1.05,0.2),vec3(0.05,1.08,0.52),0.02),3.0));
  // bed against the back wall: frame, mattress, blanket, pillow
  vec3 b=p-vec3(-0.7,0.0,-2.45);
  r=opU(r,vec2(sdRoundBox(b-vec3(0.0,0.2,0.0),vec3(1.0,0.2,0.5),0.03),4.0));
  r=opU(r,vec2(sdRoundBox(b-vec3(0.0,0.47,0.0),vec3(0.97,0.08,0.47),0.07),5.0));
  r=opU(r,vec2(sdRoundBox(b-vec3(0.25,0.56,0.02),vec3(0.72,0.05,0.48)+vec3(0.0,0.02*noise2(b.xz*6.0),0.0),0.05),6.0));
  r=opU(r,vec2(sdEllipsoid(b-vec3(-0.75,0.6,0.0),vec3(0.24,0.09,0.36)),7.0));
  r=opU(r,vec2(sdRoundBox(b-vec3(-1.02,0.55,0.0),vec3(0.03,0.55,0.5),0.02),4.0)); // headboard
  // desk + chair + lamp on the right
  vec3 d=p-vec3(1.75,0.0,-2.3);
  r=opU(r,vec2(sdRoundBox(d-vec3(0.0,0.74,0.0),vec3(0.62,0.03,0.4),0.01),8.0));
  for(int i=0;i<4;i++){ float sx=(mod(float(i),2.0)<0.5)?-0.55:0.55; float sz=(i<2)?-0.33:0.33; r=opU(r,vec2(sdRoundBox(d-vec3(sx,0.37,sz),vec3(0.03,0.37,0.03),0.01),8.0)); }
  vec3 l=d-vec3(0.35,0.77,-0.15);
  r=opU(r,vec2(sdCylinder(l-vec3(0.0,0.015,0.0),0.015,0.09),9.0));
  r=opU(r,vec2(sdCapsule(l,vec3(0.0,0.0,0.0),vec3(-0.05,0.32,0.0),0.012),9.0));
  r=opU(r,vec2(sdEllipsoid(l-vec3(-0.12,0.36,0.0),vec3(0.13,0.07,0.1)),10.0));
  // poster on the back wall
  if(u_cut<0.5 && u_prof<0.5) r=opU(r,vec2(sdRoundBox(p-vec3(0.55,1.55,-2.98),vec3(0.32,0.44,0.01),0.005),12.0));
  // window frame (right part of back wall)
  if(u_cut<0.5) r=opU(r,vec2(max(sdRoundBox(p-vec3(1.75,1.6,-2.97),vec3(0.55,0.5,0.04),0.01),-sdRoundBox(p-vec3(1.75,1.6,-2.97),vec3(0.48,0.43,0.1),0.0)),13.0));
  // professor's room behind the wall (cutaway): floor step, bed with a lump under the blanket, nightstand
  if(u_cut>0.5){
    vec3 q=p-vec3(-0.5,0.0,-4.2);
    r=opU(r,vec2(sdRoundBox(q-vec3(0.0,0.22,0.0),vec3(1.1,0.22,0.55),0.03),14.0));
    r=opU(r,vec2(sdRoundBox(q-vec3(0.0,0.5+0.18*u_pbed,0.0),vec3(1.05,0.1+0.05*u_pbed,0.5),0.08),15.0));
    r=opU(r,vec2(sdRoundBox(q-vec3(1.45,0.3,-0.2),vec3(0.25,0.3,0.25),0.02),14.0));
    r=opU(r,vec2(p.z+5.0,16.0));
    r=opU(r,vec2(sdRoundBox(p-vec3(0.0,1.4,-5.0),vec3(3.0,1.4,0.05),0.01),16.0));
  }
  return r;
}
vec4 pixel(vec2 uv){
  vec2 sp=screenP(uv,0.0);
  vec3 ro=vec3(u_rx,u_ry,u_rz), ta=vec3(u_tx,u_ty,u_tz);
  vec3 rd=camRay(sp,ro,ta,u_lens);
  float N=u_night;
  vec3 L=normalize(mix(vec3(0.6,0.75,0.35),vec3(-0.3,0.5,0.6),N));
  vec3 keyC=mix(hexc(255.0,236.0,205.0)*1.1,hexc(120.0,140.0,230.0)*0.45,N);
  vec3 fillC=mix(hexc(170.0,190.0,240.0)*0.75,hexc(70.0,70.0,150.0)*0.5,N);
  vec3 bounceC=hexc(200.0,130.0,80.0)*0.18;
  vec3 shT=mix(vec3(0.55,0.5,0.7),vec3(0.35,0.35,0.6),N);
  float tF=(rd.y<0.0)?(0.0-ro.y)/rd.y:1e5;
  vec3 m=march(ro,rd,25.0,0.004);
  float tC=(rd.y>0.0&&u_cut<0.5)?(2.8-ro.y)/rd.y:1e5;
  float tO=m.x>0.0?m.x:1e5; if(tC<tO){ tO=1e5; } float tt=min(min(tO,tF),tC); float ink=(tF<tO)?0.0:m.z;
  vec3 col=mix(hexc(170.0,210.0,250.0),hexc(18.0,22.0,60.0),N);
  vec3 lampP=vec3(1.98,1.12,-2.45);
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb; float em=0.0;
    if(tt==tO){ n=calcNormal(pos); float id=m.y;
      if(id<1.5){ float st=step(0.5,fract(pos.x*4.0)); alb=mix(mix(hexc(246.0,226.0,170.0),hexc(214.0,196.0,240.0),u_prof),mix(hexc(236.0,212.0,156.0),hexc(200.0,182.0,230.0),u_prof),st); alb*=0.93+0.1*fbm(pos.xy*3.0); if(pos.y<0.9) alb=hexc(96.0,120.0,140.0); if(abs(pos.y-0.9)<0.02) alb=hexc(240.0,236.0,226.0); }
      else if(id<2.5){ alb=mix(hexc(240.0,220.0,166.0),hexc(210.0,192.0,236.0),u_prof); if(pos.y<0.9) alb=hexc(96.0,120.0,140.0); }
      else if(id<3.5) alb=hexc(150.0,96.0,60.0);
      else if(id<4.5) alb=mix(hexc(120.0,74.0,48.0),hexc(150.0,96.0,62.0),fbm(pos.xy*vec2(2.0,14.0)));
      else if(id<5.5) alb=hexc(236.0,232.0,224.0);
      else if(id<6.5){ float ch=step(0.5,fract(pos.x*3.0+0.0))*step(0.5,fract(pos.z*3.0))+step(fract(pos.x*3.0),0.5)*step(fract(pos.z*3.0),0.5); alb=mix(hexc(226.0,92.0,84.0),hexc(240.0,180.0,90.0),ch); }
      else if(id<7.5) alb=hexc(250.0,248.0,240.0);
      else if(id<8.5) alb=mix(hexc(176.0,120.0,72.0),hexc(150.0,100.0,60.0),fbm(pos.xz*vec2(14.0,2.0)));
      else if(id<9.5) alb=hexc(50.0,50.0,60.0);
      else if(id<10.5){ alb=hexc(70.0,150.0,110.0); em=0.6*u_lamp*(n.y<0.0?2.0:0.3); }
      else if(id<11.5){ alb=(fract(pos.y*30.0)<0.5)?hexc(200.0,60.0,60.0):hexc(60.0,90.0,170.0); }
      else if(id<12.5){ alb=hexc(250.0,214.0,90.0); vec2 q=pos.xy-vec2(0.55,1.55); if(length(q-vec2(0.0,0.08))<0.14) alb=hexc(40.0,40.0,60.0); if(abs(q.y+0.28)<0.05) alb=hexc(220.0,60.0,70.0); }
      else if(id<13.5) alb=hexc(240.0,236.0,226.0);
      else if(id<14.5) alb=hexc(110.0,80.0,70.0);
      else if(id<15.5) alb=mix(hexc(120.0,120.0,190.0),hexc(150.0,150.0,210.0),step(0.5,fract(pos.x*5.0)));
      else if(id<16.5) alb=hexc(150.0,120.0,150.0);
      else alb=hexc(236.0,232.0,222.0);
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4)+alb*em*2.0;
      // warm lamp pool
      float dl=length(pos-lampP); col+=alb*hexc(255.0,190.0,110.0)*u_lamp*1.2*exp(-dl*1.6)*clamp(dot(n,normalize(lampP-pos))*0.7+0.3,0.0,1.0);
      // window: sky behind the glass
      if(u_cut<0.5 && pos.z<-2.9 && abs(pos.x-1.75)<0.48 && abs(pos.y-1.6)<0.43 && id<1.5){
        vec2 w=pos.xy-vec2(1.75,1.6);
        col=mix(mix(hexc(150.0,200.0,250.0),hexc(255.0,200.0,150.0),smoothstep(0.4,-0.4,w.y)),hexc(14.0,18.0,56.0),N);
        col+=hexc(255.0,250.0,220.0)*N*smoothstep(0.03,0.02,length(w-vec2(0.22,0.2)));        // moon
        col+=vec3(1.0)*N*step(0.985,hash2(floor(w*60.0)))*0.8;                                  // stars
        if(abs(w.x)<0.015||abs(w.y)<0.015) col=hexc(240.0,236.0,226.0);
      }
    } else if(tt==tC){ col=hexc(236.0,230.0,214.0)*0.75; float dl=length(pos-lampP); col+=hexc(255.0,190.0,110.0)*u_lamp*0.5*exp(-dl*1.0);
    } else { n=vec3(0.0,1.0,0.0);
      float w=0.16, pk=floor(pos.x/w), fx=fract(pos.x/w), off=hash2(vec2(pk,7.0))*3.0, fz=fract(pos.z/1.2+off);
      alb=mix(hexc(176.0,112.0,70.0),hexc(150.0,94.0,58.0),hash2(vec2(pk,3.0)));
      alb=mix(alb,hexc(70.0,40.0,30.0),max(smoothstep(0.04,0.0,min(fx,1.0-fx)),smoothstep(0.012,0.0,min(fz,1.0-fz))));
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.4);
      float dl=length(pos-lampP); col+=alb*hexc(255.0,190.0,110.0)*u_lamp*1.1*exp(-dl*1.2);
      ink=max(ink,smoothstep(0.02,0.0,min(fx,1.0-fx))*clamp(1.2-tt*0.15,0.0,1.0));
    }
    col=pow(max(col,0.0),vec3(0.4545));
  } else col=pow(max(col,0.0),vec3(0.4545));
  // lamp glow
  vec3 w0=lampP-ro; float t0=dot(w0,rd); if(t0>0.0){ float d0=length(w0-rd*t0)/t0; col+=hexc(255.0,210.0,140.0)*exp(-d0*70.0)*0.6*u_lamp; }
  col=mix(col,vec3(31.0,18.0,37.0)/255.0,clamp(ink,0.0,1.0)*0.9);
  col=post(col,1.15,1.08,vec3(24.0,14.0,36.0)/255.0);
  col=clamp(col,0.0,1.0);
  if(u_layer>1.5){ float a=(tt==tF)?0.0:1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

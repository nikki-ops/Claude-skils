// Pier at dusk: plank deck (y=0, z>-3), railing, table; sea y=-2.2 under height fog;
// masts poking out of the fog; cape with a red-white lighthouse far away.
// params: rx ry rz tx ty tz lens  flash (0..1 red lamp flash)  lamp (0..1 steady white light)  fogH (fog top, ~-0.6)
float sdCone(vec3 p, float h, float r0, float r1){ float q=length(p.xz); float k=clamp(p.y/h,0.0,1.0); return max(q-mix(r0,r1,k), abs(p.y-0.5*h)-0.5*h); }
const vec3 LH=vec3(13.0,7.0,-62.0);
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
  // masts in the fog
  for(int i=0;i<4;i++){ float fi=float(i);
    vec3 m=p-vec3(-7.0+fi*4.3,-2.2,-24.0-fi*6.0);
    float h=1.6+0.5*fi;
    r=opU(r,vec2(sdCylinder(m-vec3(0.0,h,0.0),h,0.05),6.0));
    r=opU(r,vec2(sdCylinder(m-vec3(0.0,2.0*h-0.15,0.0),0.08,0.16),6.0));
    r=opU(r,vec2(sdCapsule(m,vec3(0.0,2.0*h-0.3,0.0),vec3(1.4,0.4,0.0),0.015),6.0)); }
  // the Lastochka: rusty barge at (u_bx,-2.2,-9) heading +x
  vec3 b=p-vec3(u_bx,-2.2,-9.0); b.y-=0.04*sin(u_time*2.0);
  if(length(b)<6.0){
    float hull=sdRoundBox(b-vec3(0.0,0.25,0.0),vec3(2.3-0.35*clamp(b.x-1.4,0.0,1.0),0.32,0.75-0.4*clamp(b.x-1.6,0.0,1.0)),0.12);
    float cab=sdRoundBox(b-vec3(-1.3,0.85,0.0),vec3(0.45,0.32,0.5),0.05);
    float stack=sdCylinder(b-vec3(-0.6,1.15,0.0),0.55,0.17);
    float band=sdCylinder(b-vec3(-0.6,1.45,0.0),0.08,0.185);
    r=opU(r,vec2(hull,7.0)); r=opU(r,vec2(cab,12.0)); r=opU(r,vec2(stack,13.0)); r=opU(r,vec2(band,14.0));
    for(int i=0;i<4;i++){ float fi=float(i); float ph=fract(u_time*0.45+fi*0.25);
      vec3 sm=b-vec3(-0.6-ph*1.6,1.9+ph*1.4,0.0);
      r=opU(r,vec2(sdSphere(sm,0.12+ph*0.3)+0.08*noise2(sm.xy*5.0+fi),15.0)); }
  }
  // cape
  vec3 c=p-vec3(18.0,-6.0,-64.0);
  float cape=sdEllipsoid(c,vec3(16.0,13.0,9.0))+0.6*noise2(p.xy*0.35);
  r=opU(r,vec2(cape,8.0));
  // lighthouse
  vec3 l=p-LH;
  float tower=sdCone(l,8.0,1.25,0.85);
  float gal=sdCylinder(l-vec3(0.0,8.1,0.0),0.12,1.25);
  float room=sdCylinder(l-vec3(0.0,8.8,0.0),0.6,0.75);
  float roof=sdCone(l-vec3(0.0,9.35,0.0),0.9,0.9,0.05);
  r=opU(r,vec2(tower,9.0)); r=opU(r,vec2(gal,10.0)); r=opU(r,vec2(room,11.0)); r=opU(r,vec2(roof,10.0));
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
  return mix(hexc(214.0,150.0,205.0),hexc(255.0,190.0,150.0),pow(s,3.0));
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
  vec3 m=march(ro,rd,110.0,0.0045);
  float tObj=m.x>0.0?m.x:1e5;
  float tt=min(tObj,min(tDeck,tSea));
  vec3 col=skyD(rd); float ink=m.z;
  if(tt<1e4){
    vec3 pos=ro+rd*tt, n, alb; float em=0.0;
    if(tt==tObj){ n=calcNormal(pos); float id=m.y;
      if(id<2.5) alb=hexc(236.0,226.0,214.0);
      else if(id<3.5) alb=hexc(150.0,60.0,32.0);
      else if(id<4.5) alb=hexc(60.0,40.0,40.0);
      else if(id<5.5){ alb=hexc(255.0,210.0,120.0); em=1.0; }
      else if(id<6.5) alb=hexc(70.0,50.0,60.0);
      else if(id<7.5){ float rs=noise2(pos.xy*vec2(3.0,6.0))*0.6+noise2(pos.xz*9.0)*0.4; alb=mix(hexc(196.0,98.0,48.0),hexc(110.0,52.0,36.0),rs); alb=mix(alb,hexc(70.0,96.0,110.0),smoothstep(0.62,0.7,noise2(pos.xy*2.0+3.0))*0.6); if(pos.y>-1.68) alb=hexc(96.0,62.0,52.0); if(abs(pos.y+1.66)<0.04) alb=hexc(236.0,226.0,214.0); }
      else if(id<8.5){ alb=(n.y>0.55)?mix(hexc(46.0,120.0,60.0),hexc(92.0,160.0,80.0),noise2(pos.xz*0.5)):mix(hexc(150.0,104.0,90.0),hexc(110.0,70.0,80.0),noise2(pos.xy*0.6)); }
      else if(id<9.5){ float y=pos.y-LH.y; alb=(mod(floor(y/1.6),2.0)<0.5)?hexc(240.0,236.0,230.0):hexc(214.0,52.0,58.0); }
      else if(id<10.5) alb=hexc(50.0,40.0,50.0);
      else if(id<11.5){ alb=mix(hexc(255.0,240.0,200.0),hexc(255.0,70.0,60.0),u_flash); em=max(u_lamp,u_flash); }
      else if(id<12.5){ alb=hexc(230.0,214.0,190.0); float wnd=step(abs(pos.y+1.32),0.1)*step(0.15,abs(fract((pos.x-u_bx)*2.2)-0.5)); alb=mix(alb,hexc(255.0,200.0,110.0),wnd); em=wnd*0.6; }
      else if(id<13.5) alb=hexc(60.0,44.0,48.0);
      else if(id<14.5) alb=hexc(214.0,52.0,58.0);
      else { alb=mix(hexc(250.0,230.0,240.0),hexc(200.0,180.0,215.0),noise2(pos.xy*3.0)); em=0.25; }
      col=shadeR(pos,n,alb,L,keyC,fillC,bounceC,shT,0.3)+alb*em*2.5;
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
    } else { n=vec3(0.0,1.0,0.0);
      float wv=noise2(pos.xz*vec2(0.5,1.4))*0.6+noise2(pos.xz*1.3)*0.4;
      col=mix(hexc(70.0,50.0,120.0),hexc(230.0,130.0,150.0),smoothstep(5.0,60.0,tSea))*(0.9+0.2*wv);
    }
    // height fog: thick near the sea, thin above fogH
    float fd=0.0;
    if(tt>3.0){
      float y0=ro.y, k=1.6;
      float a=exp(-(max(y0,u_fogH)-u_fogH)*k);
      float dy=rd.y*k; float e=abs(dy)>1e-4 ? (1.0-exp(-(tt-3.0)*dy))/dy : (tt-3.0);
      fd=1.0-exp(-0.35*a*e);
      float below=smoothstep(u_fogH+0.6,u_fogH-0.4,pos.y);
      fd=clamp(max(fd,below*smoothstep(3.0,14.0,tt)),0.0,0.96);
    }
    col=mix(col,fogCol(rd),fd);
    col=mix(col,hexc(255.0,170.0,190.0),clamp((tt-30.0)*0.006,0.0,0.35));
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
  if(u_layer>1.5){ float a=(tt==tDeck)?0.0:1.0-smoothstep(u_focus,u_focus*1.35,tt); return vec4(col*a,a); }
  return vec4(col,1.0);
}

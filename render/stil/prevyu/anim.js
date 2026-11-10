const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const [from,to,step]=process.argv.slice(2).map(Number);
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});
  await p.goto('file://'+__dirname+'/'+(process.env.PAGE||'anim.html'));await p.waitForFunction('window.__ready===true',{timeout:120000});
  fs.mkdirSync(__dirname+'/'+(process.env.OUT||'frames'),{recursive:true});
  const t0=Date.now();
  for(let i=from;i<to;i+=(step||1)){await p.evaluate(t=>window.renderAt(t),i/30);
    await p.screenshot({path:__dirname+`/${process.env.OUT||'frames'}/f_${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92,timeout:0});}
  console.log('done',(Date.now()-t0)/1000,'s');await b.close();
})();

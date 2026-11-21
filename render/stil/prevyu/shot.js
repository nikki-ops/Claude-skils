const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});p.on('pageerror',e=>console.log('PAGEERR',e.message));
  for(const f of process.argv.slice(2)){
    await p.goto('file://'+__dirname+'/index.html?f='+f);
    await p.waitForFunction('window.__done===true',{timeout:120000});
    await p.screenshot({path:__dirname+'/kadr-'+f+'.png'});console.log('ok',f);
  }
  await b.close();
})();

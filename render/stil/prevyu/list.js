const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});
await p.goto('file://'+__dirname+'/list.html');await p.waitForFunction('window.__done===true',{timeout:120000});await p.screenshot({path:__dirname+'/gosha-list.jpg',type:'jpeg',quality:92});await b.close();console.log('ok');})();

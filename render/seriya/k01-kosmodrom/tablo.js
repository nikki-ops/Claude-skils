// Табло ЦУП «Космодром за 1 рубль» — общее для 2D и 3D версий (своё, не как у «Деревни»):
// одна тёмная панель-пульт: обратный отсчёт Т−N дней (красные LED-цифры) + шкала «ГОТОВНОСТЬ К СТАРТУ» + бюджет (зелёные LED-цифры).
window.tablo=function(el,o){o=o||{};const W=el.clientWidth||1080,s=W/1080;
 const days=o.days==null?30:o.days,ready=o.ready||0,budget=(o.budget||0).toLocaleString('ru-RU').replace(/ /g,' ');
 el.insertAdjacentHTML('beforeend',`<div style="position:absolute;left:${40*s}px;right:${40*s}px;top:${200*s}px;height:${150*s}px;border-radius:${22*s}px;background:linear-gradient(#11162a,#0a0d1a);border:${5*s}px solid #2b3556;box-shadow:0 ${8*s}px 0 rgba(0,0,0,.35),inset 0 0 ${30*s}px rgba(79,214,232,.12);font-family:Rubik,sans-serif;display:flex;align-items:center;gap:${22*s}px;padding:0 ${26*s}px;box-sizing:border-box">
  <div style="text-align:center"><div style="color:#8fa0c8;font-weight:700;font-size:${22*s}px;letter-spacing:${3*s}px">ДО СТАРТА</div>
   <div style="font-family:'Courier New',monospace;font-weight:900;font-size:${64*s}px;line-height:1;color:#ff4a4a;text-shadow:0 0 ${14*s}px rgba(255,60,60,.8)">Т−${String(days).padStart(2,'0')}</div></div>
  <div style="flex:1"><div style="color:#8fa0c8;font-weight:700;font-size:${22*s}px;letter-spacing:${2*s}px;display:flex;justify-content:space-between"><span>ГОТОВНОСТЬ К СТАРТУ</span><span style="color:#ffd860">${ready}%</span></div>
   <div style="height:${30*s}px;margin-top:${8*s}px;border-radius:${15*s}px;background:#1d2440;overflow:hidden;border:${3*s}px solid #2b3556"><div style="height:100%;width:${Math.max(3,ready)}%;background:repeating-linear-gradient(90deg,#ffd860 0 ${18*s}px,#f7a83a ${18*s}px ${24*s}px)"></div></div></div>
  <div style="text-align:right"><div style="color:#8fa0c8;font-weight:700;font-size:${22*s}px;letter-spacing:${3*s}px">БЮДЖЕТ</div>
   <div style="font-family:'Courier New',monospace;font-weight:900;font-size:${44*s}px;line-height:1.2;color:#5dff8a;text-shadow:0 0 ${12*s}px rgba(80,255,130,.7)">${budget}₽</div></div>
 </div>`)};

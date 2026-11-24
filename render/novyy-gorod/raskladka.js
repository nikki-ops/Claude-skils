// Раскладка участков нового города: житель №n → координаты участка (детерминированно, дом никогда не «переезжает»).
// Кварталы 2×2 участка идут по квадратной спирали вокруг центральной площади (квартал 0 = площадь).
(function(){
const PLOT=6, ROAD=4, BLOCK=PLOT*2+ROAD; // метры
function spiral(k){ // k-й квартал по квадратной спирали: 0→(0,0),1→(1,0),2→(1,1)...
 if(k===0)return [0,0];let x=0,y=0,dx=1,dy=0,len=1,steps=0,turns=0;
 for(let i=0;i<k;i++){x+=dx;y+=dy;if(++steps===len){steps=0;[dx,dy]=[-dy,dx];if(++turns%2===0)len++}}return [x,y]}
const RAYONY=[[0,'Центр'],[51,'Северный'],[151,'Восточный'],[301,'Южный'],[501,'Западный']];
window.uchastok=function(n){ // n — номер жителя с 1
 const i=n-1,blk=1+Math.floor(i/4),slot=i%4,[bx,by]=spiral(blk);
 const x=bx*BLOCK+(slot%2?PLOT/2:-PLOT/2),z=by*BLOCK+(slot>1?PLOT/2:-PLOT/2);
 let rayon='Центр';for(const [from,name] of RAYONY)if(n>=from)rayon=name;
 return {x,z,blok:blk,slot,rayon}};
window.GOROD={PLOT,ROAD,BLOCK,spiral};
})();

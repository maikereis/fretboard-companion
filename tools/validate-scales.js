// Checks every scale position (box) on every root: node tools/validate-scales.js js/app.js
const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const cut=src.findIndex(l=>l.startsWith('function diagram'));
const code=src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","");
(0,eval)(code+`;globalThis.API={SCALES,st,positions,pcOf,NF};`);
const{SCALES,st,positions,pcOf,NF}=API;
let bad=0,total=0;
for(const sc of Object.keys(SCALES))for(let r=0;r<12;r++){
  st.sc=sc;st.r=r;total++;
  const S=SCALES[sc],cv=S.core||S.iv,per=cv.length>5?3:2,all=S.iv.map(x=>(r+x)%12),core=cv.map(x=>(r+x)%12),P=positions(),errs=[];
  if(P.length!==cv.length)errs.push('expected '+cv.length+' positions, got '+P.length);
  P.forEach((p,n)=>{
    const by=[0,0,0,0,0,0],tag='position '+(n+1);
    p.box.forEach(([i,f])=>{by[i]++;if(!all.includes(pcOf(i,f)))errs.push(tag+': note outside the scale');if(f<0)errs.push(tag+': negative fret')});
    by.forEach((c,i)=>{const extra=S.core?S.iv.length-cv.length:0;if(c<per||c>per+extra)errs.push(tag+': string '+(i+1)+' has '+c+' notes')});
    const fr=p.box.map(b=>b[1]),span=Math.max(...fr)-Math.min(...fr);
    if(span>(per===3?6:5))errs.push(tag+': spans '+span+' frets');   // 3-notes-per-string boxes can need 6, pentatonic 5
    if(n===0&&pcOf(0,p.box.filter(b=>b[0]===0)[0][1])!==r)errs.push('position 1 should start on the root on the low E string');
  });
  for(let i=0;i<6;i++)for(let f=0;f<=NF;f++)if(core.includes(pcOf(i,f))&&!P.some(p=>p.set.has(i+':'+f)))errs.push('string '+(i+1)+' fret '+f+' is in no position');
  if(errs.length){bad++;console.log('-',sc,'root',r,'=>',[...new Set(errs)].join('; '))}
}
console.log('scale/root combos',total,'with problems',bad);

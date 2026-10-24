// Checks every chord voicing for playability: node tools/validate-voicings.js js/app.js
const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const cut=src.findIndex(l=>l.startsWith('function diagram'));
const code=src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","");
(0,eval)(code+`;globalThis.API={S,SUF,T,F,OPEN,st,voice,pcOf};`);
const A=API,S=A.S,SUF=A.SUF,T=A.T,F=A.F,st=A.st,pcOf=A.pcOf,voiceFn=A.voice;
let bad=0,total=0;const issues={};
for(const q of Object.keys(T))for(const sh of ['C','A','G','E','D'])for(let r=0;r<12;r++){
  st.r=r;st.q=q;st.sh=sh;const v=voiceFn();total++;const errs=[];
  const{fr,fg}=v;
  // chord-tone correctness
  const set=F[q].map(x=>(r+x)%12);
  fr.forEach((f,i)=>{if(f>=0&&!set.includes(pcOf(i,f)))errs.push('non-chord tone on string '+(i+1))});
  const pcs=new Set(fr.map((f,i)=>f<0?null:pcOf(i,f)).filter(x=>x!==null));
  set.forEach(p=>{if(!pcs.has(p)&&!((q.includes('7')||q.includes('6'))&&p===set[2]))errs.push('missing '+S[p])}); // 5th may be omitted only on 7th and 6th chords
  fr.forEach((f,i)=>{
    if(f>0&&!fg[i])errs.push('fretted string '+(i+1)+' has no finger');
    if(f<=0&&fg[i])errs.push('unfretted string '+(i+1)+' has a finger');
  });
  const fingers=[...new Set(fg.filter(x=>x))];
  if(fingers.some(x=>x>4))errs.push('finger >4');
  for(const f of fingers){
    const idx=fg.map((x,i)=>x===f?i:-1).filter(i=>i>=0);
    const frets=new Set(idx.map(i=>fr[i]));
    if(frets.size>1)errs.push('finger '+f+' on different frets');
    else{const fret=fr[idx[0]];
      for(let j=idx[0]+1;j<idx[idx.length-1];j++) if(fr[j]>=0&&fr[j]<fret)errs.push('finger '+f+' barre blocked by lower/open string '+(j+1));}
  }
  // finger order must not cross: lower finger number on lower fret
  for(const a of fingers)for(const b of fingers){
    const fa=fr[fg.indexOf(a)],fb=fr[fg.indexOf(b)];
    if(a<b&&fa>fb)errs.push('finger '+a+' above finger '+b+' in fret order');
  }
  if(errs.length){bad++;const key=S[r]+SUF[q]+' '+sh+'-shape (base '+v.base+') frets '+fr.join(',')+' fingers '+fg.join(',');issues[key]=errs}
}
console.log('combos',total,'with problems',bad);
for(const[k,e]of Object.entries(issues))console.log('-',k,'=>',[...new Set(e)].join('; '));
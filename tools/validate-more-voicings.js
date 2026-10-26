// Re-checks every generated voicing, for every chord type on every root: node tools/validate-more-voicings.js js/app.js
// Rules are re-implemented here on purpose (they do not call the generator's own checks).
const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const cut=src.findIndex(l=>l.startsWith('function diagram'));
(0,eval)(src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","")+';globalThis.API={F,genVoicings,pcOf,NF};');
const{F,genVoicings,pcOf,NF}=API;
let chords=0,total=0,bad=0,empty=[],noRoot=[];const per=[];
for(const q of Object.keys(F))for(let r=0;r<12;r++){
  chords++;const L=genVoicings(r,q),tones=F[q].map(x=>(r+x)%12),fifthOptional=(q.includes('7')||q.includes('6'))&&tones.length>3;
  const need=tones.filter((p,i)=>!(fifthOptional&&i===2)),errs=[];
  if(!L.length)empty.push(q+'/'+r);
  if(!L.some(v=>!v.inv&&v.n>=(q==='5'?2:4)))noRoot.push(q+'/'+r);
  if(new Set(L.map(v=>v.key)).size!==L.length)errs.push('duplicates');
  for(const v of L){
    total++;const fr=v.fr,played=fr.map((f,i)=>f>=0?i:-1).filter(i=>i>=0),pcs=new Set(played.map(i=>pcOf(i,fr[i])));
    if(!played.every(i=>tones.includes(pcOf(i,fr[i]))))errs.push(v.key+': note outside the chord');
    if(!need.every(p=>pcs.has(p)))errs.push(v.key+': missing a chord tone');
    if(played.length<(q==='5'?2:3))errs.push(v.key+': too few strings');
    if(played[played.length-1]-played[0]+1!==played.length)errs.push(v.key+': muted string between played strings');
    const fr0=fr.filter(f=>f>0);
    if(fr0.length&&Math.max(...fr0)-Math.min(...fr0)>3)errs.push(v.key+': wider than 4 frets');
    if(fr.includes(0)&&fr0.length&&Math.max(...fr0)>5)errs.push(v.key+': open strings but high on the neck');
    if(fr.some(f=>f>NF))errs.push(v.key+': off the drawn neck');
    // fingering: a finger covers one fret on contiguous pressed strings; numbers rise with the fret; at most 4
    const fg=v.fg,nums=[...new Set(fg.filter(x=>x>0))];
    if(nums.length>4)errs.push(v.key+': more than 4 fingers');
    if(fr.some((f,i)=>(f>0)!==(fg[i]>0)))errs.push(v.key+': finger/fret mismatch');
    let lastFret=0;for(const n of nums.sort((a,b)=>a-b)){
      const ix=fg.map((x,i)=>x===n?i:-1).filter(i=>i>=0),fs=new Set(ix.map(i=>fr[i]));
      if(fs.size!==1)errs.push(v.key+': one finger on two frets');
      else{const f=[...fs][0];if(f<lastFret)errs.push(v.key+': fingers cross');lastFret=f;
        if(!fr.slice(ix[0],ix[ix.length-1]+1).every(x=>x>=f))errs.push(v.key+': a barre over an open or lower string')}
    }
    if(v.base!==(fr.includes(0)||!fr0.length?0:Math.min(...fr0)))errs.push(v.key+': wrong base');
  }
  per.push(L.length);if(errs.length){bad++;console.log('-',q,'root',r,'=>',[...new Set(errs)].slice(0,4).join('; '))}
}
console.log('chords',chords,'| voicings',total,'| chords with problems',bad);
console.log('per chord: min',Math.min(...per),'max',Math.max(...per),'average',Math.round(per.reduce((a,b)=>a+b)/per.length));
console.log('chords with no voicing at all:',empty.length?empty.join(' '):'none');
console.log('chords with no root-position voicing of 4+ strings:',noRoot.length?noRoot.join(' '):'none');

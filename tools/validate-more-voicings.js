// Re-checks every generated voicing, for every chord type on every root: node tools/validate-more-voicings.js js/app.js
// Rules are re-implemented here on purpose (they do not call the generator's own checks).
const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const cut=src.findIndex(l=>l.startsWith('function diagram'));
(0,eval)(src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","")+';globalThis.API={F,genVoicings,pcOf,NF,whyHard,voice,OPT5,T,cagedOK};');
const{F,genVoicings,pcOf,NF,whyHard,voice,OPT5,T,cagedOK}=API;
let chords=0,total=0,bad=0,empty=[],noRoot=[];const per=[];
for(const q of Object.keys(F))for(let r=0;r<12;r++){
  chords++;const L=genVoicings(r,q),tones=F[q].map(x=>(r+x)%12),fifthOptional=OPT5.includes(q);
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
    const hard=whyHard(fr,fg);if(hard)errs.push(v.key+': too hard for a hand ('+hard+')');
    if(v.base!==(fr.includes(0)||!fr0.length?0:Math.min(...fr0)))errs.push(v.key+': wrong base');
  }
  per.push(L.length);if(errs.length){bad++;console.log('-',q,'root',r,'=>',[...new Set(errs)].slice(0,4).join('; '))}
}
// the five classic CAGED shapes: the classic chords must keep at least three that a hand can play. Newer types have fewer
// classic shapes (some have none), and then the app shows the generated voicings, so what matters is that voicing() never fails.
const CLASSIC=['maj','min','7','maj7','m7','sus2','sus4','6','m6','5'];
let fewShapes=[],noShape=[];for(const q of Object.keys(F))for(let r=0;r<12;r++){const n=[...'CAGED'].filter(s=>{if(!(T[q]&&T[q][s]))return false;const w=voice(r,q,s);return!whyHard(w.fr,w.fg)}).length;
 if(CLASSIC.includes(q)&&n<3)fewShapes.push(q+'/'+r+':'+n);
 if(!n){noShape.push(q+'/'+r);const w=voice(r,q,'E');if(!w.fr.length||whyHard(w.fr,w.fg))fewShapes.push(q+'/'+r+': fallback is not playable')}}
if(fewShapes.length){bad++;console.log('- chords with fewer than 3 playable CAGED shapes:',fewShapes.join(' '))}
console.log('chord/root pairs shown with generated voicings only (no playable classic shape):',noShape.length,'of',chords);
console.log('chords',chords,'| voicings',total,'| chords with problems',bad);
console.log('per chord: min',Math.min(...per),'max',Math.max(...per),'average',Math.round(per.reduce((a,b)=>a+b)/per.length));
console.log('chords with no voicing at all:',empty.length?empty.join(' '):'none');
console.log('chords with no root-position voicing of 4+ strings:',noRoot.length?noRoot.join(' '):'none');

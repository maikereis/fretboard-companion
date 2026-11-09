const S='C C# D D# E F F# G G# A A# B'.split(' '),FL='C Db D Eb E F Gb G Ab A Bb B'.split(' ');
const flatR=r=>[1,3,5,8,10].includes(r);
const nm=(pc,fl)=>(fl?FL:S)[((pc%12)+12)%12];
const OPEN=[4,9,2,7,11,4];
const NF=15; // frets drawn on the neck
const MID=[40,45,50,55,59,64]; // MIDI numbers of the open strings, low E to high e
const IV=['R','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const F={maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],sus2:[0,2,7],sus4:[0,5,7],'6':[0,4,7,9],m6:[0,3,7,9],'5':[0,7],
 dim:[0,3,6],aug:[0,4,8],dim7:[0,3,6,9],m7b5:[0,3,6,10],mmaj7:[0,3,7,11],'9':[0,4,7,10,2],m9:[0,3,7,10,2],add9:[0,4,7,2]};
const SUF={maj:'',min:'m','7':'7',maj7:'maj7',m7:'m7',sus2:'sus2',sus4:'sus4','6':'6',m6:'m6','5':'5',
 dim:'dim',aug:'aug',dim7:'dim7',m7b5:'m7♭5',mmaj7:'m(maj7)','9':'9',m9:'m9',add9:'add9'};
const LONG={maj:'Major',min:'Minor','7':'Dominant 7',maj7:'Major 7',m7:'Minor 7',sus2:'Suspended 2',sus4:'Suspended 4','6':'Major 6',m6:'Minor 6','5':'Power chord',
 dim:'Diminished',aug:'Augmented',dim7:'Diminished 7',m7b5:'Minor 7♭5',mmaj7:'Minor-major 7','9':'Dominant 9',m9:'Minor 9',add9:'Add 9'};
// Chords whose 5th may be left out of a voicing (it adds little, and leaving it out frees a finger). In dim, aug, dim7, m7b5 and add9 the 5th matters.
const OPT5=['7','maj7','m7','6','m6','mmaj7','9','m9'];
// Names for the notes of a chord: a 9th is the same note as the 2nd, and some altered notes have their own names.
const IVQ={aug:{8:'♯5'},dim7:{9:'♭♭7'},'9':{2:'9'},m9:{2:'9'},add9:{2:'9'}};
const ivq=(q,sem)=>(IVQ[q]&&IVQ[q][sem])||IV[sem];
// Open-position chord of each CAGED shape (strings 6 to 1, -1 = muted). Sliding a shape up by N frets plays it N semitones higher.
const SPC={C:0,A:9,G:7,E:4,D:2}; // pitch class of each shape
const T={maj:{E:[0,2,2,1,0,0],A:[-1,0,2,2,2,0],C:[-1,3,2,0,1,0],G:[3,2,0,0,0,3],D:[-1,-1,0,2,3,2]},min:{E:[0,2,2,0,0,0],A:[-1,0,2,2,1,0],C:[-1,3,1,-1,1,3],G:[3,1,0,0,3,3],D:[-1,-1,0,2,3,1]},'7':{E:[0,2,0,1,0,0],A:[-1,0,2,0,2,0],C:[-1,3,2,3,1,0],G:[3,2,0,0,0,1],D:[-1,-1,0,2,1,2]},maj7:{E:[0,2,1,1,0,0],A:[-1,0,2,1,2,0],C:[-1,3,2,0,0,0],G:[3,2,0,0,0,2],D:[-1,-1,0,2,2,2]},m7:{E:[0,2,0,0,0,0],A:[-1,0,2,0,1,0],C:[-1,3,1,3,1,-1],G:[3,1,0,0,3,1],D:[-1,-1,0,2,1,1]},sus2:{E:[0,2,4,4,0,0],A:[-1,0,2,2,0,0],C:[-1,3,0,0,1,3],G:[3,0,0,0,3,3],D:[-1,-1,0,2,3,0]},sus4:{E:[0,2,2,2,0,0],A:[-1,0,2,2,3,0],C:[-1,3,3,0,1,1],G:[3,3,0,0,1,3],D:[-1,-1,0,2,3,3]},'6':{E:[0,2,2,1,2,0],A:[-1,0,2,2,2,2],C:[-1,3,2,2,1,0],G:[3,2,0,0,0,0],D:[-1,-1,0,2,0,2]},m6:{E:[0,2,2,0,2,0],A:[-1,0,2,2,1,2],C:[-1,3,1,2,1,-1],G:[3,1,0,0,3,0],D:[-1,-1,0,2,0,1]},'5':{E:[0,2,2,-1,-1,-1],A:[-1,0,2,2,-1,-1],C:[-1,3,-1,0,1,-1],G:[3,-1,0,0,-1,-1],D:[-1,-1,0,2,3,-1]}};
const DESC={
maj:'Bright and stable. Built from the 1st, major 3rd and 5th notes of the major scale. The sound of “home”.',
min:'Darker, more serious. Same as major, but the 3rd is lowered one fret (a “flat 3rd”).',
'7':'A major chord plus a flat 7th. It has tension and wants to resolve, which is why it is everywhere in blues and rock.',
maj7:'A major chord plus the 7th note of the scale, one fret below the root’s octave. Soft, dreamy, jazzy.',
m7:'A minor chord plus a flat 7th. Warm and relaxed, common in soul, funk and jazz.',
sus2:'Open and unresolved. The 3rd is replaced by the 2nd (2 frets above the root), so the chord is neither major nor minor. It often resolves to the plain major or minor chord.',
sus4:'Tense and expectant. The 3rd is replaced by the 4th (5 frets above the root), which “wants” to fall back to the 3rd. A staple of rock, pop and folk.',
'6':'A major chord plus the 6th note of the scale (9 frets above the root). Warm and relaxed, with an old-fashioned, jazzy flavour.',
m6:'A minor chord plus the major 6th. Moody but smooth, with a jazz and bossa nova flavour.',
'5':'Just the root and the 5th, with no 3rd. It is neither major nor minor, so it sounds strong and neutral. The foundation of rock and metal guitar.',
dim:'Three notes stacked in minor thirds: the root, a flat 3rd and a flat 5th. Tense and unstable, it wants to move somewhere. It is the vii° chord of a major key and a classic passing chord in jazz, blues and classical music.',
aug:'A major chord with the 5th raised one fret (a “sharp 5th”). Dreamy and unresolved. It is symmetrical: C aug, E aug and G♯ aug all use the same three notes.',
dim7:'A diminished chord plus one more note a minor 3rd higher (the 6th, spelled ♭♭7). Four notes, each a minor 3rd apart, so the chord repeats every 3 frets: C dim7, E♭ dim7, G♭ dim7 and A dim7 are the same notes. Dramatic and suspenseful.',
m7b5:'A minor 7th chord with the 5th lowered one fret. Also called half-diminished and written with a ø (Bø7). Dark and jazzy. It is the vii chord of a major key and the ii chord of a minor key.',
mmaj7:'A minor chord plus a major 7th, so it has a minor 3rd and a major 7th at once. Also written Am(maj7), AmM7, Am△7 or Am7M. Mysterious and cinematic, and the middle step of the famous Am, Am(maj7), Am7, Am6 line.',
'9':'A dominant 7th chord plus the 9th (the note 2 frets above the root, one octave up). Funky and jazzy, richer than a plain 7th. The 5th is often left out.',
m9:'A minor 7th chord plus the 9th. Smooth, soulful and mellow, common in R&B, neo-soul and jazz. The 5th is often left out.',
add9:'A major chord with the 9th added and no 7th. The 9th is the same note as the 2nd, an octave higher. Open and shimmering, common in pop and acoustic songs.'};
// Why some chords have no single place in a major key (shown instead of the key list).
const NOKEY={
sus2:'Suspended chords have no 3rd, so they are neither major nor minor. They usually stand in for a major or minor chord with the same root and then resolve back to it, so they do not have one fixed place in a key.',
sus4:'Suspended chords have no 3rd, so they are neither major nor minor. They usually stand in for a major or minor chord with the same root and then resolve back to it, so they do not have one fixed place in a key.',
'6':'A 6th chord is often used instead of a plain major or maj7 chord as the “home” (I) chord, especially in jazz, country and swing. It has the same notes as a minor 7th chord built a minor 3rd lower: C6 and Am7 share C, E, G and A.',
m6:'A minor 6th chord is often used as the minor “home” chord in jazz and bossa nova. It has the same notes as a minor 7♭5 chord built a minor 3rd higher: Am6 and F♯m7♭5 share A, C, E and F♯.',
'5':'A power chord has only the root and the 5th, so it is neither major nor minor. That is why it can replace either one with the same root, and why it stays clear under heavy distortion.',
aug:'An augmented chord is symmetrical (C aug, E aug and G♯ aug share the same notes), so it does not belong to one major key. It is often used as a tense passing chord that leads to the chord a 4th higher, like C aug into F.',
dim7:'A dim7 is built only from minor 3rds, so it repeats every 3 frets and does not belong to one major key. It is used as a tense chord that resolves up a half step (B dim7 into C) in jazz, gospel and classical music.',
mmaj7:'The minor chord with a major 7th does not occur in a major key. It sits on the root of the harmonic and melodic minor scales, and is used as a tense, dramatic minor chord, for example in the line Am, Am(maj7), Am7, Am6.',
'9':'A dominant 9th is usually the V chord of a major key with extra colour: G9 (G B D F A) fits C major, since all of its notes are in the scale. Common in funk, soul and blues.',
m9:'A minor 9th is usually the ii chord of a major key: Dm9 (D F A C E) fits C major, since all of its notes are in the scale. Smooth and common in soul and jazz.',
add9:'An add9 chord can stand in for a plain major chord: Cadd9 (C E G D) and Fadd9 (F A C G) both fit C major, as the I and IV chords.'};
const DEG=[0,2,4,5,7,9,11],TQ=['maj','min','min','maj','maj','min','dim'],SQ=['maj7','m7','m7','maj7','7','m7','m7b5'];
const SEV=['7','maj7','m7','m7b5']; // chord types that belong to the “7th chords of a key” row
const RN=['I','ii','iii','IV','V','vi','vii°'],RN7=['Imaj7','iim7','iiim7','IVmaj7','V7','vim7','viiø7'];
const st={r:7,q:'maj',sh:'E',mode:'fingers',rot:false,view:'chord',sc:'major',pos:0,vmode:'caged',vsize:'all',vinv:false,gk:'',gb:0};
const $=id=>document.getElementById(id);

// Fingers (1 = index, 2 = middle, 3 = ring, 4 = pinky) for the open-position version of each shape, strings 6 to 1.
// Same numbers as the standardguitar.com chord pages (e.g. Em = 1 on A, 2 on D) and standard teaching fingerings.
const OF={
maj:{E:[0,2,3,1,0,0],A:[0,0,1,2,3,0],C:[0,3,2,0,1,0],G:[2,1,0,0,0,3],D:[0,0,0,1,3,2]},
min:{E:[0,1,2,0,0,0],A:[0,0,2,3,1,0],C:[0,3,1,0,1,4],G:[2,1,0,0,3,4],D:[0,0,0,2,3,1]},
'7':{E:[0,2,0,1,0,0],A:[0,0,1,0,2,0],C:[0,3,2,4,1,0],G:[3,2,0,0,0,1],D:[0,0,0,2,1,3]},
maj7:{E:[0,3,1,2,0,0],A:[0,0,2,1,3,0],C:[0,3,2,0,0,0],G:[3,1,0,0,0,2],D:[0,0,0,1,2,3]},
m7:{E:[0,1,0,0,0,0],A:[0,0,2,0,1,0],C:[0,3,1,4,1,0],G:[3,1,0,0,4,2],D:[0,0,0,2,1,1]},sus2:{E:[0,1,3,4,0,0],A:[0,0,1,2,0,0],C:[0,3,0,0,1,4],G:[2,0,0,0,3,4],D:[0,0,0,1,2,0]},sus4:{E:[0,2,3,4,0,0],A:[0,0,1,2,3,0],C:[0,3,4,0,1,1],G:[2,3,0,0,1,4],D:[0,0,0,1,3,4]},'6':{E:[0,2,3,1,4,0],A:[0,0,1,1,1,1],C:[0,4,2,3,1,0],G:[3,2,0,0,0,0],D:[0,0,0,1,0,2]},m6:{E:[0,1,2,0,3,0],A:[0,0,2,3,1,4],C:[0,4,1,2,1,0],G:[3,1,0,0,4,0],D:[0,0,0,2,0,1]},'5':{E:[0,1,2,0,0,0],A:[0,0,1,2,0,0],C:[0,3,0,0,1,0],G:[3,0,0,0,0,0],D:[0,0,0,1,2,0]}};
// Two shapes need a string muted once they slide up the neck, because the open string would need a 5th finger.
const TS={'7':{C:[-1,3,2,3,1,-1]},m7:{G:[3,1,0,0,-1,1]}};
// Fingering for a shape slid up the neck (base > 0). Open strings of the template become the index-finger barre.
// Every other note sits at (fret - base + 1) as a finger number, bumped up where two notes share a fret, pushed back
// down when it would pass the pinky, and notes that one finger can lay across (same fret, nothing lower in between)
// are merged into a mini-barre when there are three or more of them or when fingers would run out.
function barreFingers(t,fr,base){
 const fg=Array(6).fill(0),bar=[],rest=[];
 fr.forEach((f,i)=>{if(f>0)(t[i]===0?bar:rest).push(i)});
 bar.forEach(i=>fg[i]=1);
 const hasBar=bar.length>0,lo=Math.min(99,...rest.map(i=>fr[i]));
 const runsAt=f=>{const out=[];let cur=[];
  rest.filter(i=>fr[i]===f).forEach(i=>{
   if(cur.length&&fr.slice(cur[cur.length-1]+1,i).some(x=>x>=0&&x<f)){out.push(cur);cur=[]}
   cur.push(i)});
  if(cur.length)out.push(cur);return out};
 const groups=[...new Set(rest.map(i=>fr[i]))].sort((a,b)=>a-b)
  .flatMap(f=>runsAt(f).map(s=>({f,s,merge:s.length>=3||(!hasBar&&f===lo&&s.length>1)})));
 const attempt=()=>{
  const units=[];
  groups.forEach(g=>g.merge?units.push({f:g.f,s:g.s}):g.s.forEach(i=>units.push({f:g.f,s:[i]})));
  const floor=hasBar?1:0,a=[];let prev=floor;
  units.forEach(u=>{prev=Math.max(hasBar?u.f-base+1:u.f-lo+1,prev+1);a.push(prev)});
  if(a.length&&a[a.length-1]>4){a[a.length-1]=4;for(let k=a.length-2;k>=0;k--)a[k]=Math.min(a[k],a[k+1]-1)}
  if(a.length&&a[0]<=floor)return false;
  units.forEach((u,k)=>u.s.forEach(i=>fg[i]=a[k]));return true};
 let ok=attempt();
 for(const g of [...groups].reverse()){if(ok)break;if(g.s.length>1&&!g.merge){g.merge=true;ok=attempt()}}
 return fg;
}
function fallbackVoice(r,q){ // chords with no classic shape: the fullest root-position voicing nearest the nut
 const L=genVoicings(r,q).filter(v=>!v.inv),v=L.reduce((a,b)=>b.n>a.n||(b.n===a.n&&b.base<a.base)?b:a);
 return{fr:v.fr.slice(),fg:v.fg.slice(),base:v.base};
}
function voice(r=st.r,q=st.q,sh=st.sh){
 if(!(T[q]&&T[q][sh]))return fallbackVoice(r,q);
 const t=T[q][sh],base=(r-SPC[sh]+12)%12;
 if(base===0)return{fr:t.slice(),fg:OF[q][sh].slice(),base};
 const tt=(TS[q]&&TS[q][sh])||t,fr=tt.map(o=>o<0?-1:base+o);
 return{fr,fg:barreFingers(tt,fr,base),base};
}
const pcOf=(i,f)=>(OPEN[i]+f)%12;
function lab(i,f,fg){
 if(st.mode==='fingers')return fg||'';
 const pc=pcOf(i,f);
 return st.mode==='notes'?nm(pc,flatR(st.r)):ivq(st.q,(pc-st.r+12)%12);
}
// ---------- Can a hand play it? ----------
// Limits of a real hand, calibrated on real chord charts (see tools/check-against-chords-db.js: 96.8% of 433 fingerings in the
// open chords-db database pass, and the ones that fail are rare or advanced). Returns the reason a fingering is too hard, or null.
//   fr = fret per string (low to high, -1 muted), fg = finger per string (0 = none, 1 = index ... 4 = pinky)
const REACH={'1-2':2,'2-3':2,'3-4':2,'1-3':3,'2-4':3,'1-4':3}; // widest gap, in frets, that each pair of fingers can cover
function whyHard(fr,fg){
 const g={};fr.forEach((f,i)=>{if(f>0)(g[fg[i]]=g[fg[i]]||[]).push(i)});
 if(g[0])return'a pressed string has no finger';
 const used=Object.keys(g).map(Number).sort((a,b)=>a-b);if(used.length>4)return'more than 4 fingers';
 const fretted=fr.filter(f=>f>0),span=fretted.length?Math.max(...fretted)-Math.min(...fretted):0;if(span>3)return'wider than 4 frets';
 let multi=0,last=0;
 for(const n of used){const ix=g[n],f=fr[ix[0]];
  if(ix.some(i=>fr[i]!==f))return'one finger on two frets';
  if(f<last)return'fingers cross';last=f;
  if(ix.length>1){multi++;const seg=fr.slice(ix[0],ix[ix.length-1]+1);
   if(seg.some(x=>x>=0&&x<f))return'a finger lies across an open or lower string';
   if(seg.some(x=>x===-1))return'a finger lies across a muted string';  // advanced: the finger must also deaden that string
   if(n===2)return'the middle finger cannot lie across strings';
   if(n===4&&(ix.length>2||ix[1]-ix[0]>1))return'the pinky can only cover two neighbouring strings';}}
 for(let a=0;a<used.length;a++)for(let b=a+1;b<used.length;b++)
  if(Math.abs(fr[g[used[b]][0]]-fr[g[used[a]][0]])>REACH[used[a]+'-'+used[b]])return'fingers '+used[a]+' and '+used[b]+' are too far apart';
 if(span===3&&used.length===4&&multi>=2)return'a full 4-fret stretch with two fingers lying flat'; // never seen in real charts
 return null;
}
const shapeOK=(r,q,sh)=>{if(!(T[q]&&T[q][sh]))return false;const v=voice(r,q,sh);return!whyHard(v.fr,v.fg)};
const cagedOK=(r,q)=>[...'CAGED'].some(s=>shapeOK(r,q,s));
function okShape(r,q,sh){ // keep the chosen shape if playable, otherwise the playable one closest to it on the neck
 if(shapeOK(r,q,sh))return sh;const b0=voice(r,q,sh).base,c=[...'CAGED'].filter(s=>shapeOK(r,q,s));
 return c.length?c.reduce((a,b)=>Math.abs(voice(r,q,b).base-b0)<Math.abs(voice(r,q,a).base-b0)?b:a):sh;
}
// ---------- More voicings: generated, not hand-written ----------
// A voicing is any way to play the chord that (1) uses only chord tones and all the needed ones, (2) fits a 4-fret window,
// (3) leaves no muted string between played strings, and (4) can be fingered by a real hand (see whyHard() above: four fingers, barres, reach).
// Open strings are allowed when everything stays within the first five frets.
function assignFingers(fr){
 const fs=[];fr.forEach((f,i)=>{if(f>0)fs.push(i)});
 if(!fs.length)return fr.map(()=>0);
 const lo=Math.min(...fs.map(i=>fr[i])),frets=[...new Set(fs.map(i=>fr[i]))].sort((a,b)=>a-b);
 // a finger can lie flat across strings a..b at fret f only if every string in between is pressed at f or higher
 const run=f=>{const ix=fs.filter(i=>fr[i]===f);return ix.length>1&&fr.slice(ix[0],ix[ix.length-1]+1).every(x=>x>=f)?ix:null};
 for(const plan of [0,1,2]){ // 0: one finger per note, 1: barre on the lowest fret, 2: barre and mini-barres anywhere
  const groups=[],used=new Set();
  for(const f of frets){const ix=plan===0||(plan===1&&f!==lo)?null:run(f);if(ix){groups.push({f,s:ix});ix.forEach(i=>used.add(i))}}
  fs.forEach(i=>{if(!used.has(i))groups.push({f:fr[i],s:[i]})});
  if(groups.length>4)continue;
  groups.sort((a,b)=>a.f-b.f||a.s[0]-b.s[0]);
  // Fingers rise with the fret. Try the lowest finger numbers first, and use the ring finger or pinky when the reach needs it
  // (a barre at the lowest fret plus one far note is played index + pinky, a mini-barre higher up is played with the ring finger).
  const pick=(k,from=1)=>k===0?[[]]:[1,2,3,4].filter(x=>x>=from&&4-x>=k-1).flatMap(x=>pick(k-1,x+1).map(t=>[x,...t]));
  for(const nums of pick(groups.length)){
   const fg=fr.map(()=>0);groups.forEach((g,k)=>g.s.forEach(i=>fg[i]=nums[k]));
   if(!whyHard(fr,fg))return fg; // otherwise try the next way of fingering it
  }
 }
 return null;
}
// The newer chord types get their classic shapes from an older one by moving one or two notes (a diminished chord is a
// minor chord with the 5th lowered, and so on). A shape is kept only if it has every chord tone and a hand can play it.
// Chords with no such shape (9th chords, add9) are shown with the generated voicings instead.
const DERIVE={dim:['min',{7:-1}],aug:['maj',{7:1}],m7b5:['m7',{7:-1}],dim7:['m7',{7:-1,10:-1}],mmaj7:['m7',{10:1}]};
Object.entries(DERIVE).forEach(([q,[from,mv]])=>{
 T[q]={};OF[q]={};
 for(const sh of 'CAGED'){
  const rel=(i,f)=>(OPEN[i]+f-SPC[sh]+120)%12,t0=T[from][sh];if(!t0)continue;
  const fr=t0.map((f,i)=>{if(f<0)return-1;const nf=f+(mv[rel(i,f)]||0);return nf<0?-1:nf});
  if(!fr.every((f,i)=>f<0||F[q].includes(rel(i,f))))continue;
  if(!F[q].every((x,k)=>(OPT5.includes(q)&&k===2)||fr.some((f,i)=>f>=0&&rel(i,f)===x)))continue;
  if(fr.filter(f=>f>=0).length<3)continue;
  const fg=assignFingers(fr);if(fg){T[q][sh]=fr;OF[q][sh]=fg}
 }
});
const _gv={};
function genVoicings(r,q){
 const k=r+'|'+q;if(_gv[k])return _gv[k];
 const tones=F[q].map(x=>(r+x)%12),opt=OPT5.includes(q)?tones[2]:-1; // 7th, 9th and 6th chords may leave out the 5th
 const need=tones.filter(p=>p!==opt),minS=q==='5'?2:3,out=new Map();
 const leaf=fr=>{
  if(fr.filter(f=>f>=0).length<minS)return;
  const pcs=new Set(fr.map((f,i)=>f<0?-1:pcOf(i,f)));if(!need.every(p=>pcs.has(p)))return;
  const fretted=fr.filter(f=>f>0),open=fr.includes(0);
  if(open&&Math.max(0,...fretted)>5)return;
  const key=fr.join(',');if(out.has(key))return;
  const fg=assignFingers(fr);if(!fg)return;
  const b=fr.findIndex(f=>f>=0),bass=ivq(q,(pcOf(b,fr[b])-r+12)%12);
  out.set(key,{key,fr:fr.slice(),fg,base:open||!fretted.length?0:Math.min(...fretted),n:fr.filter(f=>f>=0).length,bass,inv:bass==='R'?0:1});
 };
 for(let w=1;w<=NF-3;w++){
  const opts=[0,1,2,3,4,5].map(i=>{const o=[-1];if(tones.includes(pcOf(i,0)))o.push(0);for(let f=w;f<w+4;f++)if(tones.includes(pcOf(i,f)))o.push(f);return o});
  const fr=[];
  (function go(i,ph){ // ph 0: leading mutes, 1: playing, 2: trailing mutes
   if(i===6){leaf(fr);return}
   for(const f of opts[i]){
    if(f<0){fr.push(f);go(i+1,ph===1?2:ph);fr.pop()}
    else if(ph<2){fr.push(f);go(i+1,1);fr.pop()}
   }
  })(0,0);
 }
 return _gv[k]=[...out.values()].sort((a,b)=>a.base-b.base||b.n-a.n||a.inv-b.inv||a.key.localeCompare(b.key));
}
// ---------- Tab trainer: technique data, tab drawing and text tabs (no page needed) ----------
// A written phrase is a list of events: {s: string 0..5 (0 = thickest, low E), f: fret, t: start in beats, d: length in beats, ...marks}.
// Marks: x = 'h' hammer-on | 'p' pull-off | '/' slide up | '\\' slide down (all joined to the previous note on the same string),
// 'dead' dead note, 'slin' slide into, 'slout' slide off; bend / pb (pre-bend) = size in semitones, rel = then release;
// vib = vibrato, pm = palm mute, nh = natural harmonic, tap = tapped, tr + f2 = trill between f and f2.
const RND={int:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick:a=>a[Math.floor(Math.random()*a.length)]};
const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TN=(s,f,t,d,o)=>Object.assign({s,f,t,d},o||{});
const LEG=['h','p','/','\\'];
const HARM={12:12,7:19,5:24}; // a natural harmonic at fret 12, 7 or 5 sounds this many semitones above the open string
const withM=ev=>ev.map(e=>Object.assign({},e,{
 m:e.x==='dead'?MID[e.s]+2:e.nh?MID[e.s]+(HARM[e.f]||12):MID[e.s]+e.f,
 m2:e.f2!==undefined?MID[e.s]+e.f2:undefined}));
const evLen=ev=>Math.max(...ev.map(e=>e.t+e.d));
const BENDTXT={1:'1/2',2:'full',3:'1 1/2'};
const lbl=e=>e.x==='dead'?'x':e.nh?'<'+e.f+'>':String(e.f);

const TECH=[
{id:'hammer',sym:'h',name:'Hammer-on',txt:'5h7',
 what:'Sound a higher note without picking it. You pick the first note, then bring another finger down hard on a higher fret of the same string.',
 how:['Fret and pick the first note (fret 5 in the example).','While it rings, bring another finger straight down onto the higher fret (7), just behind the fret wire.','Do not pick again. The force of the finger makes the second note sound.'],
 hear:'Two smoothly connected notes. The second one has no pick “click”.',
 slip:'Hammering too softly, so the second note is weak or silent. Use the fingertip, fast and firm.',
 gen:()=>{const s=RND.int(1,4),a=RND.int(2,8);return[TN(s,a,0,1),TN(s,a+RND.pick([1,2,3]),1,1.5,{x:'h'})]}},
{id:'pull',sym:'p',name:'Pull-off',txt:'7p5',
 what:'The opposite of a hammer-on: you pick a note, then pull the finger off the string so a lower note that is already fretted sounds, again without picking.',
 how:['Place two fingers: one on the higher fret (7) and one on the lower fret (5), or leave the lower note open.','Pick the higher note.','Pull the upper finger away with a small downward flick, as if plucking the string with it. The lower note rings.'],
 hear:'A smooth step down. The second note is a little softer than a picked one.',
 slip:'Lifting the finger straight up. That mutes the string. Flick it sideways, toward the floor.',
 gen:()=>{const s=RND.int(1,4),a=RND.int(4,10);return[TN(s,a,0,1),TN(s,a-RND.pick([2,3]),1,1.5,{x:'p'})]}},
{id:'slideup',sym:'/',name:'Slide up',txt:'5/7',
 what:'Move one finger along the string from a lower fret to a higher one without lifting it. Only the first note is picked.',
 how:['Fret and pick the first note (5).','Keep the finger pressed and slide it up the neck to the second fret (7).','Keep the same pressure the whole way, or the sound breaks up.'],
 hear:'A smooth glide up, passing through the notes in between.',
 slip:'Letting go of the pressure during the slide, so the note dies half way. Some tabs write a slide with “s” (5s7).',
 gen:()=>{const s=RND.int(1,4),a=RND.int(2,8);return[TN(s,a,0,1),TN(s,a+RND.pick([2,3,4,5]),1,1.5,{x:'/'})]}},
{id:'slidedown',sym:'\\',name:'Slide down',txt:'7\\5',
 what:'Move one finger along the string from a higher fret down to a lower one. The slash leans the other way: it points down.',
 how:['Fret and pick the first note (7).','Keep the finger pressed and slide it down the neck to the second fret (5).','Stop exactly on the target fret. Check that you land on the right one, because there are no frets to feel on a slide.'],
 hear:'A smooth glide down, the way a “falling” note sounds.',
 slip:'Sliding too far, or too early. Aim your eyes at the target fret before you start.',
 gen:()=>{const s=RND.int(1,4),a=RND.int(7,12);return[TN(s,a,0,1),TN(s,a-RND.pick([2,3,4,5]),1,1.5,{x:'\\'})]}},
{id:'slideinout',sym:'/ \\',name:'Slide into / off a note',txt:'/7  7\\',
 what:'A slide with only one number. A slash before the number means: start a few frets lower and slide into it. A slash after it means: slide off the note and let it fade away.',
 how:['For “/7”: start your finger two or three frets below 7, then pick and slide up into 7 as the note begins.','For “7\\”: play 7, then slide your finger down the neck and keep going until the sound dies.','In both cases the starting or ending point is not exact. It is a decoration.'],
 hear:'A note that swoops in from below, or one that falls away at the end.',
 slip:'Treating it like a normal slide with an exact target. Here the slide is the effect, so only the written number matters.',
 gen:()=>{const s=RND.int(1,4),a=RND.int(5,12);return[TN(s,a,0,1.5,{x:'slin'}),TN(s,a+RND.pick([0,2]),2,1.5,{x:'slout'})]}},
{id:'dead',sym:'x',name:'Dead note',txt:'x',
 what:'A note with no pitch: a short, dry “chk”. An x on a string means: do not fret it, just mute it and pick.',
 how:['Lay the fretting fingers across the string(s) lightly, without pressing down to the fret.','Pick or strum. You hear a dull thud, not a note.','Keep the rhythm going. Dead notes are used as percussion, mostly in funk and rock rhythm playing.'],
 hear:'A short, percussive click with no clear pitch.',
 slip:'Pressing down too much, which makes a normal (even if odd-sounding) note.',
 gen:()=>{const s=RND.int(0,3),a=RND.pick([0,3,5,7]);return[TN(s,a,0,.5),TN(s,0,.5,.5,{x:'dead'}),TN(s,0,1,.5,{x:'dead'}),TN(s,a,1.5,1)]}},
{id:'vib',sym:'~',name:'Vibrato',txt:'7~',
 what:'A small, steady wobble of the pitch that makes a long note sing. Wavy lines after a note show how long to keep it going.',
 how:['Pick and fret the note.','Rock your fretting finger and wrist so the string is pushed up and down a tiny bit, not along the neck.','Keep the wobble even and relaxed, about 5 to 6 times per second.'],
 hear:'The note pulses in pitch, slowly, like a singer holding a note.',
 slip:'Shaking too hard or too fast. A good vibrato is small and steady.',
 gen:()=>[TN(RND.int(1,4),RND.int(5,12),0,2.5,{vib:1})]},
{id:'bend',sym:'b',name:'Bend',txt:'7b9',
 what:'Push the string sideways across the fretboard to raise its pitch. The arrow shows the amount: “full” is a whole step (2 frets) and “1/2” is a half step (1 fret).',
 how:['Fret the note, with extra fingers behind it to help push.','Pick, then push the string up toward the ceiling until it reaches the target pitch.','In a text tab, 7b9 means: bend the note at fret 7 until it sounds like the note at fret 9.'],
 hear:'The note rises smoothly and stops at the target pitch, like a vocal slide.',
 slip:'Stopping short, so the note sounds out of tune. Check the target by playing it normally first.',
 gen:()=>[TN(RND.int(2,5),RND.int(5,12),0,2.5,{bend:RND.pick([1,2])})]},
{id:'prebend',sym:'pb',name:'Pre-bend',txt:'7pb9',
 what:'Bend the string first, in silence, and only then pick it. The note is already high when you hear it. It is often followed by a release (r) back down.',
 how:['Fret the note and push it up to the target pitch before you pick.','Pick the already-bent string.','If an “r” follows (7pb9r7), let the string slowly down to the starting pitch while it rings.'],
 hear:'The note starts high. If released, it then falls to the lower pitch.',
 slip:'Bending after the pick, which turns it into a normal bend. The whole point is to start high.',
 gen:()=>[TN(RND.int(2,5),RND.int(5,12),0,2.5,{pb:RND.pick([1,2]),rel:RND.pick([0,1])})]},
{id:'bendrel',sym:'b r',name:'Bend and release',txt:'7b9r7',
 what:'Bend the note up, then let it come back down to where it started, all without picking again. One arrow goes up and one goes down.',
 how:['Fret and pick the note, then bend up to the target pitch.','Hold it for a moment.','Slowly let the string back down to the original pitch while it is still ringing.'],
 hear:'The pitch goes up, and then comes back down to the first note.',
 slip:'Releasing too quickly or letting the string go slack, which leaves a rattle or an out-of-tune ending.',
 gen:()=>[TN(RND.int(2,5),RND.int(5,12),0,3,{bend:RND.pick([1,2]),rel:1})]},
{id:'palm',sym:'P.M.',name:'Palm mute',txt:'P.M.---|',
 what:'Rest the edge of your picking-hand palm lightly on the strings near the bridge. The notes come out short and chunky. The dashed line shows how long to keep it on.',
 how:['Place the edge of your picking hand on the strings, right by the bridge.','Press just enough to shorten the notes, but not so much that the pitch is lost.','At the end of the dashed line (the “|”), lift your palm and let the notes ring.'],
 hear:'Tight, dull, “chugging” notes, which then open up when the mute ends.',
 slip:'Resting the palm too far from the bridge (a dead “thunk” with no pitch) or too close to the saddle (no muting).',
 gen:()=>{const s=RND.int(0,2),a=RND.pick([0,0,2,3,5]);return[0,1,2,3].map(k=>TN(s,a,k*.5,.5,{pm:1})).concat([TN(s,a,2,1.5)])}},
{id:'harm',sym:'<12>',name:'Natural harmonic',txt:'<12>',
 what:'A bell-like chime. Touch the string lightly right above a fret wire (usually 12, 7 or 5), pick, and take the finger away at once. Numbers in diamonds or <angle brackets> mean this.',
 how:['Lay one finger very lightly on the string directly above the fret wire (not behind it), without pressing it down.','Pick the string, then lift the finger away immediately.','If it sounds like a dull thud, move the finger closer to the fret wire.'],
 hear:'A pure, high, ringing tone, like a bell or a glass.',
 slip:'Pressing the string down. That makes a normal note, not a harmonic.',
 gen:()=>[TN(RND.int(0,5),RND.pick([12,7,5]),0,3,{nh:1})]},
{id:'tap',sym:'T',name:'Tapping',txt:'T12p8p5',
 what:'Use a finger of your picking hand to hammer a note down on the neck. A “T” marks the tapped note. It is usually followed by pull-offs to notes fretted by the other hand.',
 how:['Fret the lower notes (8 and 5) with your fretting hand.','Hammer the string down hard on fret 12 with a finger of your picking hand. A T marks it.','Pull the tapping finger off with a small flick so the next note (8) sounds, then pull off again to 5.'],
 hear:'A fast, smooth run of connected notes, each one lower than the last, played without any picking.',
 slip:'Tapping on the wrong place on the fret (not right behind the fret wire) or forgetting to flick the finger off.',
 gen:()=>{const s=RND.int(3,5),a=RND.int(12,17),b=RND.int(7,10);return[TN(s,a,0,.5,{tap:1}),TN(s,b,.5,.5,{x:'p'}),TN(s,b-RND.pick([2,3]),1,1,{x:'p'})]}},
{id:'trill',sym:'tr',name:'Trill',txt:'5tr7',
 what:'Flip quickly between two notes with hammer-ons and pull-offs, as fast as you can, for as long as the wavy line lasts.',
 how:['Fret the lower note with one finger and keep a second finger just above the higher fret.','Pick once, then hammer on and pull off again and again.','Keep the finger over the higher note, close to the string, so it can move quickly.'],
 hear:'A fast, shimmering flutter between two notes.',
 slip:'Playing it too slowly or unevenly. A trill should be quick, and each note must sound clearly.',
 gen:()=>{const a=RND.int(5,12);return[TN(RND.int(1,5),a,0,2.5,{tr:1,f2:a+RND.pick([1,2])})]}}
];
const lk=a=>{let t=0;return a.map(([s,f,d,o])=>{const e=TN(s,f,t,d,o);t+=d;return e})};
const LICKS=[
{id:'opener',name:'Blues-rock opener',bpm:70,techs:['bendrel','pull','vib'],
 info:'A bend and release, a pull-off, then a long note with vibrato. All notes come from A minor pentatonic, so it works over an A minor or A7 backing.',
 ev:lk([[5,8,2.5,{bend:2,rel:1}],[5,5,1,{x:'p'}],[4,8,1],[4,5,1,{x:'p'}],[3,7,3,{vib:1}]])},
{id:'groove',name:'Slide and hammer groove',bpm:80,techs:['hammer','dead','slideup','slidedown'],
 info:'A funky little groove: a hammer-on, a dead note for rhythm, then a slide up and a slide back down.',
 ev:lk([[2,5,.5],[2,7,.5,{x:'h'}],[2,0,.5,{x:'dead'}],[2,5,.5],[3,5,1],[3,7,1,{x:'/'}],[3,5,1.5,{x:'\\'}]])},
{id:'palm',name:'Palm-muted riff',bpm:90,techs:['palm','harm'],
 info:'A rock riff on the low E string with a palm mute, which opens up on the last note. It ends with a bell-like harmonic.',
 ev:lk([[0,0,.5,{pm:1}],[0,0,.5,{pm:1}],[0,0,.5,{pm:1}],[0,3,.5,{pm:1}],[0,0,.5,{pm:1}],[0,0,.5,{pm:1}],[0,5,1],[4,12,2.5,{nh:1}]])},
{id:'legato',name:'Tapping and trill',bpm:70,techs:['tap','pull','hammer','trill'],
 info:'A tapped run of notes with pull-offs and a hammer-on, followed by a trill.',
 ev:lk([[5,12,.5,{tap:1}],[5,8,.5,{x:'p'}],[5,5,.5,{x:'p'}],[5,8,.5,{x:'h'}],[5,12,1,{tap:1}],[5,5,1,{x:'p'}],[4,8,2.5,{tr:1,f2:10}]])}
];

function tokenOf(e,prev){
 let pre='',suf='';
 if(LEG.includes(e.x)&&prev&&prev.s===e.s)pre=e.x;
 else if(e.x==='slin')pre='/';
 else if(e.x==='slout')suf='\\';
 if(e.tap)pre='T';
 if(e.pb)suf='pb'+(e.f+e.pb)+(e.rel?'r'+e.f:'');
 else if(e.bend)suf='b'+(e.f+e.bend)+(e.rel?'r'+e.f:'');
 if(e.tr)suf='tr'+e.f2;
 if(e.vib)suf+='~';
 return pre+lbl(e)+suf;
}
// The same phrase as a plain-text tab, the way it looks on most websites.
function asciiTab(ev){
 const names=['E','A','D','G','B','e'],rows=['','','','','',''],cols=[];let pos=1;
 ev.forEach((e,i)=>{const tok=tokenOf(e,ev[i-1]),nx=ev[i+1],joined=nx&&LEG.includes(nx.x)&&nx.s===e.s,w=joined?tok.length:tok.length+1+Math.round(e.d*2); // a hammer-on, pull-off or slide is written right against the note before it
  for(let s=0;s<6;s++)rows[s]+=s===e.s?tok.padEnd(w,'-'):'-'.repeat(w);
  cols.push({start:pos,len:tok.length});pos+=w});
 const lines=[5,4,3,2,1,0].map(s=>names[s]+'|-'+rows[s]+'|');
 const pm=[];
 for(let i=0;i<ev.length;i++){if(!ev[i].pm)continue;let j=i;while(j+1<ev.length&&ev[j+1].pm)j++;pm.push([i,j]);i=j}
 if(pm.length){const ch=Array(pos+1).fill(' ');
  pm.forEach(([i,j])=>{const a=cols[i].start,b=Math.max(cols[j].start+cols[j].len,a+5);
   'P.M.'.split('').forEach((c,k)=>ch[a+k]=c);for(let k=a+4;k<b;k++)ch[k]='-';ch[b]='|'});
  lines.unshift('  '+ch.join('').replace(/\s+$/,''))}
 return lines.join('\n');
}
// The phrase as a drawn tab: six lines, fret numbers, and the marks for each technique.
function tabSVG(ev){
 const bw=72,L=52,top=58,sy=22,end=evLen(ev),W=Math.round(L+end*bw+28),H=top+5*sy+26;
 const X=e=>L+e.t*bw+20,Y=e=>top+(5-e.s)*sy,wd=e=>lbl(e).length*9+8;
 let s=`<svg class="tabsvg" viewBox="0 0 ${W} ${H}" style="max-width:${Math.round(W*1.6)}px" role="img" aria-label="Guitar tablature">`;
 for(let r=0;r<6;r++)s+=`<line x1="${L-8}" x2="${W-8}" y1="${top+r*sy}" y2="${top+r*sy}"/>`;
 s+=`<line class="bl" x1="${L-8}" x2="${L-8}" y1="${top}" y2="${top+5*sy}"/><line class="bl" x1="${W-8}" x2="${W-8}" y1="${top}" y2="${top+5*sy}"/>`;
 ['T','A','B'].forEach((c,i)=>s+=`<text class="clef" x="${L-34}" y="${top+sy*(1.3+i*1.1)+6}">${c}</text>`);
 let m='',nums='';
 for(let i=0;i<ev.length;i++){const e=ev[i];if(!e.pm||(i&&ev[i-1].pm))continue;
  let j=i;while(j+1<ev.length&&ev[j+1].pm)j++;
  const x0=X(e)-wd(e)/2,x1=X(ev[j])+wd(ev[j])/2,y=top-30;
  m+=`<text class="ann" x="${x0}" y="${y}">P.M.</text><line class="pml" x1="${x0+34}" x2="${x1}" y1="${y-4}" y2="${y-4}"/><line class="pml" x1="${x1}" x2="${x1}" y1="${y-4}" y2="${y+6}"/>`}
 ev.forEach((e,i)=>{
  const cx=X(e),cy=Y(e),w=wd(e),prev=ev[i-1];
  if(i&&LEG.includes(e.x)&&prev.s===e.s){const px=X(prev),pw=wd(prev);
   if(e.x==='h'||e.x==='p'){const mx=(px+cx)/2;m+=`<path class="mk" d="M${px} ${cy-12}Q${mx} ${cy-30} ${cx} ${cy-12}"/><text class="lt" x="${mx}" y="${cy-26}">${e.x==='h'?'H':'P'}</text>`}
   else m+=`<line class="sl" x1="${px+pw/2+3}" y1="${cy+(e.x==='/'?7:-7)}" x2="${cx-w/2-3}" y2="${cy+(e.x==='/'?-7:7)}"/>`}
  if(e.x==='slin')m+=`<line class="sl" x1="${cx-w/2-16}" y1="${cy+7}" x2="${cx-w/2-3}" y2="${cy-7}"/>`;
  if(e.x==='slout')m+=`<line class="sl" x1="${cx+w/2+3}" y1="${cy-7}" x2="${cx+w/2+16}" y2="${cy+7}"/>`;
  if(e.tap)m+=`<text class="lt" x="${cx}" y="${cy-30}">T</text>`;
  if(e.bend){const ax=cx+w/2+2;
   m+=`<path class="mk" d="M${ax} ${cy-5}C${ax+14} ${cy-5} ${ax+22} ${cy-12} ${ax+24} ${cy-26}"/><polygon class="ah" points="${ax+20},${cy-24} ${ax+28},${cy-24} ${ax+24},${cy-34}"/><text class="bt" x="${ax+24}" y="${cy-38}">${BENDTXT[e.bend]}</text>`;
   if(e.rel)m+=`<path class="mk" d="M${ax+32} ${cy-30}C${ax+36} ${cy-18} ${ax+42} ${cy-14} ${ax+44} ${cy-12}"/><polygon class="ah" points="${ax+40},${cy-12} ${ax+48},${cy-12} ${ax+44},${cy-4}"/>`}
  if(e.pb){m+=`<line class="mk" x1="${cx}" y1="${cy-11}" x2="${cx}" y2="${cy-26}"/><polygon class="ah" points="${cx-4},${cy-24} ${cx+4},${cy-24} ${cx},${cy-34}"/><text class="bt" x="${cx}" y="${cy-38}">${BENDTXT[e.pb]}</text>`;
   if(e.rel)m+=`<line class="mk" x1="${cx+18}" y1="${cy-30}" x2="${cx+18}" y2="${cy-14}"/><polygon class="ah" points="${cx+14},${cy-14} ${cx+22},${cy-14} ${cx+18},${cy-6}"/>`}
  if(e.vib||e.tr){const x0=cx+w/2+(e.tr?24:4),x1=Math.max(x0+12,L+(e.t+e.d)*bw+8),y=cy-(e.tr?17:15);let p=`M${x0} ${y}`;
   for(let x=x0;x<=x1;x+=2.5)p+=`L${x.toFixed(1)} ${(y+3.2*Math.sin((x-x0)*.9)).toFixed(1)}`;
   m+=`<path class="mk" d="${p}"/>`;
   if(e.tr)m+=`<text class="ann" x="${cx+w/2+4}" y="${cy-14}">tr</text><text class="lt" x="${cx+w/2+16}" y="${cy+5}">(${e.f2})</text>`}
  nums+=`<g class="tn" data-ev="${i}"><rect x="${cx-w/2}" y="${cy-9}" width="${w}" height="18" rx="5"/><text x="${cx}" y="${cy+5.5}">${escH(lbl(e))}</text></g>`;
 });
 return s+m+nums+'</svg>';
}
// ---------- Close-up of the fretting hand ----------
// closeState() is a pure function: given the phrase and a moment in time it says where the fingers are, how the
// string is bent and what to tell the player. It follows the same timings as the sound (js/audio.js), so the
// picture and the sound stay together. Strings run left to right like the tab, with the low E at the bottom.
const CLK={sp:26,top:30,left:50,right:92,pop:0.12,die:0.15};
const BENDWORD={1:'a half step',2:'a whole step',3:'a step and a half'};
const clamp01=v=>Math.max(0,Math.min(1,v));
function chainsOf(ev){const ch=[];ev.forEach(e=>{if(ch.length&&LEG.includes(e.x))ch[ch.length-1].push(e);else ch.push([e])});return ch}
function closeGeom(ev,o){
 let lo=99,hi=0;const add=f=>{if(f>0){lo=Math.min(lo,f);hi=Math.max(hi,f)}};
 ev.forEach(e=>{add(e.f);if(e.f2)add(e.f2);
  if(e.x==='slin'||e.x==='slout')add(Math.max(1,e.f-4));
  if(e.bend||e.pb)add(Math.max(1,e.f-2))});
 if(lo>hi){lo=1;hi=4}
 let p=99;ev.forEach(e=>{if(e.tap||e.nh||e.x==='dead'||e.x==='/'||e.x==='\\')return;[e.f,e.f2].forEach(f=>{if(f>0)p=Math.min(p,f)})});
 if(p===99)p=lo;
 const a=lo<=3?1:lo-1,N=Math.max(5,hi-a+2),cw=N>9?40:56,{sp,top,left,right}=CLK;
 return {names:!!(o&&o.names),a,N,cw,p,nut:a===1,W:left+N*cw+right,H:top+5*sp+42,chains:chainsOf(ev),
  fing:f=>Math.max(1,Math.min(4,f-p+1)),
  xF:f=>f<=0?left-17:left+(f-a+0.5)*cw,      // middle of a fret space (where a finger goes)
  xW:f=>left+(f-a+1)*cw,                     // on the fret wire (where a harmonic is touched)
  yS:s=>top+(5-s)*sp,fretEnd:left+N*cw};
}
const SNAME=['Low E','A','D','G','B','High e'];
function capOf(ch,j,g){const t=capText(ch,j,g);return g.names?SNAME[ch[j].s]+' string: '+t:t}
function capText(ch,j,g){
 const e=ch[j],F=g.fing,pv=ch[j-1];
 if(j>0){
  if(e.x==='h')return `No pick: bring finger ${F(e.f)} down hard on fret ${e.f}.`;
  if(e.x==='p')return `No pick: pull ${pv.tap?'your tapping finger':'finger '+F(pv.f)} off with a small sideways flick. `+(e.f===0?'The open string rings.':`Finger ${F(e.f)} is already on fret ${e.f}, so that note rings.`);
  return `No pick: keep pressing and slide ${e.x==='/'?'up':'down'} to fret ${e.f}.`;
 }
 const fr=e.f===0?'the open string':`fret ${e.f} with finger ${F(e.f)}`,rel=e.rel?' Then let it slowly back down.':'';
 if(e.x==='dead')return 'Rest the finger lightly across the string, without pressing it to the fret, and pick. You hear a dull thud.';
 if(e.nh)return `Touch the string lightly right above fret ${e.f} (not behind it), pick, then lift the finger away at once.`;
 if(e.tap)return `Tap fret ${e.f} hard with a finger of your picking hand. No pick needed.`;
 if(e.x==='slin')return `Start finger ${F(e.f)} a few frets below fret ${e.f}, pick, and slide up into the note.`;
 if(e.x==='slout')return `Fret ${e.f} with finger ${F(e.f)}, pick, then slide the finger off down the neck and let the note fade.`;
 if(e.tr)return `Fret ${e.f} with finger ${F(e.f)}, pick once, then hammer finger ${F(e.f2)} on and pull it off again and again, as fast as you can.`;
 if(e.pb)return `Fret ${e.f} with finger 3 and silently push the string up ${BENDWORD[e.pb]}. Then pick it already bent.${rel}`;
 if(e.bend)return `Fret ${e.f} with finger 3, with fingers 1 and 2 behind it. Pick, then push the string up ${BENDWORD[e.bend]}.${rel}`;
 if(e.vib)return `Fret ${e.f} with finger ${F(e.f)}, pick, then rock the finger and wrist to wobble the string up and down.`;
 if(e.pm)return 'Rest the edge of your picking hand on the strings by the bridge, then pick. The notes come out short and chunky.';
 return e.f===0?'Pick the open string.':`Fret ${e.f} with finger ${F(e.f)} and pick the string.`;
}
function closeState(ev,b,g,spb){
 const ts=b*spb,dots=[],strs={},ghosts=[],picks=[],palms=[];let caps=[],capAt=-1;
 const T=e=>e.t*spb;
 g.chains.forEach(ch=>{
  const m0=ch[0],last=ch[ch.length-1],tS=m0.t,tE=last.t+last.d,s=m0.s;
  const lead=(m0.pb||ch.some(e=>e.x==='p'))?0.3:0.12,vS=Math.max(0,tS-lead);
  if(b<vS||b>tE+0.2)return;
  const sT=T(m0),dur=m0.d*spb,endT=(last.t+last.d)*spb,vST=vS*spb;
  let al=1;if(b<tS)al=(b-vS)/Math.max(1e-6,tS-vS);if(b>tE)al=Math.max(0,1-(b-tE)/0.2);
  const D=[],mk=(f,kind,born,x)=>{const d=Object.assign({f,cf:f,kind,born,died:Infinity,segs:[],lab:kind==='fret'&&f>0?g.fing(f):'',landDur:CLK.pop},x);D.push(d);return d};
  const bendy=m0.bend||m0.pb;
  const cur=m0.x==='dead'?mk(Math.min(g.a+2,g.a+g.N-1),'dead',vST,{landDur:Math.max(1e-6,sT-vST)}):m0.nh?mk(m0.f,'harm',vST,{landDur:Math.max(1e-6,sT-vST)}):m0.tap?mk(m0.f,'tap',vST,{lab:'T',landDur:Math.max(1e-6,sT-vST)}):mk(m0.f,'fret',vST,{landDur:Math.max(1e-6,sT-vST)});
  if(bendy)cur.lab=3;
  ch.slice(1).forEach((e,i)=>{const pv=ch[i],te=T(e);
   if(e.x==='h')mk(e.f,'fret',te,{pop:1});
   else if(e.x==='p'){
    D.forEach(d=>{if(d.cf>e.f&&d.died===Infinity&&d.kind!=='support')d.died=te});
    if(!D.some(d=>d.cf===e.f&&d.died===Infinity))mk(e.f,'fret',vST,{landDur:0.0001});
   }else{
    const d=D.filter(q=>q.cf===pv.f&&q.died===Infinity).pop();
    if(d){const sd=Math.min(0.2,(e.t-pv.t)*spb*0.6);d.segs.push({t0:te-sd,t1:te,f0:pv.f,f1:e.f});d.cf=e.f}
   }});
  if(m0.tr)mk(m0.f2,'fret',vST,{toggle:true,landDur:0.0001});
  if(m0.x==='slin'){cur.f=Math.max(g.a,m0.f-4);cur.segs.push({t0:sT,t1:sT+Math.min(0.22,dur*0.4),f0:cur.f,f1:m0.f});cur.cf=m0.f;cur.lab=g.fing(m0.f)}
  if(m0.x==='slout'){cur.segs.push({t0:sT+dur*0.35,t1:sT+dur*0.95,f0:m0.f,f1:Math.max(g.a,m0.f-4)});cur.fade=[sT+dur*0.6,sT+dur*0.95]}
  if(m0.nh)cur.died=sT+0.25;
  if(bendy)[1,2].forEach(k=>{if(m0.f-k>=1)mk(m0.f-k,'support',vST,{lab:3-k,landDur:0.0001})});
  // how far the string is pushed: same shape as the pitch change in the sound
  let dy=0;
  if(m0.pb){const a=m0.pb;dy=ts<sT?a*clamp01((ts-vST)/Math.max(1e-6,sT-vST)):a;
   if(m0.rel){const a0=sT+dur*0.45,d=Math.min(0.35,dur*0.3);if(ts>=a0)dy=a*Math.max(0,1-(ts-a0)/d)}}
  else if(m0.bend){const a0=sT+Math.min(0.12,dur*0.1),u=Math.min(0.3,dur*0.3);dy=m0.bend*clamp01((ts-a0)/u);
   if(m0.rel){const b0=sT+dur*0.62,d=Math.min(0.3,dur*0.28);if(ts>=b0)dy=m0.bend*Math.max(0,1-(ts-b0)/d)}}
  let wob=0,vibAmp=0;
  ch.forEach(e=>{if(!e.vib)return;const s0=T(e)+Math.min(0.35,e.d*spb*0.3),ed=(e.t+e.d)*spb;vibAmp=e.vib===2?8:5;
   if(ts>=s0&&ts<=ed)wob=vibAmp*clamp01((ts-s0)/0.25)*Math.sin(2*Math.PI*5.5*(ts-s0))});
  const bpx=Math.min(26,(m0.bend||m0.pb||0)*10),dpx=-Math.min(26,dy*10)-wob;
  const fx=(d,f)=>d.kind==='harm'?g.xW(f):g.xF(f);
  D.forEach(d=>{
   if(ts<d.born)return;
   let f=d.f;d.segs.forEach(sg=>{if(ts>=sg.t1)f=sg.f1;else if(ts>sg.t0){const k=(ts-sg.t0)/(sg.t1-sg.t0);f=sg.f0+(sg.f1-sg.f0)*(k*k*(3-2*k))}});
   let op=al,off=0;
   if(ts>d.died){const k=(ts-d.died)/CLK.die;if(k>=1)return;op*=1-k;off=k*CLK.sp*0.7}
   if(d.fade)op*=1-clamp01((ts-d.fade[0])/(d.fade[1]-d.fade[0]));
   if(d.toggle){const k=Math.floor((ts-sT)/0.11);if(!(ts>=sT&&ts<endT&&k%2===1))return}
   const land=clamp01((ts-d.born)/d.landDur);
   const isCur=d===cur&&(bendy||vibAmp);
   dots.push({x:fx(d,f),y:g.yS(s)+off+(isCur?dpx:0),kind:d.kind,lab:d.lab,op,sc:1+0.45*(1-land)});
  });
  const cx=m0.nh?g.xW(m0.f):g.xF(m0.f>0?m0.f:Math.min(g.a+1,g.a+g.N-1));
  if(dpx!==0||bendy||vibAmp)strs[s]={x:cx,dy:dpx};
  if(bendy)ghosts.push({s,x:cx,dy:-bpx});
  if(vibAmp){ghosts.push({s,x:cx,dy:-vibAmp});ghosts.push({s,x:cx,dy:vibAmp})}
  if(!LEG.includes(m0.x)&&!m0.tap)picks.push({s,op:ts>=sT?Math.max(0,1-(ts-sT)/0.25):0});
  if(m0.pm)palms.push({s,op:al});
  if(vS>capAt+1e-9){capAt=vS;caps=[]}
  if(Math.abs(vS-capAt)<1e-9){let j=0;ch.forEach((e,i)=>{if(e.t<=b)j=i});caps.push(capOf(ch,j,g))}
 });
 return {dots,strs,ghosts,picks,palms,cap:caps.join(' · ')};
}
const CLSN=['E','A','D','G','B','e'];
function closeStatic(g){
 const {sp,top,left}=CLK,{a,N,cw}=g,y0=top,y1=top+5*sp,xe=g.fretEnd;
 let s=`<rect class="cb" x="${left}" y="${y0-12}" width="${N*cw}" height="${5*sp+24}" rx="4"/>`;
 for(let i=0;i<=N;i++)s+=`<line class="${i===0&&g.nut?'cn':'cw'}" x1="${left+i*cw}" x2="${left+i*cw}" y1="${y0-12}" y2="${y1+12}"/>`;
 [3,5,7,9,12,15,17].forEach(f=>{if(f<a||f>=a+N)return;const x=g.xF(f),my=(y0+y1)/2;
  if(f===12)s+=`<circle class="cin" cx="${x}" cy="${y0+sp*1.5}" r="4.5"/><circle class="cin" cx="${x}" cy="${y0+sp*3.5}" r="4.5"/>`;else s+=`<circle class="cin" cx="${x}" cy="${my}" r="4.5"/>`});
 for(let i=0;i<N;i++)s+=`<text class="cnum" x="${g.xF(a+i)}" y="${y1+32}">${a+i}</text>`;
 for(let k=0;k<6;k++)s+=`<text class="csn" x="${left-36}" y="${g.yS(k)+4}">${CLSN[k]}</text><polyline class="cs" id="cs${k}" style="stroke-width:${(3.4-k*0.45).toFixed(2)}px" points=""/>`;
 s+=`<text class="cbr" x="${xe+46}" y="${y1+32}">bridge side</text><text class="cbr" x="${left-17}" y="${y1+32}">open</text>`;
 return s;
}
function closeDyn(g,st){
 const {left}=CLK,xe=g.fretEnd,r=(n)=>n.toFixed(1);
 const strs=[0,1,2,3,4,5].map(k=>{const y=g.yS(k),v=st.strs[k];
  return v?`${left-26},${y} ${r(v.x)},${r(y+v.dy)} ${xe+14},${y}`:`${left-26},${y} ${xe+14},${y}`});
 const gh=st.ghosts.map(q=>{const y=g.yS(q.s);return `<polyline class="cgh" points="${left-26},${y} ${r(q.x)},${r(y+q.dy)} ${xe+14},${y}"/>`}).join('');
 const dots=st.dots.map(d=>{
  const tr=`transform="translate(${r(d.x)} ${r(d.y)}) scale(${r(d.sc)})" opacity="${r(d.op)}"`;
  if(d.kind==='dead')return `<g ${tr}><rect class="cflat" x="-34" y="-20" width="68" height="40" rx="20"/><circle class="cdead" r="11"/><path class="cx" d="M-5 -5L5 5M5 -5L-5 5"/></g>`;
  if(d.kind==='harm')return `<g ${tr}><rect class="charm" x="-8" y="-8" width="16" height="16" transform="rotate(45)"/></g>`;
  if(d.kind==='tap')return `<g ${tr}><rect class="ctap" x="-11" y="-11" width="22" height="22" rx="5"/><text class="cdt" y="5">T</text></g>`;
  if(d.kind==='support')return `<g ${tr}><circle class="csup" r="8"/><text class="cdt sm" y="4">${d.lab}</text></g>`;
  if(d.x<g.xF(1)-g.cw*0.6)return `<g ${tr}><circle class="copen" r="7"/></g>`;
  return `<g ${tr}><circle class="cdot" r="11"/><text class="cdt" y="5">${d.lab}</text></g>`}).join('');
 const px=xe+46;
 const pk=st.picks.map(q=>`<g transform="translate(${px} ${g.yS(q.s)})" opacity="${r(q.op)}"><path class="cpick" d="M-9 -9L9 0L-9 9Z"/></g>`).join('');
 let pm='';if(st.palms.length){const op=Math.max(...st.palms.map(q=>q.op)),ss=st.palms.map(q=>q.s),y0=g.yS(Math.max(...ss))-CLK.sp*1.3,y1=g.yS(Math.min(...ss))+CLK.sp*1.3;
  pm=`<g opacity="${r(op)}"><rect class="cpalm" x="${xe+8}" y="${r(y0)}" width="${CLK.right-12}" height="${r(y1-y0)}" rx="14"/><text class="cpt" x="${xe+8+(CLK.right-12)/2}" y="${r((y0+y1)/2+4)}">palm</text></g>`}
 return {strs,gh,dots,pk,pm};
}
function closeHTML(ev,o){
 const g=closeGeom(ev,o),bx=(o&&o.box)||g,spb=60/((o&&o.bpm)||tm.bpm),t00=Math.min(...ev.map(e=>e.t)),st=closeState(ev,t00+0.2/spb,g,spb),dy=closeDyn(g,st);tm.cl={ev,g,spb,t00};
 st.cap=tm.cl.cap0=g.chains.filter(c=>c[0].t===t00).map(c=>c.map((e,j)=>capOf(c,j,g)).join(' ')).join(' · ');
 return `<figure class="close"><svg class="closesvg" viewBox="0 0 ${g.W} ${g.H}" role="img" aria-label="Close-up of the fretting hand on the neck" preserveAspectRatio="xMinYMid meet" style="max-width:${Math.round(bx.W*1.5)}px;min-width:${bx.N>9?560:0}px;aspect-ratio:${bx.W}/${bx.H}">${closeStatic(g).replace(/id="cs(\d)" style="([^"]*)" points=""/g,(m,k,sty)=>`id="cs${k}" style="${sty}" points="${dy.strs[k]}"`)}<g class="cgg">${dy.gh}</g><g class="cdd">${dy.dots}</g><g class="cpa">${dy.pm}</g><g class="cpp">${dy.pk}</g></svg>
 <figcaption class="ccap">${escH(st.cap)}</figcaption></figure>`;
}
// Draws one moment into the close-up already on the page.
function closeDraw(ev,b,spb){
 const root=document.querySelector('#tabview .close');if(!root||!tm.cl||tm.cl.ev!==ev)return;
 const g=tm.cl.g,st=closeState(ev,b,g,spb),dy=closeDyn(g,st);
 dy.strs.forEach((p,k)=>root.querySelector('#cs'+k).setAttribute('points',p));
 root.querySelector('.cgg').innerHTML=dy.gh;root.querySelector('.cdd').innerHTML=dy.dots;root.querySelector('.cpp').innerHTML=dy.pk;root.querySelector('.cpa').innerHTML=dy.pm;
 const c=root.querySelector('.ccap');if(st.cap&&c.textContent!==st.cap)c.textContent=st.cap;
}
// ---------- Your own tab: reading a plain-text tab ----------
// parseTab() turns pasted tab text into events (the same model the lessons use). layoutTab() puts them in time and splits them into parts.
const PCL={c:0,d:2,e:4,f:5,g:7,a:9,b:11};
const labelPc=l=>{const m=/^([A-Ga-g])([#♯b♭]?)$/.exec(l||'');return m?(PCL[m[1].toLowerCase()]+(/[#♯]/.test(m[2])?1:m[2]?-1:0)+12)%12:-1};
const OPENPC=[4,9,2,7,11,4];
const EDNAMES=['E','A','D','G','B','e'];
// One line (one string) of a tab. Returns the notes with the marks that belong to them (h p / \ b pb r ~ x tr T <12>).
function lexTabLine(b,s,ln,cmap,blk,W){
 const out=[],said={};let last=null,gap=99,tap=false,i=0;
 const once=(k,msg)=>{if(!said[k]){said[k]=1;W(ln,msg)}};
 const add=(f,di,len,o,si)=>{
  if(f>24){once('hi','Fret '+f+' is higher than 24, so that note was skipped.');return null}
  const e=Object.assign({s,f,ci:si===undefined?di:si,ei:di+len-1,blk,ln,col:cmap[di]},o);
  if(tap){e.tap=1;tap=false}
  out.push(e);last=e;gap=0;return e};
 const plain=()=>last&&last.x!=='dead'&&!last.nh;
 while(i<b.length){
  if(cmap[i]==null){i++;gap++;continue}
  const c=b[i],r=b.slice(i);let m;
  if('- .*_=:|'.includes(c)){gap++;i++;continue}
  if((m=/^\((\d{1,2})\)/.exec(r))){once('tie','Notes in (parentheses) are treated as tied or ghost notes and are not played again.');i+=m[0].length;gap++;continue}
  if((m=/^<(\d{1,2})>/.exec(r))){if(!HARM[+m[1]])once('nh','A harmonic is played one octave above the open string. Only <5>, <7> and <12> are exact.');add(+m[1],i,m[0].length,{nh:1});i+=m[0].length;continue}
  if((m=/^\[(\d{1,2})\]/.exec(r))){once('ah','Notes in [brackets] (artificial harmonics) are played as normal notes.');add(+m[1],i,m[0].length);i+=m[0].length;continue}
  if((m=/^tr(\d{1,2})/.exec(r))){if(last&&plain()){last.tr=1;last.f2=+m[1];last.ei=i+m[0].length-1;gap=0}else once('tr','A trill (tr) needs a normal note before it.');i+=m[0].length;continue}
  if(/^[tT]\d/.test(r)){tap=true;i++;continue}
  if((m=/^pb(\d{1,2})/.exec(r))||(m=/^[b^](\d{1,2})?/.exec(r))){
   const pre=/^pb/.test(m[0]),d=m[1]?+m[1]-(last?last.f:0):2;
   if(!plain())once('nobend','A bend (b) needs a normal note before it.');
   else if(last.bend||last.pb)once('bend2','Only one bend per note is supported.');
   else{const dd=d>=1&&d<=3?d:2;if(m[1]&&dd!==d)once('bendsz','A bend of '+d+' frets is not supported, so it is played as a full step.');
    if(pre)last.pb=dd;else last.bend=dd;last.ei=i+m[0].length-1;gap=0}
   i+=m[0].length;continue}
  if((m=/^r(?:\(\d{1,2}\)|\d{1,2})?/.exec(r))){
   if(last&&(last.bend||last.pb)){last.rel=1;last.ei=i+m[0].length-1;gap=0}else once('rel','A release (r) needs a bend before it.');
   i+=m[0].length;continue}
  if((m=/^~+/.exec(r))){if(last&&plain()){last.vib=m[0].length>=4?2:1;last.ei=i+m[0].length-1;gap=0}else once('vib','Vibrato (~) needs a normal note before it.');i+=m[0].length;continue}
  if((m=/^([hp])(\d{1,2})/.exec(r))){
   if(plain()){let x=m[1];const f2=+m[2];
    if(x==='h'&&f2<last.f){once('hp','A hammer-on goes up in pitch, so “h” to a lower fret was read as a pull-off.');x='p'}
    else if(x==='p'&&f2>last.f){once('hp','A pull-off goes down in pitch, so “p” to a higher fret was read as a hammer-on.');x='h'}
    if(f2===last.f)once('same','A hammer-on or pull-off to the same fret does nothing.');
    add(f2,i+1,m[2].length,{x},i)}
   else{once('lnk','“'+m[1]+'” needs a normal note before it. It was read as a plain note.');add(+m[2],i+1,m[2].length,{},i)}
   i+=m[0].length;continue}
  if((m=/^([\/\\sS])(\d{1,2})?/.exec(r))){
   if(m[2]!==undefined){const f2=+m[2];
    if(plain()&&gap===0&&!last.tap||(plain()&&gap===0)){
     if(f2===last.f){once('same','A slide to the same fret does nothing.');add(f2,i+1,m[2].length,{},i)}
     else add(f2,i+1,m[2].length,{x:f2>last.f?'/':'\\'},i)}
    else add(f2,i+1,m[2].length,{x:'slin'},i)}
   else if(plain()&&gap===0&&!last.x&&!last.tr){last.x='slout';last.ei=i;gap=0}
   else once('sl','A slide mark (/ or \\) needs a fret number after it, or a plain note right before it.');
   i+=m[0].length;continue}
  if(c==='x'||c==='X'){add(0,i,1,{x:'dead'});i++;continue}
  if((m=/^\d{1,2}/.exec(r))){add(+m[0],i,m[0].length);i+=m[0].length;continue}
  once('sym'+c,'The symbol “'+c+'” is not supported, so it was skipped.');i++;gap++;
 }
 return out;
}
function parseTab(text){
 const P={warn:[],blocks:[],events:[],chains:[],barCols:[0],ncols:0,cols:[],tuning:[0,0,0,0,0,0],tuned:false,bpm:null,unit:null,ok:false};
 const W=(ln,msg)=>P.warn.push({line:ln+1,msg});
 // typographic dashes become '-', and a tab pasted with its line breaks lost (…|B|-…) is cut back into lines
 const raw=String(text||'').replace(/\r\n?/g,'\n').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\t/g,'    ').replace(/\|(?:[ ]*\b(?:or|and)\b)?[ ]*(?=[A-Ga-g][#♯b♭]?\|[-0-9xX(<\[~])/g,'|\n').split('\n');
 const isTab=l=>/^\s*(?:[A-Ga-g][#♯b♭]?\s*)?[|:]/.test(l)&&(l.match(/-/g)||[]).length>=3;
 const groups=[],pmLines=[];let cur=null;
 raw.forEach((l,i)=>{
  if(isTab(l)){if(!cur){cur={at:i,lines:[]};groups.push(cur)}cur.lines.push(l);return}
  cur=null;let m;
  if((m=/(\d{2,3})\s*bpm|\b(?:bpm|tempo)\s*[:=]?\s*(\d{2,3})\b/i.exec(l)))P.bpm=Math.max(30,Math.min(240,+(m[1]||m[2])));
  if((m=/\b(?:rhythm|grid|dash(?:es)?)\b[^0-9a-z]{0,6}(1\/4|1\/8|1\/16|quarter|eighth|sixteenth|triplet)/i.exec(l)))P.unit={'1/4':1,quarter:1,'1/8':0.5,eighth:0.5,'1/16':0.25,sixteenth:0.25,triplet:1/3}[m[1].toLowerCase()];
  if(/^[\sPM.\-|]+$/.test(l)&&/P\.?M/.test(l))pmLines.push({i,l});
 });
 let off=0;
 groups.forEach(g=>{
  if(g.lines.length%6)W(g.at,'Found '+g.lines.length+' tab lines in a row. A tab needs 6 (one per string), so the last '+g.lines.length%6+' were ignored.');
  for(let k=0;k<Math.floor(g.lines.length/6);k++){
   const lines=g.lines.slice(k*6,k*6+6),first=g.at+k*6,blk=P.blocks.length;
   const pre=lines.map(l=>/^(\s*)([A-Ga-g][#♯b♭]?)?\s*([|:])/.exec(l));
   const labels=pre.map(m=>m[2]||''),w0=lines.map((l,j)=>l.slice(pre[j][0].length).replace(/\s+$/,''));
   const w=Math.max(...w0.map(b=>b.length)),body=w0.map(b=>b.padEnd(w,'-'));
   const rev=labels[0]==='E'&&labels[5]==='e',sOf=j=>rev?j:5-j;
   if(labels.every(l=>labelPc(l)>=0)){
    const t=[0,0,0,0,0,0];labels.forEach((l,j)=>{const s=sOf(j);t[s]=((labelPc(l)-OPENPC[s]+18)%12)-6});
    if(!blk){P.tuning=t;P.tuned=t.some(Boolean)}else if(t.join()!==P.tuning.join())W(first,'This staff has different string names than the first one. The first tuning is used.');
   }
   if(blk>0)P.barCols.push(off);
   const isBar=Array.from({length:w},(_,i)=>body.every(b=>b[i]==='|')),cmap=[];let c=0;
   for(let i=0;i<w;i++){
    if(isBar[i]){cmap.push(null);if(i>0&&!isBar[i-1])P.barCols.push(off+c)}
    else{cmap.push(off+c);P.cols.push({b:blk,i});c++}
   }
   const before=P.events.length;
   body.forEach((b,j)=>lexTabLine(b,sOf(j),first+j,cmap,blk,W).forEach(e=>P.events.push(e)));
   const mine=P.events.slice(before);
   mine.forEach(e=>{let q=e.ei;while(q>e.ci&&cmap[q]==null)q--;e.col2=cmap[q]==null?e.col:cmap[q]});
   // a "P.M.---|" line just above the tab marks palm-muted notes
   pmLines.filter(p=>p.i<first&&p.i>=first-3).forEach(p=>{
    const pl=pre[0][0].length,re=/P\.?M\.?-*\|?/g;let m;
    while((m=re.exec(p.l))){const a=m.index-pl,z=m.index+m[0].length-1-pl;mine.forEach(e=>{if(e.ci>=a&&e.ci<=z)e.pm=1})}
   });
   P.blocks.push({labels:labels.map((l,j)=>l||EDNAMES[sOf(j)]),body,cmap,off,w,first});
   off+=c;
  }
 });
 P.ncols=off;
 // notes of one string form a chain when they are joined by h, p or a slide (they ring as one string and only change pitch)
 const by={};P.events.forEach(e=>{(by[e.blk+':'+e.s]=by[e.blk+':'+e.s]||[]).push(e)});
 const chains=[];
 Object.values(by).forEach(list=>{list.sort((a,b)=>a.col-b.col||a.ci-b.ci);let ch=null;
  list.forEach(e=>{if(ch&&LEG.includes(e.x))ch.push(e);else{ch=[e];chains.push(ch)}})});
 chains.sort((a,b)=>a[0].col-b[0].col||a[0].s-b[0].s);
 P.chains=chains;P.events=chains.flat();P.ok=P.events.length>0;
 return P;
}
// Puts the notes in time. unit = beats per dash. mode 'cols' follows the spacing, 'even' gives every note the same length.
function layoutTab(P,o){
 o=o||{};const unit=o.unit||0.5,even=o.mode==='even',gapMin=o.gap||3;
 let slotCol,tOf,len;
 if(even){slotCol=[...new Set(P.events.map(e=>e.col))].sort((a,b)=>a-b);const ix=new Map(slotCol.map((c,k)=>[c,k]));tOf=c=>ix.get(c)*unit;len=slotCol.length*unit}
 else{slotCol=Array.from({length:P.ncols},(_,c)=>c);tOf=c=>c*unit;len=P.ncols*unit}
 const ev=P.events.map(e=>Object.assign({},e,{t:tOf(e.col)}));
 const per={};ev.forEach(e=>(per[e.s]=per[e.s]||[]).push(e));
 Object.values(per).forEach(l=>{l.sort((a,b)=>a.t-b.t);l.forEach((e,i)=>{const nx=l[i+1];e.d=Math.max(unit,Math.min(4,nx?nx.t-e.t:Math.max(unit,Math.min(2,len-e.t))))})});
 const chains=chainsOf(ev);
 const bars=[...new Set(P.barCols.filter(c=>c<P.ncols))].sort((a,b)=>a-b);
 const staffs=P.blocks.map(b=>b.off).filter(c=>c<P.ncols),split=!o.split||o.split==='auto'?(staffs.length>1?'lines':bars.length>1?'bars':'gaps'):o.split;
 let bounds=[0];
 if(split==='lines')bounds=staffs.length?staffs:[0];
 else if(split==='bars')bounds=bars.length?bars:[0];
 else if(split==='gaps'){
  const occ=new Uint8Array(P.ncols+1);ev.forEach(e=>{for(let c=e.col;c<=e.col2;c++)occ[c]=1});
  let prev=-1;for(let c=0;c<P.ncols;c++)if(occ[c]){if(prev>=0&&c-prev-1>=gapMin)bounds.push(c);prev=c}
 }
 const parts=bounds.map(()=>[]);
 chains.forEach(ch=>{let k=0;bounds.forEach((b,i)=>{if(ch[0].col>=b)k=i});parts[k].push(ch)});
 const out=parts.filter(p=>p.length).map(p=>{const evs=p.flat();
  return{ev:evs,chains:p,t0:Math.min(...p.map(c=>c[0].t)),t1:Math.max(...evs.map(e=>e.t+Math.min(e.d,2))),c0:Math.min(...evs.map(e=>e.col)),c1:Math.max(...evs.map(e=>e.col2))}});
 out.forEach((p,i)=>p.i=i);
 const slotT=slotCol.map((c,k)=>even?k*unit:c*unit);
 const slotAt=beat=>{let lo=0,hi=slotT.length-1,r=-1;while(lo<=hi){const m=(lo+hi)>>1;if(slotT[m]<=beat+1e-9){r=m;lo=m+1}else hi=m-1}return r};
 const timeOfCol=c=>even?(slotCol.filter(x=>x<=c).length-1)*unit:c*unit;
 return{ev,chains,parts:out,len,unit,split,slotCol,slotT,slotAt,timeOfCol};
}
// What the fretting hand does, move by move, for one part.
function partSteps(part){
 const g=closeGeom(part.ev,{names:true}),rows=[];
 g.chains.forEach(ch=>ch.forEach((e,j)=>rows.push({t:e.t,s:e.s,txt:capOf(ch,j,g)})));
 rows.sort((a,b)=>a.t-b.t||a.s-b.s);
 const out=[];rows.forEach(r=>{const l=out[out.length-1];if(l&&Math.abs(l.t-r.t)<1e-6)l.txt.push(r.txt);else out.push({t:r.t,txt:[r.txt]})});
 return out;
}
const withMT=(ev,tun)=>ev.map(e=>{const o=MID.map((m,s)=>m+((tun&&tun[s])||0));
 return Object.assign({},e,{m:e.x==='dead'?o[e.s]+2:e.nh?o[e.s]+(HARM[e.f]||12):o[e.s]+e.f,m2:e.f2!==undefined?o[e.s]+e.f2:undefined})});
// ---------- Scales ----------
// iv = frets above the root, d = degree labels, core = notes that define the boxes (blues = minor pentatonic + blue note).
const SCALES={
 major:{n:'Major',iv:[0,2,4,5,7,9,11],d:['R','2','3','4','5','6','7'],t:'The “do-re-mi” scale: bright, happy and the reference point for most Western music.'},
 minor:{n:'Natural minor',iv:[0,2,3,5,7,8,10],d:['R','2','♭3','4','5','♭6','♭7'],t:'The everyday minor scale. Darker and more serious than major, with a flat 3rd, 6th and 7th.'},
 majpent:{n:'Major pentatonic',iv:[0,2,4,7,9],d:['R','2','3','5','6'],on:['maj','6','maj7','sus2'],t:'Five notes and no half steps, so almost nothing sounds wrong. Sweet and open, great for country, pop and rock solos.'},
 minpent:{n:'Minor pentatonic',iv:[0,3,5,7,10],d:['R','♭3','4','5','♭7'],on:['min','m7','7','5'],t:'The classic first solo scale: five notes, easy to grip, and at home in blues, rock and metal.'},
 blues:{n:'Blues',iv:[0,3,5,6,7,10],core:[0,3,5,7,10],d:['R','♭3','4','♭5','5','♭7'],on:['7','min','m7','5'],t:'The minor pentatonic plus one “blue note” (♭5) that adds grit. Slide or bend through it.'},
 dorian:{n:'Dorian',iv:[0,2,3,5,7,9,10],d:['R','2','♭3','4','5','6','♭7'],t:'A minor scale with a raised 6th. Smooth, funky and jazzy.'},
 phrygian:{n:'Phrygian',iv:[0,1,3,5,7,8,10],d:['R','♭2','♭3','4','5','♭6','♭7'],t:'A minor scale with a flat 2nd. Dark and Spanish-sounding, common in flamenco and metal.'},
 lydian:{n:'Lydian',iv:[0,2,4,6,7,9,11],d:['R','2','3','♯4','5','6','7'],t:'A major scale with a raised 4th. Dreamy and floating.'},
 mixolydian:{n:'Mixolydian',iv:[0,2,4,5,7,9,10],d:['R','2','3','4','5','6','♭7'],t:'A major scale with a flat 7th. Relaxed and bluesy, the sound of dominant 7th chords and classic rock.'},
 locrian:{n:'Locrian',iv:[0,1,3,5,6,8,10],d:['R','♭2','♭3','4','♭5','♭6','♭7'],t:'The unstable one: flat 2nd and flat 5th. Rarely used as a home key.'},
 harmonic:{n:'Harmonic minor',iv:[0,2,3,5,7,8,11],d:['R','2','♭3','4','5','♭6','7'],t:'Natural minor with a raised 7th. Dramatic, with a classical and Middle Eastern flavour.'},
 melodic:{n:'Melodic minor',iv:[0,2,3,5,7,9,11],d:['R','2','♭3','4','5','6','7'],t:'A minor scale with a raised 6th and 7th, like a major scale with a flat 3rd. Smooth and jazzy.'}};
// Spell notes the way a musician would: flats or sharps follow the parent major key (D dorian uses C major's notes, and so on).
const PARENT={major:0,minor:3,majpent:0,minpent:3,blues:3,dorian:10,phrygian:8,lydian:7,mixolydian:5,locrian:1,harmonic:3,melodic:3};
const sFl=()=>flatR((st.r+PARENT[st.sc])%12);
const SGROUPS=[['Essentials',['major','minor','majpent','minpent','blues']],['Modes',['dorian','phrygian','lydian','mixolydian','locrian']],['More minor scales',['harmonic','melodic']]];
// Positions ("boxes"): 2 notes per string for 5-note scales, 3 for 7-note scales. Box 1 starts on the root on the low E string;
// each next string starts on the first scale note above the last note of the string before. The shape repeats 12 frets higher.
let _pk='',_pv=[];
function positions(){
 const k=st.r+'|'+st.sc;if(k===_pk)return _pv;
 const S=SCALES[st.sc],cv=S.core||S.iv,core=cv.map(x=>(st.r+x)%12),per=cv.length>5?3:2;
 const ext=S.core?S.iv.filter(x=>!S.core.includes(x)).map(x=>(st.r+x)%12):[];
 const L=[0,1,2,3,4,5].map(i=>{const a=[];for(let f=0;f<=30;f++)if(core.includes(pcOf(i,f)))a.push(f);return a});
 const j0=L[0].findIndex(f=>pcOf(0,f)===st.r);
 _pv=core.map((_,n)=>{
  let box=[],prev=-1;
  for(let i=0;i<6;i++){
   const pk=i?L[i].filter(f=>MID[i]+f>prev).slice(0,per):L[0].slice(j0+n,j0+n+per);
   pk.forEach(f=>box.push([i,f]));prev=MID[i]+pk[pk.length-1];
  }
  const sh=Math.min(...box.map(b=>b[1]))>=12?12:0;box=box.map(([i,f])=>[i,f-sh]);
  const lo=Math.min(...box.map(b=>b[1])),hi=Math.max(...box.map(b=>b[1]));
  for(let i=0;i<6;i++)for(let f=lo;f<=hi;f++)if(ext.includes(pcOf(i,f)))box.push([i,f]);
  const set=new Set();box.forEach(([i,f])=>[-12,0,12].forEach(o=>{if(f+o>=0&&f+o<=NF)set.add(i+':'+(f+o))}));
  return{box,set};
 });
 _pk=k;return _pv;
}
// What the fretboard draws: which pitch classes, which dots are "bright", and what the labels say.
function chordCtx(v){return{set:F[st.q].map(x=>(st.r+x)%12),inV:(i,f)=>v.fr[i]===f&&f>=0,
 label:(i,pc,inV)=>inV&&st.mode==='fingers'?(v.fg[i]||''):st.mode==='intervals'?ivq(st.q,(pc-st.r+12)%12):nm(pc,flatR(st.r))}}
function scaleCtx(){const S=SCALES[st.sc],pos=st.pos?positions()[st.pos-1].set:null;
 return{set:S.iv.map(x=>(st.r+x)%12),inV:(i,f)=>!pos||pos.has(i+':'+f),
 label:(i,pc)=>st.mode==='intervals'?S.d[S.iv.indexOf((pc-st.r+12)%12)]:nm(pc,sFl())}}
function diagram(v){
 // Vertical (classic chord box) or, when st.rot is on, horizontal like the neck seen from the player's seat:
 // nut on the left, frets running right, thickest string at the bottom.
 const H=st.rot,rows=5,start=v.base>0?v.base:1,sd=28,fd=H?44:34,X0=H?54:44,Y0=H?36:62;
 const P=(i,r)=>H?[X0+r*fd,Y0+(5-i)*sd]:[X0+i*sd,Y0+r*fd]; // string i, fret-space coordinate r
 const L=(a,b,w)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke-width="${w}"/>`;
 const M=(i,d)=>{const p=P(i,0);return H?[p[0]-d,p[1]]:[p[0],p[1]-d]}; // spot for x / open markers
 let s=`<svg viewBox="0 0 ${H?290:240} ${H?190:242}" class="dg${H?' h':''}" role="img" aria-label="Chord diagram">`;
 for(let j=0;j<=rows;j++)s+=L(P(0,j),P(5,j),j===0&&start===1?5:1.2);
 for(let i=0;i<6;i++)s+=L(P(i,0),P(i,rows),1+(5-i)*.25);
 for(let r=0;r<rows;r++){
  const f=start+r;
  (f===12?[1.5,3.5]:[3,5,7,9,15].includes(f)?[2.5]:[]).forEach(k=>{const c=P(k,r+.5);s+=`<circle class="mk" cx="${c[0]}" cy="${c[1]}" r="6"/>`});
  const q=P(5,r+.5),n=H?[q[0],q[1]-12]:[q[0]+18,q[1]+5];
  s+=`<text class="num" x="${n[0]}" y="${n[1]}">${f}</text>`;
 }
 for(let n=1;n<=4;n++){const b=v.fg.map((g,i)=>g===n?i:-1).filter(i=>i>=0);
  if(b.length>1){const row=v.fr[b[0]]-start,a=P(b[0],row+.5),z=P(b[b.length-1],row+.5);
   s+=`<rect class="bar" x="${Math.min(a[0],z[0])-13}" y="${Math.min(a[1],z[1])-13}" width="${Math.abs(a[0]-z[0])+26}" height="${Math.abs(a[1]-z[1])+26}" rx="13"/>`}}
 v.fr.forEach((f,i)=>{
  if(f<0){const c=M(i,26);s+=`<text class="t" x="${c[0]}" y="${c[1]+5}">×</text>`;return}
  const isR=pcOf(i,f)===st.r;
  if(f===0){const c=M(i,26);
   if(st.mode==='fingers')s+=`<circle class="ring" data-midi="${MID[i]}" tabindex="0" cx="${c[0]}" cy="${c[1]}" r="7"/>`;
   else s+=`<circle class="dot${isR?' r':''}" data-midi="${MID[i]}" tabindex="0" cx="${c[0]}" cy="${c[1]}" r="12"/><text class="dt" x="${c[0]}" y="${c[1]+5}">${lab(i,0,0)}</text>`;
   return}
  const c=P(i,f-start+.5);
  s+=`<circle class="dot${isR&&st.mode!=='fingers'?' r':''}" data-midi="${MID[i]+f}" tabindex="0" cx="${c[0]}" cy="${c[1]}" r="13"/><text class="dt" x="${c[0]}" y="${c[1]+5}">${lab(i,f,v.fg[i])}</text>`;
 });
 return s+'</svg>';
}
function neck(v){
 const fw=56,x0=44,top=36,sy=34,W=x0+NF*fw+10,H=top+5*sy+40,NS=st.view==='scale'?scaleCtx():chordCtx(v),set=NS.set;
 let s=`<svg viewBox="0 0 ${W} ${H}" class="neck" role="img" aria-label="Fretboard"><rect class="board" x="${x0}" y="${top-14}" width="${NF*fw}" height="${5*sy+28}" rx="8"/>`;
 for(let f=0;f<=NF;f++)s+=`<line class="${f?'f':'nut'}" x1="${x0+f*fw}" x2="${x0+f*fw}" y1="${top}" y2="${top+5*sy}"/>`;
 for(let r=0;r<6;r++)s+=`<line class="s" x1="${x0}" x2="${x0+NF*fw}" y1="${top+r*sy}" y2="${top+r*sy}" stroke-width="${1+r*.4}"/>`;
 [3,5,7,9,15].forEach(f=>s+=`<circle class="mk" cx="${x0+(f-.5)*fw}" cy="${top+5*sy+26}" r="4"/>`);
 s+=`<circle class="mk" cx="${x0+11.5*fw-8}" cy="${top+5*sy+26}" r="4"/><circle class="mk" cx="${x0+11.5*fw+8}" cy="${top+5*sy+26}" r="4"/>`;
 for(let f=1;f<=NF;f++)s+=`<text class="num" x="${x0+(f-.5)*fw}" y="${top-22}">${f}</text>`;
 for(let i=0;i<6;i++){const y=top+(5-i)*sy;
  for(let f=0;f<=NF;f++){const pc=pcOf(i,f);if(!set.includes(pc))continue;
   const cx=f?x0+(f-.5)*fw:x0-16,inV=NS.inV(i,f),isR=pc===st.r;
   const L=NS.label(i,pc,inV);
   s+=`<g class="nd${inV?' vv':''}">${inV?`<circle class="pulse" cx="${cx}" cy="${y}" r="14"/>`:''}<circle class="n${isR?' r':''}${inV?' v':''}" data-midi="${MID[i]+f}" tabindex="0" cx="${cx}" cy="${y}" r="14"/><text x="${cx}" y="${y+4.5}">${L}</text></g>`;}}
 return s+'</svg>';
}
function theory(){
 const fl=flatR(st.r),notes=F[st.q].map(x=>(st.r+x)%12);
 return `<p>${DESC[st.q]}</p><p>Formula (frets above the root): <b>${F[st.q].join(' · ')}</b>. Notes in <b>${nm(st.r,fl)}${SUF[st.q]}</b>:</p>`+
 notes.map((p,i)=>`<span class="chip${i?'':' r'}"><b>${nm(p,fl)}</b> <small>${ivq(st.q,(p-st.r+12)%12)}</small></span>`).join('')+
 `<p style="color:var(--mut);font-size:.9rem">The small label under each note says how it relates to the root: R is the root, 3 is the third, 5 is the fifth, ♭ means lowered by one fret. The 3rd decides major or minor; the 2nd, 4th, 6th and 7th add colour.</p>`;
}
function fits(){
 const sev=SEV.includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,out=[];
 for(let k=0;k<12;k++)for(let d=0;d<7;d++)if((k+DEG[d])%12===st.r&&L[d]===st.q)out.push(`<span class="chip"><b>${nm(k,flatR(k))} major</b>: ${R[d]}</span>`);
 const nme=nm(st.r,flatR(st.r))+SUF[st.q];
 if(!out.length&&NOKEY[st.q])return `<p><b>${nme}</b>: ${NOKEY[st.q]}</p>`;
 return `<p><b>${nme}</b> is a natural fit in these major keys (with its position in the key):</p>${out.join('')}`;
}
function keyrow(){
 const sev=SEV.includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,k=st.r,fl=flatR(k);
 $('keytitle').textContent=`The ${sev?'7th chords':'chords'} of ${nm(k,fl)} major:`;
 return L.map((q,d)=>{const r=(k+DEG[d])%12,ok=F[q],cur=r===st.r&&q===st.q;
  const name=nm(r,fl)+(q==='dim'?'°':q==='m7b5'?'m7♭5':SUF[q]);
  return `<button ${ok?`data-r="${r}" data-q="${q}"`:'disabled title="Not covered by this app yet"'} aria-pressed="${cur}">${name}<small>${R[d]}</small></button>`}).join('');
}
// ---------- Scale view ----------
const MAJ=[0,2,4,5,7,9,11],RM=['I','II','III','IV','V','VI','VII'];
const ODD={'0,3,6':'dim','0,4,8':'aug','0,3,6,10':'m7♭5','0,3,6,9':'dim7','0,3,7,11':'m(maj7)','0,4,8,11':'maj7♯5'};
function scaleChords(seven){ // chords made by stacking thirds on each note of a 7-note scale
 const iv=SCALES[st.sc].iv,fl=sFl();
 return iv.map((x,k)=>{
  const at=j=>(iv[(k+j)%7]-x+12)%12,a=[0,at(2),at(4)];if(seven)a.push(at(6));
  const key=a.join(','),q=['maj','min','7','maj7','m7','dim','aug','m7b5','dim7','mmaj7'].find(c=>F[c].join(',')===key),r=(st.r+x)%12;
  const suf=q!==undefined?SUF[q]:(ODD[key]||'?'),d=x-MAJ[k],acc=d===-1?'♭':d===1?'♯':'';
  const rn=acc+(a[1]===3?RM[k].toLowerCase():RM[k])+(seven?suf:suf==='dim'?'°':suf==='aug'?'+':'');
  return{r,q,name:nm(r,fl)+suf,rn};
 });
}
function scaleNotes(){ // ascending MIDI notes to play
 const S=SCALES[st.sc];
 if(st.pos)return[...new Set(positions()[st.pos-1].box.map(([i,f])=>MID[i]+f))].sort((a,b)=>a-b);
 const root=MID[0]+(st.r-4+12)%12;return[...S.iv.map(x=>root+x),root+12];
}
function flashMidi(seq,gap){ // ripple the dots in the order they sound; dots never move
 const g=[...document.querySelectorAll('.nd.vv')];
 g.forEach(e=>e.classList.remove('play'));void document.body.offsetWidth;
 seq.forEach((m,k)=>g.filter(e=>+e.querySelector('.n').dataset.midi===m).forEach(e=>{e.style.setProperty('--d',(k*gap)+'s');e.classList.add('play')}));
}
function playScale(desc){const ms=scaleNotes(),seq=desc?ms.slice().reverse():ms;seq.forEach((m,k)=>Sound.note(m,k*.28));flashMidi(seq,.28)}
function renderScale(){
 const S=SCALES[st.sc],fl=sFl(),P=positions(),n=S.iv.length;
 $('sname').innerHTML=nm(st.r,fl)+'<small>'+S.n+' scale</small>';$('sdesc').textContent=S.t;
 $('snotes').innerHTML=S.iv.map((x,i)=>`<span class="chip${i?'':' r'}"><b>${nm((st.r+x)%12,fl)}</b> <small>${S.d[i]}</small></span>`).join('');
 const steps=S.iv.map((x,i)=>(S.iv[i+1]??12)-x);
 $('sform').innerHTML=`<p>${n} notes. Steps between them, in frets: <b>${steps.join(' · ')}</b> (${steps.map(s=>s===1?'H':s===2?'W':'W+H').join(' ')}), where W is a whole step (2 frets) and H a half step (1 fret).</p>`+
  `<p>A <b>position</b> (or “box”) is a handful of notes you can play without moving your hand. This scale has ${P.length} of them and together they cover the whole neck. Position 1 starts on the root on the low E string, and every box repeats 12 frets higher.</p>`;
 if(st.pos){const b=P[st.pos-1].box[0],pc=pcOf(0,b[1]);
  const dg=S.d[S.iv.indexOf((pc-st.r+12)%12)];
  $('spos').textContent=`Position ${st.pos} of ${P.length}: it starts on ${dg==='R'?'the root':'the '+dg} (${nm(pc,fl)}) on the low E string. Faded dots are the rest of the scale.`}
 else $('spos').textContent='Showing every note of the scale. Pick a position in the sidebar to focus on one box.';
 $('positions').innerHTML=['All',...P.map((_,i)=>i+1)].map((l,i)=>`<button data-pos="${i}" aria-pressed="${i===st.pos}">${l}</button>`).join('');
 document.querySelectorAll('#scales button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sc===st.sc));
 const btn=c=>`<button ${c.q?`data-r="${c.r}" data-q="${c.q}" data-view="chord"`:'disabled title="Not covered by this app yet"'}>${c.name}<small>${c.rn}</small></button>`;
 $('schords').innerHTML=n===7
  ?`<p>Stack every other note of the scale to get one chord per note. Tap a chord to see it.</p><p class="hint">Triads</p><div class="keyrow">${scaleChords(false).map(btn).join('')}</div><p class="hint">7th chords</p><div class="keyrow">${scaleChords(true).map(btn).join('')}</div>`
  :`<p>${S.n} is usually played over chords on the same root. Tap one to see it.</p><div class="keyrow">${S.on.map(q=>btn({r:st.r,q,name:nm(st.r,fl)+SUF[q],rn:LONG[q]})).join('')}</div>`;
}
// ---------- Progression player ----------
// A progression is a list of slots {off, q}: semitones above the key's tonic + chord type, so changing the key transposes it.
const PRESETS=[
 {n:'Pop: I–V–vi–IV',mode:'major',s:[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']]},
 {n:'Classic: I–vi–IV–V',mode:'major',s:[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']]},
 {n:'Three chords: I–IV–V–I',mode:'major',s:[[0,'maj'],[5,'maj'],[7,'maj'],[0,'maj']]},
 {n:'Canon: I–V–vi–iii–IV–I–IV–V',mode:'major',s:[[0,'maj'],[7,'maj'],[9,'min'],[4,'min'],[5,'maj'],[0,'maj'],[5,'maj'],[7,'maj']]},
 {n:'Jazz: ii–V–I',mode:'major',s:[[2,'m7'],[7,'7'],[0,'maj7']]},
 {n:'12-bar blues',mode:'major',s:[[0,'7'],[0,'7'],[0,'7'],[0,'7'],[5,'7'],[5,'7'],[0,'7'],[0,'7'],[7,'7'],[5,'7'],[0,'7'],[7,'7']]},
 {n:'Minor: i–VI–III–VII',mode:'minor',s:[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']]},
 {n:'Andalusian: i–VII–VI–V',mode:'minor',s:[[0,'min'],[10,'maj'],[8,'maj'],[7,'maj']]}];
const RNT={ // Roman numeral base per semitone offset, for a major or a minor key
 major:[['','I'],['♭','II'],['','II'],['♭','III'],['','III'],['','IV'],['♯','IV'],['','V'],['♭','VI'],['','VI'],['♭','VII'],['','VII']],
 minor:[['','I'],['♭','II'],['','II'],['','III'],['♯','III'],['','IV'],['♯','IV'],['','V'],['','VI'],['♯','VI'],['','VII'],['♯','VII']]};
const pr={key:7,mode:'major',flavor:'triad',slots:[],bpm:90,beats:4,style:'once',loop:true,click:true,playing:false,sel:0,cur:-1,vo:[],started:false};
const pFl=()=>flatR((pr.key+(pr.mode==='minor'?3:0))%12); // spell notes by the key signature
const pRoman=(off,q)=>{const[a,n]=RNT[pr.mode][off];return a+(['min','m7','m6'].includes(q)?n.toLowerCase():n)+(q==='maj'||q==='min'?'':SUF[q])};
const pChord=s=>{const r=(pr.key+s.off)%12;return{r,name:nm(r,pFl())+SUF[s.q],rn:pRoman(s.off,s.q)}};
function pPalette(){ // chords you can add: the key's own chords (triads or 7ths), or the three dominant 7ths for blues
 const fl=pFl(),mk=(off,q)=>({off,q,name:nm((pr.key+off)%12,fl)+SUF[q],rn:pRoman(off,q)});
 if(pr.flavor==='dom')return[0,5,7].map(o=>mk(o,'7'));
 const iv=SCALES[pr.mode].iv,seven=pr.flavor==='seventh';
 return iv.map((x,k)=>{
  const at=j=>(iv[(k+j)%7]-x+12)%12,a=[0,at(2),at(4)];if(seven)a.push(at(6));
  const key=a.join(','),q=['maj','min','7','maj7','m7'].find(c=>F[c].join(',')===key);
  return q?mk(x,q):{off:x,q:null,name:nm((pr.key+x)%12,fl)+(ODD[key]||'?'),rn:RNT[pr.mode][x][1].toLowerCase()+(seven?'ø':'°')};
 });
}
// Pick a CAGED shape for every chord so the hand moves as little as possible; the first chord prefers open position.
function pVoicings(){let prev=null;return pr.slots.map(s=>{
 const r=(pr.key+s.off)%12;let best=null;
 const ok=[...'CAGED'].filter(sh=>shapeOK(r,s.q,sh));
 for(const sh of ok.length?ok:[...'CAGED']){const v=voice(r,s.q,sh),sc=prev===null?v.base:Math.abs(v.base-prev)+v.base*.01;if(!best||sc<best.sc)best={r,q:s.q,sh,v,sc}}
 prev=best.v.base;return best})}
const pRefresh=()=>{pr.vo=pVoicings()};
function applySlot(i){const o=pr.vo[i];if(!o)return;st.r=o.r;st.q=o.q;st.sh=o.sh;pr.cur=i}
function showSlot(i){applySlot(i);render();flash(0.035)}
function pEdited(){pRefresh();if(pr.slots.length){pr.sel=Math.min(pr.sel,pr.slots.length-1);if(!pr.playing)applySlot(pr.sel)}render()}
function pLoad(i){const p=PRESETS[i];pStop();pr.mode=p.mode;pr.slots=p.s.map(([off,q])=>({off,q}));pr.sel=0;pEdited()}
function pAdd(off,q){if(pr.slots.length>=16)return;pr.slots.push({off,q});pr.sel=pr.slots.length-1;pEdited();if(!pr.playing){Sound.strum(chordMidi(),0.045);flash(0.045)}}
function pDel(){if(!pr.slots.length)return;pr.slots.splice(pr.sel,1);pr.sel=Math.max(0,pr.sel-1);pEdited()}
function pEnter(){if(!pr.started){pr.started=true;pr.key=st.r;pLoad(0)}else{pRefresh();applySlot(pr.sel)}}
// Scheduler: a short timer looks ~0.2 s ahead and books notes on the audio clock, so timing stays steady even if the page is busy.
let pTimer=null,pNext=0,pBeat=0,pTos=[];
function pStop(){clearInterval(pTimer);pTimer=null;pTos.forEach(clearTimeout);pTos=[];if(pr.playing){pr.playing=false;pr.cur=-1;if(st.view==='prog')renderProg()}}
function pStart(){if(!pr.slots.length)return;pStop();pr.playing=true;pBeat=0;pRefresh();pNext=Sound.now()+0.1;pTimer=setInterval(pTick,25);pTick();renderProg()}
function pTick(){
 while(pNext<Sound.now()+0.2){
  if(!pr.loop&&pBeat>=pr.slots.length*pr.beats){clearInterval(pTimer);pTimer=null;pTos.push(setTimeout(pStop,Math.max(0,(pNext-Sound.now())*1000)+50));return}
  pSchedule(pBeat,pNext);pNext+=60/pr.bpm;pBeat++;
 }
}
function pSchedule(n,t){
 const idx=Math.floor(n/pr.beats)%pr.slots.length,beat=n%pr.beats,o=pr.vo[idx];if(!o)return;
 const mid=o.v.fr.map((f,i)=>f<0?null:MID[i]+f).filter(m=>m!==null),spb=60/pr.bpm;
 if(pr.click)Sound.tick(t,beat===0);
 if(pr.style==='arp'){const seq=[...mid,...mid.slice(1,-1).reverse()];for(let h=0;h<2;h++)Sound.noteAt(seq[(beat*2+h)%seq.length],t+h*spb/2,h?.7:.9)}
 else if(pr.style==='beat'||beat===0)Sound.strumAt(mid,t,.03,beat===0?1:.75);
 pTos.push(setTimeout(()=>{if(!pr.playing)return;if(beat===0){pr.sel=idx;applySlot(idx);render();flash(0.03)}paintBeat(beat)},Math.max(0,(t-Sound.now())*1000)));
}
const paintBeat=b=>document.querySelectorAll('#beats span').forEach((e,i)=>e.classList.toggle('on',i===b));
function renderProg(){
 const n=pr.slots.length,shown=pr.playing?pr.cur:pr.sel,nxt=pr.playing&&n?(pr.cur+1)%n:-1;
 $('slots').innerHTML=n?pr.slots.map((s,i)=>{const c=pChord(s);return`<button class="slot${i===nxt&&n>1?' next':''}" data-slot="${i}" aria-pressed="${i===shown}"><small>${c.rn}</small><b>${c.name}</b></button>`}).join(''):'<p class="hint">No chords yet. Pick a preset in the sidebar or add chords below.</p>';
 $('beats').innerHTML=Array.from({length:pr.beats},()=>'<span></span>').join('');
 $('pplay').textContent=pr.playing?'■ Stop':'▶ Play';
 $('pinfo').textContent=pr.playing&&n>1?`Next: ${pChord(pr.slots[nxt]).name}`:`${n} chord${n===1?'':'s'} · ${n*pr.beats} beats · about ${Math.round(n*pr.beats*60/pr.bpm)} s per loop`;
 $('bpmv').textContent=pr.bpm;
 $('ppal').innerHTML=pPalette().map(c=>`<button ${c.q?`data-padd="${c.off},${c.q}"`:'disabled title="Not covered by this app yet"'}>${c.name}<small>${c.rn}</small></button>`).join('');
 const on=(sel,key,val)=>document.querySelectorAll(sel+' button').forEach(b=>b.setAttribute('aria-pressed',b.dataset[key]===String(val)));
 on('#pstyle','pstyle',pr.style);on('#pbeats','pbeats',pr.beats);on('#pflav','pflav',pr.flavor);on('#pmodes','pmode',pr.mode);
 $('ploop').setAttribute('aria-pressed',pr.loop);$('pclick').setAttribute('aria-pressed',pr.click);
 if(pr.playing)paintBeat(pBeat>0?(pBeat-1)%pr.beats:0);
}
// ---------- Voicing picker (chord view) ----------
const voicingList=()=>genVoicings(st.r,st.q).filter(v=>(st.vinv||!v.inv)&&(st.vsize==='all'||(st.vsize==='full'?v.n>=5:st.vsize==='four'?v.n===4:v.n<=3)));
function curVoice(){ // the voicing on screen: a generated one if picked, otherwise the CAGED shape
 if(st.view!=='chord'||(st.vmode!=='all'&&cagedOK(st.r,st.q))){if(st.view==='chord')st.sh=okShape(st.r,st.q,st.sh);return voice()}
 const L=voicingList();if(!L.length)return voice();
 let v=L.find(x=>x.key===st.gk);
 if(!v){v=L.reduce((a,b)=>Math.abs(b.base-st.gb)<Math.abs(a.base-st.gb)?b:a);st.gk=v.key} // new chord: stay near the same spot on the neck
 st.gb=v.base;return v;
}
function thumb(v,sel){
 const b=v.base>0?v.base:1,rows=v.base>0?4:5,x0=9,sx=9,y0=17,sy=11,tab=v.fr.map(f=>f<0?'x':f).join(v.fr.some(f=>f>9)?'-':'');
 let s=`<svg class="tb" viewBox="0 0 68 ${y0+rows*sy+5}" aria-hidden="true">`;
 for(let j=0;j<=rows;j++)s+=`<line class="${j===0&&b===1?'nut':''}" x1="${x0}" x2="${x0+5*sx}" y1="${y0+j*sy}" y2="${y0+j*sy}"/>`;
 for(let i=0;i<6;i++)s+=`<line x1="${x0+i*sx}" x2="${x0+i*sx}" y1="${y0}" y2="${y0+rows*sy}"/>`;
 if(b>1)s+=`<text x="${x0+5*sx+11}" y="${y0+8}">${b}</text>`;
 v.fr.forEach((f,i)=>{const x=x0+i*sx,isR=pcOf(i,f)===st.r;
  if(f<0)s+=`<text x="${x}" y="${y0-6}">×</text>`;
  else if(f===0)s+=`<circle class="op${isR?' r':''}" cx="${x}" cy="${y0-8}" r="3"/>`;
  else s+=`<circle class="${isR?'r':''}" cx="${x}" cy="${y0+(f-b+.5)*sy}" r="4"/>`});
 return`<button class="vthumb" data-gv="${v.key}" aria-pressed="${sel}" title="${tab}${v.inv?' · '+v.bass+' in the bass':''}">${s}</svg><small>${tab}</small></button>`;
}
function renderVoicings(){
 const L=voicingList(),all=genVoicings(st.r,st.q),cur=(st.vmode==='all'||!cagedOK(st.r,st.q))?curVoice():null;
 $('vinfo').textContent=`${L.length} shown, ${all.length} in total`;
 $('vgrid').innerHTML=L.length?L.map(v=>thumb(v,!!cur&&cur.key===v.key)).join(''):'<p class="hint">No voicings match. Try “All sizes” or include inversions.</p>';
 document.querySelectorAll('#vsize button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.vsize===st.vsize));
 $('vinv').setAttribute('aria-pressed',st.vinv);
}
// ---------- Tab trainer: the page part ----------
const tm={mode:'learn',tech:'hammer',ev:null,lick:0,bpm:70,playing:false,handle:null,tos:[],q:null,qk:'tab',score:0,total:0,streak:0,best:0};
const TBY={};TECH.forEach(t=>TBY[t.id]=t);
const tChips=ids=>ids.map(i=>`<span class="chip"><b>${escH(TBY[i].sym)}</b> ${escH(TBY[i].name)}</span>`).join('');
const RAF=f=>(window.requestAnimationFrame||(g=>setTimeout(g,16)))(f),CAF=h=>(window.cancelAnimationFrame||clearTimeout)(h);
function tStop(){
 if(tm.raf){CAF(tm.raf);tm.raf=0}
 if(tm.handle){tm.handle.stop();tm.handle=null}
 tm.tos.forEach(clearTimeout);tm.tos=[];tm.playing=false;
 document.querySelectorAll('#tabview .tn.on').forEach(e=>e.classList.remove('on'));
 document.querySelectorAll('#tplay,#tqplay').forEach(b=>b.textContent=b.dataset.label);
 if(typeof edStop==='function'&&tm.mode==='mine')edStop();
 if(tm.cl&&tm.cl.ev&&tm.cl.ev.length){const sp=tm.cl.spb||60/tm.bpm;closeDraw(tm.cl.ev,tm.cl.t00+0.2/sp,sp);const c=document.querySelector('#tabview .ccap');if(c&&tm.cl.cap0)c.textContent=tm.cl.cap0}
}
function hlEv(i){
 document.querySelectorAll('#tabview .tn.on').forEach(e=>e.classList.remove('on'));
 const el=document.querySelector(`#tabview .tn[data-ev="${i}"]`);if(el)el.classList.add('on');
}
function tPlay(ev,reps){ // plays the phrase 'reps' times; each written note lights up as it sounds
 tStop();
 const spb=60/tm.bpm,t0=Sound.now()+0.12,n=ev.length,len=evLen(ev),all=[];
 for(let k=0;k<reps;k++)ev.forEach(e=>all.push(Object.assign({},e,{t:e.t+k*len})));
 tm.handle=Sound.lickAt(withM(all),t0,spb);tm.playing=true;
 all.forEach((e,i)=>tm.tos.push(setTimeout(()=>hlEv(i%n),Math.max(0,(t0+e.t*spb-Sound.now())*1000))));
 tm.tos.push(setTimeout(tStop,Math.max(0,(t0+len*reps*spb+0.5-Sound.now())*1000)));
 document.querySelectorAll('#tplay,#tqplay').forEach(b=>b.textContent='■ Stop');
 const loop=()=>{if(!tm.playing)return;const ts=Sound.now()-t0;if(ts>=0)closeDraw(ev,(ts/spb)%len,spb);tm.raf=RAF(loop)};
 tm.raf=RAF(loop);
}
const tNewEx=()=>{tm.ev=TBY[tm.tech].gen()};
function tNewQ(){
 const kinds=['tab','ascii','listen'],k=tm.qk==='mixed'?RND.pick(kinds):tm.qk;
 let t;do{t=RND.pick(TECH)}while(tm.q&&t.id===tm.q.tech);
 const opts=[t.id];while(opts.length<4){const o=RND.pick(TECH).id;if(!opts.includes(o))opts.push(o)}
 opts.sort(()=>Math.random()-.5);
 tm.q={tech:t.id,kind:k,ev:t.gen(),opts,done:false,pick:null};
}
function tAnswer(id){
 const q=tm.q;if(!q||q.done)return;
 q.done=true;q.pick=id;tm.total++;
 if(id===q.tech){tm.score++;tm.streak++;tm.best=Math.max(tm.best,tm.streak)}else tm.streak=0;
 renderTab();
}
const tControls=(extra)=>`<div class="row"><button id="tplay" class="go" data-label="▶ Play">▶ Play</button>${extra||''}<label class="bpm">Tempo <input type="range" id="tbpm" min="40" max="140" value="${tm.bpm}" aria-label="Tempo in beats per minute"> <b id="tbpmv">${tm.bpm}</b> BPM</label></div>`;
function tMain(){
 const m=tm.mode;
 if(m==='learn'){
  if(!tm.ev)tNewEx();
  const t=TBY[tm.tech];
  return `<section class="card"><div class="bar"><h2>${escH(t.name)}</h2><span class="chip"><b>${escH(t.sym)}</b> in the tab · <code>${escH(t.txt)}</code> in a text tab</span></div>
  <p>${escH(t.what)}</p><div class="tabbox">${tabSVG(tm.ev)}</div><pre class="ascii" aria-label="The same phrase as a text tab">${escH(asciiTab(tm.ev))}</pre>
  <h3 class="ch">On the neck <span class="hint">your fretting hand, with suggested fingers</span></h3>${closeHTML(tm.ev)}
  ${tControls('<button id="tnew">Another example</button><button data-ed="open">Open in editor</button>')}
  <p class="hint">Each note lights up as it sounds. The phrase plays twice. Read the tab first, then listen.</p></section>
  <div class="learn"><div class="card"><h2>How to play it</h2><ol class="steps">${t.how.map(x=>`<li>${escH(x)}</li>`).join('')}</ol></div>
  <div class="card"><h2>What to listen for</h2><p>${escH(t.hear)}</p><h2>Common mistake</h2><p>${escH(t.slip)}</p></div></div>
  <section class="card"><h2>All symbols at a glance</h2><div class="ref">${TECH.map(x=>`<div><b class="symb">${escH(x.sym)}</b><span>${escH(x.name)}</span><code>${escH(x.txt)}</code></div>`).join('')}</div>
  <p class="hint">Text tabs on websites are not all written the same way. This is the most common style. Always check the legend of the tab you are reading.</p></section>`;
 }
 if(m==='mine')return edShell();
 if(m==='licks'){
  const l=LICKS[tm.lick];
  return `<section class="card"><div class="bar"><h2>${escH(l.name)}</h2></div><p>${escH(l.info)}</p>
  <p class="hint">Techniques in this lick</p><div>${tChips(l.techs)}</div>
  <div class="tabbox">${tabSVG(l.ev)}</div><pre class="ascii" aria-label="The same lick as a text tab">${escH(asciiTab(l.ev))}</pre>
  <h3 class="ch">On the neck <span class="hint">your fretting hand, with suggested fingers</span></h3>${closeHTML(l.ev)}
  ${tControls('<button data-ed="open">Open in editor</button>')}<p class="hint">Challenge: before you press play, find every technique in the tab. Then play it slowly and speed up when it is clean.</p></section>`;
 }
 if(!tm.q)tNewQ();
 const q=tm.q,t=TBY[q.tech],ok=q.pick===q.tech;
 const show=q.kind==='tab'?`<div class="tabbox">${tabSVG(q.ev)}</div>`:q.kind==='ascii'?`<pre class="ascii">${escH(asciiTab(q.ev))}</pre>`
  :q.done?'':`<div class="row"><button id="tqplay" class="go" data-label="▶ Play sound">▶ Play sound</button><span class="hint">Listen as often as you like.</span></div>`;
 const opts=q.opts.map(id=>{const mk=!q.done?'':id===q.tech?'✓ ':id===q.pick?'✗ ':'';
  return `<button class="opt${q.done?(id===q.tech?' ok':id===q.pick?' no':''):''}" data-ans="${id}"${q.done?' disabled':''}>${mk}${escH(TBY[id].name)}</button>`}).join('');
 const more=!q.done?'':`<div class="fb"><p><b>${ok?'Correct!':'Not quite.'}</b> This is a <b>${escH(t.name)}</b> (${escH(t.sym)}, written <code>${escH(t.txt)}</code>). ${escH(t.what)}</p>
  ${q.kind==='tab'?`<pre class="ascii">${escH(asciiTab(q.ev))}</pre>`:q.kind==='ascii'?`<div class="tabbox">${tabSVG(q.ev)}</div>`:`<div class="tabbox">${tabSVG(q.ev)}</div><pre class="ascii">${escH(asciiTab(q.ev))}</pre>`}
  <h3 class="ch">On the neck <span class="hint">your fretting hand, with suggested fingers</span></h3>${closeHTML(q.ev)}
  <div class="row"><button id="tqplay" data-label="▶ Play it">▶ Play it</button><button id="tnext" class="go">Next question →</button></div></div>`;
 return `<section class="card"><div class="bar"><h2>Quiz</h2><span class="hint">Score ${tm.score}/${tm.total} · Streak ${tm.streak} · Best ${tm.best}</span></div>
  <p class="qprompt">${q.kind==='listen'?'Which technique do you hear?':'Which technique is written here?'}</p>${show}<div class="opts">${opts}</div>${more}</section>`;
}
function renderTab(){
 const m=tm.mode;
 document.querySelectorAll('#tmode button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tmode===m));
 $('tsidehead').textContent=m==='learn'?'Technique':m==='licks'?'Lick':m==='mine'?'Examples':'Quiz type';
 $('techs').innerHTML=(m==='learn'?TECH.map(t=>`<button data-tech="${t.id}" aria-pressed="${t.id===tm.tech}"><b>${escH(t.sym)}</b> ${escH(t.name)}</button>`)
  :m==='licks'?LICKS.map((l,i)=>`<button data-lick="${i}" aria-pressed="${i===tm.lick}">${escH(l.name)}</button>`)
  :m==='mine'?EXAMPLES.map((x,i)=>`<button data-edex="${i}">${escH(x.n)}</button>`)
  :[['tab','Read the tab'],['ascii','Read a text tab'],['listen','Listen'],['mixed','Mixed']].map(([k,l])=>`<button data-tqk="${k}" aria-pressed="${k===tm.qk}">${l}</button>`)).join('');
 $('techs').classList.toggle('one',m!=='learn');
 $('tabview').innerHTML=tMain();
 if(m==='mine'){edRefresh(!ed.init);ed.init=1}
}
// ---------- Your tab: editor, parts, playback ----------
const EXAMPLES=[
 {n:'Slides (your example)',t:'60 bpm\nE|-3/5-5/3-------------------------------------------|\nB|-3/5-5/3---3/5-5/3p0---3/5-5/3p0-------------------|\nG|-----------2/4-4/2p0---2/4-4/2p0--4----------------|\nD|----------------------------------5----------------|\nA|---------------------------------------------------|\nE|---------------------------------------------------|'},
 {n:'Hammer-ons and pull-offs',t:'80 bpm\ne|-0h3p0-----3h5p3-----|\nB|---------1---------1-|\nG|---0-----------------|\nD|---------------------|\nA|---------------------|\nE|---------------------|'},
 {n:'Several staves (riff)',t:'90 bpm\ne|-----------|-----3-3-3---3-3--------3---------|\nB|-----------|-----3-3-3---3-3--------3---------|\nG|-----------|-----0-0-0---0-0--------0-0-------|\nD|-------0---|-2---2-2-2---2-2--------------2---|\nA|---0h2-----|-----2-2-2---2-2------------------|\nE|-----------|-----x-x-x---x-x------------------|\n\ne|-----3--3--3--3-3-|--------------|--3---3-3------3-3-3---|\nB|-----3--3--3--3-3-|--------------|--3---3-3------3-3-3---|\nG|-----0--0--0--0-0-|--------------|--2---2-2------2-2-2---|\nD|-2---2--2--2--2-2-|--2--0--------|--2---2-2------2-2-2---|\nA|-----2--2--2--2-2-|--------2--0--|--0-------0------------|\nE|-----x--x--x--x-x-|--------------|-----------------------|'},
 {n:'Bend, vibrato, dead note',t:'70 bpm\ne|-8b10r8---7~~~~---5---|\nB|-----------------x---|\nG|---------------------|\nD|---------------------|\nA|---------------------|\nE|---------------------|'}];
const ed={text:EXAMPLES[0].t,bpm:60,unit:0.5,mode:'cols',split:'auto',sel:'all',loop:false,metro:false,count:true,cur:-1,P:null,L:null,seg:null,col:-1,step:-1};
try{const d=JSON.parse(localStorage.getItem('fc.tab')||'null');if(d&&typeof d.text==='string'&&d.text.length<20000)ed.text=d.text}catch(e){}
const edSave=()=>{try{localStorage.setItem('fc.tab',JSON.stringify({text:ed.text}))}catch(e){}};
const edTog=(k,l,on)=>`<button data-ed="${k}" aria-pressed="${on}">${l}</button>`;
function edShell(){
 return `<section class="card edmain"><div class="bar"><h2>Your tab</h2><span class="hint">Paste a text tab, then press play</span></div>
 <div class="edtop">
  <div class="edcol"><label class="edlbl" for="edtext">Tab text <span class="hint">six lines per staff · add “60 bpm” above for tempo</span></label>
   <textarea id="edtext" class="edtext" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="edwarn">${escH(ed.text)}</textarea></div>
  <div class="edcol"><div class="edlbl">Follow along <span class="hint">press a note to start there</span></div><pre class="ascii edpre" id="edpre" aria-label="The tab you entered"></pre></div>
 </div>
 <div id="edwarn" class="edwarn" role="status"></div>
 <div class="edbar">
  <button id="edplay" class="go" data-label="▶ Play">▶ Play</button>
  <label class="bpm"><input type="range" id="edbpm" min="30" max="200" value="${ed.bpm}" aria-label="Tempo in beats per minute"> <b id="edbpmv">${ed.bpm}</b> BPM</label>
  <span class="edgrp" id="edtogs"></span><span id="edstat" class="hint edstat" aria-live="polite"></span>
 </div>
 <div class="edbar" id="edparts"></div>
 <details class="edmore"><summary>Rhythm and parts options</summary><div class="edbar" id="edopts"></div></details>
 </section>
 <div class="edbot">
  <section class="card" id="edcard"><h3 class="ch">On the neck <span class="hint" id="edpartname"></span></h3><div id="edclose"></div></section>
  <section class="card"><h2>Move by move</h2><ol class="steps" id="edsteps"></ol></section>
 </div>`;
}
function edOpts(){
 $('edtogs').innerHTML=edTog('tog:metro','Metronome',ed.metro)+edTog('tog:count','Count-in',ed.count)+edTog('tog:loop','Loop',ed.loop);
 $('edopts').innerHTML=[
  ['Dash is',[['unit:1','1/4 beat'],['unit:0.5','1/8 beat'],['unit:0.25','1/16 beat']].map(([k,l])=>edTog(k,l,ed.unit===+k.slice(5))).join('')],
  ['Timing',[['mode:cols','Follow spacing'],['mode:even','Even steps']].map(([k,l])=>edTog(k,l,ed.mode===k.slice(5))).join('')],
  ['Split into parts by',[['split:auto','Auto'],['split:lines','Staff'],['split:bars','Bars'],['split:gaps','Gaps']].map(([k,l])=>edTog(k,l,ed.split===k.slice(6))).join('')]
 ].map(([t,h])=>`<span class="edgrp"><span class="hint">${t}</span>${h}</span>`).join('');
}
function edModel(textChanged){
 const P=parseTab(ed.text);
 if(textChanged){if(P.bpm){ed.bpm=P.bpm;const s=$('edbpm');if(s){s.value=ed.bpm;$('edbpmv').textContent=ed.bpm}}if(P.unit)ed.unit=P.unit}
 ed.P=P;ed.L=P.ok?layoutTab(P,{unit:ed.unit,mode:ed.mode,split:ed.split}):null;
 if(ed.L&&ed.sel!=='all'&&!ed.L.parts[ed.sel])ed.sel='all';
 ed.cur=-1;
}
function edWarn(){
 const P=ed.P,w=P.warn.slice(0,6).map(x=>`<li>Line ${x.line}: ${escH(x.msg)}</li>`).join('')+(P.warn.length>6?`<li>…and ${P.warn.length-6} more.</li>`:'');
 let h='';
 if(!P.ok)h=`<p>${ed.text.trim()?'No tab found yet. Each string needs its own line, like <code>e|-0-3-5-|</code>, and you need six of them.':'Paste or type a tab above.'}</p>`;
 else h=`<p>${P.events.length} notes · ${ed.L.parts.length} part${ed.L.parts.length>1?'s':''}${P.bpm?` · ${P.bpm} BPM read from the text`:''}${P.tuned?` · tuning read from the string names. The close-up shows frets as written.`:''}</p>`;
 $('edwarn').innerHTML=h+(w?`<ul>${w}</ul>`:'');
}
function edPartsUI(){
 const L=ed.L;
 $('edparts').innerHTML=L?`<span class="edgrp"><span class="hint">Play</span>${edTog('sel:all','All parts',ed.sel==='all')}${L.parts.map((p,i)=>edTog('sel:'+i,(L.split==='lines'?'Line ':'Part ')+(i+1),ed.sel===i)).join('')}</span>`:'';
 $('edplay').disabled=!L;
}
function edPre(){
 const P=ed.P,L=ed.L;if(!L){$('edpre').textContent='';return}
 const inSel=c=>ed.sel==='all'||(L.parts[ed.sel]&&c>=L.parts[ed.sel].c0&&c<=L.parts[ed.sel].c1);
 $('edpre').innerHTML=P.blocks.map(b=>[0,1,2,3,4,5].map(j=>escH(b.labels[j]||' ')+'|'+[...b.body[j]].map((ch,i)=>{const c=b.cmap[i];return c==null?escH(ch):`<span data-c="${c}"${inSel(c)?'':' class="dim"'}>${escH(ch)}</span>`}).join('')).join('\n')).join('\n\n');
 ed.col=-1;
}
function edShowPart(i){
 const L=ed.L;if(!L||!L.parts[i])return;ed.cur=i;ed.step=-1;
 const p=L.parts[i];
 if(!L.box){const gs=L.parts.map(q=>closeGeom(q.ev,{names:true}));L.box={W:Math.max(...gs.map(q=>q.W)),H:Math.max(...gs.map(q=>q.H)),N:Math.max(...gs.map(q=>q.N))}}
 $('edclose').innerHTML=closeHTML(p.ev,{names:true,bpm:ed.bpm,box:L.box});
 $('edpartname').textContent=L.parts.length>1?(L.split==='lines'?'Line ':'Part ')+(i+1)+' of '+L.parts.length:'';
 $('edsteps').innerHTML=partSteps(p).map(s=>`<li>${s.txt.map(escH).join('<br>')}</li>`).join('');
}
function edRefresh(textChanged){
 tStop();edModel(textChanged);edWarn();edOpts();edPartsUI();edPre();
 if(ed.L)edShowPart(ed.sel==='all'?0:ed.sel);else{$('edclose').innerHTML='<p class="hint">The fretting hand appears here once the tab is read.</p>';$('edsteps').innerHTML='';$('edpartname').textContent=''}
}
function edKeep(box,el){ // scrolls only inside its own box, never the page
 if(!box||!el||!el.getBoundingClientRect)return;
 const b=box.getBoundingClientRect(),r=el.getBoundingClientRect();
 if(r.left<b.left+16)box.scrollLeft+=r.left-b.left-40;else if(r.right>b.right-16)box.scrollLeft+=r.right-b.right+60;
 if(r.top<b.top+4)box.scrollTop+=r.top-b.top-8;else if(r.bottom>b.bottom-4)box.scrollTop+=r.bottom-b.bottom+8;
}
function edHL(beat){ // marks the column and the step that sound now
 const L=ed.L,p=L.parts[ed.cur];if(!p)return;
 const c=L.slotCol[Math.max(0,L.slotAt(beat))],pre=$('edpre');
 if(c!==ed.col){pre.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));const cs=pre.querySelectorAll(`[data-c="${c}"]`);cs.forEach(e=>e.classList.add('on'));ed.col=c;if(cs[0])edKeep(pre,cs[0])}
 const li=$('edsteps').children;let k=-1;ed.steps=ed.steps&&ed.steps.p===p?ed.steps:{p,t:partSteps(p).map(s=>s.t)};
 ed.steps.t.forEach((t,j)=>{if(t<=beat+1e-9)k=j});
 if(k!==ed.step){if(li[ed.step])li[ed.step].classList.remove('on');if(li[k]){li[k].classList.add('on');edKeep($('edsteps'),li[k])}ed.step=k}
}
function edStop(){ // called by tStop
 const pre=$('edpre');if(pre)pre.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));ed.col=-1;
 const li=$('edsteps');if(li)[...li.children].forEach(e=>e.classList.remove('on'));ed.step=-1;
 const s=$('edstat');if(s)s.textContent='';
 const b=$('edplay');if(b)b.textContent=b.dataset.label;
 if(ed.L&&ed.cur>=0){const want=ed.sel==='all'?0:ed.sel;if(want!==ed.cur)edShowPart(want)}
}
function edPlay(first){
 const L=ed.L;if(!L)return;
 const was=tm.playing&&!first;
 if(!was)tStop();else{if(tm.raf)CAF(tm.raf);if(tm.handle)tm.handle.stop();tm.tos.forEach(clearTimeout);tm.tos=[]}
 const parts=ed.sel==='all'?L.parts:[L.parts[ed.sel]],spb=60/ed.bpm,ci=first&&ed.count?4:0,seg=[],all=[];let off=ci;
 parts.forEach(p=>{const len=Math.max(1,Math.ceil(p.t1-p.t0-1e-9));seg.push({p,start:off,len});p.ev.forEach(e=>all.push(Object.assign({},e,{t:e.t-p.t0+off})));off+=len});
 const total=off,t0=Sound.now()+0.12;
 tm.handle=Sound.lickAt(withMT(all,ed.P.tuning),t0,spb);tm.playing=true;
 for(let k=0;k<total;k++)if(k<ci||ed.metro)Sound.tick(t0+k*spb,k%4===0);
 $('edplay').textContent='■ Stop';
 tm.tos.push(setTimeout(()=>{if(ed.loop)edPlay(false);else tStop()},Math.max(0,(t0+total*spb+0.3-Sound.now())*1000)));
 const loop=()=>{if(!tm.playing)return;const ts=(Sound.now()-t0)/spb;
  if(ts<0||ts<ci){const n=Math.ceil(ci-Math.max(ts,0));$('edstat').textContent='Count-in… '+n}
  else{const sg=seg.find(x=>ts>=x.start&&ts<x.start+x.len)||seg[seg.length-1];
   if(ed.cur!==sg.p.i)edShowPart(sg.p.i);
   const b=sg.p.t0+Math.min(ts-sg.start,sg.len);closeDraw(sg.p.ev,b,spb);edHL(b);
   $('edstat').textContent=(ed.loop?'Looping · ':'')+(seg.length>1?(L.split==='lines'?'Line ':'Part ')+(sg.p.i+1):'Playing')}
  tm.raf=RAF(loop)};
 tm.raf=RAF(loop);
}
function edFrom(col){
 const L=ed.L;if(!L)return;
 let i=L.parts.findIndex(p=>col>=p.c0&&col<=p.c1);if(i<0)i=Math.max(0,L.parts.findIndex(p=>p.c0>col));
 ed.sel=i;edPartsUI();edPre();edShowPart(i);edPlay(false);
}
function edClick(b){
 const [k,v]=b.dataset.ed.split(':');
 if(k==='unit')ed.unit=+v;else if(k==='mode')ed.mode=v;else if(k==='split')ed.split=v;
 else if(k==='sel'){ed.sel=v==='all'?'all':+v;tStop();edPartsUI();edPre();edShowPart(ed.sel==='all'?0:ed.sel);return}
 else if(k==='tog'){ed[v]=!ed[v];edOpts();if(v==='metro'&&tm.playing)edPlay(false);return}
 edRefresh(false);
}
function renderView(){
 const v=st.view,sc=v==='scale';
 document.querySelectorAll('.chordonly').forEach(e=>e.hidden=v!=='chord');
 const tb=v==='tab';
 document.querySelectorAll('.chordprog').forEach(e=>e.hidden=sc||tb);
 document.querySelectorAll('.fretcard').forEach(e=>e.hidden=tb);
 document.querySelectorAll('.tabonly').forEach(e=>e.hidden=!tb);
 $('rootlbl').hidden=$('roots').hidden=tb;
 document.querySelectorAll('.scaleonly').forEach(e=>e.hidden=!sc);
 document.querySelectorAll('.progonly').forEach(e=>e.hidden=v!=='prog');
 document.querySelector('#modes [data-m="fingers"]').hidden=sc;
 document.querySelector('#modes [data-m="intervals"]').textContent=sc?'Degrees':'Intervals';
 $('rootlbl').textContent=v==='prog'?'Key':'Root note';
 $('sub').textContent={chord:'Choose a chord on the right, then follow the dots on the neck.',scale:'Pick a scale on the right, then follow the dots on the neck.',prog:'Build a progression, press play and follow each chord on the neck.',tab:'Learn to read guitar tablature: pick a technique, read it, then hear it.'}[v];
 document.querySelectorAll('#views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v));
 if(sc)renderScale();
 if(v==='prog')renderProg();
 if(v==='chord')renderVoicings();
 if(tb)renderTab();
}
function render(){
 const v=curVoice(),fl=flatR(st.r);
 $('cname').innerHTML=nm(st.r,fl)+SUF[st.q]+'<small>'+LONG[st.q]+'</small>';
 $('dg').innerHTML=diagram(v);
 $('vnote').textContent=(v.key?(v.base===0?'Open position':'Fret '+v.base)+' · '+(v.bass==='R'?'root in the bass':v.bass+' in the bass (inversion)'):(v.base===0?'Open position':'Barre at fret '+v.base)+' · '+st.sh+' shape')+(st.mode==='fingers'?' · numbers are fingers (1 = index)':st.mode==='notes'?' · note names':' · distance from the root');
 $('neck').innerHTML=neck(v);
 $('tones').innerHTML='';
 renderView();
 $('theory').innerHTML=theory();$('fits').innerHTML=fits();$('keyrow').innerHTML=keyrow();
 document.querySelectorAll('#roots button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.r===(st.view==='prog'?pr.key:st.r)));
 document.querySelectorAll('#quals button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.q===st.q));
 document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===(st.view==='scale'&&st.mode==='fingers'?'notes':st.mode)));
 document.querySelectorAll('#shapes button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.s===st.sh&&st.vmode==='caged');const ok=shapeOK(st.r,st.q,b.dataset.s);b.disabled=!ok;b.title=ok?b.dataset.s+' shape':T[st.q]&&T[st.q][b.dataset.s]?'Too hard to play at this position':'No classic '+b.dataset.s+' shape for this chord. Pick a voicing below.'});
}
$('roots').innerHTML=S.map((n,i)=>`<button data-r="${i}">${[1,3,6,8,10].includes(i)?n.replace('#','♯')+'/'+FL[i].replace('b','♭'):n}</button>`).join('');
const QGROUPS=[['Triads',['maj','min']],['Seventh chords',['7','maj7','m7']],['Suspended, 6th and power',['sus2','sus4','6','m6','5']],['Diminished and augmented',['dim','dim7','m7b5','aug']],['Colour chords',['add9','9','m9','mmaj7']]];
$('quals').innerHTML=QGROUPS.map(([t,qs])=>`<p class="qgroup">${t}</p>`+qs.map(q=>`<button data-q="${q}">${LONG[q]}</button>`).join('')).join('');
$('modes').innerHTML=[['fingers','Fingers'],['notes','Notes'],['intervals','Intervals']].map(([m,l])=>`<button data-m="${m}">${l}</button>`).join(' ');
$('shapes').innerHTML=['C','A','G','E','D'].map(k=>`<button data-s="${k}" title="${k} shape">${k}</button>`).join(' ');
$('views').innerHTML=[['chord','Chords'],['scale','Scales'],['prog','Progression'],['tab','Tab']].map(([v,l])=>`<button data-view="${v}">${l}</button>`).join(' ');
$('tmode').innerHTML=[['learn','Learn'],['licks','Licks'],['quiz','Quiz'],['mine','My tab']].map(([k,l])=>`<button data-tmode="${k}">${l}</button>`).join(' ');
document.addEventListener('input',e=>{if(e.target.id==='tbpm'){tm.bpm=+e.target.value;$('tbpmv').textContent=tm.bpm}
 if(e.target.id==='edbpm'){ed.bpm=+e.target.value;$('edbpmv').textContent=ed.bpm}
 if(e.target.id==='edtext'){ed.text=e.target.value;edSave();edRefresh(true)}});
document.addEventListener('change',e=>{if(e.target.id==='edbpm'){const w=tm.playing;if(w){tStop()}if(ed.cur>=0)edShowPart(ed.cur);if(w)edPlay(true)}});
$('scales').innerHTML=SGROUPS.map(([t,ks])=>`<p class="qgroup">${t}</p>`+ks.map(k=>`<button data-sc="${k}">${SCALES[k].n}</button>`).join('')).join('');
$('pstyle').innerHTML=[['once','Once per chord'],['beat','Every beat'],['arp','Arpeggio']].map(([k,l])=>`<button data-pstyle="${k}">${l}</button>`).join(' ');
$('pbeats').innerHTML=[2,3,4].map(k=>`<button data-pbeats="${k}">${k}</button>`).join(' ');
$('pflav').innerHTML=[['triad','Triads'],['seventh','7th chords'],['dom','Dominant 7']].map(([k,l])=>`<button data-pflav="${k}">${l}</button>`).join(' ');
$('pmodes').innerHTML=[['major','Major key'],['minor','Minor key']].map(([k,l])=>`<button data-pmode="${k}">${l}</button>`).join(' ');
$('presets').innerHTML=PRESETS.map((p,i)=>`<button data-preset="${i}">${p.n}</button>`).join('');
$('bpm').addEventListener('input',e=>{pr.bpm=+e.target.value;$('bpmv').textContent=pr.bpm;renderProg()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pStop();tStop()}});
document.addEventListener('keydown',e=>{ // Space = play / stop in the progression view
 if(e.code==='Space'&&st.view==='prog'&&!e.target.closest('button,input,select,textarea,[data-midi]')){e.preventDefault();pr.playing?pStop():pStart()}
});
$('vsize').innerHTML=[['all','All sizes'],['full','5–6 strings'],['four','4 strings'],['three','3 or fewer']].map(([k,l])=>`<button data-vsize="${k}">${l}</button>`).join(' ');
const chordMidi=()=>curVoice().fr.map((f,i)=>f<0?null:MID[i]+f).filter(m=>m!==null);
// Notes light up in place (ripple + pop) in the order they sound; they never move.
function flash(gap){
 const g=[...document.querySelectorAll('.nd.vv')];
 g.forEach(e=>e.classList.remove('play'));void document.body.offsetWidth;
 g.forEach((e,k)=>{e.style.setProperty('--d',(k*gap)+'s');e.classList.add('play')});
}
const hit=el=>{const g=el.closest('.nd');
 if(g){g.classList.remove('play');void g.offsetWidth;g.style.setProperty('--d','0s');g.classList.add('play');return}
 el.classList.add('hit');setTimeout(()=>el.classList.remove('hit'),180)};
document.addEventListener('keydown',e=>{
 const c=e.target.closest&&e.target.closest('[data-midi]');
 if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();Sound.note(+c.dataset.midi);hit(c)}
});
document.addEventListener('click',e=>{
 const c=e.target.closest('[data-midi]');
 if(c){Sound.note(+c.dataset.midi);hit(c);return}
 const cc=e.target.closest('#edpre [data-c]');if(cc){edFrom(+cc.dataset.c);return}
 const b=e.target.closest('button');if(!b||b.disabled||b.closest('#theme,#donate'))return;
 if(b.id==='edplay'){if(tm.playing)tStop();else edPlay(true);return}
 if(b.dataset.edex!==undefined){tStop();ed.text=EXAMPLES[+b.dataset.edex].t;edSave();const t=$('edtext');if(t)t.value=ed.text;edRefresh(true);return}
 if(b.dataset.ed==='open'){tStop();ed.text=asciiTab(tm.mode==='licks'?LICKS[tm.lick].ev:tm.ev);ed.bpm=tm.bpm;ed.sel='all';edSave();tm.mode='mine';renderTab();return}
 if(b.dataset.ed){edClick(b);return}
 if(b.id==='rot'){st.rot=!st.rot;b.setAttribute('aria-pressed',st.rot);render();return}
 if(b.id==='dgtilt'){b.setAttribute('aria-pressed',$('dgstage').classList.toggle('tilt'));return}
 if(b.id==='tilt'){b.setAttribute('aria-pressed',$('stage').classList.toggle('tilt'));return}
 if(b.id==='strum'){Sound.strum(chordMidi(),0.045);flash(0.045);return}
 if(b.id==='od'){const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);Sound.setDrive(on?0.5:0);Sound.strum(chordMidi(),0.045);flash(0.045);return}
 if(b.id==='arp'){Sound.strum(chordMidi(),0.28);flash(0.28);return}
 if(b.id==='splay'||b.id==='sdown'){playScale(b.id==='sdown');return}
 if(b.dataset.gv!==undefined){st.vmode='all';st.gk=b.dataset.gv;render();Sound.strum(chordMidi(),0.045);flash(0.045);return}
 if(b.dataset.vsize){st.vsize=b.dataset.vsize;render();return}
 if(b.id==='vinv'){st.vinv=!st.vinv;render();return}
 if(b.dataset.tmode){tStop();tm.mode=b.dataset.tmode;if(tm.mode==='quiz'&&!tm.q)tNewQ();if(tm.mode==='licks')tm.bpm=LICKS[tm.lick].bpm;renderTab();return}
 if(b.dataset.tech){tStop();tm.tech=b.dataset.tech;tNewEx();renderTab();return}
 if(b.dataset.lick!==undefined){tStop();tm.lick=+b.dataset.lick;tm.bpm=LICKS[tm.lick].bpm;renderTab();return}
 if(b.dataset.tqk){tStop();tm.qk=b.dataset.tqk;tNewQ();renderTab();return}
 if(b.dataset.ans){tAnswer(b.dataset.ans);return}
 if(b.id==='tnext'){tStop();tNewQ();renderTab();return}
 if(b.id==='tnew'){tNewEx();renderTab();tPlay(tm.ev,2);return}
 if(b.id==='tplay'){if(tm.playing)tStop();else tPlay(tm.mode==='licks'?LICKS[tm.lick].ev:tm.ev,tm.mode==='licks'?1:2);return}
 if(b.id==='tqplay'){if(tm.playing)tStop();else tPlay(tm.q.ev,2);return}
 if(b.dataset.slot!==undefined){if(!pr.playing){pr.sel=+b.dataset.slot;showSlot(pr.sel)}return}
 if(b.dataset.padd){const[o,q]=b.dataset.padd.split(',');pAdd(+o,q);return}
 if(b.id==='pplay'){pr.playing?pStop():pStart();return}
 if(b.id==='ploop'){pr.loop=!pr.loop;renderProg();return}
 if(b.id==='pclick'){pr.click=!pr.click;renderProg();return}
 if(b.id==='pdel'){pDel();return}
 if(b.id==='pclear'){pStop();pr.slots=[];pr.sel=0;pEdited();return}
 if(b.dataset.pstyle){pr.style=b.dataset.pstyle;renderProg();return}
 if(b.dataset.pbeats){pr.beats=+b.dataset.pbeats;renderProg();return}
 if(b.dataset.pflav){pr.flavor=b.dataset.pflav;renderProg();return}
 if(b.dataset.pmode){pr.mode=b.dataset.pmode;pEdited();return}
 if(b.dataset.preset!==undefined){pLoad(+b.dataset.preset);return}
 if(b.dataset.view){const was=st.view;st.view=b.dataset.view;if(was==='prog'&&st.view!=='prog')pStop();if(was==='tab'&&st.view!=='tab')tStop();if(st.view==='prog'&&was!=='prog')pEnter()}
 if(b.dataset.sc){st.sc=b.dataset.sc;st.pos=0}
 if(b.dataset.pos!==undefined)st.pos=+b.dataset.pos;
 if(b.dataset.r!==undefined){if(st.view==='prog'&&b.closest('#roots')){pr.key=+b.dataset.r;pEdited();return}st.r=+b.dataset.r}
 if(b.dataset.q)st.q=b.dataset.q;
 if(b.dataset.m)st.mode=b.dataset.m;
 if(b.dataset.s!==undefined){st.sh=b.dataset.s;st.vmode='caged'}
 render();
});
render();
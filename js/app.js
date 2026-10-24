const S='C C# D D# E F F# G G# A A# B'.split(' '),FL='C Db D Eb E F Gb G Ab A Bb B'.split(' ');
const flatR=r=>[1,3,5,8,10].includes(r);
const nm=(pc,fl)=>(fl?FL:S)[((pc%12)+12)%12];
const OPEN=[4,9,2,7,11,4];
const NF=15; // frets drawn on the neck
const MID=[40,45,50,55,59,64]; // MIDI numbers of the open strings, low E to high e
const IV=['R','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const F={maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],sus2:[0,2,7],sus4:[0,5,7],'6':[0,4,7,9],m6:[0,3,7,9],'5':[0,7]};
const SUF={maj:'',min:'m','7':'7',maj7:'maj7',m7:'m7',sus2:'sus2',sus4:'sus4','6':'6',m6:'m6','5':'5'};
const LONG={maj:'Major',min:'Minor','7':'Dominant 7',maj7:'Major 7',m7:'Minor 7',sus2:'Suspended 2',sus4:'Suspended 4','6':'Major 6',m6:'Minor 6','5':'Power chord'};
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
'5':'Just the root and the 5th, with no 3rd. It is neither major nor minor, so it sounds strong and neutral. The foundation of rock and metal guitar.'};
// Why some chords have no single place in a major key (shown instead of the key list).
const NOKEY={
sus2:'Suspended chords have no 3rd, so they are neither major nor minor. They usually stand in for a major or minor chord with the same root and then resolve back to it, so they do not have one fixed place in a key.',
sus4:'Suspended chords have no 3rd, so they are neither major nor minor. They usually stand in for a major or minor chord with the same root and then resolve back to it, so they do not have one fixed place in a key.',
'6':'A 6th chord is often used instead of a plain major or maj7 chord as the “home” (I) chord, especially in jazz, country and swing. It has the same notes as a minor 7th chord built a minor 3rd lower: C6 and Am7 share C, E, G and A.',
m6:'A minor 6th chord is often used as the minor “home” chord in jazz and bossa nova. It has the same notes as a minor 7♭5 chord built a minor 3rd higher: Am6 and F♯m7♭5 share A, C, E and F♯.',
'5':'A power chord has only the root and the 5th, so it is neither major nor minor. That is why it can replace either one with the same root, and why it stays clear under heavy distortion.'};
const DEG=[0,2,4,5,7,9,11],TQ=['maj','min','min','maj','maj','min','dim'],SQ=['maj7','m7','m7','maj7','7','m7','m7b5'];
const RN=['I','ii','iii','IV','V','vi','vii°'],RN7=['Imaj7','iim7','iiim7','IVmaj7','V7','vim7','viiø7'];
const st={r:7,q:'maj',sh:'E',mode:'fingers',rot:false,view:'chord',sc:'major',pos:0};
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
function voice(){
 const t=T[st.q][st.sh],base=(st.r-SPC[st.sh]+12)%12;
 if(base===0)return{fr:t.slice(),fg:OF[st.q][st.sh].slice(),base};
 const tt=(TS[st.q]&&TS[st.q][st.sh])||t,fr=tt.map(o=>o<0?-1:base+o);
 return{fr,fg:barreFingers(tt,fr,base),base};
}
const pcOf=(i,f)=>(OPEN[i]+f)%12;
function lab(i,f,fg){
 if(st.mode==='fingers')return fg||'';
 const pc=pcOf(i,f);
 return st.mode==='notes'?nm(pc,flatR(st.r)):IV[(pc-st.r+12)%12];
}
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
 label:(i,pc,inV)=>inV&&st.mode==='fingers'?(v.fg[i]||''):st.mode==='intervals'?IV[(pc-st.r+12)%12]:nm(pc,flatR(st.r))}}
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
 notes.map((p,i)=>`<span class="chip${i?'':' r'}"><b>${nm(p,fl)}</b> <small>${IV[(p-st.r+12)%12]}</small></span>`).join('')+
 `<p style="color:var(--mut);font-size:.9rem">The small label under each note says how it relates to the root: R is the root, 3 is the third, 5 is the fifth, ♭ means lowered by one fret. The 3rd decides major or minor; the 2nd, 4th, 6th and 7th add colour.</p>`;
}
function fits(){
 const sev=['7','maj7','m7'].includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,out=[];
 for(let k=0;k<12;k++)for(let d=0;d<7;d++)if((k+DEG[d])%12===st.r&&L[d]===st.q)out.push(`<span class="chip"><b>${nm(k,flatR(k))} major</b>: ${R[d]}</span>`);
 const nme=nm(st.r,flatR(st.r))+SUF[st.q];
 if(!out.length&&NOKEY[st.q])return `<p><b>${nme}</b>: ${NOKEY[st.q]}</p>`;
 return `<p><b>${nme}</b> is a natural fit in these major keys (with its position in the key):</p>${out.join('')}`;
}
function keyrow(){
 const sev=['7','maj7','m7'].includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,k=st.r,fl=flatR(k);
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
  const key=a.join(','),q=['maj','min','7','maj7','m7'].find(c=>F[c].join(',')===key),r=(st.r+x)%12;
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
function renderView(){
 const sc=st.view==='scale';
 document.querySelectorAll('.chordonly').forEach(e=>e.hidden=sc);
 document.querySelectorAll('.scaleonly').forEach(e=>e.hidden=!sc);
 document.querySelector('#modes [data-m="fingers"]').hidden=sc;
 document.querySelector('#modes [data-m="intervals"]').textContent=sc?'Degrees':'Intervals';
 $('sub').textContent=sc?'Pick a scale on the right, then follow the dots on the neck.':'Choose a chord on the right, then follow the dots on the neck.';
 document.querySelectorAll('#views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===st.view));
 if(sc)renderScale();
}
function render(){
 const v=voice(),fl=flatR(st.r);
 $('cname').innerHTML=nm(st.r,fl)+SUF[st.q]+'<small>'+LONG[st.q]+'</small>';
 $('dg').innerHTML=diagram(v);
 $('vnote').textContent=(v.base===0?'Open position':'Barre at fret '+v.base)+' · '+st.sh+' shape'+(st.mode==='fingers'?' · numbers are fingers (1 = index)':st.mode==='notes'?' · note names':' · distance from the root');
 $('neck').innerHTML=neck(v);
 $('tones').innerHTML='';
 renderView();
 $('theory').innerHTML=theory();$('fits').innerHTML=fits();$('keyrow').innerHTML=keyrow();
 document.querySelectorAll('#roots button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.r===st.r));
 document.querySelectorAll('#quals button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.q===st.q));
 document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===(st.view==='scale'&&st.mode==='fingers'?'notes':st.mode)));
 document.querySelectorAll('#shapes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===st.sh));
}
$('roots').innerHTML=S.map((n,i)=>`<button data-r="${i}">${[1,3,6,8,10].includes(i)?n.replace('#','♯')+'/'+FL[i].replace('b','♭'):n}</button>`).join('');
const QGROUPS=[['Triads',['maj','min']],['Seventh chords',['7','maj7','m7']],['Suspended, 6th and power',['sus2','sus4','6','m6','5']]];
$('quals').innerHTML=QGROUPS.map(([t,qs])=>`<p class="qgroup">${t}</p>`+qs.map(q=>`<button data-q="${q}">${LONG[q]}</button>`).join('')).join('');
$('modes').innerHTML=[['fingers','Fingers'],['notes','Notes'],['intervals','Intervals']].map(([m,l])=>`<button data-m="${m}">${l}</button>`).join(' ');
$('shapes').innerHTML=['C','A','G','E','D'].map(k=>`<button data-s="${k}" title="${k} shape">${k}</button>`).join(' ');
$('views').innerHTML=[['chord','Chords'],['scale','Scales']].map(([v,l])=>`<button data-view="${v}">${l}</button>`).join(' ');
$('scales').innerHTML=SGROUPS.map(([t,ks])=>`<p class="qgroup">${t}</p>`+ks.map(k=>`<button data-sc="${k}">${SCALES[k].n}</button>`).join('')).join('');
const chordMidi=()=>voice().fr.map((f,i)=>f<0?null:MID[i]+f).filter(m=>m!==null);
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
 const b=e.target.closest('button');if(!b||b.disabled||b.closest('#theme,#donate'))return;
 if(b.id==='rot'){st.rot=!st.rot;b.setAttribute('aria-pressed',st.rot);render();return}
 if(b.id==='dgtilt'){b.setAttribute('aria-pressed',$('dgstage').classList.toggle('tilt'));return}
 if(b.id==='tilt'){b.setAttribute('aria-pressed',$('stage').classList.toggle('tilt'));return}
 if(b.id==='strum'){Sound.strum(chordMidi(),0.045);flash(0.045);return}
 if(b.id==='arp'){Sound.strum(chordMidi(),0.28);flash(0.28);return}
 if(b.id==='splay'||b.id==='sdown'){playScale(b.id==='sdown');return}
 if(b.dataset.view)st.view=b.dataset.view;
 if(b.dataset.sc){st.sc=b.dataset.sc;st.pos=0}
 if(b.dataset.pos!==undefined)st.pos=+b.dataset.pos;
 if(b.dataset.r!==undefined)st.r=+b.dataset.r;
 if(b.dataset.q)st.q=b.dataset.q;
 if(b.dataset.m)st.mode=b.dataset.m;
 if(b.dataset.s!==undefined)st.sh=b.dataset.s;
 render();
});
render();
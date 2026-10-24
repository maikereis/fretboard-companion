const S='C C# D D# E F F# G G# A A# B'.split(' '),FL='C Db D Eb E F Gb G Ab A Bb B'.split(' ');
const flatR=r=>[1,3,5,8,10].includes(r);
const nm=(pc,fl)=>(fl?FL:S)[((pc%12)+12)%12];
const OPEN=[4,9,2,7,11,4];
const NF=15; // frets drawn on the neck
const MID=[40,45,50,55,59,64]; // MIDI numbers of the open strings, low E to high e
const IV=['R','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const F={maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10]};
const SUF={maj:'',min:'m','7':'7',maj7:'maj7',m7:'m7'};
const LONG={maj:'Major',min:'Minor','7':'Dominant 7',maj7:'Major 7',m7:'Minor 7'};
// Open-position chord of each CAGED shape (strings 6 to 1, -1 = muted). Sliding a shape up by N frets plays it N semitones higher.
const SPC={C:0,A:9,G:7,E:4,D:2}; // pitch class of each shape
const T={maj:{E:[0,2,2,1,0,0],A:[-1,0,2,2,2,0],C:[-1,3,2,0,1,0],G:[3,2,0,0,0,3],D:[-1,-1,0,2,3,2]},min:{E:[0,2,2,0,0,0],A:[-1,0,2,2,1,0],C:[-1,3,1,0,1,-1],G:[3,1,0,0,3,3],D:[-1,-1,0,2,3,1]},'7':{E:[0,2,0,1,0,0],A:[-1,0,2,0,2,0],C:[-1,3,2,3,1,0],G:[3,2,0,0,0,1],D:[-1,-1,0,2,1,2]},maj7:{E:[0,2,1,1,0,0],A:[-1,0,2,1,2,0],C:[-1,3,2,0,0,0],G:[3,2,0,0,0,2],D:[-1,-1,0,2,2,2]},m7:{E:[0,2,0,0,0,0],A:[-1,0,2,0,1,0],C:[-1,3,1,3,1,-1],G:[3,1,0,0,3,1],D:[-1,-1,0,2,1,1]}};
const DESC={
maj:'Bright and stable. Built from the 1st, major 3rd and 5th notes of the major scale. The sound of “home”.',
min:'Darker, more serious. Same as major, but the 3rd is lowered one fret (a “flat 3rd”).',
'7':'A major chord plus a flat 7th. It has tension and wants to resolve, which is why it is everywhere in blues and rock.',
maj7:'A major chord plus the 7th note of the scale, one fret below the root’s octave. Soft, dreamy, jazzy.',
m7:'A minor chord plus a flat 7th. Warm and relaxed, common in soul, funk and jazz.'};
const DEG=[0,2,4,5,7,9,11],TQ=['maj','min','min','maj','maj','min','dim'],SQ=['maj7','m7','m7','maj7','7','m7','m7b5'];
const RN=['I','ii','iii','IV','V','vi','vii°'],RN7=['Imaj7','iim7','iiim7','IVmaj7','V7','vim7','viiø7'];
const st={r:7,q:'maj',sh:'E',mode:'fingers',rot:false};
const $=id=>document.getElementById(id);

function voice(){
 const t=T[st.q][st.sh],base=(st.r-SPC[st.sh]+12)%12;
 const fr=t.map(o=>o<0?-1:base+o),fg=Array(6).fill(0),idx=[];
 t.forEach((o,i)=>{if(o>=0&&fr[i]>0)idx.push(i)});
 let n=base>0?2:1;
 if(base>0)idx.filter(i=>t[i]===0).forEach(i=>fg[i]=1);
 idx.filter(i=>!(base>0&&t[i]===0)).sort((a,b)=>fr[a]-fr[b]||a-b).forEach(i=>fg[i]=n++);
 return{fr,fg,base};
}
const pcOf=(i,f)=>(OPEN[i]+f)%12;
function lab(i,f,fg){
 if(st.mode==='fingers')return fg||'';
 const pc=pcOf(i,f);
 return st.mode==='notes'?nm(pc,flatR(st.r)):IV[(pc-st.r+12)%12];
}
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
 if(v.base>0){const b=v.fg.map((g,i)=>g===1?i:-1).filter(i=>i>=0);
  if(b.length>1){const a=P(b[0],.5),z=P(b[b.length-1],.5);
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
 const fw=56,x0=44,top=36,sy=34,W=x0+NF*fw+10,H=top+5*sy+40,set=F[st.q].map(x=>(st.r+x)%12);
 let s=`<svg viewBox="0 0 ${W} ${H}" class="neck" role="img" aria-label="Fretboard"><rect class="board" x="${x0}" y="${top-14}" width="${NF*fw}" height="${5*sy+28}" rx="8"/>`;
 for(let f=0;f<=NF;f++)s+=`<line class="${f?'f':'nut'}" x1="${x0+f*fw}" x2="${x0+f*fw}" y1="${top}" y2="${top+5*sy}"/>`;
 for(let r=0;r<6;r++)s+=`<line class="s" x1="${x0}" x2="${x0+NF*fw}" y1="${top+r*sy}" y2="${top+r*sy}" stroke-width="${1+r*.4}"/>`;
 [3,5,7,9,15].forEach(f=>s+=`<circle class="mk" cx="${x0+(f-.5)*fw}" cy="${top+5*sy+26}" r="4"/>`);
 s+=`<circle class="mk" cx="${x0+11.5*fw-8}" cy="${top+5*sy+26}" r="4"/><circle class="mk" cx="${x0+11.5*fw+8}" cy="${top+5*sy+26}" r="4"/>`;
 for(let f=1;f<=NF;f++)s+=`<text class="num" x="${x0+(f-.5)*fw}" y="${top-22}">${f}</text>`;
 for(let i=0;i<6;i++){const y=top+(5-i)*sy;
  for(let f=0;f<=NF;f++){const pc=pcOf(i,f);if(!set.includes(pc))continue;
   const cx=f?x0+(f-.5)*fw:x0-16,inV=v.fr[i]===f&&f>=0&&(v.base>0||true),isR=pc===st.r;
   const L=inV&&st.mode==='fingers'?(v.fg[i]||''):st.mode==='intervals'?IV[(pc-st.r+12)%12]:nm(pc,flatR(st.r));
   s+=`<g class="nd${inV?' vv':''}">${inV?`<circle class="pulse" cx="${cx}" cy="${y}" r="14"/>`:''}<circle class="n${isR?' r':''}${inV?' v':''}" data-midi="${MID[i]+f}" tabindex="0" cx="${cx}" cy="${y}" r="14"/><text x="${cx}" y="${y+4.5}">${L}</text></g>`;}}
 return s+'</svg>';
}
function theory(){
 const fl=flatR(st.r),notes=F[st.q].map(x=>(st.r+x)%12);
 return `<p>${DESC[st.q]}</p><p>Formula (frets above the root): <b>${F[st.q].join(' · ')}</b>. Notes in <b>${nm(st.r,fl)}${SUF[st.q]}</b>:</p>`+
 notes.map((p,i)=>`<span class="chip${i?'':' r'}"><b>${nm(p,fl)}</b> <small>${IV[(p-st.r+12)%12]}</small></span>`).join('')+
 `<p style="color:var(--mut);font-size:.9rem">The small label under each note says how it relates to the root: R is the root, 3 is the third, 5 is the fifth, ♭ means lowered by one fret. Only the 3rd and 7th change between these chord types.</p>`;
}
function fits(){
 const sev=['7','maj7','m7'].includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,out=[];
 for(let k=0;k<12;k++)for(let d=0;d<7;d++)if((k+DEG[d])%12===st.r&&L[d]===st.q)out.push(`<span class="chip"><b>${nm(k,flatR(k))} major</b>: ${R[d]}</span>`);
 const nme=nm(st.r,flatR(st.r))+SUF[st.q];
 return `<p><b>${nme}</b> is a natural fit in these major keys (with its position in the key):</p>${out.join('')}`;
}
function keyrow(){
 const sev=['7','maj7','m7'].includes(st.q),L=sev?SQ:TQ,R=sev?RN7:RN,k=st.r,fl=flatR(k);
 $('keytitle').textContent=`The ${sev?'7th chords':'chords'} of ${nm(k,fl)} major:`;
 return L.map((q,d)=>{const r=(k+DEG[d])%12,ok=F[q],cur=r===st.r&&q===st.q;
  const name=nm(r,fl)+(q==='dim'?'°':q==='m7b5'?'m7♭5':SUF[q]);
  return `<button ${ok?`data-r="${r}" data-q="${q}"`:'disabled title="Not covered by this app yet"'} aria-pressed="${cur}">${name}<small>${R[d]}</small></button>`}).join('');
}
function render(){
 const v=voice(),fl=flatR(st.r);
 $('cname').innerHTML=nm(st.r,fl)+SUF[st.q]+'<small>'+LONG[st.q]+'</small>';
 $('dg').innerHTML=diagram(v);
 $('vnote').textContent=(v.base===0?'Open position':'Barre at fret '+v.base)+' · '+st.sh+' shape'+(st.mode==='fingers'?' · numbers are fingers (1 = index)':st.mode==='notes'?' · note names':' · distance from the root');
 $('neck').innerHTML=neck(v);
 $('tones').innerHTML='';
 $('theory').innerHTML=theory();$('fits').innerHTML=fits();$('keyrow').innerHTML=keyrow();
 document.querySelectorAll('#roots button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.r===st.r));
 document.querySelectorAll('#quals button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.q===st.q));
 document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===st.mode));
 document.querySelectorAll('#shapes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===st.sh));
}
$('roots').innerHTML=S.map((n,i)=>`<button data-r="${i}">${[1,3,6,8,10].includes(i)?n.replace('#','♯')+'/'+FL[i].replace('b','♭'):n}</button>`).join('');
$('quals').innerHTML=Object.keys(F).map(q=>`<button data-q="${q}">${LONG[q]}</button>`).join('');
$('modes').innerHTML=[['fingers','Fingers'],['notes','Notes'],['intervals','Intervals']].map(([m,l])=>`<button data-m="${m}">${l}</button>`).join(' ');
$('shapes').innerHTML=['C','A','G','E','D'].map(k=>`<button data-s="${k}" title="${k} shape">${k}</button>`).join(' ');
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
 if(b.dataset.r!==undefined)st.r=+b.dataset.r;
 if(b.dataset.q)st.q=b.dataset.q;
 if(b.dataset.m)st.mode=b.dataset.m;
 if(b.dataset.s!==undefined)st.sh=b.dataset.s;
 render();
});
render();

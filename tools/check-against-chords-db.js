// Calibration check: do the app's "can a hand play it" rules (whyHard) agree with real chord charts?
//
//   npm i --no-save @tombatossals/chords-db      (open database of guitar chords, MIT license; not a dependency of this project)
//   node tools/check-against-chords-db.js js/app.js
//
// It converts every fingering the database has for the chord types this app supports, runs them through whyHard(), and prints
// how many pass, why the others fail, and how many of the playable ones the voicing generator also produces. It exits with an
// error if fewer than 95% pass, so a rule that is too strict gets noticed.
const fs=require('fs');
let db;try{db=require('@tombatossals/chords-db/lib/guitar.json')}catch(e){console.error('Install the data first: npm i --no-save @tombatossals/chords-db');process.exit(2)}
const src=fs.readFileSync(process.argv[2]||'js/app.js','utf8').split('\n'),cut=src.findIndex(l=>l.startsWith('function diagram'));
(0,eval)(src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","")+';globalThis.API={whyHard,genVoicings,assignFingers};');
const{whyHard,genVoicings,assignFingers}=API;
const KEY={C:0,Csharp:1,D:2,Eb:3,E:4,F:5,Fsharp:6,G:7,Ab:8,A:9,Bb:10,B:11}; // the database spells C# and F# out
const TYPE={major:'maj',minor:'min','7':'7',maj7:'maj7',m7:'m7',sus2:'sus2',sus4:'sus4','6':'6',m6:'m6',dim:'dim',aug:'aug',dim7:'dim7',m7b5:'m7b5',mmaj7:'mmaj7','9':'9',m9:'m9',add9:'add9'};
let n=0,ok=0,okLabels=0,inList=0;const perType={},why={},examples={},notGen={};
for(const[k,list]of Object.entries(db.chords))for(const c of list){const q=TYPE[c.suffix];if(!q)continue;
  for(const p of c.positions){n++;const bf=p.baseFret||1,fr=p.frets.map(f=>f>0?f+bf-1:f),w0=whyHard(fr,p.fingers),w=w0&&assignFingers(fr)?null:w0;if(!w0)okLabels++;
    if(w){why[w]=(why[w]||0)+1;(examples[w]=examples[w]||[]).push(k+c.suffix+' '+fr.map(f=>f<0?'x':f).join(','))}
    else{ok++;if(KEY[k]===undefined)throw new Error('unknown key '+k);const pt=perType[q]=perType[q]||{ok:0,gen:0};pt.ok++;
     if(genVoicings(KEY[k],q).some(v=>v.key===fr.join(',')))inList++,pt.gen++;
     else{const pl=fr.map((f,i)=>f>=0?i:-1).filter(i=>i>=0),f0=fr.filter(f=>f>0);
      const r=pl[pl.length-1]-pl[0]+1!==pl.length?'mutes a string between played strings':fr.includes(0)&&f0.length&&Math.max(...f0)>5?'open strings together with frets above the 5th':'something else';
      notGen[r]=(notGen[r]||0)+1}}}}
console.log('fingerings in chords-db for the supported chord types:',n);
console.log('accepted by whyHard():',ok,'('+(100*ok/n).toFixed(1)+'%)','| with the chart\'s own finger numbers alone:',okLabels,'('+(100*okLabels/n).toFixed(1)+'%)');
console.log('(a position counts as accepted if the chart\'s fingering passes, or the app finds another fingering that does)');
console.log('rejected, and why:');for(const[w,c]of Object.entries(why).sort((a,b)=>b[1]-a[1]))console.log('  ',String(c).padStart(3),w,'  e.g.',examples[w].slice(0,2).join(' | '));
console.log('of the accepted ones, also produced by the voicing generator:',inList,'('+(100*inList/ok).toFixed(1)+'%)');
console.log('the others are left out on purpose or by design:');for(const[w,c]of Object.entries(notGen).sort((a,b)=>b[1]-a[1]))console.log('  ',String(c).padStart(3),w);
console.log('per chord type, playable fingerings in chords-db and how many the generator also produces:');
for(const[q,c]of Object.entries(perType))console.log('  ',q.padEnd(6),String(c.ok).padStart(3),' generated',String(c.gen).padStart(3),' ('+(100*c.gen/c.ok).toFixed(0)+'%)');
process.exit(ok/n<0.95?1:0);

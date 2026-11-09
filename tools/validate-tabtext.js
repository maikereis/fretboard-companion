// Round trip: every lesson and lick is written as a text tab with asciiTab(), read back with parseTab(), and must come out the same.
// It also feeds the reader random junk to make sure it never crashes, and checks the user's own sliding example.
// Run: node tools/validate-tabtext.js js/app.js
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'js/app.js','utf8').split('\n'),cut=src.findIndex(l=>l.startsWith('function diagram'));
const code=src.slice(0,cut).join('\n').replace('const $=id=>document.getElementById(id);','');
const X=(0,eval)('(function(){const tm={bpm:70};'+code+';return {TECH,LICKS,parseTab,layoutTab,partSteps,asciiTab,withMT}})()');
const sig=e=>[e.s,e.x==='dead'?0:e.f,e.x||'',e.bend||0,e.pb||0,e.rel?1:0,e.vib||0,e.pm?1:0,e.nh?1:0,e.tap?1:0,e.tr?e.f2:0].join(',');
let bad=0,n=0;const fail=m=>{bad++;console.log('PROBLEM',m)};
const cases=[];
X.TECH.forEach(t=>{for(let i=0;i<40;i++)cases.push([t.id,t.gen()])});
X.LICKS.forEach(l=>cases.push([l.name,l.ev]));
for(const [name,ev] of cases){n++;
 const txt=X.asciiTab(ev),P=X.parseTab(txt);
 if(!P.ok){fail(name+' not read\n'+txt);continue}
 if(P.warn.length)fail(name+' warnings '+JSON.stringify(P.warn)+'\n'+txt);
 const a=ev.map(sig).sort().join('|'),b=P.events.map(sig).sort().join('|');
 if(a!==b)fail(name+' differs\n'+txt+'\n'+a+'\n'+b);
 // order of notes on each string is kept
 for(let s=0;s<6;s++){const o=ev.filter(e=>e.s===s).sort((p,q)=>p.t-q.t).map(sig).join('|'),r=P.events.filter(e=>e.s===s).sort((p,q)=>p.col-q.col||p.ci-q.ci).map(sig).join('|');if(o!==r)fail(name+' order on string '+s)}
 const L=X.layoutTab(P,{unit:0.5});
 if(!L.parts.length)fail(name+' no parts');
 L.parts.forEach(p=>{X.partSteps(p).forEach(s=>{if(/NaN|undefined/.test(s.txt.join()))fail(name+' bad step text')})});
 X.withMT(P.events,P.tuning).forEach(e=>{if(!Number.isFinite(e.m))fail(name+' bad midi')});
}
// the user's example
const ex=`60 bpm
E|-3/5-5/3-------------------------------------------|
B|-3/5-5/3---3/5-5/3p0---3/5-5/3p0-------------------|
G|-----------2/4-4/2p0---2/4-4/2p0--4----------------|
D|----------------------------------5----------------|
A|---------------------------------------------------|
E|---------------------------------------------------|`;
{const P=X.parseTab(ex),L=X.layoutTab(P,{unit:0.5});n++;
 if(P.bpm!==60)fail('bpm header');if(P.warn.length)fail('example warns');if(L.parts.length!==3)fail('example parts '+L.parts.length);
 const sl=P.events.filter(e=>e.x==='/'||e.x==='\\').length;if(sl!==12)fail('example slides '+sl);
 if(P.events.filter(e=>e.x==='p').length!==4)fail('example pull-offs');
 const L2=X.layoutTab(P,{unit:0.5,split:'gaps'});if(L2.parts.length!==3)fail('gap split '+L2.parts.length);
 const L3=X.layoutTab(P,{unit:0.5,mode:'even'});if(L3.parts.length!==3)fail('even mode parts');}
// slide-in versus slide link, labels, tuning
{const P=X.parseTab('e|-/5---5/7-5\\-\nB|-----------\nG|-----------\nD|-----------\nA|-----------\nE|-----------');n++;
 const k=P.events.map(e=>(e.x||'-')+e.f).join(' ');if(k!=='slin5 -5 /7 slout'&&k!=='slin5 -5 /7 -5 slout'&&!/slin5/.test(k))fail('slide forms: '+k);}
{const P=X.parseTab('e|-0-2-|\nB|-----|\nG|-----|\nD|-----|\nA|-----|\nD|-0---|');n++;
 if(!P.tuned||P.tuning[0]!==-2)fail('drop D tuning '+P.tuning);}
// junk never crashes
let seed=7;const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const alpha='-|0123456789hpbr/\\~xX()<>[]tT .\nPM:*=abcdefg#';
for(let i=0;i<4000;i++){n++;let t='';const len=Math.floor(rnd()*400);for(let k=0;k<len;k++)t+=alpha[Math.floor(rnd()*alpha.length)];
 try{const P=X.parseTab(t);if(P.ok){const L=X.layoutTab(P,{unit:[1,0.5,0.25][i%3],mode:i%2?'even':'cols',split:['auto','bars','gaps'][i%3]});L.parts.forEach(p=>X.partSteps(p))}}catch(e){fail('crash '+e.message+' on '+JSON.stringify(t.slice(0,80)));break}}
// six-line junk that looks like tab
for(let i=0;i<1500;i++){n++;const rows=[];for(let j=0;j<6;j++){let r='eBGDAE'[j]+'|';const len=5+Math.floor(rnd()*60);for(let k=0;k<len;k++)r+=alpha.slice(0,28)[Math.floor(rnd()*28)];rows.push(r+'|')}
 try{const P=X.parseTab(rows.join('\n'));if(P.ok){const L=X.layoutTab(P,{unit:0.5});L.parts.forEach(p=>X.partSteps(p));if(!L.parts.length)fail('ok but no parts')}}catch(e){fail('crash '+e.message+'\n'+rows.join('\n'));break}}
console.log('cases',n,'| problems',bad);process.exit(bad?1:0);
